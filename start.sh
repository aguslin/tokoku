#!/bin/sh

# Wait for DB to be ready
echo "Waiting for database to be ready..."
RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if nc -z db 5432 2>/dev/null; then
    echo "Database is ready!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Waiting for database... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "Database connection timeout"
  exit 1
fi

echo "Starting backend API on port 5000..."
PORT=5000 node /app/backend/server.js &

echo "Starting frontend on port 3001..."
PORT=3001 HOSTNAME=0.0.0.0 node /app/frontend/server.js &

trap "kill 0" EXIT
wait
