#!/bin/sh
set -eu

echo "Applying database migrations..."
npm run db:migrate
echo "Database migrations complete. Starting application..."

exec node server.js
