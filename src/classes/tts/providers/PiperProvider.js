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
        // Validar parámetros
        const params = {
          text: sentence,
          language: extras.language || 'es_MX',
          voice: extras.voice || 'ald',
          speed: extras.speed || 'normal'
        };

        // Hacer petición al servicio Piper
        const response = await axios.get(`${this.piperServiceUrl}/synthesize`, {
          params,
          responseType: 'arraybuffer',
          timeout: 30000 // 30 segundos timeout
        });

        // Guardar audio en archivo temporal
        const tempFile = `/tmp/piper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;
        fs.writeFileSync(tempFile, response.data);

        // Crear payload con la ruta del archivo
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
