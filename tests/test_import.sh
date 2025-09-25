#!/bin/bash

# Test script for importing cached recipes to MongoDB
echo "🔄 Starting import test..."

# Start the Next.js server in the background
echo "📡 Starting development server..."
cd /home/dci-student/dci-curse/webdev-assets/Final-Project-25-08-2025/smartplates
bun run dev &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 10

# Test the import endpoint
echo "🧪 Testing import endpoint..."
response=$(curl -s -X POST http://localhost:3000/api/admin/import-cached-recipes \
  -H "Content-Type: application/json" \
  -w "HTTPSTATUS:%{http_code}")

# Extract response body and status code
body=$(echo $response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
status_code=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

echo "📊 HTTP Status: $status_code"
echo "📋 Response: $body"

# Stop the server
echo "🛑 Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

# Analyze the result
if [ "$status_code" = "200" ]; then
    echo "✅ Import test successful!"
else
    echo "❌ Import test failed with status $status_code"
fi

echo "🏁 Test completed"