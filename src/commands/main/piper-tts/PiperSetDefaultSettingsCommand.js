const { Command } = require('@sapphire/framework');
const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');

class PiperSetDefaultSettingsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'piper_set_default',
      description: 'Sets the settings to be used by the say and piper_say commands by default.',
      preconditions: ['GuildOnly', 'ManageGuild']
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
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
    );
  }

  async chatInputRun(interaction) {
    const language = interaction.options.getString('language');
    const voice = interaction.options.getString('voice');
    const speed = interaction.options.getString('speed');

    const settings = {};
    if (language) settings.language = language;
    if (voice) settings.voice = voice;
    if (speed) settings.speed = speed;

    await this.container.client.ttsSettings.set(interaction.guild, { [PiperProvider.NAME]: settings });

    return interaction.reply({
      content: `✅ Default Piper TTS settings updated: ${Object.entries(settings).map(([k, v]) => `**${k}**: ${v}`).join(', ')}`,
      ephemeral: true
    });
  }
}

module.exports = { PiperSetDefaultSettingsCommand };
