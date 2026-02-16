const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { MESSAGE_EMBED } = require('../../../common/constants');
const ProviderManager = require('../../../classes/tts/providers/ProviderManager');

class DefaultSettingsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'default_settings',
      description: 'Get the default TTS settings currently set for the guild.',
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

  prepareFields(settings, localizer) {
    return Object.keys(ProviderManager.PROVIDER_FRIENDLY_NAMES).map((name) => {
      const friendlyName = ProviderManager.PROVIDER_FRIENDLY_NAMES[name];
      const values = settings[name];
      const valueKeys = Object.keys(values);

      if (valueKeys.length < 1) {
        return { title: friendlyName, text: localizer.t('command.settings.default.no_settings') };
      }

      const text = valueKeys.reduce((text, key) => {
        const setting = values[key];
        return text.concat(`• **${key}**: ${setting}\n`);
      }, '');

      return { title: friendlyName, text };
    });
  }

  async chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const currentSettings = await this.container.client.ttsSettings.getCurrentForGuild(interaction.guild);
    const { provider, ...restSettings } = currentSettings;

    const fields = this.prepareFields(restSettings, localizer);
    const embed = new EmbedBuilder()
      .setTitle(localizer.t('command.settings.default.embed.title'))
      .setColor(MESSAGE_EMBED.color)
      .setDescription(localizer.t('command.settings.default.embed.description'))
      .addFields([
        {
          name: localizer.t('command.settings.default.current.provider'),
          value: ProviderManager.PROVIDER_FRIENDLY_NAMES[provider]
        },
        ...fields.map((field) => ({
          name: field.title,
          value: field.text,
          inline: true
        }))
      ]);

    return interaction.reply({ embeds: [embed] });
  }
}

module.exports = { DefaultSettingsCommand };
