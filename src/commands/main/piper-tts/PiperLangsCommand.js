const LangsBaseCommand = require('../../base/LangsBaseCommand');
const PiperProvider = require('../../../classes/tts/providers/PiperProvider');

class PiperLangsCommand extends LangsBaseCommand {
  constructor(client) {
    super(client, {
      name: 'piper_langs',
      description: 'Display a list of the languages supported by the Piper provider.',
      emoji: ':speaking_head:',
      group: 'piper-tts'
    });
  }

  getProvider() {
    return PiperProvider;
  }

  getProviderName() {
    return PiperProvider.NAME;
  }

  getLangsData() {
    return PiperProvider.getSupportedLanguages().reduce((obj, lang) => {
      return {
        ...obj,
        [lang.value]: {
          name: lang.name,
          emoji: '🌍',
          voices: PiperProvider.getSupportedVoices()
            .filter(v => v.value.startsWith(lang.value.split('_')[0]))
            .map(v => ({
              name: v.name,
              emoji: '🎤'
            }))
        }
      };
    }, {});
  }
}

module.exports = PiperLangsCommand;
