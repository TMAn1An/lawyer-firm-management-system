#!/bin/sh
set -e
# Create or update tables on start. Safe to run every time.
node node_modules/prisma/build/index.js db push --skip-generate >/dev/null
exec "$@"
