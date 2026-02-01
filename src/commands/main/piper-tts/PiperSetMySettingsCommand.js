const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('discord.js');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');

class PiperSetMySettingsCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'piper_set_my',
      description: 'Sets the settings to be used by the say and piper_say commands for yourself.',
      emoji: ':speaking_head:',
      group: 'piper-tts',
      guildOnly: true,
      dataBuilder: new SlashCommandBuilder()
        .addStringOption((input) => {
          return input
            .setName('language')
            .setDescription('The language to use.')
            .setRequired(false)
            .addChoices(
              PiperProvider.getSupportedLanguages().map(lang => ({
                name: lang.name,
                value: lang.value
              }))
            );
        })
        .addStringOption((input) => {
          return input
            .setName('voice')
            .setDescription('The voice to use.')
            .setRequired(false)
            .addChoices(
              PiperProvider.getSupportedVoices().map(voice => ({
                name: voice.name,
                value: voice.value
              }))
            );
        })
        .addStringOption((input) => {
          return input
            .setName('speed')
            .setDescription('The speech speed.')
            .setRequired(false)
            .addChoices(
              PiperProvider.getSupportedSpeedChoices().map(speed => ({
                name: speed.name,
                value: speed.value
              }))
            );
        })
    });
  }

  async run(interaction) {
    const language = interaction.options.getString('language');
    const voice = interaction.options.getString('voice');
    const speed = interaction.options.getString('speed');
    const localizer = this.client.localizer.getLocalizer(interaction.guild);

    const settings = {};
    if (language) settings.language = language;
    if (voice) settings.voice = voice;
    if (speed) settings.speed = speed;

    const provider = PiperProvider.NAME;
    const userProvider = this.client.getProvider();

    await userProvider.setUserProvider(interaction.user.id, provider, settings);

    return interaction.reply({
      content: `✅ Piper TTS settings updated: ${Object.entries(settings).map(([k, v]) => `**${k}**: ${v}`).join(', ')}`,
      ephemeral: true
    });
  }
}

module.exports = PiperSetMySettingsCommand;
