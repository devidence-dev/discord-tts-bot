package main

import (
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"

	"discord-tts-bot/internal/bot"
)

func main() {
	cfg := bot.Config{
		Token:          mustEnv("DISCORD_TOKEN"),
		TestingGuildID: os.Getenv("TESTING_GUILD_ID"),
		DataPath:       envOr("DATA_PATH", filepath.Join(".", "data")),
		DefaultTimeout: envInt("DEFAULT_DISCONNECT_TIMEOUT", 5),
	}

	b, err := bot.New(cfg)
	if err != nil {
		log.Fatalf("failed to create bot: %v", err)
	}

	if err := b.Start(); err != nil {
		log.Fatalf("failed to connect: %v", err)
	}
	log.Println("bot is running. press Ctrl+C to stop.")

	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM)
	<-sc

	log.Println("shutting down...")
	b.Close()
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required environment variable %s is not set", key)
	}
	return v
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}
