#!/usr/bin/env bash
# Start the Next.js frontend for local development
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

echo "Installing dependencies..."
npm install

echo "Starting Next.js frontend on http://localhost:3000"
npm run dev
