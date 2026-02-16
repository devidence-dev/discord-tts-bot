const { Listener } = require('@sapphire/framework');
const { Events } = require('discord.js');

class GuildCreateListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: Events.GuildCreate
    });
  }

  async run(guild) {
    await this.container.client.initializeDependenciesForGuild(guild);
  }
}

module.exports = { GuildCreateListener };
