#!/bin/bash

# Start simple HTTP server for documentation preview

PORT=${1:-8080}

echo "Starting documentation server on port $PORT..."
echo "Open http://localhost:$PORT in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server $PORT

