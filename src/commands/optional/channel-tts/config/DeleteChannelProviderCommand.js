const { Command } = require('@sapphire/framework');
const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const logger = require('@greencoast/logger');

class DeleteChannelProviderCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'delete_channel_provider',
      description: 'Disable message-only based TTS on this channel (deletes its saved settings).',
      preconditions: ['GuildOnly', 'ManageChannels']
    });
  }

  registerApplicationCommands(registry) {
    if (!this.container.config.get('ENABLE_TTS_CHANNELS')) return;
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  async chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const channelSettings = await this.container.client.ttsSettings.get(interaction.channel);

    if (!channelSettings || !channelSettings.provider) {
      return interaction.reply({ content: localizer.t('channel_commands.delete.already_disabled') });
    }

    await this.container.client.ttsSettings.delete(interaction.channel);
    logger.info(`${interaction.guild.name} has disabled message-only TTS for the channel ${interaction.channel.name}`);
    return interaction.reply({ content: localizer.t('channel_commands.delete.success') });
  }
}

module.exports = { DeleteChannelProviderCommand };
