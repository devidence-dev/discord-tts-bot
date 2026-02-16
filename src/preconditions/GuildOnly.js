const { Precondition } = require('@sapphire/framework');

class GuildOnlyPrecondition extends Precondition {
  chatInputRun(interaction) {
    return interaction.guild
      ? this.ok()
      : this.error({ message: 'This command can only be used in a server.' });
  }
}

module.exports = { GuildOnlyPrecondition };
