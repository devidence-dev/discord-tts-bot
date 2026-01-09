const SayBaseCommand = require('../../base/SayBaseCommand');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');

class PiperSayCommand extends SayBaseCommand {
  constructor(client) {
    super(client, {
      name: 'piper_say',
      description: 'Send a Piper TTS message with natural-sounding voices in your voice channel.',
      emoji: ':speaking_head:',
      group: 'piper-tts'
    });
  }

  getProviderName() {
    return PiperProvider.NAME;
  }
}

module.exports = PiperSayCommand;
