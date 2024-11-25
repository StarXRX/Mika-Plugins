(function (s) {
    "use strict";

    const { metro, React } = vendetta;
    const { findByProps, findByDisplayName } = metro;

    // React Native components
    const { View, Text } = findByDisplayName("ReactNative");
    const { after } = metro.patcher;
    const ImageZoomView = findByProps("ImageZoomView");

    // Utility function to format file size
    function formatSize(bytes) {
        return bytes < 1024
            ? `${bytes} bytes`
            : bytes < 1024 * 1024
            ? `${(bytes / 1024).toFixed(2)} KB`
            : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    // Component to overlay media info
    function MediaInfoOverlay({ source, size, type }) {
        return React.createElement(
            View,
            {
                style: {
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    padding: 10,
                    borderRadius: 8,
                    maxWidth: "90%",
                },
            },
            React.createElement(
                Text,
                {
                    style: {
                        color: "white",
                        fontSize: 12,
                    },
                },
                `Source: ${source}\nSize: ${size}\nType: ${type}`
            )
        );
    }

    // Plugin definition
    const p = {
        onLoad: function () {
            // Patch the image zoom view to add the overlay when displaying media
            after("render", ImageZoomView, (args, res) => {
                const mediaProps = args[0].imageProps || {};

                if (mediaProps?.source?.uri) {
                    const uri = mediaProps.source.uri;

                    // Fetch the media details and add the overlay
                    fetch(uri).then(response => {
                        const size = formatSize(parseInt(response.headers.get("content-length"), 10));
                        const type = response.headers.get("content-type");

                        // Inject the overlay into the image/video view
                        res.props.children.push(
                            React.createElement(MediaInfoOverlay, {
                                source: uri,
                                size,
                                type,
                            })
                        );
                    }).catch(() => {
                        // If fetching fails, still show an overlay with partial info
                        res.props.children.push(
                            React.createElement(MediaInfoOverlay, {
                                source: uri,
                                size: "Unknown",
                                type: "Unknown",
                            })
                        );
                    });
                }

                return res;
            });
        },

        onUnload: function () {
            // Remove any patches when the plugin is unloaded
            metro.patcher.unpatchAll();
        }
    };

    return s.default = p, Object.defineProperty(s, "__esModule", { value: !0 }), s;

})({});
