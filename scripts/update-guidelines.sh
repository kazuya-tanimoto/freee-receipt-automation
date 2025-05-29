#!/bin/bash

# Script to update guidelines submodules and format the SUMMARY.md file
# This script is part of the AI-driven development guidelines setup

set -e

# Check if submodules exist
if [ -f .gitmodules ]; then
  echo "Updating guidelines submodules..."
  # Initialize submodules if not initialized
  git submodule init
  git submodule update --remote --merge
else
  echo "No submodules found. Skipping submodule update."
fi

# Check if SUMMARY.md exists before formatting
SUMMARY_FILE="docs/standards/SUMMARY.md"
if [ -f "$SUMMARY_FILE" ]; then
  echo "Formatting SUMMARY.md..."
  if command -v npx &> /dev/null; then
    npx mdformat "$SUMMARY_FILE"
  else
    echo "Warning: npx not found. Please install Node.js to use mdformat."
  fi
else
  echo "Warning: $SUMMARY_FILE not found. Skipping formatting."
fi

echo "Guidelines update completed successfully!"