package commands

import (
	"fmt"

	"discord-tts-bot/internal/locale"
	"discord-tts-bot/internal/settings"

	"github.com/bwmarrin/discordgo"
)

func (h *Handler) setLocale(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	code := i.ApplicationCommandData().Options[0].StringValue()
	if !locale.IsSupported(code) {
		reply(s, i, "Unsupported locale.", true)
		return
	}
	h.settings.SetLocale(i.GuildID, code) //nolint:errcheck

	newLoc := locale.New(code)
	reply(s, i, newLoc.T("command.locale.success", map[string]string{"locale": code}), true)
}

func (h *Handler) setTimeout(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	minutes := int(i.ApplicationCommandData().Options[0].IntValue())
	if minutes < settings.MinTimeout || minutes > settings.MaxTimeout {
		reply(s, i, loc.T("command.timeout.out_of_range", map[string]string{
			"min": fmt.Sprint(settings.MinTimeout),
			"max": fmt.Sprint(settings.MaxTimeout),
		}), true)
		return
	}
	h.settings.SetTimeout(i.GuildID, minutes) //nolint:errcheck
	reply(s, i, loc.T("command.timeout.success", map[string]string{"timeout": fmt.Sprint(minutes)}), true)
}

func (h *Handler) mySettings(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	eff := h.settings.GetEffective(i.GuildID, i.Member.User.ID)
	replyEmbed(s, i, settingsEmbed(
		loc.T("command.settings.my.embed.title", map[string]string{"name": i.Member.Nick}),
		loc.T("command.settings.my.embed.description"),
		eff,
	))
}

func (h *Handler) defaultSettings(s *discordgo.Session, i *discordgo.InteractionCreate, loc *locale.Localizer) {
	guild := h.settings.GetGuild(i.GuildID)
	replyEmbed(s, i, settingsEmbed(
		loc.T("command.settings.default.embed.title"),
		loc.T("command.settings.default.embed.description"),
		guild,
	))
}

func settingsEmbed(title, description string, s settings.AmazonSettings) *discordgo.MessageEmbed {
	return &discordgo.MessageEmbed{
		Title:       title,
		Description: description,
		Color:       0x9b59b6,
		Fields: []*discordgo.MessageEmbedField{
			{Name: "Language", Value: s.Language, Inline: true},
			{Name: "Voice", Value: s.Voice, Inline: true},
			{Name: "Volume", Value: s.Volume, Inline: true},
			{Name: "Rate", Value: s.Rate, Inline: true},
			{Name: "Pitch", Value: s.Pitch, Inline: true},
		},
	}
}
