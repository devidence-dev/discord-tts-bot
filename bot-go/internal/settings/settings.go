package settings

import "discord-tts-bot/internal/data"

const (
	keyGuildAmazon      = "amazon:settings:default"
	keyUserAmazonPrefix = "amazon:settings:user:"
	keyLocale           = "locale"
	keyTimeout          = "timeout"

	DefaultLocale   = "en"
	DefaultTimeout  = 5 // minutes
	MinTimeout      = 1
	MaxTimeout      = 60
)

// AmazonSettings holds the configurable fields for the Amazon TTS provider.
type AmazonSettings struct {
	Language string `json:"language"`
	Voice    string `json:"voice"`
	Volume   string `json:"volume"`
	Rate     string `json:"rate"`
	Pitch    string `json:"pitch"`
}

// DefaultAmazon is the baseline when nothing has been configured.
var DefaultAmazon = AmazonSettings{
	Language: "en",
	Voice:    "Amazon US English (Salli)",
	Volume:   "default",
	Rate:     "medium",
	Pitch:    "default",
}

// Manager reads and writes guild/user settings on top of a data.Provider.
type Manager struct {
	db data.Provider
}

// New creates a Settings manager backed by db.
func New(db data.Provider) *Manager {
	return &Manager{db: db}
}

// GetEffective returns merged settings for an interaction: defaults → guild override → user override.
func (m *Manager) GetEffective(guildID, userID string) AmazonSettings {
	base := DefaultAmazon
	base = applyOverrides(base, m.loadOverrides(guildID, keyGuildAmazon))
	base = applyOverrides(base, m.loadOverrides(guildID, keyUserAmazonPrefix+userID))
	return base
}

// GetGuild returns the guild-level override merged on top of defaults.
func (m *Manager) GetGuild(guildID string) AmazonSettings {
	return applyOverrides(DefaultAmazon, m.loadOverrides(guildID, keyGuildAmazon))
}

// SetGuild updates one field of the guild default settings.
func (m *Manager) SetGuild(guildID, field, value string) error {
	overrides := m.loadOverrides(guildID, keyGuildAmazon)
	overrides[field] = value
	return m.db.Set(guildID, keyGuildAmazon, overrides)
}

// SetUser updates one field of the user's personal settings within a guild.
func (m *Manager) SetUser(guildID, userID, field, value string) error {
	key := keyUserAmazonPrefix + userID
	overrides := m.loadOverrides(guildID, key)
	overrides[field] = value
	return m.db.Set(guildID, key, overrides)
}

// GetLocale returns the configured locale for a guild, defaulting to DefaultLocale.
func (m *Manager) GetLocale(guildID string) string {
	v, _ := m.db.GetString(guildID, keyLocale, DefaultLocale)
	return v
}

// SetLocale persists the locale for a guild.
func (m *Manager) SetLocale(guildID, locale string) error {
	return m.db.Set(guildID, keyLocale, locale)
}

// GetTimeout returns the inactivity timeout (minutes) for a guild.
func (m *Manager) GetTimeout(guildID string) int {
	v, _ := m.db.GetInt(guildID, keyTimeout, DefaultTimeout)
	return v
}

// SetTimeout persists the inactivity timeout for a guild.
func (m *Manager) SetTimeout(guildID string, minutes int) error {
	return m.db.Set(guildID, keyTimeout, minutes)
}

// ClearGuild removes all stored data for a guild (called on guild leave).
func (m *Manager) ClearGuild(guildID string) error {
	return m.db.Clear(guildID)
}

// loadOverrides reads a map[string]string from LevelDB; returns empty map on miss.
func (m *Manager) loadOverrides(guildID, key string) map[string]string {
	raw, err := m.db.GetMap(guildID, key, nil)
	if err != nil || raw == nil {
		return map[string]string{}
	}
	result := make(map[string]string, len(raw))
	for k, v := range raw {
		if s, ok := v.(string); ok {
			result[k] = s
		}
	}
	return result
}

// applyOverrides returns a copy of base with non-empty fields from overrides applied.
func applyOverrides(base AmazonSettings, overrides map[string]string) AmazonSettings {
	if v := overrides["language"]; v != "" {
		base.Language = v
	}
	if v := overrides["voice"]; v != "" {
		base.Voice = v
	}
	if v := overrides["volume"]; v != "" {
		base.Volume = v
	}
	if v := overrides["rate"]; v != "" {
		base.Rate = v
	}
	if v := overrides["pitch"]; v != "" {
		base.Pitch = v
	}
	return base
}
