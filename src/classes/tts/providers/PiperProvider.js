const { spawn } = require('child_process');
const { Readable } = require('stream');
const AbstractProvider = require('./AbstractProvider');
const Payload = require('../Payload');
const path = require('path');

/**
 * A concrete TTS provider for Piper TTS.
 * Provides natural-sounding voices with offline support.
 */
class PiperProvider extends AbstractProvider {
  constructor(client) {
    super(client);
    this.modelsDir = path.join(process.cwd(), 'piper-models');
  }

  createPayload(sentence, extras) {
    return new Promise((resolve, reject) => {
      try {
        // Construir el nombre del modelo
        const modelName = `${extras.language}-${extras.voice}`;
        const modelPath = path.join(this.modelsDir, `${modelName}.onnx`);

        // Crear stream de audio usando Piper
        const audioStream = this._generateAudioStream(sentence, modelPath, extras);

        const payload = new Payload(audioStream, sentence, PiperProvider.NAME, extras);
        resolve(payload);
      } catch (error) {
        reject(error);
      }
    });
  }

  _generateAudioStream(sentence, modelPath, extras) {
    return new Readable({
      read() {
        // El stream será poblado por el proceso Piper
      },

      destroy(error, callback) {
        if (piperProcess) {
          piperProcess.kill();
        }
        callback(error);
      }
    }).on('pipe', () => {
      this._spawnPiperProcess(sentence, modelPath, extras);
    });
  }

  _spawnPiperProcess(sentence, modelPath, extras) {
    const piperProcess = spawn('piper', [
      '--model', modelPath,
      '--output-file', '/dev/stdout',
      '--speaker', extras.speaker || '0',
      '--length-scale', extras.speed === 'fast' ? '0.8' : (extras.speed === 'slow' ? '1.2' : '1.0')
    ]);

    piperProcess.stdin.write(sentence);
    piperProcess.stdin.end();

    piperProcess.stdout.pipe(this.audioStream);

    piperProcess.stderr.on('data', (data) => {
      console.error(`Piper error: ${data}`);
    });

    piperProcess.on('error', (error) => {
      console.error('Failed to start Piper process:', error);
    });

    piperProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Piper process exited with code ${code}`);
      }
    });
  }

  getPlayLogMessage(payload, guild) {
    const { sentence, extras: { language, voice, speed } } = payload;
    return `(Piper): Saying ${sentence} with voice ${voice} (${language}) with ${speed} speed in guild ${guild.name}.`;
  }
}

PiperProvider.NAME = 'Piper';
PiperProvider.FRIENDLY_NAME = 'Piper TTS Provider';

PiperProvider.EXTRA_FIELDS = ['language', 'voice', 'speaker', 'speed'];
PiperProvider.EXTRA_DEFAULTS = {
  language: 'es_MX',
  voice: 'ald',
  speaker: '0',
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
