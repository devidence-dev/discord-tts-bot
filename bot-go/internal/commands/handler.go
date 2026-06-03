package commands

import (
	"discord-tts-bot/internal/locale"
	"discord-tts-bot/internal/player"
	"discord-tts-bot/internal/settings"

	"github.com/bwmarrin/discordgo"
)

// Handler holds all dependencies and routes Discord interactions to the right command.
type Handler struct {
	session  *discordgo.Session
	players  *player.Manager
	settings *settings.Manager
}

// New returns a Handler wired to the given dependencies.
func New(s *discordgo.Session, pm *player.Manager, sm *settings.Manager) *Handler {
	return &Handler{session: s, players: pm, settings: sm}
}

// Handle is the discordgo InteractionCreate callback.
func (h *Handler) Handle(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Type != discordgo.InteractionApplicationCommand {
		return
	}

	data := i.ApplicationCommandData()
	loc := locale.New(h.settings.GetLocale(i.GuildID))

	switch data.Name {
	case "amazon_say":
		h.amazonSay(s, i, loc)
	case "amazon_langs":
		h.amazonLangs(s, i, loc)
	case "amazon_voices":
		h.amazonVoices(s, i, loc)
	case "amazon_set_my":
		h.amazonSetMy(s, i, loc)
	case "amazon_set_default":
		h.amazonSetDefault(s, i, loc)
	case "stop":
		h.stop(s, i, loc)
	case "help":
		h.help(s, i, loc)
	case "set_locale":
		h.setLocale(s, i, loc)
	case "set_timeout":
		h.setTimeout(s, i, loc)
	case "my_settings":
		h.mySettings(s, i, loc)
	case "default_settings":
		h.defaultSettings(s, i, loc)
	}
}

// reply sends an ephemeral reply.
func reply(s *discordgo.Session, i *discordgo.InteractionCreate, content string, ephemeral bool) {
	flags := discordgo.MessageFlags(0)
	if ephemeral {
		flags = discordgo.MessageFlagsEphemeral
	}
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{ //nolint:errcheck
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: content,
			Flags:   flags,
		},
	})
}

// replyEmbed sends a public reply with an embed.
func replyEmbed(s *discordgo.Session, i *discordgo.InteractionCreate, embed *discordgo.MessageEmbed) {
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{ //nolint:errcheck
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Embeds: []*discordgo.MessageEmbed{embed},
		},
	})
}

// memberVoiceChannel returns the voice channel ID the interacting member is in, or "".
func memberVoiceChannel(s *discordgo.Session, i *discordgo.InteractionCreate) string {
	guild, err := s.State.Guild(i.GuildID)
	if err != nil {
		return ""
	}
	for _, vs := range guild.VoiceStates {
		if vs.UserID == i.Member.User.ID {
			return vs.ChannelID
		}
	}
	return ""
}
