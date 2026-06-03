package commands

import (
	"discord-tts-bot/internal/provider"

	"github.com/bwmarrin/discordgo"
)

// All returns the list of ApplicationCommand definitions to register with Discord.
func All() []*discordgo.ApplicationCommand {
	return []*discordgo.ApplicationCommand{
		amazonSayDef(),
		amazonLangsDef(),
		amazonVoicesDef(),
		amazonSetMyDef(),
		amazonSetDefaultDef(),
		stopDef(),
		helpDef(),
		setLocaleDef(),
		setTimeoutDef(),
		mySettingsDef(),
		defaultSettingsDef(),
	}
}

func amazonSayDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "amazon_say",
		Description: "Say a message using Amazon TTS in your voice channel.",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "message",
				Description: "The message to say in your voice channel.",
				Required:    true,
			},
		},
	}
}

func amazonLangsDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "amazon_langs",
		Description: "List the languages supported by the Amazon provider.",
	}
}

func amazonVoicesDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "amazon_voices",
		Description: "List voices available for a given Amazon language.",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "language",
				Description: "Language code (e.g. en, es). Use /amazon_langs for the full list.",
				Required:    true,
			},
		},
	}
}

func settingSubcommands() []*discordgo.ApplicationCommandOption {
	return []*discordgo.ApplicationCommandOption{
		{
			Type:        discordgo.ApplicationCommandOptionSubCommand,
			Name:        "language",
			Description: "Set the language.",
			Options: []*discordgo.ApplicationCommandOption{
				{Type: discordgo.ApplicationCommandOptionString, Name: "value", Description: "Language code. Use /amazon_langs for the full list.", Required: true},
			},
		},
		{
			Type:        discordgo.ApplicationCommandOptionSubCommand,
			Name:        "voice",
			Description: "Set the voice.",
			Options: []*discordgo.ApplicationCommandOption{
				{Type: discordgo.ApplicationCommandOptionString, Name: "value", Description: "Voice name. Use /amazon_voices to see available voices.", Required: true},
			},
		},
		{
			Type:        discordgo.ApplicationCommandOptionSubCommand,
			Name:        "volume",
			Description: "Set the volume.",
			Options: []*discordgo.ApplicationCommandOption{
				{Type: discordgo.ApplicationCommandOptionString, Name: "value", Description: "Volume level.", Required: true, Choices: choicesFrom(provider.VolumeChoices())},
			},
		},
		{
			Type:        discordgo.ApplicationCommandOptionSubCommand,
			Name:        "rate",
			Description: "Set the speech rate.",
			Options: []*discordgo.ApplicationCommandOption{
				{Type: discordgo.ApplicationCommandOptionString, Name: "value", Description: "Speech rate.", Required: true, Choices: choicesFrom(provider.RateChoices())},
			},
		},
		{
			Type:        discordgo.ApplicationCommandOptionSubCommand,
			Name:        "pitch",
			Description: "Set the pitch.",
			Options: []*discordgo.ApplicationCommandOption{
				{Type: discordgo.ApplicationCommandOptionString, Name: "value", Description: "Pitch level.", Required: true, Choices: choicesFrom(provider.PitchChoices())},
			},
		},
	}
}

func amazonSetMyDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "amazon_set_my",
		Description: "Set your personal Amazon TTS settings.",
		Options:     settingSubcommands(),
	}
}

func amazonSetDefaultDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "amazon_set_default",
		Description: "Set the guild default Amazon TTS settings.",
		Options:     settingSubcommands(),
	}
}

func stopDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "stop",
		Description: "Stop TTS and leave the voice channel.",
	}
}

func helpDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "help",
		Description: "Show bot help information.",
	}
}

func setLocaleDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "set_locale",
		Description: "Set the bot language for this server.",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "locale",
				Description: "Language code.",
				Required:    true,
				Choices: []*discordgo.ApplicationCommandOptionChoice{
					{Name: "English", Value: "en"},
					{Name: "Español", Value: "es"},
				},
			},
		},
	}
}

func setTimeoutDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "set_timeout",
		Description: "Set the inactivity disconnect timeout.",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionInteger,
				Name:        "minutes",
				Description: "Minutes of inactivity before leaving (1–60).",
				Required:    true,
				MinValue:    ptr(1.0),
				MaxValue:    60,
			},
		},
	}
}

func mySettingsDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "my_settings",
		Description: "Show your current Amazon TTS settings.",
	}
}

func defaultSettingsDef() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "default_settings",
		Description: "Show the guild default Amazon TTS settings.",
	}
}

// choicesFrom converts [][2]string pairs to discordgo option choices.
func choicesFrom(pairs [][2]string) []*discordgo.ApplicationCommandOptionChoice {
	out := make([]*discordgo.ApplicationCommandOptionChoice, len(pairs))
	for i, p := range pairs {
		out[i] = &discordgo.ApplicationCommandOptionChoice{Name: p[0], Value: p[1]}
	}
	return out
}

func ptr(f float64) *float64 { return &f }
