const { SlashCommand } = require('@greencoast/discord.js-extended');
const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');

class PiperSetDefaultSettingsCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'piper_set_default',
      description: 'Sets the settings to be used by the say and piper_say commands by default.',
      emoji: ':speaking_head:',
      group: 'piper-tts',
      guildOnly: true,
      userPermissions: [PermissionsBitField.Flags.ManageGuild],
      dataBuilder: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
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
    const localizer = this.client.getLocalizer(interaction.guildId);

    const settings = {};
    if (language) settings.language = language;
    if (voice) settings.voice = voice;
    if (speed) settings.speed = speed;

    const provider = PiperProvider.NAME;
    const userProvider = this.client.getProvider();

    await userProvider.setGuildProvider(interaction.guildId, provider, settings);

    return interaction.reply({
      content: `✅ Default Piper TTS settings updated: ${Object.entries(settings).map(([k, v]) => `**${k}**: ${v}`).join(', ')}`,
      ephemeral: true
    });
  }
}

module.exports = PiperSetDefaultSettingsCommand;
