# syntax=docker/dockerfile:1

# Production Dockerfile for book_shop / used-books.
#
# The image build is intentionally database-free. Configure DATABASE_URL and
# the other secrets only as runtime variables. Database migrations are an
# explicit deployment operation, never part of image build or startup.


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
# Production dependencies, including Drizzle Kit for the explicit deployment
# migration command.
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
# standard Drizzle deployment migration command.
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Public and static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Keep the migration journal and configuration in the final image so an
# operator can run `npm run db:migrate` with the runtime DATABASE_URL.
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3006

CMD ["node", "server.js"]
