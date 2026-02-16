const { Listener } = require('@sapphire/framework');
const { Events } = require('discord.js');

class GuildDeleteListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: Events.GuildDelete
    });
  }

  async run(guild) {
    const { client, dataProvider } = this.container;

    await dataProvider.clear(guild);
    client.deleteDependenciesForGuild(guild);
  }
}

module.exports = { GuildDeleteListener };
