const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');
const { MESSAGE_EMBED } = require('../../../common/constants');

class PiperLangsCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'piper_langs',
      description: 'Display a list of the languages supported by the Piper provider.',
      emoji: ':speaking_head:',
      group: 'piper-tts',
      guildOnly: true,
      dataBuilder: new SlashCommandBuilder()
    });
  }

  createEmbed(localizer) {
    const embed = new EmbedBuilder()
      .setTitle('🌍 Piper TTS - Supported Languages')
      .setColor(MESSAGE_EMBED.color)
      .setDescription('Available languages and voices')
      .setThumbnail(MESSAGE_EMBED.langThumbnail);

    const languages = PiperProvider.getSupportedLanguages();
    const voices = PiperProvider.getSupportedVoices();

    languages.forEach(lang => {
      const langVoices = voices.filter(v => v.name.includes(lang.name.split('(')[0].trim()) || v.value.includes(lang.value.split('_')[0]));
      
      const voicesList = langVoices.length > 0 
        ? langVoices.map(v => `🎤 ${v.name}`).join('\n')
        : 'No voices available';

      embed.addFields({
        name: `${lang.name}`,
        value: voicesList,
        inline: false
      });
    });

    return embed;
  }

  async run(interaction) {
    const localizer = this.client.getLocalizer(interaction.guildId);
    const embed = this.createEmbed(localizer);
    return interaction.reply({ embeds: [embed] });
  }
}

module.exports = PiperLangsCommand;
