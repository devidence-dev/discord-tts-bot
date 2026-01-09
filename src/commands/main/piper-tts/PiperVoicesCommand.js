const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');
const { MESSAGE_EMBED } = require('../../../common/constants');

class PiperVoicesCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'piper_voices',
      description: 'Display a list of the voices available in the Piper TTS service.',
      emoji: ':speaking_head:',
      group: 'piper-tts',
      guildOnly: true,
      dataBuilder: new SlashCommandBuilder()
    });
  }

  async createEmbed(localizer) {
    const embed = new EmbedBuilder()
      .setTitle('🎤 Available Piper TTS Models')
      .setColor(MESSAGE_EMBED.color)
      .setDescription('Currently downloaded and available models')
      .setThumbnail(MESSAGE_EMBED.langThumbnail);

    try {
      // Consultar modelos disponibles del servidor Piper
      const response = await axios.get('http://piper-tts:8000/models', {
        timeout: 5000
      });

      const models = response.data.models || [];

      if (models.length === 0) {
        embed.addFields({
          name: 'No models available',
          value: 'Download a model using: `docker exec piper-tts python3 -m piper.download --voice LANGUAGE-VOICE-medium --output-dir /opt/app/piper-models`\n\nExample: `es_MX-ald-medium`, `en_US-amy-medium`'
        });
      } else {
        // Agrupar por idioma
        const byLanguage = {};
        models.forEach(model => {
          if (!byLanguage[model.language]) {
            byLanguage[model.language] = [];
          }
          byLanguage[model.language].push(model);
        });

        // Agregar campos por idioma
        Object.entries(byLanguage).forEach(([language, modelsInLang]) => {
          const modelsList = modelsInLang
            .map(m => `🎤 **${m.name}** (${m.size_mb}MB)`)
            .join('\n');

          embed.addFields({
            name: language,
            value: modelsList,
            inline: false
          });
        });
      }

      embed.setFooter({ text: `Total: ${models.length} models` });
    } catch (error) {
      embed.addFields({
        name: 'Error',
        value: `Could not fetch models: ${error.message}`
      });
    }

    return embed;
  }

  async run(interaction) {
    const localizer = this.client.getLocalizer(interaction.guildId);

    try {
      const embed = await this.createEmbed(localizer);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return interaction.reply({
        content: `❌ Error: ${error.message}`,
        ephemeral: true
      });
    }
  }
}

module.exports = PiperVoicesCommand;
