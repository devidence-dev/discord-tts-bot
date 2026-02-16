const SayBaseCommand = require('../../../classes/base/SayBaseCommand');

class SayCommand extends SayBaseCommand {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'say',
      description: 'Send a TTS message in your voice channel with your own settings or the ones saved for this server.'
    });
  }

  getProviderName(currentSettings) {
    return currentSettings.provider;
  }
}

module.exports = { SayCommand };
