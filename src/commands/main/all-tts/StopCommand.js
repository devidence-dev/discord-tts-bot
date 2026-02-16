const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageFlags } = require('discord.js');
const logger = require('@greencoast/logger');

class StopCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'stop',
      description: 'Stop the TTS bot and leave the channel.',
      preconditions: ['GuildOnly']
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const ttsPlayer = this.container.client.getTTSPlayer(interaction.guild);
    const connection = ttsPlayer.voice.getConnection();

    const { members: { me: { voice: myVoice } }, name: guildName } = interaction.guild;
    const myChannel = myVoice?.channel;
    const { channel: memberChannel } = interaction.member.voice;

    if (!connection) {
      return interaction.reply({ content: localizer.t('command.stop.no_connection'), flags: MessageFlags.Ephemeral });
    }

    if (!memberChannel || myChannel !== memberChannel) {
      return interaction.reply({ content: localizer.t('command.stop.different_channel'), flags: MessageFlags.Ephemeral });
    }

    ttsPlayer.stop();
    logger.info(`Successfully left the voice channel ${myChannel.name} from guild ${guildName}.`);
    return interaction.reply({ content: localizer.t('command.stop.success', { channel: myChannel.toString() }) });
  }
}

module.exports = { StopCommand };
