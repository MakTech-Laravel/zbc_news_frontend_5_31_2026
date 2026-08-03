# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# pnpm is not bundled in node:22-alpine — enable via corepack
RUN corepack enable

# Build-time env vars for the client bundle. Vite inlines VITE_* at build time,
# so these must be present as build args (docker-compose passes them).
ARG VITE_ENVIRONMENT_MODE
ARG VITE_API_BASE_URL
ARG VITE_AUTH_STRATEGY
ARG VITE_BEARER_TOKEN_STORAGE
ARG VITE_AUTH_ME_PATH
ARG VITE_AUTH_LOGOUT_PATH
ARG VITE_SITE_URL

# Reverb configuration
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT
ARG VITE_REVERB_SCHEME

# Turnstile configuration
ARG VITE_TURNSTILE_SITE_KEY

# Make them available to Vite at build time
ENV VITE_ENVIRONMENT_MODE=$VITE_ENVIRONMENT_MODE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AUTH_STRATEGY=$VITE_AUTH_STRATEGY
ENV VITE_BEARER_TOKEN_STORAGE=$VITE_BEARER_TOKEN_STORAGE
ENV VITE_AUTH_ME_PATH=$VITE_AUTH_ME_PATH
ENV VITE_AUTH_LOGOUT_PATH=$VITE_AUTH_LOGOUT_PATH
ENV VITE_SITE_URL=$VITE_SITE_URL

# Reverb configuration
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST
ENV VITE_REVERB_PORT=$VITE_REVERB_PORT
ENV VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME

# Turnstile configuration
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

# Install dependencies (lockfile required for reproducible installs)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm rebuild lightningcss @tailwindcss/oxide

# Copy source and build. React Router Framework Mode outputs:
#   build/client  (browser assets + merged public/ files)
#   build/server  (SSR bundle: index.js + assets)
COPY . .
RUN pnpm run build

# ─── Stage 2: Serve — Framework Mode SSR via react-router-serve ───────────────
# A persistent Node process, NOT static nginx: the SSR app renders per request.
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production
# Listen on port 80 so docker-compose's existing "3000:80" mapping stays valid
# with no VM-side change. (Runs as root — required to bind the privileged port,
# same as the previous nginx runtime.)
ENV PORT=80

# Production-only dependencies: react-router-serve + the packages the server
# bundle externalizes (react, react-router, axios, …). devDependencies
# (@react-router/dev etc.) are build-only and intentionally excluded.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Build output only — no source, no dev tooling. public/ is already merged into
# build/client by the build, so it needs no separate COPY.
COPY --from=builder /app/build ./build

EXPOSE 80

# Single source of truth for how the app starts: package.json "start"
# (react-router-serve ./build/server/index.js).
CMD ["pnpm", "start"]
