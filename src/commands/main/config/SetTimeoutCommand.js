const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('@greencoast/logger');
const { DISCONNECT_TIMEOUT } = require('../../../common/constants');

class SetTimeoutCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'set_timeout',
      description: 'Sets the timeout for the bot to leave the channel when not in use.',
      preconditions: ['GuildOnly', 'ManageGuild']
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addNumberOption((input) => {
          return input
            .setName('timeout')
            .setDescription('The time in minutes that the bot should wait before leaving the channel when inactive.')
            .setRequired(true)
            .setMinValue(DISCONNECT_TIMEOUT.MIN)
            .setMaxValue(DISCONNECT_TIMEOUT.MAX);
        })
    );
  }

  async chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const timeout = interaction.options.getNumber('timeout');
    const ttsPlayer = this.container.client.getTTSPlayer(interaction.guild);

    if (timeout < DISCONNECT_TIMEOUT.MIN || timeout > DISCONNECT_TIMEOUT.MAX) {
      return interaction.reply({ content: localizer.t('command.timeout.out_of_range', { min: DISCONNECT_TIMEOUT.MIN, max: DISCONNECT_TIMEOUT.MAX }) });
    }

    await ttsPlayer.disconnectScheduler.updateTimeout(timeout * 60 * 1000);

    logger.info(`${interaction.guild.name} has changed its disconnect timeout to ${timeout} minutes.`);
    return interaction.reply({ content: localizer.t('command.timeout.success', { timeout }) });
  }
}

module.exports = { SetTimeoutCommand };
