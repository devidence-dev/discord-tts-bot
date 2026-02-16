const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection } = require('discord.js');

class LangsBaseCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      preconditions: ['GuildOnly']
    });

    this.embeds = new Collection();
  }

  registerApplicationCommands(registry) {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);

    registry.registerChatInputCommand(builder);
  }

  createEmbed() {
    throw new Error('createEmbed() not implemented!');
  }

  chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    let embed;

    if (!this.embeds.has(localizer.locale)) {
      embed = this.createEmbed(localizer);
      this.embeds.set(localizer.locale, embed);
    } else {
      embed = this.embeds.get(localizer.locale);
    }

    return interaction.reply({ embeds: [embed] });
  }
}

module.exports = LangsBaseCommand;
