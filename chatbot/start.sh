#!/bin/bash
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting EduSense backend..."
(
  while true; do
    cd "$ROOT_DIR/backend" && node server.js
    echo "Backend exited. Restarting in 2s..."
    sleep 2
  done
) &
BACKEND_PID=$!

# Give backend a moment to start
sleep 1

echo "Starting frontend..."
cd "$ROOT_DIR" && pnpm run dev

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null
