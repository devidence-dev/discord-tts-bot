package commands

import (
	"log"
	"strings"

	"discord-tts-bot/internal/locale"
	"discord-tts-bot/internal/provider"

	"github.com/bwmarrin/discordgo"
)

func (h *Handler) amazonSetDefault(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	sub := i.ApplicationCommandData().Options[0]

	switch sub.Name {
	case "language":
		langCode := sub.Options[0].StringValue()
		lang, ok := provider.Languages[langCode]
		if !ok {
			reply(s, i, loc.T("command.amazon.settings.default.language.unsupported", map[string]string{"language": langCode}), true)
			return
		}
		defaultVoice := lang.Voices[0]
		if err := h.settings.SetGuild(i.GuildID, "language", langCode); err != nil {
			log.Printf("[commands] SetGuild language error: %v", err)
		}
		if err := h.settings.SetGuild(i.GuildID, "voice", defaultVoice.ID); err != nil {
			log.Printf("[commands] SetGuild voice error: %v", err)
		}
		reply(s, i, loc.T("command.amazon.settings.default.language.success", map[string]string{
			"language": lang.Name,
			"voice":    defaultVoice.Name,
		}), true)

	case "voice":
		voiceName := strings.ToLower(sub.Options[0].StringValue())
		guild := h.settings.GetGuild(i.GuildID)
		lang, ok := provider.Languages[guild.Language]
		if !ok {
			reply(s, i, loc.T("command.amazon.settings.default.voice.invalidated"), true)
			return
		}
		var found *provider.Voice
		for _, v := range lang.Voices {
			if strings.ToLower(v.Name) == voiceName {
				found = &v
				break
			}
		}
		if found == nil {
			reply(s, i, loc.T("command.amazon.settings.default.voice.unsupported", map[string]string{"voice": voiceName}), true)
			return
		}
		h.settings.SetGuild(i.GuildID, "voice", found.ID) //nolint:errcheck
		reply(s, i, loc.T("command.amazon.settings.default.voice.success", map[string]string{"voice": found.Name}), true)

	case "volume":
		v := sub.Options[0].StringValue()
		h.settings.SetGuild(i.GuildID, "volume", v) //nolint:errcheck
		reply(s, i, loc.T("command.amazon.settings.default.volume.success", map[string]string{"volume": v}), true)

	case "rate":
		v := sub.Options[0].StringValue()
		h.settings.SetGuild(i.GuildID, "rate", v) //nolint:errcheck
		reply(s, i, loc.T("command.amazon.settings.default.rate.success", map[string]string{"rate": v}), true)

	case "pitch":
		v := sub.Options[0].StringValue()
		h.settings.SetGuild(i.GuildID, "pitch", v) //nolint:errcheck
		reply(s, i, loc.T("command.amazon.settings.default.pitch.success", map[string]string{"pitch": v}), true)
	}
}
