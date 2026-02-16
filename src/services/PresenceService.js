const { ActivityType } = require('discord.js');

class PresenceService {
  constructor(client, { refreshInterval = null, templates = ['{num_guilds} servers!'] }) {
    this.client = client;
    this.templates = templates;
    this.refreshInterval = refreshInterval;
    this._intervalHandle = null;
  }

  start() {
    if (!this.refreshInterval || !this.templates.length) return;

    this._update();
    this._intervalHandle = setInterval(() => this._update(), this.refreshInterval);
  }

  stop() {
    if (this._intervalHandle) {
      clearInterval(this._intervalHandle);
      this._intervalHandle = null;
    }
  }

  async _update() {
    const template = this.templates[Math.floor(Math.random() * this.templates.length)];
    const text = await this._interpolate(template);

    try {
      this.client.user?.setPresence({
        activities: [{ name: text, type: ActivityType.Playing }],
        status: 'online'
      });
    } catch (error) {
      this.client.emit('error', error);
    }
  }

  async _interpolate(template) {
    let result = template;

    if (result.includes('{num_guilds}')) {
      const count = this.client.shard
        ? (await this.client.shard.fetchClientValues('guilds.cache.size')).reduce((sum, size) => sum + size, 0)
        : this.client.guilds.cache.size;
      result = result.replace('{num_guilds}', count.toString());
    }

    if (result.includes('{num_members}')) {
      let count;
      if (this.client.shard) {
        const results = await this.client.shard.fetchClientValues('guilds.cache');
        count = results.reduce((sum, guildCache) => {
          return sum + guildCache.reduce((s, guild) => s + guild.memberCount, 0);
        }, 0);
      } else {
        count = this.client.guilds.cache.reduce((sum, guild) => sum + guild.memberCount, 0);
      }
      result = result.replace('{num_members}', count.toString());
    }

    if (result.includes('{num_commands}')) {
      const count = this.client.stores.get('commands').size;
      result = result.replace('{num_commands}', count.toString());
    }

    if (result.includes('{uptime}')) {
      const uptimeMs = this.client.uptime || 0;
      const hours = Math.floor(uptimeMs / 3600000);
      const minutes = Math.floor((uptimeMs % 3600000) / 60000);
      const uptime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      result = result.replace('{uptime}', uptime);
    }

    return result;
  }
}

module.exports = PresenceService;
