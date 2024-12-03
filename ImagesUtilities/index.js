import { registerCommand } from "@vendetta/commands";
import { before, unpatchAll } from "@vendetta/patcher";
import { getModule } from "@vendetta/metro";

// Store deleted or unavailable messages
const deletedMessages = [];

export default {
    onLoad: () => {
        // Intercept message deletions
        const messageModule = getModule(m => m.deleteMessage);
        before("deleteMessage", messageModule, (args) => {
            const [channelId, messageId] = args;

            // Retrieve the message details (mock example for simplicity)
            const messageStore = getModule(m => m.getMessage);
            const message = messageStore.getMessage(channelId, messageId);

            if (message) {
                deletedMessages.unshift({
                    content: message.content || "[Message Content Unavailable]",
                    author: message.author.username || "Unknown",
                    timestamp: new Date().toISOString()
                });

                // Limit the log to the last 10 messages
                if (deletedMessages.length > 10) deletedMessages.pop();
            }
        });

        // Register the /snipe command
        registerCommand({
            name: "snipe",
            description: "Retrieve the last deleted message.",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, { send }) => {
                if (deletedMessages.length === 0) {
                    send({
                        content: "No deleted messages found!",
                        username: "Clyde",
                        avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                    });
                    return;
                }

                const lastMessage = deletedMessages.shift(); // Get the most recent deleted message
                send({
                    content: `**${lastMessage.author}**: ${lastMessage.content}`,
                    username: "Clyde",
                    avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                });
            }
        });
    },
    onUnload: () => {
        // Clean up hooks and commands
        unpatchAll();
    }
};
