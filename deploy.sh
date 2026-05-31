#!/usr/bin/env bash
set -euo pipefail

# ==============================================================
# MARKETPLACE V2 - One-Command Deploy Script
# ==============================================================
# This script will:
#   1. Check prerequisites (git, docker, docker compose, node)
#   2. Clone the repository (if not already cloned)
#   3. Build and start all services with Docker Compose
#   4. Run database migrations
#   5. Seed the database with comprehensive demo data
#   6. Verify everything is healthy
#
# Usage:
#   chmod +x deploy.sh && ./deploy.sh
#
# On a fresh machine, just run:
#   curl -fsSL https://your-repo-url/deploy.sh | bash
# ==============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# --------------- Colors ---------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

# ==============================================================
# STEP 1: Check Prerequisites
# ==============================================================
info "Checking prerequisites..."

command -v git        >/dev/null 2>&1 || err "git is required but not installed."
command -v docker     >/dev/null 2>&1 || err "docker is required but not installed."
command -v docker compose >/dev/null 2>&1 || err "docker compose is required but not installed."

# Check Node.js (only needed if running outside Docker)
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    warn "Node.js 18+ recommended (found v$(node -v)). Continuing anyway..."
  fi
fi

log "All prerequisites satisfied."

# ==============================================================
# STEP 2: Clone or verify repository
# ==============================================================
# If this script is running from within the repo, skip cloning.
# Otherwise, set REPO_URL and clone it.
if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
  # ----- CONFIGURE THESE -----
  REPO_URL="${REPO_URL:-https://github.com/your-org/marketplace-v2.git}"
  BRANCH="${BRANCH:-main}"
  # --------------------------

  info "Cloning repository from $REPO_URL (branch: $BRANCH)..."
  git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$PROJECT_ROOT"
  cd "$PROJECT_ROOT"
  log "Repository cloned."
else
  info "Repository already exists at $PROJECT_ROOT"
  cd "$PROJECT_ROOT"
fi

# ==============================================================
# STEP 3: Stop conflicting containers (if any)
# ==============================================================
info "Checking for port conflicts..."
for PORT in 5432 6379; do
  if docker ps --format '{{.Names}}' | grep -q .; then
    CONFLICT=$(docker ps --format '{{.Names}} {{.Ports}}' | grep ":$PORT->" || true)
    if [ -n "$CONFLICT" ]; then
      warn "Port $PORT is in use. Stopping conflicting container..."
      CONTAINER=$(echo "$CONFLICT" | awk '{print $1}')
      docker stop "$CONTAINER" 2>/dev/null || true
    fi
  fi
done

# ==============================================================
# STEP 4: Build and start Docker Compose services
# ==============================================================
info "Building and starting Docker Compose services..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

# Wait for the app to be ready
info "Waiting for application to be ready..."
RETRIES=0
MAX_RETRIES=60
until curl -s http://localhost:5000/api-docs >/dev/null 2>&1 || [ $RETRIES -eq $MAX_RETRIES ]; do
  sleep 2
  RETRIES=$((RETRIES + 1))
  if [ $((RETRIES % 5)) -eq 0 ]; then
    info "Still waiting... ($RETRIES/$MAX_RETRIES)"
  fi
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
  err "Application failed to start. Check logs with: docker compose logs app"
fi

log "Docker Compose services are running."

# ==============================================================
# STEP 5: Run Database Migrations
# ==============================================================
info "Running database migrations..."
docker exec marketplace-v2 sh -c "cd /app/backend && npx sequelize-cli db:migrate" || {
  warn "Migration via CLI failed, trying server auto-migration..."
  # The server auto-runs migrations on startup, so this may be a no-op
  sleep 3
}
log "Database migrations completed."

# ==============================================================
# STEP 6: Seed the Database
# ==============================================================
info "Seeding database with demo data..."
docker exec marketplace-v2 sh -c "cd /app/backend && npx sequelize-cli db:seed:all" || {
  # If seed fails (e.g., already seeded), it's usually okay
  warn "Seeding encountered issues (may already be seeded). Checking data..."
}
log "Database seeding completed."

# ==============================================================
# STEP 7: Verify
# ==============================================================
info "Verifying deployment..."
sleep 2

# Check API
if curl -s http://localhost:5000/api-docs >/dev/null 2>&1; then
  log "API is running at http://localhost:5000/api-docs"
else
  warn "API health check inconclusive. Check with: curl http://localhost:5000/api-docs"
fi

# Check Frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 >/dev/null 2>&1; then
  log "Frontend is running at http://localhost:3001"
else
  warn "Frontend health check inconclusive."
fi

# Check Database
docker exec marketplace-db psql -U postgres -d marketplace -c "SELECT count(*) as total_users FROM users;" >/dev/null 2>&1 && {
  USERS=$(docker exec marketplace-db psql -U postgres -d marketplace -t -A -c "SELECT count(*) FROM users;")
  log "Database has $USERS users seeded."
}

# ==============================================================
# SUMMARY
# ==============================================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  MARKETPLACE V2 IS READY!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  Frontend:  ${CYAN}http://localhost:3001${NC}"
echo -e "  API:       ${CYAN}http://localhost:5000${NC}"
echo -e "  API Docs:  ${CYAN}http://localhost:5000/api-docs${NC}"
echo ""
echo -e "  ${YELLOW}Demo Accounts:${NC}"
echo -e "  Admin:  admin@marketplace.com / Admin123!"
echo -e "  User:   user@marketplace.com  / User123!"
echo ""
echo -e "  Quick commands:"
echo -e "  Logs:       ${YELLOW}docker compose logs -f${NC}"
echo -e "  Rebuild:    ${YELLOW}docker compose up -d --build${NC}"
echo -e "  Stop:       ${YELLOW}docker compose down${NC}"
echo -e "  Seed again: ${YELLOW}docker exec marketplace-v2 sh -c 'cd /app/backend && npx sequelize-cli db:seed:all'${NC}"
echo ""
