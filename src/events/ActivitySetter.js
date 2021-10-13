module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        client.user.setPresence({
            status: "idle",
            activities: [{
                name: "no",
                type: "PLAYING"
            }]
        });
        console.log("Successfully set the activity");
    }
}