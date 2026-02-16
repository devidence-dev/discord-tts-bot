const { Command } = require('@sapphire/framework');
const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const logger = require('@greencoast/logger');
const ProviderManager = require('../../../../classes/tts/providers/ProviderManager');
const { oldChoiceListToNew } = require('../../../../utils/upgrade-utils');

class SetChannelProvider extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'set_channel_provider',
      description: 'Sets the provider to be used by the message-only based TTS on specific channels.',
      preconditions: ['GuildOnly', 'ManageChannels']
    });
  }

  registerApplicationCommands(registry) {
    if (!this.container.config.get('ENABLE_TTS_CHANNELS')) return;
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((input) => {
          return input
            .setName('provider')
            .setDescription('The provider to use from now on.')
            .setRequired(true)
            .addChoices(...oldChoiceListToNew(ProviderManager.SUPPORTED_PROVIDERS.map((p) => [p.FRIENDLY_NAME, p.NAME])));
        })
    );
  }

  async chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const providerName = interaction.options.getString('provider');
    const providerFriendlyName = ProviderManager.PROVIDER_FRIENDLY_NAMES[providerName];

    await this.container.client.ttsSettings.set(interaction.channel, { provider: providerName });

    logger.info(`${interaction.guild.name} has changed the provider for the channel ${interaction.channel.name} to ${providerName}.`);
    return interaction.reply({ content: localizer.t('channel_commands.set.success', { name: providerFriendlyName }) });
  }
}

module.exports = { SetChannelProvider };
