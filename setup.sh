#!/usr/bin/env bash
# Setup script: creates Python venv and installs backend dependencies
set -e

echo "=== ReelRAG Backend Setup ==="
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Check ffmpeg
if ! command -v ffmpeg &> /dev/null; then
  echo "WARNING: ffmpeg not found. Install it for Whisper audio processing:"
  echo "  macOS:  brew install ffmpeg"
  echo "  Ubuntu: sudo apt install ffmpeg"
fi

# Navigate to backend
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip --quiet

# Install requirements
echo "Installing Python dependencies (this may take a few minutes)..."
pip install -r requirements.txt

# Pre-download models
echo ""
echo "Pre-downloading BAAI/bge-small-en-v1.5 embedding model..."
python -c "
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('BAAI/bge-small-en-v1.5')
print('  Embedding model ready.')
"

echo ""
echo "Pre-downloading Whisper base model..."
python -c "
import whisper
whisper.load_model('base')
print('  Whisper model ready.')
"

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To start the backend:"
echo "  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "Or use the convenience script:"
echo "  ./start-backend.sh"
