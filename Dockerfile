# syntax=docker/dockerfile:1

# Production Dockerfile for book_shop / used-books
# Next.js standalone output + Coolify Dockerfile deployment
#
# Build-time variables:
#   NEXT_PUBLIC_APP_URL
#   BUILD_DATABASE_URL
#
# Runtime variables:
#   DATABASE_URL
#   AUTH_SECRET
#   AUTH_GOOGLE_ID
#   AUTH_GOOGLE_SECRET
#   S3_*
#   UPLOADTHING_TOKEN
#   OWNER_SETUP_TOKEN
#
# Coolify pre-deployment command:
#   node scripts/migrate.mjs


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1


# ---------------------------------------------------------------------------
# Development/build dependencies
# ---------------------------------------------------------------------------

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci


# ---------------------------------------------------------------------------
# Production dependencies
#
# The Next.js standalone output contains traced application dependencies,
# but scripts/migrate.mjs is outside the Next.js dependency graph.
# Keeping production dependencies here ensures the migration runner can load
# packages such as the PostgreSQL driver in the final image.
# ---------------------------------------------------------------------------

FROM base AS prod-deps

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force


# ---------------------------------------------------------------------------
# Builder
# ---------------------------------------------------------------------------

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG BUILD_DATABASE_URL

# NEXT_PUBLIC_* values are intentionally embedded into the client bundle.
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Explicitly mark environment validation as build-time validation.
ENV ENV_VALIDATION_CONTEXT=build
ENV NODE_ENV=production

# Fail immediately with an understandable error when Coolify has not exposed
# BUILD_DATABASE_URL as a build-time variable.
RUN test -n "${BUILD_DATABASE_URL}" || \
    (echo >&2 "ERROR: BUILD_DATABASE_URL is required during Docker build."; \
     echo >&2 "Configure it in Coolify as a build-time variable."; \
     echo >&2 "It must point to a non-production, read-only/sanitized PostgreSQL database."; \
     exit 1)

RUN npm run typecheck

# DATABASE_URL is provided only to this command because application modules
# loaded by `next build` currently require database access while prerendering.
#
# AUTH_SECRET is a build-only placeholder. It exists only in this intermediate
# builder layer and is not copied into the runtime image.
RUN DATABASE_URL="${BUILD_DATABASE_URL}" \
    BUILD_DATABASE_URL="${BUILD_DATABASE_URL}" \
    ENV_VALIDATION_CONTEXT=build \
    AUTH_SECRET="build-only-placeholder-secret-not-used-at-runtime-0001" \
    npm run build


# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3006
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Production dependencies are needed by the standalone server and by the
# custom migration runner executed through Coolify's pre-deployment command.
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Static/public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Next.js standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Reviewed database migrations and custom migration runner
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs

# Package metadata can help runtime tooling and diagnostics.
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3006

CMD ["node", "server.js"]