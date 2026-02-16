const fs = require('fs');

const VALID_TYPES = ['boolean', 'number', 'string', 'null', 'boolean[]', 'number[]', 'string[]'];

class ConfigService {
  constructor({ configPath, env, default: defaults = {}, types = {}, customValidators = {} }) {
    this.config = {};
    this.types = types;
    this.customValidators = customValidators;

    this._processDefaults(defaults);
    this._processConfigFile(configPath);
    this._processEnv(env);
    this._validate();
  }

  get(key) {
    return this.config[key];
  }

  _processDefaults(defaults) {
    if (!defaults) return;
    for (const key in defaults) {
      this.config[key] = defaults[key];
    }
  }

  _processConfigFile(configPath) {
    if (!configPath || !fs.existsSync(configPath)) return;

    const json = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    for (const key in json) {
      this.config[key.toUpperCase()] = json[key];
    }
  }

  _processEnv(env) {
    if (!env) return;

    const configFromEnv = Object.keys(env)
      .filter((key) => key.startsWith('DISCORD_'))
      .reduce((obj, key) => {
        return { ...obj, [key.substring('DISCORD_'.length)]: env[key] };
      }, {});

    const castedConfig = this._castFromString(configFromEnv);
    for (const key in castedConfig) {
      this.config[key] = castedConfig[key];
    }
  }

  _castFromString(config) {
    const casted = { ...config };

    for (const key of Object.keys(config)) {
      const value = config[key];
      const type = this.types[key] || 'string';

      if (Array.isArray(type)) {
        let containsString = false;

        for (const t of type) {
          try {
            if (t === 'string') {
              containsString = true;
              continue;
            }
            casted[key] = this._castSingleValue(value, t);
            break;
          } catch (_) {
            continue;
          }
        }

        if (casted[key] === value && containsString) {
          casted[key] = this._castSingleValue(value, 'string');
        }
      } else {
        casted[key] = this._castSingleValue(value, type);
      }
    }

    return casted;
  }

  _castSingleValue(value, type) {
    switch (type) {
      case 'boolean':
        if (value === 'true') return true;
        if (value === 'false') return false;
        throw new TypeError(`Cannot cast ${value} to boolean!`);
      case 'number': {
        const num = Number(value);
        if (isNaN(num)) throw new TypeError(`Cannot cast ${value} to number!`);
        return num;
      }
      case 'string':
        return `${value}`;
      case 'string[]':
        return value.split(',').map((v) => `${v}`);
      case 'boolean[]':
        return value.split(',').map((v) => this._castSingleValue(v, 'boolean'));
      case 'number[]':
        return value.split(',').map((v) => this._castSingleValue(v, 'number'));
      case 'null':
        if (value === 'null') return null;
        throw new TypeError(`Cannot cast ${value} to null!`);
      default:
        throw new TypeError(`${type} is an invalid type. Must be or contain: ${VALID_TYPES.join(', ')}.`);
    }
  }

  _validate() {
    for (const key of Object.keys(this.config)) {
      const value = this.config[key];
      const customValidator = this.customValidators[key];

      if (customValidator) {
        customValidator(value);
        continue;
      }

      const type = this.types[key];
      if (!type) continue;

      if (Array.isArray(type)) {
        const valid = type.some((t) => this._isValueValid(value, t));
        if (!valid) {
          throw new TypeError(`${value} in config for key ${key} does not conform to types ${type.join(', ')}.`);
        }
      } else if (!this._isValueValid(value, type)) {
        throw new TypeError(`${value} in config for key ${key} does not conform to type ${type}.`);
      }
    }
  }

  _isValueValid(value, type) {
    if (type === 'null') return value === null;

    if (type.endsWith('[]')) {
      if (!Array.isArray(value)) return false;
      const singleType = type.slice(0, -2);
      return value.every((val) => typeof val === singleType);
    }

    return typeof value === type;
  }
}

module.exports = ConfigService;
