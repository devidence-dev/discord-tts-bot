const { Listener } = require('@sapphire/framework');
const { Events } = require('discord.js');

class MessageCreateListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: Events.MessageCreate
    });
  }

  run(message) {
    const { client, config, localizer } = this.container;
    const prefix = config.get('PREFIX');

    if (message.author.bot || !message.guild || !message.content.startsWith(prefix)) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    const command = client.stores.get('commands').get(commandName);

    if (command) {
      const guildLocalizer = localizer.getLocalizer(message.guild);
      message.reply(guildLocalizer.t('app.message.deprecated', { commandName }))
        .catch((error) => {
          client.emit('error', error);
        });
    }
  }
}

module.exports = { MessageCreateListener };
