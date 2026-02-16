const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const merge = require('deepmerge');
const { MESSAGE_EMBED } = require('../../../../common/constants');
const ProviderManager = require('../../../../classes/tts/providers/ProviderManager');

class ChannelSettingsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'channel_settings',
      description: 'Get the TTS settings associated to this channel (if applies).',
      preconditions: ['GuildOnly']
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

  handleDisabled(interaction, localizer) {
    const embed = new EmbedBuilder()
      .setTitle(localizer.t('channel_commands.settings.disabled.embed.title'))
      .setColor(MESSAGE_EMBED.color)
      .setDescription(localizer.t('channel_commands.settings.disabled.embed.description'));

    return interaction.reply({ embeds: [embed] });
  }

  handleEnabled(interaction, localizer, channelSettings) {
    const providerSettings = channelSettings[channelSettings.provider];
    const providerFriendlyName = ProviderManager.PROVIDER_FRIENDLY_NAMES[channelSettings.provider];
    const settingsField = this.prepareSettingsField(providerSettings, providerFriendlyName, localizer);

    const embed = new EmbedBuilder()
      .setTitle(localizer.t('channel_commands.settings.enabled.embed.title', { channel: interaction.channel.name }))
      .setColor(MESSAGE_EMBED.color)
      .setDescription(localizer.t('channel_commands.settings.enabled.embed.description'))
      .addFields([
        {
          name: localizer.t('channel_commands.settings.enabled.current.provider'),
          value: ProviderManager.PROVIDER_FRIENDLY_NAMES[channelSettings.provider]
        },
        {
          name: settingsField.title,
          value: settingsField.text
        }
      ]);

    return interaction.reply({ embeds: [embed] });
  }

  prepareSettingsField(settings, friendlyName, localizer) {
    const settingsKeys = Object.keys(settings);

    if (settingsKeys.length < 1) {
      return { title: friendlyName, text: localizer.t('channel_commands.settings.enabled.no_settings') };
    }

    const text = settingsKeys.reduce((text, key) => {
      const setting = settings[key];
      return text.concat(`• **${key}**: ${setting}\n`);
    }, '');

    return { title: friendlyName, text };
  }

  async chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const channelSettings = await this.container.client.ttsSettings.get(interaction.channel);

    if (!channelSettings || !channelSettings.provider) {
      return this.handleDisabled(interaction, localizer);
    }

    return this.handleEnabled(interaction, localizer, merge(ProviderManager.DEFAULT_SETTINGS, channelSettings));
  }
}

module.exports = { ChannelSettingsCommand };
