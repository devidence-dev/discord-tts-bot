package commands

import (
	"time"

	"discord-tts-bot/internal/locale"

	"github.com/bwmarrin/discordgo"
)

func (h *Handler) stop(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	timeout := time.Duration(h.settings.GetTimeout(i.GuildID)) * time.Minute
	p := h.players.Get(i.GuildID, timeout)

	if !p.IsConnected() {
		reply(s, i, loc.T("command.stop.no_connection"), true)
		return
	}

	memberCh := memberVoiceChannel(s, i)
	if memberCh != "" && p.ChannelID() != memberCh {
		reply(s, i, loc.T("command.stop.different_channel"), true)
		return
	}

	channelName := p.Stop()
	reply(s, i, loc.T("command.stop.success", map[string]string{"channel": channelName}), false)
}
