const { Listener } = require('@sapphire/framework');
const { Events } = require('discord.js');

class MessageCreateChannelTtsListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: Events.MessageCreate
    });
  }

  run(message) {
    if (!this.container.config.get('ENABLE_TTS_CHANNELS')) return;
    this.container.client.ttsChannelHandler.handleMessage(message);
  }
}

module.exports = { MessageCreateChannelTtsListener };
