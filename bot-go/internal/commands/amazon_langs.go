package commands

import (
	"fmt"
	"sort"
	"strings"

	"discord-tts-bot/internal/locale"
	"discord-tts-bot/internal/provider"

	"github.com/bwmarrin/discordgo"
)

func (h *Handler) amazonLangs(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	codes := make([]string, 0, len(provider.Languages))
	for code := range provider.Languages {
		codes = append(codes, code)
	}
	sort.Strings(codes)

	var sb strings.Builder
	for _, code := range codes {
		lang := provider.Languages[code]
		sb.WriteString(fmt.Sprintf("**%s** — %s (`%s`)\n", lang.Emoji, lang.Name, code))
	}

	replyEmbed(s, i, &discordgo.MessageEmbed{
		Title:       loc.T("command.amazon.langs.embed.title"),
		Description: loc.T("command.amazon.langs.embed.description") + "\n\n" + sb.String(),
		Color:       0x3498db,
	})
}
