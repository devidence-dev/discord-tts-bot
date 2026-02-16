const { Precondition } = require('@sapphire/framework');
const { PermissionsBitField } = require('discord.js');

class ManageChannelsPrecondition extends Precondition {
  chatInputRun(interaction) {
    return interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
      ? this.ok()
      : this.error({ message: 'You need the Manage Channels permission to use this command.' });
  }
}

module.exports = { ManageChannelsPrecondition };
