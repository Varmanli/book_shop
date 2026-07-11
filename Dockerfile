# Production Dockerfile for book_shop / "used-books" (Next.js, standalone output).
# Designed for Coolify's "Dockerfile" build pack. No secrets are baked in —
# all values below are supplied by Coolify's build/runtime environment.

# ---- deps: install dependencies reproducibly -------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: typecheck + build --------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The builder uses a dedicated, non-production read-only database for Next.js
# data prerendering. Migrations run separately at deployment time with the
# runtime production database environment.
ARG NEXT_PUBLIC_APP_URL
ARG BUILD_DATABASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=$BUILD_DATABASE_URL
ENV AUTH_SECRET=build-time-placeholder-secret-that-is-never-deployed
ENV NODE_ENV=production

RUN npm run typecheck
RUN npm run build

# ---- runner: minimal production image --------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3006
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs

USER nextjs
EXPOSE 3006

# Real secrets (DATABASE_URL, AUTH_SECRET, S3_*, UPLOADTHING_TOKEN,
# AUTH_GOOGLE_SECRET) must be provided as runtime environment variables in
# Coolify — never baked into this image. Run `node scripts/migrate.mjs` as the
# Coolify pre-deployment command; no db:seed or destructive schema sync runs.
CMD ["node", "server.js"]
