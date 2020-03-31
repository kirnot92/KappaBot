import {TextChannel, DMChannel, GroupDMChannel } from "discord.js"

export type AnyChannel = TextChannel | DMChannel | GroupDMChannel;
export type Channel = TextChannel | DMChannel | GroupDMChannel;