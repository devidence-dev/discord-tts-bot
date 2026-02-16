const { Listener, container } = require('@sapphire/framework');
const { Events } = require('discord.js');
const logger = require('@greencoast/logger');
const { keepAlive } = require('../utils/keep-alive');

class ReadyListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      once: true,
      event: Events.ClientReady
    });
  }

  async run(client) {
    const { config, localizer, presence, createProvider } = container;

    // Wire up data provider and expose on client for legacy classes (Scheduler, CachedTTSSettings)
    const provider = createProvider(config.get('PROVIDER_TYPE'));
    container.dataProvider = provider;
    client.dataProvider = provider;

    // Init localizer (needs dataProvider)
    await localizer.init();

    // Init per-guild TTS players and schedulers
    await client.initializeDependencies();

    // Start presence rotation
    presence.start();

    // Optional features
    if (config.get('ENABLE_TTS_CHANNELS')) {
      client.ttsChannelHandler.initialize();
    }

    if (config.get('ENABLE_KEEP_ALIVE')) {
      keepAlive({ port: process.env.PORT || 3000 });
    }

    logger.info(`Logged in as ${client.user.tag}`);
  }
}

module.exports = { ReadyListener };
