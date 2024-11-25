(function (s) {
    "use strict";

    var p = {
        onLoad: function () {
            const { metro: r, commands: o, logger: c } = vendetta;
            const { sendBotMessage: d } = r.findByProps("sendBotMessage");
            const u = r.findByProps("sendMessage", "receiveMessage");

            // Register the roast command
            this.onUnload = o.registerCommand({
                name: "roast",
                displayName: "roast",
                description: "Get a roast response from the API",
                displayDescription: "Get roasted with a custom prompt",
                options: [
                    {
                        name: "prompt",
                        description: "The prompt for the roast",
                        type: 3,
                        required: true,
                        displayName: "prompt",
                        displayDescription: "The prompt for the roast"
                    }
                ],
                applicationId: -1,
                inputType: 1,
                type: 1,
                execute: async function (args, context) {
                    try {
                        // Extract the prompt input from command options
                        let prompt = args.find(function (e) { return e.name === "prompt"; });

                        // Payload to send to the API
                        const payload = {
                            userMessage: {
                                role: "user",
                                content: prompt.value
                            },
                            history: [
                                {
                                    role: "assistant",
                                    content: "Hello there. I'm here to roast you."
                                }
                            ],
                            style: "default"
                        };

                        // Perform the API request
                        const response = await fetch("https://www.roastedby.ai/api/generate", {
                            method: "POST",
                            headers: {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9",
                                "content-type": "application/json",
                                "priority": "u=1, i",
                                "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin"
                            },
                            body: JSON.stringify(payload)
                        });

                        // Parse the response
                        const responseData = await response.json();
                        const roastResponse = responseData.content || 'No response from the API.';

                        // Send the roast response as a chat message
                        await u.sendMessage(context.channel.id, { content: roastResponse });
                        d(context.channel.id, "Roast complete!");
                    } catch (error) {
                        // Log any errors and send an error message
                        c.log(error);
                        d(context.channel.id, `Error: ${error.message}`);
                    }
                }
            });
        },

        onUnload: function () {
            // Unregister the command when the plugin is unloaded
            vendetta.commands.remove("roast");
        }
    };

    return s.default = p, Object.defineProperty(s, "__esModule", { value: !0 }), s;

})({});
