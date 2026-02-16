# Optimizing a Discord TTS Bot: From 1.3GB to 660MB with Bun and Distroless

![Discord TTS Bot Banner](https://i.imgur.com/HT7Wmv1.jpg)

When I first encountered [moonstar-x's Discord TTS Bot](https://github.com/moonstar-x/discord-tts-bot), I was impressed by its functionality — a simple yet powerful bot that converts text to speech in Discord voice channels using Google Translate's TTS API. However, looking under the hood, I saw significant room for optimization
.

In this article, I'll walk you through how I transformed this project from a **1.3GB Docker image** running on Node.js to a **~660MB lean, secure container** powered by Bun and Google's Distroless images.

---

## The Starting Point: What Needed Improvement?

The original bot worked well, but had some pain points for production deployments:

| Aspect | Original | Issue |
|--------|----------|-------|
| **Runtime** | Node.js | Slower cold starts, higher memory footprint |
| **Docker Image** | ~1.3GB | Excessive size due to full OS and dependencies |
| **Dependencies** | Outdated | Security vulnerabilities, deprecated packages |
| **Security** | Standard Debian | Full shell access, larger attack surface |

My goals were clear:
1. **Faster startup** and lower memory usage
2. **Smaller Docker images** for quicker deployments
3. **Improved security** posture
4. **Modernized dependencies**

---

## Step 1: Migrating to Bun 🚀

[Bun](https://bun.sh/) is a modern JavaScript runtime that's significantly faster than Node.js for many workloads. It includes a bundler, transpiler, and package manager all in one.

### Why Bun?

- **3-4x faster startup** compared to Node.js
- **Native TypeScript support** (no transpilation step)
- **Built-in package manager** that's faster than npm/yarn
- **Drop-in Node.js compatibility** for most packages

The migration was straightforward since Bun maintains high compatibility with Node.js APIs:

```json
{
  "scripts": {
    "start": "bun ./src/app.js",
    "dev": "bun --watch ./src/app.js",
    "deploy": "bun ./src/command-deployer.js"
  }
}
```

Most of the codebase worked without modifications. The main adjustments were:
- Replacing `npm` commands with `bun` equivalents
- Ensuring native modules like `@discordjs/opus` compiled correctly

---

## Step 2: Optimizing the Docker Image 🐳

This is where the real magic happened. The original Dockerfile used a standard Node.js image with ffmpeg installed via apt-get, resulting in a massive 1.3GB image.

### The Multi-Stage Build Strategy

I implemented a two-stage build:

**Stage 1: Builder** — Handles dependency installation and native module compilation:

```dockerfile
FROM oven/bun:1.3.8-debian AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    gcc \
    g++ \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app
COPY package.json bun.lock* bunfig.toml* ./
RUN bun install --production
```

**Stage 2: Runtime** — The final, minimal image:

```dockerfile
FROM gcr.io/distroless/cc-debian12

# Copy Bun binary from builder
COPY --from=builder /usr/local/bin/bun /usr/bin/bun

# Use static ffmpeg binaries (no system dependencies!)
COPY --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/

WORKDIR /opt/app
COPY --from=builder /opt/app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY provider-data ./provider-data
COPY config ./config

CMD ["/usr/bin/bun", "src/app.js"]
```

### Key Optimizations Explained

#### 1. Static FFmpeg Binaries

Instead of installing ffmpeg via apt-get (which pulls in X11 libraries, codecs, and other dependencies), I use pre-compiled static binaries from `mwader/static-ffmpeg`. These are self-contained and add minimal overhead.

#### 2. Google Distroless Images

[Distroless images](https://github.com/GoogleContainerTools/distroless) contain only your application and its runtime dependencies. They don't include:
- Package managers
- Shells (`/bin/sh`, `/bin/bash`)
- Text editors
- Any other programs you'd find in a standard Linux distribution

This dramatically reduces:
- **Image size**: No unnecessary OS tools
- **Attack surface**: No shell means attackers can't easily execute commands even if they compromise your app
- **CVE exposure**: Fewer packages = fewer potential vulnerabilities

#### 3. Direct Execution (No Shell Required)

A subtle but important change: instead of using `bun run start` (which requires a shell to parse the npm script), I execute the application directly:

```dockerfile
# ❌ This requires a shell
CMD ["bun", "run", "start"]

# ✅ This works in distroless
CMD ["/usr/bin/bun", "src/app.js"]
```

---

## The Results 📊

| Metric | Original | Optimized | Improvement |
|--------|----------|-----------|-------------|
| **Image Size** | ~1.3GB | ~660MB | **~50% smaller** |
| **Startup Time** | ~3-4s | ~1s | **3-4x faster** |
| **Attack Surface** | Full Debian | Distroless | **Significantly reduced** |
| **Shell Access** | Yes | No | **More secure** |

---

## Trade-offs and Considerations

No optimization comes without trade-offs. Here's what you should know:

### 🔴 No Shell for Debugging

You can't `docker exec -it container bash` into a distroless container. Debugging must be done via:
- `docker logs container_id`
- Application-level logging
- Health checks and monitoring

For development, you might want to keep a debug Dockerfile that uses a standard image.

### 🟡 Native Module Compatibility

Native modules (like `@discordjs/opus` for audio encoding) must be compiled in the builder stage using a compatible glibc version. I use `oven/bun:1.3.8-debian` for building and `gcr.io/distroless/cc-debian12` for runtime — both are Debian-based, ensuring binary compatibility.

### 🟢 Minimal Maintenance Overhead

Despite the perceived complexity, this setup is actually easier to maintain:
- Fewer packages to update
- Smaller CVE scan reports
- Faster CI/CD pipelines (smaller images = faster pulls)

---

## Deploying the Optimized Bot

Getting started is straightforward:

```bash
# Clone the repository
git clone https://github.com/devidence-dev/discord-tts-bot.git
cd discord-tts-bot

# Configure your bot token
cp config/settings.json.example config/settings.json
# Edit settings.json with your Discord token

# Build and run
docker compose up -d --build

# Check logs
docker logs -f discord-tts-bot
```

---

## Conclusion

By combining Bun's performance benefits with Docker's multi-stage builds and Google's Distroless images, we achieved:

- **50% reduction** in image size
- **3-4x faster** startup times
- **Dramatically improved** security posture
- **Modernized** dependency stack

These optimizations aren't specific to this TTS bot — they're patterns you can apply to almost any Node.js/Bun application. The key takeaways:

1. **Question your base images**: Do you really need a full OS?
2. **Use static binaries** when possible (especially for tools like ffmpeg)
3. **Separate build and runtime** concerns with multi-stage builds
4. **Consider alternative runtimes** like Bun for performance gains

---

## Resources

- 📦 [Optimized Fork on GitHub](https://github.com/devidence-dev/discord-tts-bot)
- 🥟 [Bun Runtime](https://bun.sh/)
- 🔒 [Google Distroless Images](https://github.com/GoogleContainerTools/distroless)
- 🎬 [Static FFmpeg Builds](https://github.com/mwader/static-ffmpeg)
- 🤖 [Original TTS Bot by moonstar-x](https://github.com/moonstar-x/discord-tts-bot)

---

*Have questions or suggestions? Feel free to open an issue on the [GitHub repository](https://github.com/devidence-dev/discord-tts-bot) or reach out!*

---

**Tags**: #Docker #Bun #JavaScript #Discord #Optimization #DevOps #Containers #Security
