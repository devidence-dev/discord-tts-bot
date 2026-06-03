package commands

import (
	"log"
	"regexp"
	"time"

	"discord-tts-bot/internal/locale"

	"github.com/bwmarrin/discordgo"
)

var urlRegex = regexp.MustCompile(`https?://\S+`)

func (h *Handler) amazonSay(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	msg := i.ApplicationCommandData().Options[0].StringValue()
	sanitized := urlRegex.ReplaceAllString(msg, "ඞ")

	memberCh := memberVoiceChannel(s, i)
	if memberCh == "" {
		reply(s, i, loc.T("command.say.no_channel"), true)
		return
	}

	timeout := time.Duration(h.settings.GetTimeout(i.GuildID)) * time.Minute
	p := h.players.Get(i.GuildID, timeout)

	if p.IsConnected() {
		if p.ChannelID() != memberCh {
			reply(s, i, loc.T("command.say.different_channel"), true)
			return
		}
		s := h.settings.GetEffective(i.GuildID, i.Member.User.ID)
		p.Say(sanitized, s)
		reply(h.session, i, loc.T("command.say.success", map[string]string{"request": msg}), false)
		return
	}

	// Check permissions.
	if reason := cantConnectReason(h.session, memberCh, i.GuildID); reason != "" {
		reply(s, i, loc.T(reason), true)
		return
	}

	if err := p.Connect(memberCh); err != nil {
		log.Printf("[commands] connect error guild=%s: %v", i.GuildID, err)
		reply(s, i, "Failed to join your voice channel.", true)
		return
	}

	ch, _ := s.State.Channel(memberCh)
	chMention := "<#" + memberCh + ">"
	if ch != nil {
		chMention = ch.Name
	}

	eff := h.settings.GetEffective(i.GuildID, i.Member.User.ID)
	p.Say(sanitized, eff)

	reply(s, i,
		loc.T("command.say.joined.withrequest", map[string]string{"channel": chMention, "request": msg}),
		false,
	)
}

// cantConnectReason returns a locale key describing why the bot cannot join the channel,
// or "" if it can join.
func cantConnectReason(s *discordgo.Session, channelID, guildID string) string {
	guild, err := s.State.Guild(guildID)
	if err != nil {
		return ""
	}
	botID := s.State.User.ID
	perms, err := s.State.UserChannelPermissions(botID, channelID)
	if err != nil {
		return ""
	}

	_ = guild
	if perms&discordgo.PermissionViewChannel == 0 {
		return "error.channel.not_viewable"
	}

	ch, err := s.State.Channel(channelID)
	if err != nil {
		return ""
	}
	if ch.UserLimit > 0 {
		count := 0
		for _, vs := range guild.VoiceStates {
			if vs.ChannelID == channelID {
				count++
			}
		}
		if count >= ch.UserLimit {
			return "error.channel.full"
		}
	}

	if perms&discordgo.PermissionVoiceConnect == 0 {
		return "error.channel.not_joinable"
	}
	if perms&discordgo.PermissionVoiceSpeak == 0 {
		return "error.channel.not_speakable"
	}
	return ""
}

