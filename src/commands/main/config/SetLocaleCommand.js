const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('@greencoast/logger');
const { supported } = require('../../../locales');
const { oldChoiceListToNew } = require('../../../utils/upgrade-utils');

class SetLocaleCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'set_locale',
      description: 'Sets locale to be used by the bot in this guild.',
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
            .setName('locale')
            .setDescription('The locale to be used by the bot in this guild.')
            .setRequired(true)
            .addChoices(...oldChoiceListToNew(Object.keys(supported).map((key) => [supported[key], key])));
        })
    );
  }

  async chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const locale = interaction.options.getString('locale');
    const localeFriendlyName = supported[locale];

    await localizer.updateLocale(locale);

    logger.info(`${interaction.guild.name} has changed its locale to ${locale}.`);
    return interaction.reply({ content: localizer.t('command.locale.success', { locale: localeFriendlyName }) });
  }
}

module.exports = { SetLocaleCommand };
