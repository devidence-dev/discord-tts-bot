package player

import (
	"context"
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"os/exec"
	"sync"
	"time"

	"discord-tts-bot/internal/provider"
	"discord-tts-bot/internal/settings"

	"github.com/bwmarrin/discordgo"
	"layeh.com/gopus"
)

const (
	sampleRate = 48000
	channels   = 2
	frameSize  = 960 // 20 ms at 48 kHz
	maxBytes   = frameSize * channels * 2
)

type queueItem struct {
	sentence string
	s        settings.AmazonSettings
}

// Player manages TTS playback for a single guild.
type Player struct {
	session *discordgo.Session
	guildID string
	timeout time.Duration

	mu      sync.Mutex
	vc      *discordgo.VoiceConnection
	queue   []queueItem
	playing bool
	cancel  context.CancelFunc

	timer *time.Timer
}

// Manager holds a Player per guild.
type Manager struct {
	mu      sync.RWMutex
	players map[string]*Player
	session *discordgo.Session
}

// NewManager returns a Manager tied to a discordgo session.
func NewManager(s *discordgo.Session) *Manager {
	return &Manager{
		players: make(map[string]*Player),
		session: s,
	}
}

// Get returns (creating if necessary) the Player for guildID.
func (m *Manager) Get(guildID string, timeout time.Duration) *Player {
	m.mu.RLock()
	p, ok := m.players[guildID]
	m.mu.RUnlock()
	if ok {
		return p
	}

	m.mu.Lock()
	defer m.mu.Unlock()
	if p, ok = m.players[guildID]; ok {
		return p
	}
	p = &Player{
		session: m.session,
		guildID: guildID,
		timeout: timeout,
	}
	m.players[guildID] = p
	return p
}

// Delete stops and removes the Player for guildID.
func (m *Manager) Delete(guildID string) {
	m.mu.Lock()
	p, ok := m.players[guildID]
	delete(m.players, guildID)
	m.mu.Unlock()
	if ok {
		p.Stop()
	}
}

// IsConnected reports whether the player currently has a voice connection.
func (p *Player) IsConnected() bool {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.vc != nil
}

// ChannelID returns the current voice channel ID, or "" if not connected.
func (p *Player) ChannelID() string {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.vc == nil {
		return ""
	}
	return p.vc.ChannelID
}

// Connect joins the given voice channel.
func (p *Player) Connect(channelID string) error {
	vc, err := p.session.ChannelVoiceJoin(p.guildID, channelID, false, true)
	if err != nil {
		return fmt.Errorf("player: join channel %s: %w", channelID, err)
	}
	p.mu.Lock()
	p.vc = vc
	p.mu.Unlock()
	return nil
}

// Say enqueues a sentence and starts playback if idle.
func (p *Player) Say(sentence string, s settings.AmazonSettings) {
	p.mu.Lock()
	defer p.mu.Unlock()

	p.queue = append(p.queue, queueItem{sentence, s})
	p.resetTimer()

	if !p.playing {
		p.playing = true
		ctx, cancel := context.WithCancel(context.Background())
		p.cancel = cancel
		go p.playLoop(ctx)
	}
}

// Stop clears the queue, stops playback, and disconnects from voice.
// Returns the channel name that was left (empty string if not connected).
func (p *Player) Stop() string {
	p.mu.Lock()
	cancel := p.cancel
	vc := p.vc
	p.queue = nil
	p.playing = false
	p.vc = nil
	p.cancel = nil
	if p.timer != nil {
		p.timer.Stop()
		p.timer = nil
	}
	p.mu.Unlock()

	if cancel != nil {
		cancel()
	}
	if vc != nil {
		channelID := vc.ChannelID
		vc.Disconnect()
		// Resolve channel name from session state.
		if ch, err := p.session.State.Channel(channelID); err == nil {
			return ch.Name
		}
		return channelID
	}
	return ""
}

// UpdateTimeout updates the inactivity timeout used by this player.
func (p *Player) UpdateTimeout(d time.Duration) {
	p.mu.Lock()
	p.timeout = d
	p.mu.Unlock()
}

// playLoop dequeues and plays items until the queue is empty.
func (p *Player) playLoop(ctx context.Context) {
	defer func() {
		p.mu.Lock()
		p.playing = false
		p.mu.Unlock()
	}()

	for {
		p.mu.Lock()
		if len(p.queue) == 0 {
			p.mu.Unlock()
			return
		}
		item := p.queue[0]
		p.queue = p.queue[1:]
		vc := p.vc
		p.mu.Unlock()

		if vc == nil {
			return
		}

		audioURL, err := provider.GetAudioURL(
			item.sentence,
			item.s.Language,
			item.s.Voice,
			item.s.Volume,
			item.s.Rate,
			item.s.Pitch,
		)
		if err != nil {
			log.Printf("[player] Amazon error for guild %s: %v", p.guildID, err)
			continue
		}

		if err := playAudio(ctx, vc, audioURL); err != nil && ctx.Err() == nil {
			log.Printf("[player] playback error for guild %s: %v", p.guildID, err)
		}

		select {
		case <-ctx.Done():
			return
		default:
		}
	}
}

// playAudio streams audioURL through ffmpeg, encodes to Opus, and sends to Discord.
func playAudio(ctx context.Context, vc *discordgo.VoiceConnection, audioURL string) error {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-reconnect", "1",
		"-reconnect_streamed", "1",
		"-reconnect_delay_max", "5",
		"-i", audioURL,
		"-f", "s16le",
		"-ar", "48000",
		"-ac", "2",
		"-loglevel", "quiet",
		"pipe:1",
	)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("ffmpeg start: %w", err)
	}

	enc, err := gopus.NewEncoder(sampleRate, channels, gopus.Audio)
	if err != nil {
		cmd.Process.Kill()
		return fmt.Errorf("opus encoder: %w", err)
	}
	enc.SetBitrate(128000)

	if err := vc.Speaking(true); err != nil {
		cmd.Process.Kill()
		return err
	}
	defer vc.Speaking(false) //nolint:errcheck

	rawBuf := make([]byte, maxBytes)
	pcmBuf := make([]int16, frameSize*channels)

	for {
		if _, err := io.ReadFull(stdout, rawBuf); err != nil {
			break
		}
		for i := range pcmBuf {
			pcmBuf[i] = int16(binary.LittleEndian.Uint16(rawBuf[i*2:]))
		}
		opus, err := enc.Encode(pcmBuf, frameSize, maxBytes)
		if err != nil {
			break
		}
		select {
		case vc.OpusSend <- opus:
		case <-ctx.Done():
			cmd.Process.Kill()
			return nil
		}
	}

	return cmd.Wait()
}

// resetTimer (re)starts the inactivity disconnect timer. Must be called with p.mu held.
func (p *Player) resetTimer() {
	if p.timer != nil {
		p.timer.Stop()
	}
	if p.timeout <= 0 {
		return
	}
	p.timer = time.AfterFunc(p.timeout, func() {
		log.Printf("[player] inactivity timeout — leaving guild %s", p.guildID)
		p.Stop()
	})
}
