package provider

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	_ "embed"
)

//go:embed amazon_languages.json
var langDataRaw []byte

const (
	createPartsURL = "https://support.readaloud.app/ttstool/createParts"
	getPartsURL    = "https://support.readaloud.app/ttstool/getParts"
)

// Voice represents a single Amazon TTS voice.
type Voice struct {
	Name  string `json:"name"`
	Emoji string `json:"emoji"`
	ID    string `json:"id"`
}

// Language represents a supported Amazon TTS language.
type Language struct {
	Name   string  `json:"name"`
	Emoji  string  `json:"emoji"`
	ID     string  `json:"id"` // BCP-47 locale code for SSML xml:lang
	Voices []Voice `json:"voices"`
}

// Languages is the full map of language code -> Language, loaded from embedded JSON.
var Languages map[string]Language

func init() {
	if err := json.Unmarshal(langDataRaw, &Languages); err != nil {
		panic(fmt.Sprintf("provider: failed to parse Amazon language data: %v", err))
	}
}

// VolumeChoices returns the allowed volume values.
func VolumeChoices() [][2]string {
	return [][2]string{
		{"Default Volume", "default"},
		{"Silent", "silent"},
		{"Extra Soft", "x-soft"},
		{"Soft", "soft"},
		{"Medium", "medium"},
		{"Loud", "loud"},
		{"Extra Loud", "x-loud"},
	}
}

// RateChoices returns the allowed rate values.
func RateChoices() [][2]string {
	return [][2]string{
		{"Extra Slow", "x-slow"},
		{"Slow", "slow"},
		{"Medium", "medium"},
		{"Fast", "fast"},
		{"Extra Fast", "x-fast"},
	}
}

// PitchChoices returns the allowed pitch values.
func PitchChoices() [][2]string {
	return [][2]string{
		{"Default Pitch", "default"},
		{"Extra Low", "x-low"},
		{"Low", "low"},
		{"Medium", "medium"},
		{"High", "high"},
		{"Extra High", "x-high"},
	}
}

type createPartsRequest struct {
	VoiceID string `json:"voiceId"`
	SSML    string `json:"ssml"`
}

// GetAudioURL calls the Amazon TTS Tool API and returns a URL to the audio file.
func GetAudioURL(sentence, langCode, voiceID, volume, rate, pitch string) (string, error) {
	lang, ok := Languages[langCode]
	if !ok {
		return "", fmt.Errorf("provider: unsupported language %q", langCode)
	}

	ssml := fmt.Sprintf(
		`<speak version="1.0" xml:lang="%s"><prosody volume="%s" rate="%s" pitch="%s">%s</prosody></speak>`,
		lang.ID, volume, rate, pitch, sentence,
	)

	body, err := json.Marshal([]createPartsRequest{{VoiceID: voiceID, SSML: ssml}})
	if err != nil {
		return "", err
	}

	resp, err := http.Post(createPartsURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("provider: createParts request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("provider: createParts returned status %d", resp.StatusCode)
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var parts []string
	if err := json.Unmarshal(respBody, &parts); err != nil {
		return "", fmt.Errorf("provider: unexpected createParts response: %w", err)
	}
	if len(parts) == 0 {
		return "", fmt.Errorf("provider: createParts returned empty parts list")
	}

	audioURL := fmt.Sprintf("%s?q=%s", getPartsURL, url.QueryEscape(parts[0]))
	return audioURL, nil
}
