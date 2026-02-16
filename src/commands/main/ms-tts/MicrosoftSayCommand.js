const SayBaseCommand = require('../../../classes/base/SayBaseCommand');
const MicrosoftProvider = require('../../../classes/tts/providers/MicrosoftProvider');

class MicrosoftSayCommand extends SayBaseCommand {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'ms_say',
      description: 'Send a Microsoft (TTS Tool) message with multi-language support in your voice channel.'
    });
  }

  getProviderName() {
    return MicrosoftProvider.NAME;
  }
}

module.exports = { MicrosoftSayCommand };
