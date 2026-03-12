#!/bin/bash

# FINZO Quick Start Script
# Run this to start the development server

echo "🚀 Starting FINZO Development Server..."
echo ""

cd "$(dirname "$0")/finzo"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

# Clear cache and start
echo "🔥 Starting Expo with cleared cache..."
npx expo start --clear
