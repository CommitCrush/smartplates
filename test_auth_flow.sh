#!/bin/bash

# Test Registration and Login Flow
echo "🧪 Testing SmartPlates Authentication Flow"
echo "=========================================="

# Test 1: Register a new user
echo
echo "📝 Test 1: Registering a new user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Flow",
    "email": "testflow@example.com",
    "password": "testpassword123",
    "confirmPassword": "testpassword123"
  }' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $REGISTER_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $REGISTER_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"

if [ $HTTP_STATUS -eq 201 ]; then
    echo "✅ Registration successful"
else
    echo "❌ Registration failed"
fi

echo
echo "📝 Test 2: Attempting duplicate registration..."
DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate User",
    "email": "admin@smartplates.dev",
    "password": "testpassword123"
  }' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $DUPLICATE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $DUPLICATE_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"

if [ $HTTP_STATUS -eq 409 ]; then
    echo "✅ Duplicate prevention working"
else
    echo "❌ Duplicate prevention failed"
fi

echo
echo "📝 Test 3: Login with admin credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartplates.dev",
    "password": "admin123"
  }' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $LOGIN_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $LOGIN_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"

if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ Login successful"
else
    echo "❌ Login failed"
fi

echo
echo "📝 Test 4: Login with invalid credentials..."
INVALID_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $INVALID_LOGIN_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $INVALID_LOGIN_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"

if [ $HTTP_STATUS -eq 401 ]; then
    echo "✅ Invalid credentials properly rejected"
else
    echo "❌ Invalid credentials handling failed"
fi

echo
echo "🎉 Authentication flow tests completed!"
echo "=========================================="
