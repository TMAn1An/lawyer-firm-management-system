#!/bin/sh
set -e
# Apply pending migrations on start. Safe to run every time.
node node_modules/prisma/build/index.js migrate deploy
exec "$@"
