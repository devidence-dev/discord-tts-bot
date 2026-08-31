# Stage 1: Build
FROM oven/bun:1.4.0-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    gcc \
    g++ \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

COPY package.json bun.lock* bunfig.toml* ./

RUN bun install --production --frozen-lockfile

# Stage 2: Runtime (Distroless)
# We use a distroless image to drastically reduce size and improve security.
# cc-debian12 includes glibc and other essential libraries required by Bun and native modules.
FROM gcr.io/distroless/cc-debian13

ARG DATE_CREATED
ARG VERSION

LABEL org.opencontainers.image.created=$DATE_CREATED
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.authors="devidence-dev"
LABEL org.opencontainers.image.vendor="devidence-dev"
LABEL org.opencontainers.image.title="Discord TTS Bot (Distroless)"
LABEL org.opencontainers.image.description="A Text-to-Speech bot for Discord. Forked and optimized with Bun."
LABEL org.opencontainers.image.source="https://github.com/devidence-dev/discord-tts-bot"

# Copy the Bun binary from the builder.
COPY --from=builder /usr/local/bin/bun /usr/bin/bun

# Copy static ffmpeg binaries (essential for audio playback).
COPY --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/
# COPY --from=mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/

WORKDIR /opt/app

# Copy installed dependencies and source code.
COPY --from=builder /opt/app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY provider-data ./provider-data
COPY config ./config 

# Ensure the binaries are on PATH.
ENV PATH="/usr/local/bin:/usr/bin:/bin"

# Run Bun directly against the source file to avoid requiring a shell.
CMD ["/usr/bin/bun", "src/app.js"]
