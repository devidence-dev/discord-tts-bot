package locale

var enStrings = map[string]string{
	"error.channel.not_viewable":  "I cannot see your voice channel. Do I have enough permissions to view it?",
	"error.channel.full":          "Your voice channel is full.",
	"error.channel.not_joinable":  "I cannot join your voice channel. Do I have enough permissions to join it?",
	"error.channel.not_speakable": "I cannot speak in your voice channel. Do I have enough permissions to speak in it?",

	"command.say.no_channel":          "You need to be in a voice channel first.",
	"command.say.different_channel":   "You need to be in my same voice channel to say something.",
	"command.say.success":             `Saying "{request}".`,
	"command.say.joined.withrequest":  `Joined {channel} - Saying "{request}".`,
	"command.say.joined":              "Joined {channel}.",

	"command.stop.no_connection":    "I'm not in a voice channel.",
	"command.stop.different_channel": "You need to be in my voice channel to stop me.",
	"command.stop.success":          "Successfully left the voice channel {channel}.",

	"command.help.embed.title":       "Text-to-Speech Help Message",
	"command.help.description":       "This bot uses Amazon TTS to speak messages in your voice channel.\n\n**Commands:**\n`/amazon_say` — Say a message.\n`/amazon_langs` — List supported languages.\n`/amazon_voices` — List voices for a language.\n`/amazon_set_my` — Set your personal settings.\n`/amazon_set_default` — Set the guild default settings.\n`/stop` — Stop TTS and leave the channel.\n`/set_locale` — Set the bot language (en/es).\n`/set_timeout` — Set the inactivity timeout.",

	"command.amazon.langs.embed.title":       "Supported languages by the Amazon provider:",
	"command.amazon.langs.embed.description": "Use **/amazon_set_my language LANG_CODE** to change your language.\nUse **/amazon_set_default language LANG_CODE** to change the guild default.",

	"command.amazon.voices.embed.title":       "Voices available for the {language} language:",
	"command.amazon.voices.embed.description": "Use **/amazon_set_my voice VOICE_NAME** to change your voice.\nUse **/amazon_set_default voice VOICE_NAME** to change the guild default.",
	"command.amazon.voices.error.unsupported": "Language **{language}** is not supported. Use **/amazon_langs** to see available languages.",

	"command.amazon.settings.default.language.unsupported": "Language **{language}** is not supported. Use **/amazon_langs** to see available languages.",
	"command.amazon.settings.default.language.success":     "Default language changed to **{language}** with **{voice}**'s voice.",
	"command.amazon.settings.default.voice.invalidated":    "The default language is invalid. Reset it with **/amazon_set_default language LANG_CODE**.",
	"command.amazon.settings.default.voice.unsupported":    "Voice **{voice}** is not supported. Use **/amazon_voices** to see available voices.",
	"command.amazon.settings.default.voice.success":        "Default voice changed to **{voice}**.",
	"command.amazon.settings.default.volume.success":       "Default volume changed to **{volume}**.",
	"command.amazon.settings.default.rate.success":         "Default rate changed to **{rate}**.",
	"command.amazon.settings.default.pitch.success":        "Default pitch changed to **{pitch}**.",

	"command.amazon.settings.my.language.unsupported": "Language **{language}** is not supported. Use **/amazon_langs** to see available languages.",
	"command.amazon.settings.my.language.success":     "Your language changed to **{language}** with **{voice}**'s voice.",
	"command.amazon.settings.my.voice.invalidated":    "Your stored language is invalid. Reset it with **/amazon_set_my language LANG_CODE**.",
	"command.amazon.settings.my.voice.unsupported":    "Voice **{voice}** is not supported. Use **/amazon_voices** to see available voices.",
	"command.amazon.settings.my.voice.success":        "Your voice changed to **{voice}**.",
	"command.amazon.settings.my.volume.success":       "Your volume changed to **{volume}**.",
	"command.amazon.settings.my.rate.success":         "Your rate changed to **{rate}**.",
	"command.amazon.settings.my.pitch.success":        "Your pitch changed to **{pitch}**.",

	"command.settings.default.embed.title":       "Default settings for this guild",
	"command.settings.default.embed.description": "These settings are used when you have not configured your own.",
	"command.settings.my.embed.title":            "Your current settings, {name}",
	"command.settings.my.embed.description":      "If you haven't set a value yet, the guild default is shown.",

	"command.locale.success":          "Bot language changed to **{locale}**.",
	"command.timeout.out_of_range":    "Invalid time. Must be between **{min}** and **{max}** minutes.",
	"command.timeout.success":         "I will leave after **{timeout}** minutes of inactivity.",
}
