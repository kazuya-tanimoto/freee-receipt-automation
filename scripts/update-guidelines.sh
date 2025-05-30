#!/bin/bash

# Script to update guidelines submodules
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

echo "Guidelines update completed successfully!"