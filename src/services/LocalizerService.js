const { Collection } = require('discord.js');

class GuildLocalizer {
  constructor(localizer, guild) {
    this.localizer = localizer;
    this.guild = guild;
    this.locale = localizer.defaultLocale;
  }

  async init() {
    if (!this.localizer.client.dataProvider) {
      return this.locale;
    }

    const savedLocale = await this.localizer.client.dataProvider.get(this.guild, 'locale', this.locale);

    if (!this.localizer.isLocaleSupported(savedLocale)) {
      throw new Error(`Invalid locale ${savedLocale} received from data provider.`);
    }

    this.locale = savedLocale;
    return this.locale;
  }

  async updateLocale(locale) {
    if (!this.localizer.isLocaleSupported(locale)) {
      throw new Error(`${locale} is not a supported locale.`);
    }

    this.locale = locale;

    if (!this.localizer.client.dataProvider) {
      return;
    }

    return this.localizer.client.dataProvider.set(this.guild, 'locale', this.locale);
  }

  translate(key, values = {}) {
    return this.localizer.translate(key, this.locale, values);
  }

  t(key, values = {}) {
    return this.translate(key, values);
  }
}

class LocalizerService {
  constructor(client, { defaultLocale, localeStrings }) {
    this.client = client;
    this.localeStrings = localeStrings;

    if (!this.isLocaleSupported(defaultLocale)) {
      throw new Error(`${defaultLocale} is not a supported locale.`);
    }

    this.defaultLocale = defaultLocale;
    this.guildLocalizers = new Collection();
  }

  async init() {
    this.client.on('guildCreate', this._handleGuildCreate.bind(this));
    this.client.on('guildDelete', this._handleGuildDelete.bind(this));

    return Promise.all(this.client.guilds.cache.map((guild) => this._handleGuildCreate(guild)));
  }

  async _handleGuildCreate(guild) {
    const localizer = new GuildLocalizer(this, guild);
    this.guildLocalizers.set(guild.id, localizer);
    return localizer.init();
  }

  _handleGuildDelete(guild) {
    this.guildLocalizers.delete(guild.id);

    if (!this.client.dataProvider) {
      return Promise.resolve();
    }

    return this.client.dataProvider.delete(guild, 'locale')
      .catch((error) => {
        this.client.emit('warn', `Could not delete locale settings for ${guild.id} from data provider.`);
        this.client.emit('error', error);
      });
  }

  getLocalizer(guild) {
    return this.guildLocalizers.get(guild.id);
  }

  getAvailableLocales() {
    return Object.keys(this.localeStrings);
  }

  isLocaleSupported(locale) {
    return this.getAvailableLocales().includes(locale);
  }

  translate(key, locale, values = {}) {
    const messagesForLocale = this.localeStrings[locale];
    if (!messagesForLocale) {
      throw new Error(`No messages with locale ${locale} exist!`);
    }

    const message = messagesForLocale[key] || this.localeStrings[this.defaultLocale][key];
    if (!message) {
      throw new Error(`No message with key ${key} for locale ${locale} exists!`);
    }

    let result = message;
    for (const [k, v] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return result;
  }

  t(key, locale, values = {}) {
    return this.translate(key, locale, values);
  }
}

module.exports = LocalizerService;
