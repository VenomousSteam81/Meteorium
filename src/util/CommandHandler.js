// The command handler for Meteorium
// Written by RadiatedExodus (ItzEthanPlayz_YT/RealEthanPlayzDev)

const fs = require("fs");
const path = require("path");
const { Collection, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const GuildSettingSchema = require("../schemas/GuildSettingSchema");

class MeteoriumCommandHandler {
    constructor(client, prefix, applicationId, token) {
        this.client = client;
        this.prefix = prefix;
        this.applicationId = applicationId;
        this.REST = new REST({ version: '9' }).setToken(token);
        this.parsedCommands = new Collection();
        this.interactionDeployCommands = [];
        this.disabledCommandCache = {};
        this.disabledCommandCategoryCache = {};
    }

    ParseCommands(targetDir = "../commands") {
        const files = fs.readdirSync(path.join(__dirname, targetDir)); //.filter(file => file.endsWith('.js'));
        for (const file of files) {
            const fInfo = fs.lstatSync(path.join(__dirname, targetDir, file));
            if (fInfo.isDirectory()) {
                this.ParseCommands(path.join(targetDir, file));
            } else {
                try {
                    const command = require(path.join(__dirname, targetDir, file));
                    this.parsedCommands.set(command.name, command);
                    this.interactionDeployCommands.push(command.interactionData.toJSON());
                } catch(err) {
                    console.error(`MeteoriumCommandHandler: error occured while parsing command file: ${path.join(__dirname, targetDir, file)}\n${err.stack}`);
                }
            }
        }
    }

    async DeployCommandInteraction(GuildId) {
        try {
            console.log(`MeteoriumCommandHandler: Deploying interaction for guildId ${GuildId}`);
            await this.REST.put(Routes.applicationGuildCommands(this.applicationId, GuildId), { body: this.interactionDeployCommands });
            console.log(`MeteoriumCommandHandler: Interaction deployed for guildId ${GuildId}`);
        } catch (err) {
            console.error(`MeteoriumCommandHandler: Error occured when deploying command interaction for guild ${GuildId}, \n${err.stack}`);
        }
    }

    async DeployGlobalCommandInteraction() {
        try {
            console.log(`MeteoriumCommandHandler: Deploying global interaction`);
            await this.REST.put(Routes.applicationCommands(this.applicationId), { body: this.interactionDeployCommands });
            console.log(`MeteoriumCommandHandler: Global interaction deployed successfully.`);
        } catch (err) {
            console.error(`MeteoriumCommandHandler: Error occured when deploying global command interaction, \n${err.stack}`);
        }
    }

    async HandleCommandInteraction(interaction) {
        try {
            if (!interaction.isCommand()) return;
            const targetCommand = this.parsedCommands.get(interaction.commandName);
            if (!targetCommand) return;
            if (this.disabledCommandCache[interaction.guildId] && this.disabledCommandCache[interaction.guildId][interaction.commandName]) {
                await interaction.reply({ embeds: [
                    new MessageEmbed()
                        .setTitle("Cannot run command")
                        .setDescription("This command has been disabled by a administrator for this server!")
                        .setFooter("Meteorium | Developed by RadiatedExodus (RealEthanPlayzDev)")
                        .setTimestamp()
                        .setColor("FF0000")
                ]});
                return;
            }

            try {
                await targetCommand.execute(interaction, this.client);
            } catch(err) {
                console.error(`MeteoriumCommandHandler: error occured when handling command:\n${err.stack}`);
                const errEmbed = new MessageEmbed()
                    .setTitle("An error occured when running the command!")
                    .setDescription(String(err))
                    .addFields({
                        name: "Note",
                        value: "This error is generated by ``MeteoriumCommandHandler``, coming from the command handler function"
                    })
                    .setFooter("Meteorium | Developed by RadiatedExodus (RealEthanPlayzDev)")
                    .setTimestamp()
                    .setColor("FF0000");
                if (interaction.deferred) {
                    await interaction.editReply({ embeds: [errEmbed] });
                } else {
                    await interaction.reply({ embeds: [errEmbed] });
                }
            }
        } catch(err) {
            console.error(`MeteoriumCommandHandler: HandleCommandInteraction failed:\n${err.stack}`);
        }
    }

    async UpdateDisabledCommandCache(guildId) {
        if (!guildId) { throw new Error("MeteoriumCommandHandler: no guildId specified for UpdateDisabledCommandCache") }
        const guildExists = this.client.guilds.cache.has(String(guildId));
        if (guildExists) {
            const guildSchema = await GuildSettingSchema.findOne({ GuildId: String(guildId) });
            //console.log(guildSchema);
            try {
                console.log(`MeteoriumCommandHandler: Updating guild disabled commands cache for GuildId ${guildId}\n${guildSchema.DisabledCommands}`);
                this.disabledCommandCache[String(guildId)] = guildSchema.DisabledCommands;
                this.disabledCommandCategoryCache[String(guildId)] = guildSchema.DisabledCommandCategories;
            } catch(err) {

            }
        }
        //console.log(this.disabledCommandCache);
    }
}

module.exports = MeteoriumCommandHandler;
