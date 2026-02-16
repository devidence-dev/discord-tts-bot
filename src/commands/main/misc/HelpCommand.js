const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { MESSAGE_EMBED, WEBSITE_URL } = require('../../../common/constants');

class HelpCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'help',
      description: 'Display a help message with all the available commands.',
      preconditions: ['GuildOnly']
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  prepareFields() {
    const commandStore = this.container.client.stores.get('commands');
    const grouped = new Map();

    for (const command of commandStore.values()) {
      const category = command.category || 'misc';
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(command);
    }

    return [...grouped.entries()].map(([categoryName, commands]) => {
      const listOfCommands = commands.reduce((text, command) => {
        return text.concat(`**/${command.name}** - ${command.description}\n`);
      }, '');

      return { title: categoryName, text: listOfCommands };
    });
  }

  chatInputRun(interaction) {
    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const fields = this.prepareFields();
    const embed = new EmbedBuilder()
      .setTitle(localizer.t('command.help.embed.title'))
      .setColor(MESSAGE_EMBED.color)
      .setThumbnail(MESSAGE_EMBED.helpThumbnail);

    const embedFields = fields.map((field) => ({
      name: field.title,
      value: field.text
    }));

    embed.addFields(embedFields);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setStyle('Link')
          .setEmoji('🐛')
          .setLabel(localizer.t('command.help.links.bug'))
          .setURL(MESSAGE_EMBED.helpURL),
        new ButtonBuilder()
          .setStyle('Link')
          .setEmoji('🌎')
          .setLabel(localizer.t('command.help.links.website'))
          .setURL(WEBSITE_URL)
      );

    return interaction.reply({ embeds: [embed], components: [row] });
  }
}

module.exports = { HelpCommand };
