/* eslint-disable max-statements */
const { Command } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');

const logger = require('@greencoast/logger');
const { getCantConnectToChannelReason } = require('../../utils/channel');
const { cleanMessage } = require('../../utils/mentions');

class SayBaseCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      preconditions: ['GuildOnly']
    });
  }

  registerApplicationCommands(registry) {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((input) => {
        return input
          .setName('message')
          .setDescription('The message to say in your voice channel.')
          .setRequired(true);
      });

    registry.registerChatInputCommand(builder);
  }

  getProviderName() {
    throw new Error('getProviderName() not implemented!');
  }

  async chatInputRun(interaction) {
    await interaction.deferReply();

    const localizer = this.container.localizer.getLocalizer(interaction.guild);
    const ttsPlayer = this.container.client.getTTSPlayer(interaction.guild);
    const connection = ttsPlayer.voice.getConnection();

    const currentSettings = await this.container.client.ttsSettings.getCurrent(interaction);
    const providerName = this.getProviderName(currentSettings);
    const extras = currentSettings[providerName];

    const { members: { me: { voice: myVoice } }, name: guildName, members, channels, roles } = interaction.guild;
    const { channel: memberChannel } = interaction.member.voice;
    const myChannel = myVoice?.channel;

    const messageIntro = this.container.config.get('ENABLE_WHO_SAID') ? `${interaction.member.displayName} said ` : '';
    const userMessage = interaction.options.getString('message');

    const message = cleanMessage(`${messageIntro}${userMessage}`, {
      members: members.cache,
      channels: channels.cache,
      roles: roles.cache
    });

    if (!memberChannel) {
      await interaction.editReply(localizer.t('command.say.no_channel'));
      return;
    }

    if (connection) {
      if (myChannel !== memberChannel) {
        await interaction.editReply(localizer.t('command.say.different_channel'));
        return;
      }

      await interaction.editReply(localizer.t('command.say.success', { request: userMessage }));
      return ttsPlayer.say(message, providerName, extras);
    }

    const cantConnectReason = getCantConnectToChannelReason(memberChannel);
    if (cantConnectReason) {
      await interaction.editReply(localizer.t(cantConnectReason));
      return;
    }

    await ttsPlayer.voice.connect(memberChannel);
    logger.info(`Joined ${memberChannel.name} in ${guildName}.`);
    await interaction.editReply(localizer.t('command.say.joined.withrequest', { channel: memberChannel.toString(), request: userMessage }));
    return ttsPlayer.say(message, providerName, extras);
  }
}

module.exports = SayBaseCommand;
