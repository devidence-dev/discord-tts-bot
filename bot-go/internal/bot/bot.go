package bot

import (
	"fmt"
	"log"
	"time"

	"discord-tts-bot/internal/commands"
	"discord-tts-bot/internal/data"
	"discord-tts-bot/internal/player"
	"discord-tts-bot/internal/settings"

	"github.com/bwmarrin/discordgo"
)

// Config holds startup options for the bot.
type Config struct {
	Token          string
	TestingGuildID string // if set, commands are registered only to this guild
	DataPath       string // path for LevelDB
	DefaultTimeout int    // inactivity disconnect timeout in minutes
}

// Bot wraps a discordgo session and all bot-level dependencies.
type Bot struct {
	session  *discordgo.Session
	db       data.Provider
	settings *settings.Manager
	players  *player.Manager
	handler  *commands.Handler
	cfg      Config
}

// New creates a Bot but does not connect.
func New(cfg Config) (*Bot, error) {
	if cfg.DefaultTimeout == 0 {
		cfg.DefaultTimeout = settings.DefaultTimeout
	}

	s, err := discordgo.New("Bot " + cfg.Token)
	if err != nil {
		return nil, fmt.Errorf("bot: create session: %w", err)
	}

	s.Identify.Intents = discordgo.IntentsGuilds |
		discordgo.IntentsGuildVoiceStates |
		discordgo.IntentsGuildMessages

	db, err := data.NewLevelProvider(cfg.DataPath)
	if err != nil {
		return nil, fmt.Errorf("bot: open leveldb: %w", err)
	}

	sm := settings.New(db)
	pm := player.NewManager(s)
	h := commands.New(s, pm, sm)

	b := &Bot{
		session:  s,
		db:       db,
		settings: sm,
		players:  pm,
		handler:  h,
		cfg:      cfg,
	}

	s.AddHandler(b.onReady)
	s.AddHandler(h.Handle)
	s.AddHandler(b.onGuildDelete)
	s.AddHandler(b.onVoiceStateUpdate)

	return b, nil
}

// Start connects to Discord and blocks until Close is called.
func (b *Bot) Start() error {
	return b.session.Open()
}

// Close disconnects and releases resources.
func (b *Bot) Close() {
	b.session.Close()
	b.db.Close() //nolint:errcheck
}

func (b *Bot) onReady(s *discordgo.Session, _ *discordgo.Ready) {
	log.Printf("[bot] logged in as %s#%s", s.State.User.Username, s.State.User.Discriminator)

	cmds := commands.All()
	var err error
	if b.cfg.TestingGuildID != "" {
		_, err = s.ApplicationCommandBulkOverwrite(s.State.User.ID, b.cfg.TestingGuildID, cmds)
	} else {
		_, err = s.ApplicationCommandBulkOverwrite(s.State.User.ID, "", cmds)
	}
	if err != nil {
		log.Printf("[bot] command registration error: %v", err)
	} else {
		log.Printf("[bot] registered %d slash commands", len(cmds))
	}

	s.UpdateGameStatus(0, "/help for help") //nolint:errcheck
}

func (b *Bot) onGuildDelete(_ *discordgo.Session, e *discordgo.GuildDelete) {
	b.players.Delete(e.ID)
	if err := b.settings.ClearGuild(e.ID); err != nil {
		log.Printf("[bot] clear guild %s: %v", e.ID, err)
	}
}

// onVoiceStateUpdate disconnects the bot's player if it is left alone in a channel.
func (b *Bot) onVoiceStateUpdate(s *discordgo.Session, e *discordgo.VoiceStateUpdate) {
	if e.UserID == s.State.User.ID {
		return
	}

	timeout := time.Duration(b.settings.GetTimeout(e.GuildID)) * time.Minute
	p := b.players.Get(e.GuildID, timeout)
	if !p.IsConnected() {
		return
	}

	guild, err := s.State.Guild(e.GuildID)
	if err != nil {
		return
	}

	botChID := p.ChannelID()
	nonBotCount := 0
	for _, vs := range guild.VoiceStates {
		if vs.ChannelID == botChID && vs.UserID != s.State.User.ID {
			nonBotCount++
		}
	}
	if nonBotCount == 0 {
		log.Printf("[bot] alone in channel, leaving guild %s", e.GuildID)
		p.Stop()
	}
}
