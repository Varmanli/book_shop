# syntax=docker/dockerfile:1

# Production Dockerfile for book_shop / used-books
# Next.js standalone output + Coolify Dockerfile deployment
#
# Required build-time variables:
#   NEXT_PUBLIC_APP_URL
#   BUILD_DATABASE_URL
#
# BUILD_DATABASE_URL must point to the PostgreSQL database that should receive
# the reviewed migrations. It must be writable.
#
# Runtime variables:
#   DATABASE_URL
#   AUTH_SECRET
#   AUTH_GOOGLE_ID
#   AUTH_GOOGLE_SECRET
#   S3_*
#   UPLOADTHING_TOKEN
#   OWNER_SETUP_TOKEN


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1


# ---------------------------------------------------------------------------
# Full dependencies for typecheck, migrations, and Next.js build
# ---------------------------------------------------------------------------

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci


# ---------------------------------------------------------------------------
# Production dependencies
#
# Required because scripts/migrate.mjs runs outside Next.js standalone tracing
# and may need packages such as the PostgreSQL driver.
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

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV ENV_VALIDATION_CONTEXT=build
ENV NODE_ENV=production

# Fail before typecheck/build when Coolify has not passed the database URL as
# an available-at-build-time variable.
RUN test -n "${BUILD_DATABASE_URL}" || \
    (echo >&2 "ERROR: BUILD_DATABASE_URL is required during Docker build."; \
     echo >&2 "Configure it in Coolify and enable Available at Buildtime."; \
     echo >&2 "It must be a writable PostgreSQL connection string."; \
     exit 1)

# Confirm that the supplied value has a PostgreSQL URL shape without printing
# the secret itself.
RUN case "${BUILD_DATABASE_URL}" in \
      postgres://*|postgresql://*) ;; \
      *) \
        echo >&2 "ERROR: BUILD_DATABASE_URL must be a PostgreSQL connection string."; \
        exit 1 ;; \
    esac

RUN npm run typecheck

# Apply reviewed migrations before building the application.
#
# The custom runner commits each journaled migration separately. This is
# required for migrations where a PostgreSQL enum value is introduced in one
# migration and used by a following migration.
RUN DATABASE_URL="${BUILD_DATABASE_URL}" \
    NODE_ENV=production \
    node scripts/migrate.mjs

# Build using the same migrated database.
RUN DATABASE_URL="${BUILD_DATABASE_URL}" \
    BUILD_DATABASE_URL="${BUILD_DATABASE_URL}" \
    ENV_VALIDATION_CONTEXT=build \
    AUTH_SECRET="build-only-placeholder-secret-not-used-at-runtime-0001" \
    npm run build


# ---------------------------------------------------------------------------
# Runtime image
# ---------------------------------------------------------------------------

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3006
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Keep runtime dependencies available for the standalone server and optional
# manual migration diagnostics.
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Public and static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Keep migrations and the runner in the final image for diagnostics or manual
# recovery, even though normal migrations now run during image build.
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3006

CMD ["node", "server.js"]