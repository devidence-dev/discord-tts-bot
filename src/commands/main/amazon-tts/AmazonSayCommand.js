const SayBaseCommand = require('../../../classes/base/SayBaseCommand');
const AmazonProvider = require('../../../classes/tts/providers/AmazonProvider');

class AmazonSayCommand extends SayBaseCommand {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'amazon_say',
      description: 'Send an Amazon (TTS Tool) message with multi-language support in your voice channel.'
    });
  }

  getProviderName() {
    return AmazonProvider.NAME;
  }
}

module.exports = { AmazonSayCommand };
