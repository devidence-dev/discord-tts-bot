# Stage 1: Build
FROM oven/bun:1.3.8-debian AS builder

RUN apt-get update && apt-get install -y ffmpeg python3 make gcc g++ zlib1g-dev

WORKDIR /opt/app

COPY package*.json bunfig.toml* ./

RUN bun install --production

# Stage 2: Runtime
FROM oven/bun:1.3.8-slim

ARG DATE_CREATED
ARG VERSION

LABEL org.opencontainers.image.created=$DATE_CREATED
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.authors="moonstar-x"
LABEL org.opencontainers.image.vendor="moonstar-x"
LABEL org.opencontainers.image.title="Discord TTS Bot"
LABEL org.opencontainers.image.description="A Text-to-Speech bot for Discord."
LABEL org.opencontainers.image.source="https://github.com/moonstar-x/discord-tts-bot"

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Copiar solo node_modules desde stage 1
COPY --from=builder /opt/app/node_modules ./node_modules

# Copiar el código
COPY . .

CMD ["bun", "run", "start"]