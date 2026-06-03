package commands

import (
	"log"
	"strings"

	"discord-tts-bot/internal/locale"
	"discord-tts-bot/internal/provider"

	"github.com/bwmarrin/discordgo"
)

func (h *Handler) amazonSetMy(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	sub := i.ApplicationCommandData().Options[0]
	userID := i.Member.User.ID

	switch sub.Name {
	case "language":
		langCode := sub.Options[0].StringValue()
		lang, ok := provider.Languages[langCode]
		if !ok {
			reply(s, i, loc.T("command.amazon.settings.my.language.unsupported", map[string]string{"language": langCode}), true)
			return
		}
		defaultVoice := lang.Voices[0]
		if err := h.settings.SetUser(i.GuildID, userID, "language", langCode); err != nil {
			log.Printf("[commands] SetUser language error: %v", err)
		}
		if err := h.settings.SetUser(i.GuildID, userID, "voice", defaultVoice.ID); err != nil {
			log.Printf("[commands] SetUser voice error: %v", err)
		}
		reply(s, i, loc.T("command.amazon.settings.my.language.success", map[string]string{
			"language": lang.Name,
			"voice":    defaultVoice.Name,
		}), true)

	case "voice":
		voiceName := strings.ToLower(sub.Options[0].StringValue())
		eff := h.settings.GetEffective(i.GuildID, userID)
		lang, ok := provider.Languages[eff.Language]
		if !ok {
			reply(s, i, loc.T("command.amazon.settings.my.voice.invalidated"), true)
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
			reply(s, i, loc.T("command.amazon.settings.my.voice.unsupported", map[string]string{"voice": voiceName}), true)
			return
		}
		if err := h.settings.SetUser(i.GuildID, userID, "voice", found.ID); err != nil {
			log.Printf("[commands] SetUser voice error: %v", err)
		}
		reply(s, i, loc.T("command.amazon.settings.my.voice.success", map[string]string{"voice": found.Name}), true)

	case "volume":
		v := sub.Options[0].StringValue()
		h.settings.SetUser(i.GuildID, userID, "volume", v) //nolint:errcheck
		reply(s, i, loc.T("command.amazon.settings.my.volume.success", map[string]string{"volume": v}), true)

	case "rate":
		v := sub.Options[0].StringValue()
		h.settings.SetUser(i.GuildID, userID, "rate", v) //nolint:errcheck
		reply(s, i, loc.T("command.amazon.settings.my.rate.success", map[string]string{"rate": v}), true)

	case "pitch":
		v := sub.Options[0].StringValue()
		h.settings.SetUser(i.GuildID, userID, "pitch", v) //nolint:errcheck
		reply(s, i, loc.T("command.amazon.settings.my.pitch.success", map[string]string{"pitch": v}), true)
	}
}
