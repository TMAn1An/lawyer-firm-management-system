#!/bin/sh
set -e
# Apply pending migrations on start. Safe to run every time.
node_modules/.bin/tsx scripts/migrate.ts
exec "$@"
