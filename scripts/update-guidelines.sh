#!/bin/bash

# Script to update guidelines submodules and format the SUMMARY.md file
# This script is part of the AI-driven development guidelines setup

set -e

echo "Updating guidelines submodules..."
git submodule update --remote --merge

echo "Formatting SUMMARY.md..."
if command -v npx &> /dev/null; then
  npx mdformat docs/standards/SUMMARY.md
else
  echo "Warning: npx not found. Please install Node.js to use mdformat."
fi

echo "Guidelines update completed successfully!"