const SayBaseCommand = require('../../../classes/base/SayBaseCommand');
const GoogleProvider = require('../../../classes/tts/providers/GoogleProvider');

class GoogleSayCommand extends SayBaseCommand {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'google_say',
      description: 'Send a Google Translate TTS message with multi-language support in your voice channel.'
    });
  }

  getProviderName() {
    return GoogleProvider.NAME;
  }
}

module.exports = { GoogleSayCommand };
