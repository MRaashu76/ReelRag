#!/usr/bin/env bash
# Start the FastAPI backend for local development
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  source venv/bin/activate
elif [ -d ".venv" ]; then
  source .venv/bin/activate
fi

# Load .env from project root
if [ -f "../.env" ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

echo "Starting FastAPI backend on http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
