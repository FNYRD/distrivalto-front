#!/usr/bin/env bash
# Quick-start script for the Distrivalto backend (development)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate virtual environment
source .venv/bin/activate

# Apply any pending migrations
python manage.py migrate --run-syncdb

# Seed mock data (safe to run multiple times — skips existing records)
python manage.py seed_data

# Start development server
echo ""
echo "Backend running at http://localhost:8000"
echo ""
python manage.py runserver
