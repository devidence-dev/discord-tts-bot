const SayBaseCommand = require('../../../classes/base/SayBaseCommand');
const AeiouProvider = require('../../../classes/tts/providers/AeiouProvider');

class SayAeiouCommand extends SayBaseCommand {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'aeiou_say',
      description: 'Send an aeiou (sounds like Stephen Hawking) TTS message in your voice channel.'
    });
  }

  getProviderName() {
    return AeiouProvider.NAME;
  }
}

module.exports = { SayAeiouCommand };
