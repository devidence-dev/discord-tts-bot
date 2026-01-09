# Stage 1: Build
FROM oven/bun:1.2.23-alpine AS builder

RUN apk add --no-cache ffmpeg python3 make gcc g++ zlib zlib-dev

WORKDIR /opt/app

COPY package*.json bunfig.toml* ./

RUN bun install --production

# Stage 2: Runtime
FROM oven/bun:1.2.23-alpine

ARG DATE_CREATED
ARG VERSION

LABEL org.opencontainers.image.created=$DATE_CREATED
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.authors="moonstar-x"
LABEL org.opencontainers.image.vendor="moonstar-x"
LABEL org.opencontainers.image.title="Discord TTS Bot"
LABEL org.opencontainers.image.description="A Text-to-Speech bot for Discord."
LABEL org.opencontainers.image.source="https://github.com/moonstar-x/discord-tts-bot"

RUN apk add --no-cache ffmpeg

WORKDIR /opt/app

# Copiar solo node_modules desde stage 1
COPY --from=builder /opt/app/node_modules ./node_modules

# Copiar el código
COPY . .

CMD ["bun", "run", "start"]