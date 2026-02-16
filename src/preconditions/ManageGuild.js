const { Precondition } = require('@sapphire/framework');
const { PermissionsBitField } = require('discord.js');

class ManageGuildPrecondition extends Precondition {
  chatInputRun(interaction) {
    return interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
      ? this.ok()
      : this.error({ message: 'You need the Manage Server permission to use this command.' });
  }
}

module.exports = { ManageGuildPrecondition };
