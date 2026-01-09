const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');
const { MESSAGE_EMBED } = require('../../../common/constants');

class PiperVoicesCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'piper_voices',
      description: 'Display a list of the voices for any language supported by the Piper provider.',
      emoji: ':speaking_head:',
      group: 'piper-tts',
      guildOnly: true,
      dataBuilder: new SlashCommandBuilder()
        .addStringOption((input) => {
          return input
            .setName('language')
            .setDescription('The language to check the voices for.')
            .setRequired(false)
            .addChoices(
              PiperProvider.getSupportedLanguages().map(lang => ({
                name: lang.name,
                value: lang.value
              }))
            );
        })
    });
  }

  createEmbed(localizer, language) {
    const languages = PiperProvider.getSupportedLanguages();
    const languageInfo = languages.find(l => l.value === language);

    const embed = new EmbedBuilder()
      .setTitle(`🎤 Piper TTS - ${languageInfo.name} Voices`)
      .setColor(MESSAGE_EMBED.color)
      .setDescription(`Available voices for ${languageInfo.name}`)
      .setThumbnail(MESSAGE_EMBED.langThumbnail);

    const voices = PiperProvider.getSupportedVoices()
      .filter(v => v.value.includes(language.split('_')[0]));

    const content = voices.reduce((text, voice) => {
      return text.concat(`🎤 ${voice.name} - **/piper_set_my voice ${voice.value}**\n`);
    }, '');

    embed.addFields({ name: `${languageInfo.name}`, value: content || 'No voices available' });

    return embed;
  }

  sendAvailableVoices(interaction, localizer, language) {
    const embed = this.createEmbed(localizer, language);
    return interaction.reply({ embeds: [embed] });
  }

  async run(interaction) {
    const language = interaction.options.getString('language') || 'es_MX';
    const localizer = this.client.getLocalizer(interaction.guildId);

    this.sendAvailableVoices(interaction, localizer, language);
  }
}

module.exports = PiperVoicesCommand;
