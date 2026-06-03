package locale

var esStrings = map[string]string{
	"error.channel.not_viewable":  "No puedo ver tu canal de voz. ¿Tengo los suficientes permisos para verlo?",
	"error.channel.full":          "Tu canal de voz está lleno.",
	"error.channel.not_joinable":  "No puedo unirme a tu canal de voz. ¿Tengo los suficientes permisos para unirme?",
	"error.channel.not_speakable": "No puedo hablar en tu canal de voz. ¿Tengo los suficientes permisos para hablar en él?",

	"command.say.no_channel":          "Necesitas estar en un canal de voz.",
	"command.say.different_channel":   "Necesitas estar en mi canal de voz para decir algo.",
	"command.say.success":             `Diré eso ahora.`,
	"command.say.joined.withrequest":  "Entré a {channel}.",
	"command.say.joined":              "Entré a {channel}.",

	"command.stop.no_connection":     "No estoy en un canal de voz.",
	"command.stop.different_channel": "Necesitas estar en mi canal de voz para detenerme.",
	"command.stop.success":           "He salido del canal de voz {channel} con éxito.",

	"command.help.embed.title":   "Mensaje de ayuda de Text-to-Speech",
	"command.help.description":   "Este bot usa Amazon TTS para hablar mensajes en tu canal de voz.\n\n**Comandos:**\n`/amazon_say` — Decir un mensaje.\n`/amazon_langs` — Listar idiomas disponibles.\n`/amazon_voices` — Listar voces para un idioma.\n`/amazon_set_my` — Configurar tus ajustes personales.\n`/amazon_set_default` — Configurar los ajustes por defecto del servidor.\n`/stop` — Detener TTS y salir del canal.\n`/set_locale` — Cambiar el idioma del bot (en/es).\n`/set_timeout` — Configurar el tiempo de inactividad.",

	"command.amazon.langs.embed.title":       "Idiomas disponibles del proveedor Amazon:",
	"command.amazon.langs.embed.description": "Usa **/amazon_set_my language LANG_CODE** para cambiar tu idioma.\nUsa **/amazon_set_default language LANG_CODE** para cambiar el idioma por defecto del servidor.",

	"command.amazon.voices.embed.title":       "Voces disponibles para el idioma {language}:",
	"command.amazon.voices.embed.description": "Usa **/amazon_set_my voice VOICE_NAME** para cambiar tu voz.\nUsa **/amazon_set_default voice VOICE_NAME** para cambiar la voz por defecto del servidor.",
	"command.amazon.voices.error.unsupported": "El idioma **{language}** no está disponible. Usa **/amazon_langs** para ver los idiomas disponibles.",

	"command.amazon.settings.default.language.unsupported": "El idioma **{language}** no está disponible. Usa **/amazon_langs** para ver los idiomas disponibles.",
	"command.amazon.settings.default.language.success":     "Idioma por defecto cambiado a **{language}** con la voz de **{voice}**.",
	"command.amazon.settings.default.voice.invalidated":    "El idioma por defecto guardado es inválido. Reinícialo con **/amazon_set_default language LANG_CODE**.",
	"command.amazon.settings.default.voice.unsupported":    "La voz **{voice}** no está disponible. Usa **/amazon_voices** para ver las voces disponibles.",
	"command.amazon.settings.default.voice.success":        "Voz por defecto cambiada a **{voice}**.",
	"command.amazon.settings.default.volume.success":       "Volumen por defecto cambiado a **{volume}**.",
	"command.amazon.settings.default.rate.success":         "Ritmo por defecto cambiado a **{rate}**.",
	"command.amazon.settings.default.pitch.success":        "Tono por defecto cambiado a **{pitch}**.",

	"command.amazon.settings.my.language.unsupported": "El idioma **{language}** no está disponible. Usa **/amazon_langs** para ver los idiomas disponibles.",
	"command.amazon.settings.my.language.success":     "Tu idioma fue cambiado a **{language}** con la voz de **{voice}**.",
	"command.amazon.settings.my.voice.invalidated":    "Tu idioma guardado es inválido. Reinícialo con **/amazon_set_my language LANG_CODE**.",
	"command.amazon.settings.my.voice.unsupported":    "La voz **{voice}** no está disponible. Usa **/amazon_voices** para ver las voces disponibles.",
	"command.amazon.settings.my.voice.success":        "Tu voz fue cambiada a **{voice}**.",
	"command.amazon.settings.my.volume.success":       "Tu volumen fue cambiado a **{volume}**.",
	"command.amazon.settings.my.rate.success":         "Tu ritmo fue cambiado a **{rate}**.",
	"command.amazon.settings.my.pitch.success":        "Tu tono fue cambiado a **{pitch}**.",

	"command.settings.default.embed.title":       "Configuración por defecto de este servidor",
	"command.settings.default.embed.description": "Esta configuración se usa cuando no has configurado la tuya propia.",
	"command.settings.my.embed.title":            "Tu configuración actual, {name}",
	"command.settings.my.embed.description":      "Si no has configurado un valor, se muestra el del servidor.",

	"command.locale.success":       "Idioma del bot cambiado a **{locale}**.",
	"command.timeout.out_of_range": "Tiempo inválido. Debe estar entre **{min}** y **{max}** minutos.",
	"command.timeout.success":      "Me iré del canal de voz después de **{timeout}** minutos de inactividad.",
}
