package commands

import (
	"discord-tts-bot/internal/locale"

	"github.com/bwmarrin/discordgo"
)

func (h *Handler) help(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	replyEmbed(s, i, &discordgo.MessageEmbed{
		Title:       loc.T("command.help.embed.title"),
		Description: loc.T("command.help.description"),
		Color:       0x2ecc71,
	})
}
