const path = require('path');
const { container } = require('@sapphire/framework');
const { GatewayIntentBits } = require('discord.js');
const { RedisDataProvider } = require('@greencoast/djs-extended-data-provider-redis');
const { LevelDataProvider } = require('@greencoast/djs-extended-data-provider-level');
const TTSClient = require('./classes/extensions/TTSClient');
const ConfigService = require('./services/ConfigService');
const LocalizerService = require('./services/LocalizerService');
const PresenceService = require('./services/PresenceService');
const { locales } = require('./locales');
const { DISCONNECT_TIMEOUT, WEBSITE_URL } = require('./common/constants');

const pkg = require('../package.json');

const SUPPORTED_PROVIDERS = ['level', 'redis'];

const config = new ConfigService({
  configPath: path.join(__dirname, '../config/settings.json'),
  env: process.env,
  default: {
    PREFIX: '$',
    OWNER_ID: null,
    OWNER_REPORTING: false,
    PRESENCE_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 Minutes
    DEFAULT_DISCONNECT_TIMEOUT: 5, // 5 Minutes,
    TESTING_GUILD_ID: null,
    PROVIDER_TYPE: 'level',
    REDIS_URL: null,
    ENABLE_TTS_CHANNELS: false,
    ENABLE_KEEP_ALIVE: false,
    ENABLE_WHO_SAID: false
  },
  types: {
    TOKEN: 'string',
    PREFIX: 'string',
    OWNER_ID: ['string', 'null'],
    OWNER_REPORTING: 'boolean',
    PRESENCE_REFRESH_INTERVAL: ['number', 'null'],
    DEFAULT_DISCONNECT_TIMEOUT: 'number',
    TESTING_GUILD_ID: ['string', 'null'],
    PROVIDER_TYPE: 'string',
    REDIS_URL: ['string', 'null'],
    ENABLE_TTS_CHANNELS: 'boolean',
    ENABLE_KEEP_ALIVE: 'boolean',
    ENABLE_WHO_SAID: 'boolean'
  },
  customValidators: {
    PROVIDER_TYPE: (value) => {
      if (!SUPPORTED_PROVIDERS.includes(value)) {
        throw new TypeError(`${value} is not a valid data provider, it must be one of ${SUPPORTED_PROVIDERS.join(', ')}`);
      }
    },
    DEFAULT_DISCONNECT_TIMEOUT: (value) => {
      if (isNaN(value)) {
        throw new TypeError('DEFAULT_DISCONNECT_TIMEOUT must be a number!');
      }

      if (value > DISCONNECT_TIMEOUT.MAX || value < DISCONNECT_TIMEOUT.MIN) {
        throw new TypeError(`Invalid value for DEFAULT_DISCONNECT_TIMEOUT, it must be between ${DISCONNECT_TIMEOUT.MIN} and ${DISCONNECT_TIMEOUT.MAX}`);
      }
    }
  }
});

container.config = config;

const client = new TTSClient({
  intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent]
});

container.localizer = new LocalizerService(client, {
  defaultLocale: 'en',
  localeStrings: locales
});

container.presence = new PresenceService(client, {
  refreshInterval: config.get('PRESENCE_REFRESH_INTERVAL'),
  templates: [
    '{num_guilds} servers!',
    '/help for help.',
    '{num_members} users!',
    'up for {uptime}.',
    `current version: ${pkg.version}`,
    '{num_commands} commands available.',
    `visit ${WEBSITE_URL}`
  ]
});

container.createProvider = (type) => {
  switch (type) {
    case 'level':
      return new LevelDataProvider(client, path.join(__dirname, '../data'));
    case 'redis':
      return new RedisDataProvider(client, { url: config.get('REDIS_URL') });
    default:
      throw new TypeError(`${type} is not a valid data provider, it must be one of ${SUPPORTED_PROVIDERS.join(', ')}`);
  }
};

client.login(config.get('TOKEN'));
