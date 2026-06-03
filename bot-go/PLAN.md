# Plan de migración a Go

Bot de Discord TTS migrado a Go desde Node.js/Bun.
Scope reducido: **proveedor Amazon únicamente**, locales **en** y **es**.

---

## Estado actual

### Implementado

| Paquete | Archivo(s) | Qué hace |
|---|---|---|
| `internal/data` | `provider.go`, `level.go` | Interfaz `Provider` + implementación LevelDB. Incluye tests. |
| `internal/locale` | `locale.go`, `en.go`, `es.go` | Localizer con sustitución de `{placeholders}`. Soporta `en` y `es`. |
| `internal/provider` | `amazon.go`, `amazon_languages.json` | Llama a la API de TTS Tool (createParts + getParts) y devuelve una URL de audio. El JSON de idiomas está embebido en el binario (`//go:embed`). |
| `internal/settings` | `settings.go` | Manager de configuración con merge de 3 niveles: defaults → guild → usuario. Lee/escribe overrides parciales en LevelDB. |
| `internal/player` | `player.go` | Cola de reproducción por guild. Pipeline `URL → ffmpeg → S16LE → gopus → Opus → vc.OpusSend`. Soporta stop, inactividad con timer, y desconexión cuando el bot queda solo en el canal. |
| `internal/commands` | `definitions.go`, `handler.go`, `amazon_say.go`, `amazon_langs.go`, `amazon_voices.go`, `amazon_set_my.go`, `amazon_set_default.go`, `stop.go`, `help.go`, `config.go` | Todos los comandos slash. Router de interacciones. |
| `internal/bot` | `bot.go` | Session de discordgo, registro de comandos en Discord, manejo de eventos `GuildDelete` y `VoiceStateUpdate`. |
| `main.go` | — | Entry point. Lee configuración desde variables de entorno. Señales OS para shutdown limpio. |

### Comandos slash disponibles

| Comando | Descripción |
|---|---|
| `/amazon_say` | Reproduce un mensaje en el canal de voz |
| `/amazon_langs` | Lista los idiomas soportados |
| `/amazon_voices` | Lista las voces disponibles para un idioma |
| `/amazon_set_my` | Configura language / voice / volume / rate / pitch del usuario |
| `/amazon_set_default` | Configura los valores por defecto del servidor |
| `/my_settings` | Muestra la configuración efectiva del usuario |
| `/default_settings` | Muestra la configuración por defecto del servidor |
| `/stop` | Detiene la reproducción y desconecta el bot |
| `/help` | Muestra información de uso |
| `/set_locale` | Cambia el idioma del bot (`en` / `es`) |
| `/set_timeout` | Configura los minutos de inactividad antes de desconectar |

---

## Pendiente

### Funcionalidad

- [ ] **Redis como data provider** — `internal/data` solo tiene LevelDB. En el proyecto JS existe `@greencoast/djs-extended-data-provider-redis`. Habría que implementar `RedisProvider` que satisfaga la misma interfaz `data.Provider` y seleccionarlo con una variable de entorno (`DATA_PROVIDER=redis`).
- [ ] **Canal TTS automático** — La versión JS tiene el feature `ENABLE_TTS_CHANNELS`: cualquier mensaje de texto en un canal configurado se reproduce automáticamente. No está implementado en Go. Requiere manejar el intent `GuildMessages` y un handler `MessageCreate`.
- [ ] **Cache de settings en memoria** — `settings.Manager` actualmente lee LevelDB en cada llamada. Faltaría agregar un `sync.Map` o similar para cachear por guild/usuario e invalidar en cada escritura.
- [ ] **Sanitización de menciones** — La versión JS tiene `cleanMessage()` que convierte `<@userID>` en el nombre display del usuario, y `<#channelID>` en el nombre del canal antes de enviar al TTS. En Go solo se sanitizan URLs (`urlRegex` en `amazon_say.go`).

### Infraestructura

- [ ] **`go mod tidy` + `go.sum`** — Go no estaba disponible en el entorno de desarrollo. Correr `go mod tidy` para resolver versiones exactas de dependencias y generar `go.sum`.
- [ ] **Dockerfile** — El proyecto JS tiene `Dockerfile`. Hay que crear uno para Go que incluya las dependencias de sistema (`libopus-dev`, `ffmpeg`) y compile el binario estáticamente o dinámicamente según convenga.
- [ ] **`docker-compose.yml`** — Actualizar o crear una entrada separada para el bot Go en el `docker-compose.yml` raíz.
- [ ] **Tests de integración** — Solo existen tests en `internal/data/`. Faltan tests para `settings`, `locale`, `provider` (mockeando HTTP) y `commands` (mockeando discordgo).

### Calidad

- [ ] **Manejo de errores en comandos** — Varios handlers usan `//nolint:errcheck` en escrituras a LevelDB. Conviene loggear esos errores o retornarlos al usuario con un mensaje genérico.
- [ ] **Nick en `/my_settings`** — `i.Member.Nick` puede ser vacío si el usuario no tiene apodo en el servidor; en ese caso se debería usar `i.Member.User.Username`.

---

## Consideraciones importantes

### Dependencias de sistema

El binario requiere dos dependencias externas en tiempo de ejecución:

| Dependencia | Uso | Instalación |
|---|---|---|
| `ffmpeg` | Decodifica el audio de Amazon (MP3/AAC) a PCM S16LE | `apt-get install ffmpeg` |
| `libopus` | Codifica PCM a Opus para enviarlo a Discord (cgo) | `apt-get install libopus-dev` |

`libopus-dev` es necesaria en tiempo de **compilación** (cgo). En producción solo se necesita `libopus0`. En un Dockerfile multistage el build stage necesita `-dev` y el runtime stage solo `libopus0`.

### Pipeline de audio

```
Amazon API
  └─ createParts (POST SSML) → partId
  └─ getParts (GET) → URL de audio (MP3)
        ↓
     ffmpeg -i URL -f s16le -ar 48000 -ac 2 pipe:1
        ↓
     gopus.Encode (PCM int16 → Opus frames de 20ms)
        ↓
     discordgo VoiceConnection.OpusSend (channel de []byte)
```

Si la URL de audio tarda en responder o el servidor de TTS Tool está caído, `ffmpeg` puede bloquearse. El `exec.CommandContext` propaga la cancelación del contexto (stop command, inactividad) matando el proceso con SIGKILL.

### API de TTS Tool

El proveedor usa una API pública no oficial (`support.readaloud.app`). No tiene autenticación, lo cual implica:

- No hay garantías de disponibilidad ni SLA.
- Podría cambiar o desaparecer sin aviso.
- No apta para uso de alta concurrencia (sin rate limiting implementado).

Considerar agregar un timeout en el cliente HTTP de `provider/amazon.go` (actualmente usa el cliente por defecto de Go que no tiene timeout).

### Registro de comandos

En `bot.go`, `onReady` llama a `ApplicationCommandBulkOverwrite`. Esto:

- **Reemplaza todos los comandos** del bot en Discord en cada inicio.
- Si `TESTING_GUILD_ID` está vacío, los comandos se registran globalmente (pueden tardar hasta 1 hora en propagarse).
- Si está definido, se registran solo en ese guild (propagación instantánea, útil en desarrollo).

### Concurrencia del player

Cada guild tiene un `*Player` con su propio mutex. La reproducción corre en una goroutine (`playLoop`). El contexto de cancelación (`context.WithCancel`) conecta el comando `/stop` con el proceso de `ffmpeg`. No hay límite de guilds concurrentes — cada uno puede estar reproduciendo simultáneamente de forma independiente.

### Módulo Go

El módulo se llama `discord-tts-bot` (nombre simple, no URL). Si en el futuro se publica o se mueve a un monorepo, habría que actualizar el module path en `go.mod` y todos los imports internos.

---

## Variables de entorno

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `DISCORD_TOKEN` | Sí | — | Token del bot |
| `TESTING_GUILD_ID` | No | — | Registra comandos solo en este guild |
| `DATA_PATH` | No | `./data` | Ruta del directorio LevelDB |
| `DEFAULT_DISCONNECT_TIMEOUT` | No | `5` | Minutos de inactividad antes de desconectar |

---

## Cómo compilar

```bash
# Dependencias de sistema (Debian/Ubuntu)
apt-get install libopus-dev ffmpeg

# Dentro de bot-go/
go mod tidy
go build -o tts-bot .

# Ejecutar
DISCORD_TOKEN=xxx ./tts-bot

# Con guild de testing (comandos instantáneos)
DISCORD_TOKEN=xxx TESTING_GUILD_ID=123456789 ./tts-bot
```
