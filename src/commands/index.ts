import type { Awaitable, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { MeteoriumClient } from '../util/MeteoriumClient';

export * as test from "./test/test";

export type MeteoriumCommand = {
    InteractionData: Pick<SlashCommandBuilder, 'toJSON'>,
    Callback(interaction: ChatInputCommandInteraction<'cached'>, client: MeteoriumClient): Awaitable<any>
}