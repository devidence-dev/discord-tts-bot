const SayBaseCommand = require('../../../classes/base/SayBaseCommand');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');

class PiperSayCommand extends SayBaseCommand {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'piper_say',
      description: 'Send a Piper TTS message with natural-sounding voices in your voice channel.'
    });
  }

  getProviderName() {
    return PiperProvider.NAME;
  }
}

module.exports = { PiperSayCommand };
