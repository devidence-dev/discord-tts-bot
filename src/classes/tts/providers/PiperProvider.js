const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AbstractProvider = require('./AbstractProvider');
const Payload = require('../Payload');

/**
 * A concrete TTS provider for Piper TTS.
 * Communicates with piper-tts service via HTTP.
 */
class PiperProvider extends AbstractProvider {
  constructor(client) {
    super(client);
    this.piperServiceUrl = process.env.PIPER_SERVICE_URL || 'http://piper-tts:8000';
  }

  createPayload(sentence, extras) {
    return new Promise(async (resolve, reject) => {
      try {
        // Parse voice value which contains full model name like 'es_MX-ald-medium'
        const voiceValue = extras.voice || 'es_MX-ald-medium';
        const voiceParts = voiceValue.split('-');
        
        // Extract language (first two parts like es_MX or en_US)
        const language = voiceParts.length >= 2 ? `${voiceParts[0]}-${voiceParts[1]}` : 'es_MX';
        // Extract voice (remaining parts, e.g., 'ald-medium' or just 'mls')
        const voice = voiceParts.length > 2 ? voiceParts.slice(2).join('-') : (voiceParts.length > 1 ? voiceParts[1] : 'ald-medium');
        
        const params = {
          text: sentence,
          language: language,
          voice: voice,
          speed: extras.speed || 'normal'
        };

        // Send a request to the Piper service.
        const response = await axios.post(`${this.piperServiceUrl}/synthesize`, null, {
          params,
          responseType: 'arraybuffer',
          timeout: 30000 // 30-second timeout
        });

        // Save the audio to a temporary file.
        const tempFile = `/tmp/piper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;
        fs.writeFileSync(tempFile, response.data);

        // Create a payload with the file path.
        const payload = new Payload(tempFile, sentence, PiperProvider.NAME, extras);
        resolve(payload);
      } catch (error) {
        if (error.response?.status === 404) {
          reject(new Error(`Model not found: ${extras.language}-${extras.voice}. Download it first.`));
        } else if (error.code === 'ECONNREFUSED') {
          reject(new Error('Piper TTS service is not running. Start piper-tts container.'));
        } else {
          reject(new Error(`Piper TTS error: ${error.message}`));
        }
      }
    });
  }

  getPlayLogMessage(payload, guild) {
    const { sentence, extras: { language, voice, speed } } = payload;
    return `(Piper): Saying ${sentence} with voice ${voice} (${language}) with ${speed} speed in guild ${guild.name}.`;
  }
}

PiperProvider.NAME = 'Piper';

PiperProvider.SUPPORTED_VOICES = [
  { name: '🇲🇽 Spanish (Mexico) - Alloy', value: 'es_MX-ald-medium' },
  { name: '🇪🇸 Spanish (Spain)', value: 'es_ES-mls' },
  { name: '🇺🇸 English (US)', value: 'en_US' },
  { name: '🇬🇧 English (UK)', value: 'en_GB' },
  { name: '🇫🇷 French', value: 'fr_FR' },
  { name: '🇩🇪 German', value: 'de_DE' },
  { name: '🇮🇹 Italian', value: 'it_IT' },
];

PiperProvider.SUPPORTED_LANGUAGES = [
  { name: 'Spanish (Mexico)', value: 'es_MX' },
  { name: 'Spanish (Spain)', value: 'es_ES' },
  { name: 'English (US)', value: 'en_US' },
  { name: 'English (UK)', value: 'en_GB' },
  { name: 'French', value: 'fr_FR' },
  { name: 'German', value: 'de_DE' },
  { name: 'Italian', value: 'it_IT' },
];

PiperProvider.getSupportedLanguages = function() {
  return this.SUPPORTED_LANGUAGES;
};

PiperProvider.getSupportedVoices = function() {
  return this.SUPPORTED_VOICES;
};
PiperProvider.FRIENDLY_NAME = 'Piper TTS Provider';

PiperProvider.EXTRA_FIELDS = ['language', 'voice', 'speed'];
PiperProvider.EXTRA_DEFAULTS = {
  language: 'es_MX',
  voice: 'ald',
  speed: 'normal'
};

PiperProvider.getSupportedLanguages = () => {
  return [
    { name: 'Spanish (Mexico)', value: 'es_MX' },
    { name: 'English (US)', value: 'en_US' },
  ];
};

PiperProvider.getSupportedVoices = () => {
  return [
    { name: 'Ald (es_MX)', value: 'ald' },
    { name: 'Amy (en_US)', value: 'amy' },
  ];
};

PiperProvider.getSupportedSpeedChoices = () => {
  return [
    { name: 'Fast Speed', value: 'fast' },
    { name: 'Normal Speed', value: 'normal' },
    { name: 'Slow Speed', value: 'slow' }
  ];
};

module.exports = PiperProvider;
