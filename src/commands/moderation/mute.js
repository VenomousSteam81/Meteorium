const { SlashCommandBuilder } = require("@discordjs/builders");
const MeteoriumCommand = require("../../util/Command");

module.exports = new MeteoriumCommand("mute", "Mutes a person", async () => {
    await interaction.reply("Not yet implemented.");
}, new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a person")
    .addSubcommand(subcommand => subcommand.setName("user")
                                    .setDescription("Unmute someone by their user mention")
                                    .addMentionableOption(option => option.setName("user").setDescription("Target user").setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName("id")
                                    .setDescription("Unmute someone by their user id")
                                    .addStringOption(option => option.setName("userid").setDescription("Target userid").setRequired(true)))
);