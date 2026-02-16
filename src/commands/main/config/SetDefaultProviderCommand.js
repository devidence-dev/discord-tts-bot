const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('@greencoast/logger');
const ProviderManager = require('../../../classes/tts/providers/ProviderManager');
const { oldChoiceListToNew } = require('../../../utils/upgrade-utils');

class SetDefaultProviderCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'set_default_provider',
      description: 'Sets the provider to be used by the say command for the server by default.',
      preconditions: ['GuildOnly', 'ManageGuild']
    });
  }

  registerApplicationCommands(registry) {
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

    await this.container.client.ttsSettings.set(interaction.guild, { provider: providerName });

    logger.info(`${interaction.guild.name} has changed its default provider to ${providerName}.`);
    return interaction.reply({ content: localizer.t('command.set.default.provider.success', { name: providerFriendlyName }) });
  }
}

module.exports = { SetDefaultProviderCommand };
