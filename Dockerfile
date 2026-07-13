# syntax=docker/dockerfile:1

# Production Dockerfile for book_shop / used-books.
#
# The image build is intentionally database-free. Configure DATABASE_URL and
# the other secrets only as runtime variables. At container startup, the
# startup script runs the standard Drizzle migration command before the app.


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1


# ---------------------------------------------------------------------------
# Full dependencies for typecheck and Next.js build
# ---------------------------------------------------------------------------

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci


# ---------------------------------------------------------------------------
# Production dependencies, including Drizzle Kit for the startup migration
# command.
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
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NODE_ENV=production

RUN npm run typecheck
RUN npm run build


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

# Keep runtime dependencies available for the standalone server and the
# standard Drizzle startup migration command.
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Public and static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Keep the migration journal, configuration, and startup script in the final
# image. The script runs `npm run db:migrate` before starting Next.js.
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start-production.sh ./scripts/start-production.sh

RUN chmod 755 ./scripts/start-production.sh

USER nextjs

EXPOSE 3006

CMD ["./scripts/start-production.sh"]
