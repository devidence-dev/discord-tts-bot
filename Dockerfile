# Stage 1: Build
FROM oven/bun:1.3.11-slim AS builder

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
# Utilizamos una imagen "distroless" para reducir drásticamente el tamaño y mejorar la seguridad
# cc-debian12 incluye glibc y otras librerías esenciales necesarias para Bun y módulos nativos
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

# Copiamos el binario de Bun desde el builder
COPY --from=builder /usr/local/bin/bun /usr/bin/bun

# Copiamos binarios estáticos de ffmpeg (esenciales para reproducción de audio)
COPY --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/
# COPY --from=mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/

WORKDIR /opt/app

# Copiamos las dependencias instaladas y el código fuente
COPY --from=builder /opt/app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY provider-data ./provider-data
COPY config ./config 

# Aseguramos que los binarios estén en el PATH
ENV PATH="/usr/local/bin:/usr/bin:/bin"

# Ejecutamos Bun directamente contra el archivo fuente para evitar la necesidad de una shell
CMD ["/usr/bin/bun", "src/app.js"]