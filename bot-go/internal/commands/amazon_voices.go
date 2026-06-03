package commands

import (
	"fmt"
	"strings"

	"discord-tts-bot/internal/locale"
	"discord-tts-bot/internal/provider"

	"github.com/bwmarrin/discordgo"
)

func (h *Handler) amazonVoices(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	langCode := i.ApplicationCommandData().Options[0].StringValue()

	lang, ok := provider.Languages[langCode]
	if !ok {
		reply(s, i, loc.T("command.amazon.voices.error.unsupported", map[string]string{"language": langCode}), true)
		return
	}

	var sb strings.Builder
	for _, v := range lang.Voices {
		sb.WriteString(fmt.Sprintf("**%s** — %s (`%s`)\n", v.Emoji, v.Name, v.ID))
	}

	replyEmbed(s, i, &discordgo.MessageEmbed{
		Title: loc.T("command.amazon.voices.embed.title", map[string]string{"language": lang.Name}),
		Description: loc.T("command.amazon.voices.embed.description") + "\n\n" + sb.String(),
		Color: 0x3498db,
	})
}
