# Stage 1: Build
FROM oven/bun:1.3.8-debian AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    gcc \
    g++ \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

COPY package*.json bunfig.toml* ./

RUN bun install --production

# Stage 2: Runtime
# Usamos slim para reducir la base (Debian-based)
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

# Usar binarios estáticos de ffmpeg ahorra mucho espacio al evitar dependencias de X11 y librerías compartidas
COPY --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/

WORKDIR /opt/app

# Copiar solo node_modules desde stage 1
COPY --from=builder /opt/app/node_modules ./node_modules

# Copiar solo lo estrictamente necesario
COPY package.json ./
COPY src ./src
COPY provider-data ./provider-data
# Si existe configuración por defecto necesaria
COPY config ./config 

CMD ["bun", "run", "start"]