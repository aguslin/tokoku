#!/bin/sh
set -e

echo "Starting backend API on port 5000..."
PORT=5000 node /app/backend/server.js &

echo "Starting frontend on port 3000..."
PORT=3000 HOSTNAME=0.0.0.0 node /app/frontend/server.js &

trap "kill 0" EXIT
wait
