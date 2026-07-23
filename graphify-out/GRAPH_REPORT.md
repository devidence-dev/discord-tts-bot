# Graph Report - .  (2026-07-22)

## Corpus Check
- Corpus is ~23,559 words - fits in a single context window. You may not need a graph.

## Summary
- 721 nodes · 864 edges · 54 communities (47 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.59)
- Token cost: 53,179 input · 0 output

## Community Hubs (Navigation)
- TTS Say Command Base
- Heroku Buildpack Config
- Piper TTS Provider
- Bot Entry Point / Bootstrap
- Runtime Dependencies (package.json)
- Package Metadata & Dev Deps
- TTSClient (Bot Client)
- Playback Queue / VoiceManager
- TTS Provider Registry
- Amazon TTS: My Settings
- Microsoft TTS: My Settings
- Amazon TTS: Default Settings
- Microsoft TTS: Default Settings
- Amazon TTS: Channel Settings
- Microsoft TTS: Channel Settings
- Cached TTS Settings
- Aeiou TTS Provider
- Google TTS: Languages Command
- Channel TTS Settings (generic)
- Amazon TTS: Voices Command
- Locale / Localization Command
- Google TTS: My Settings
- Microsoft TTS: Voices Command
- Google TTS Provider
- Google TTS: Default Settings
- Piper TTS: Voices Command
- Google TTS: Channel Settings
- Project README / Fork Overview
- Amazon Polly Provider
- Microsoft Azure TTS Provider
- TTS Playback Player
- Amazon TTS: Languages Command
- Global Default Settings Command
- Global My Settings Command
- Set My TTS Provider Command
- Disconnect Timeout Command
- Help Command
- Microsoft TTS: Languages Command
- Set Default TTS Provider Command
- Set Channel TTS Provider Command
- Homelab Deploy Workflow
- Piper TTS Python Server
- Languages Command Base Class
- Stop TTS Command
- Delete Channel Provider Command
- Sharded Client Entrypoint
- Slash Command Deployer
- Abstract TTS Provider Base
- Legacy CI Workflow (npm)
- Replit Init Script
- README Fragment (misc)
- Feature Request Template
- Deploy Workflow Fragment
- Piper Python Project Config

## God Nodes (most connected - your core abstractions)
1. `oldChoiceListToNew()` - 13 edges
2. `MESSAGE_EMBED` - 12 edges
3. `env` - 11 edges
4. `TTSPlayer` - 10 edges
5. `CachedTTSSettings` - 9 edges
6. `cleanMessage()` - 9 edges
7. `scripts` - 8 edges
8. `Scheduler` - 8 edges
9. `AmazonSetDefaultSettingsCommand` - 8 edges
10. `AmazonSetMySettingsCommand` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Bug Report Issue Template` --conceptually_related_to--> `Bun Runtime Migration`  [AMBIGUOUS]
  .github/ISSUE_TEMPLATE/bug_report.md → README.md
- `Question Issue Template` --references--> `Discord TTS Bot (Devidence Fork) README`  [EXTRACTED]
  .github/ISSUE_TEMPLATE/question.md → README.md
- `Discord TTS Bot (Devidence Fork) README` --references--> `CI Workflow`  [EXTRACTED]
  README.md → .github/workflows/ci.yml
- `docker-compose discord-tts Service` --shares_data_with--> `Deploy "Build & Push image" Job (Zot)`  [INFERRED]
  docker-compose.yml → .github/workflows/deploy.yml
- `Discord TTS Bot (Devidence Fork) README` --references--> `moonstarx/discord-tts-bot Docker Hub Image`  [EXTRACTED]
  README.md → .github/workflows/docker-build.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Legacy npm/Node CI + Docker Hub publish pipeline** — github_workflows_ci_test_job, github_workflows_ci_build_push_job, github_workflows_docker_build_workflow [EXTRACTED 1.00]
- **Homelab Zot + Kubernetes GitOps deploy pipeline** — github_workflows_deploy_version_job, github_workflows_deploy_build_job, github_workflows_deploy_deploy_job, github_workflows_deploy_zot_registry, github_workflows_deploy_homelab_repo [EXTRACTED 1.00]
- **Devidence Fork Key Improvements group** — readme_bun_runtime_migration, readme_distroless_docker_image, readme_devidence_dev_fork_maintainer [EXTRACTED 1.00]

## Communities (54 total, 7 thin omitted)

### Community 0 - "TTS Say Command Base"
Cohesion: 0.05
Nodes (28): { cleanMessage }, { getCantConnectToChannelReason }, logger, TTSChannelHandler, { cleanMessage }, { getCantConnectToChannelReason }, logger, SayBaseCommand (+20 more)

### Community 1 - "Heroku Buildpack Config"
Cohesion: 0.04
Nodes (45): buildpacks, description, description, required, value, description, required, value (+37 more)

### Community 2 - "Piper TTS Provider"
Cohesion: 0.05
Nodes (23): AbstractProvider, axios, fs, path, Payload, PiperProvider, { EmbedBuilder }, { MESSAGE_EMBED } (+15 more)

### Community 3 - "Bot Entry Point / Bootstrap"
Cohesion: 0.06
Nodes (32): client, config, { ConfigProvider }, createProvider(), { DISCONNECT_TIMEOUT, WEBSITE_URL }, { GatewayIntentBits }, { keepAlive }, { LevelDataProvider } (+24 more)

### Community 4 - "Runtime Dependencies (package.json)"
Cohesion: 0.06
Nodes (31): axios, deepmerge, discord.js, @discordjs/builders, @discordjs/opus, @discordjs/voice, google-tts-api, @greencoast/discord.js-extended (+23 more)

### Community 5 - "Package Metadata & Dev Deps"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-greencoast, nodemon, author, bugs, url, description, devDependencies (+21 more)

### Community 6 - "TTSClient (Bot Client)"
Cohesion: 0.10
Nodes (9): CachedTTSSettings, { Collection }, { ExtendedClient }, ProviderManager, Scheduler, TTSChannelHandler, TTSClient, TTSPlayer (+1 more)

### Community 7 - "Playback Queue / VoiceManager"
Cohesion: 0.12
Nodes (7): Queue, { createAudioResource }, logger, Queue, VoiceManager, {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  AudioPlayer,
  VoiceConnectionStatus
}, VoiceManager

### Community 8 - "TTS Provider Registry"
Cohesion: 0.14
Nodes (9): AeiouProvider, AmazonProvider, GoogleProvider, { InvalidProviderError }, MicrosoftProvider, PiperProvider, ProviderManager, InvalidProviderError (+1 more)

### Community 9 - "Amazon TTS: My Settings"
Cohesion: 0.18
Nodes (7): AmazonProvider, AmazonSetMySettingsCommand, languageData, logger, { MessageFlags }, { SlashCommand }, { SlashCommandBuilder }

### Community 10 - "Microsoft TTS: My Settings"
Cohesion: 0.18
Nodes (7): languageData, logger, { MessageFlags }, MicrosoftProvider, MicrosoftSetMySettingsCommand, { SlashCommand }, { SlashCommandBuilder }

### Community 11 - "Amazon TTS: Default Settings"
Cohesion: 0.20
Nodes (6): AmazonProvider, AmazonSetDefaultSettingsCommand, languageData, logger, { PermissionsBitField, SlashCommandBuilder }, { SlashCommand }

### Community 12 - "Microsoft TTS: Default Settings"
Cohesion: 0.20
Nodes (6): languageData, logger, MicrosoftProvider, MicrosoftSetDefaultSettingsCommand, { PermissionsBitField, SlashCommandBuilder }, { SlashCommand }

### Community 13 - "Amazon TTS: Channel Settings"
Cohesion: 0.20
Nodes (6): AmazonProvider, AmazonSetChannelSettingsCommand, languageData, logger, { PermissionsBitField, SlashCommandBuilder }, { SlashCommand }

### Community 14 - "Microsoft TTS: Channel Settings"
Cohesion: 0.20
Nodes (6): languageData, logger, MicrosoftProvider, MicrosoftSetChannelSettingsCommand, { PermissionsBitField, SlashCommandBuilder }, { SlashCommand }

### Community 15 - "Cached TTS Settings"
Cohesion: 0.22
Nodes (4): CachedTTSSettings, { Collection, Guild, GuildMember, BaseChannel }, merge, ProviderManager

### Community 16 - "Aeiou TTS Provider"
Cohesion: 0.15
Nodes (7): AbstractProvider, AeiouProvider, axios, Payload, AeiouProvider, SayAeiouCommand, SayBaseCommand

### Community 17 - "Google TTS: Languages Command"
Cohesion: 0.19
Nodes (8): { EmbedBuilder, Collection }, GoogleLangsCommand, LangsBaseCommand, languages, { MESSAGE_EMBED }, { splitContentForEmbedFields }, { EMBED_FIELD_MAX_SIZE }, splitContentForEmbedFields()

### Community 18 - "Channel TTS Settings (generic)"
Cohesion: 0.21
Nodes (7): ChannelSettingsCommand, { EmbedBuilder }, merge, { MESSAGE_EMBED }, ProviderManager, { SlashCommand }, { SlashCommandBuilder }

### Community 19 - "Amazon TTS: Voices Command"
Cohesion: 0.20
Nodes (7): AmazonProvider, AmazonVoicesCommand, { EmbedBuilder }, languageData, { MESSAGE_EMBED }, { SlashCommand }, { SlashCommandBuilder }

### Community 20 - "Locale / Localization Command"
Cohesion: 0.21
Nodes (8): logger, { oldChoiceListToNew }, { PermissionsBitField, SlashCommandBuilder }, SetLocaleCommand, { SlashCommand }, { supported }, arrayToChoice(), oldChoiceListToNew()

### Community 21 - "Google TTS: My Settings"
Cohesion: 0.20
Nodes (7): GoogleProvider, GoogleSetMySettingsCommand, languages, logger, { MessageFlags }, { SlashCommand }, { SlashCommandBuilder }

### Community 22 - "Microsoft TTS: Voices Command"
Cohesion: 0.20
Nodes (7): { EmbedBuilder }, languageData, { MESSAGE_EMBED }, MicrosoftProvider, MicrosoftVoicesCommand, { SlashCommand }, { SlashCommandBuilder }

### Community 23 - "Google TTS Provider"
Cohesion: 0.18
Nodes (6): Payload, AbstractProvider, GoogleProvider, googleTTS, { oldChoiceListToNew }, Payload

### Community 24 - "Google TTS: Default Settings"
Cohesion: 0.22
Nodes (6): GoogleProvider, GoogleSetDefaultSettingsCommand, languages, logger, { PermissionsBitField, SlashCommandBuilder }, { SlashCommand }

### Community 25 - "Piper TTS: Voices Command"
Cohesion: 0.20
Nodes (7): axios, { EmbedBuilder }, { MESSAGE_EMBED }, PiperProvider, PiperVoicesCommand, { SlashCommand }, { SlashCommandBuilder }

### Community 26 - "Google TTS: Channel Settings"
Cohesion: 0.22
Nodes (6): GoogleProvider, GoogleSetChannelSettingsCommand, languages, logger, { PermissionsBitField, SlashCommandBuilder }, { SlashCommand }

### Community 27 - "Project README / Fork Overview"
Cohesion: 0.20
Nodes (10): Bug Report Issue Template, Question Issue Template, CI Workflow, Docker Build "Build Docker Image and Push to Docker Hub" Job, moonstarx/discord-tts-bot Docker Hub Image, Bun Runtime Migration, devidence-dev (Fork Maintainer), Distroless Docker Image Optimization (+2 more)

### Community 28 - "Amazon Polly Provider"
Cohesion: 0.22
Nodes (6): AbstractProvider, AmazonProvider, axios, languageData, { oldChoiceListToNew }, Payload

### Community 29 - "Microsoft Azure TTS Provider"
Cohesion: 0.22
Nodes (6): AbstractProvider, axios, languageData, MicrosoftProvider, { oldChoiceListToNew }, Payload

### Community 31 - "Amazon TTS: Languages Command"
Cohesion: 0.22
Nodes (6): AmazonLangsCommand, { EmbedBuilder }, LangsBaseCommand, languageData, { MESSAGE_EMBED }, { splitContentForEmbedFields }

### Community 32 - "Global Default Settings Command"
Cohesion: 0.22
Nodes (6): DefaultSettingsCommand, { EmbedBuilder }, { MESSAGE_EMBED }, ProviderManager, { SlashCommand }, { SlashCommandBuilder }

### Community 33 - "Global My Settings Command"
Cohesion: 0.22
Nodes (6): { EmbedBuilder, MessageFlags }, { MESSAGE_EMBED }, MySettingsCommand, ProviderManager, { SlashCommand }, { SlashCommandBuilder }

### Community 34 - "Set My TTS Provider Command"
Cohesion: 0.20
Nodes (7): logger, { MessageFlags }, { oldChoiceListToNew }, ProviderManager, SetMyProviderCommand, { SlashCommand }, { SlashCommandBuilder }

### Community 35 - "Disconnect Timeout Command"
Cohesion: 0.22
Nodes (6): { DISCONNECT_TIMEOUT }, logger, { PermissionsBitField, SlashCommandBuilder }, SetTimeoutCommand, { SlashCommand }, DISCONNECT_TIMEOUT

### Community 36 - "Help Command"
Cohesion: 0.22
Nodes (6): { EmbedBuilder, ActionRowBuilder, ButtonBuilder }, HelpCommand, { MESSAGE_EMBED, WEBSITE_URL }, { SlashCommand }, { SlashCommandBuilder }, MESSAGE_EMBED

### Community 37 - "Microsoft TTS: Languages Command"
Cohesion: 0.22
Nodes (6): { EmbedBuilder }, LangsBaseCommand, languageData, { MESSAGE_EMBED }, MicrosoftLangsCommand, { splitContentForEmbedFields }

### Community 38 - "Set Default TTS Provider Command"
Cohesion: 0.22
Nodes (6): logger, { oldChoiceListToNew }, { PermissionsBitField, SlashCommandBuilder }, ProviderManager, SetDefaultProviderCommand, { SlashCommand }

### Community 39 - "Set Channel TTS Provider Command"
Cohesion: 0.22
Nodes (6): logger, { oldChoiceListToNew }, { PermissionsBitField, SlashCommandBuilder }, ProviderManager, SetChannelProvider, { SlashCommand }

### Community 40 - "Homelab Deploy Workflow"
Cohesion: 0.29
Nodes (8): docker-compose discord-tts Service, docker-compose piper-tts Service (commented out), Deploy "Build & Push image" Job (Zot), Deploy "Deploy to production" Job (homelab bump), devidence-dev/homelab Kubernetes GitOps Repo, Deploy "Calculate version" Job (semver), Zot Container Registry (zot.devidence.dev), Bot Configuration (settings.json / env vars)

### Community 41 - "Piper TTS Python Server"
Cohesion: 0.25
Nodes (6): cleanup_old_files(), list_models(), Limpiador de archivos antiguos de Piper     Se ejecuta cada minuto, Listar todos los modelos disponibles, Sintetizar texto a voz usando Piper TTS          Parámetros:     - text: Texto a, synthesize()

### Community 42 - "Languages Command Base Class"
Cohesion: 0.29
Nodes (4): { Collection }, LangsBaseCommand, { SlashCommand }, { SlashCommandBuilder }

### Community 43 - "Stop TTS Command"
Cohesion: 0.25
Nodes (5): logger, { MessageFlags }, { SlashCommand }, { SlashCommandBuilder }, StopCommand

### Community 44 - "Delete Channel Provider Command"
Cohesion: 0.29
Nodes (4): DeleteChannelProviderCommand, logger, { PermissionsBitField, SlashCommandBuilder }, { SlashCommand }

### Community 45 - "Sharded Client Entrypoint"
Cohesion: 0.29
Nodes (6): config, { ConfigProvider }, logger, manager, path, { ShardingManager }

### Community 46 - "Slash Command Deployer"
Cohesion: 0.33
Nodes (5): client, config, { ExtendedClient, ConfigProvider }, logger, path

### Community 48 - "Legacy CI Workflow (npm)"
Cohesion: 0.50
Nodes (4): Pull Request Template, CI "Trigger Docker Build" Job (repository_dispatch), CI "Run Tests" Job (lint via npm), Docker Build and Push Workflow

## Ambiguous Edges - Review These
- `Bug Report Issue Template` → `Bun Runtime Migration`  [AMBIGUOUS]
  .github/ISSUE_TEMPLATE/bug_report.md · relation: conceptually_related_to

## Knowledge Gaps
- **338 isolated node(s):** `name`, `description`, `repository`, `logo`, `buildpacks` (+333 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Bug Report Issue Template` and `Bun Runtime Migration`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Runtime Dependencies (package.json)` to `Package Metadata & Dev Deps`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `MESSAGE_EMBED` connect `Help Command` to `Global Default Settings Command`, `Global My Settings Command`, `Piper TTS Provider`, `Disconnect Timeout Command`, `Microsoft TTS: Languages Command`, `Google TTS: Languages Command`, `Channel TTS Settings (generic)`, `Amazon TTS: Voices Command`, `Microsoft TTS: Voices Command`, `Piper TTS: Voices Command`, `Amazon TTS: Languages Command`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `oldChoiceListToNew()` connect `Locale / Localization Command` to `Set My TTS Provider Command`, `Set Default TTS Provider Command`, `Set Channel TTS Provider Command`, `Google TTS Provider`, `Amazon Polly Provider`, `Microsoft Azure TTS Provider`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `name`, `description`, `repository` to the rest of the system?**
  _338 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TTS Say Command Base` be split into smaller, more focused modules?**
  _Cohesion score 0.050980392156862744 - nodes in this community are weakly interconnected._
- **Should `Heroku Buildpack Config` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._