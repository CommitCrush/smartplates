#!/bin/bash

echo "🧪 Testing Role-Based Authentication & Redirection"
echo "=================================================="
echo ""

# Step 1: Create default admin users
echo "📝 Step 1: Creating default admin users..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"action": "create-defaults"}' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $ADMIN_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $ADMIN_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"
echo ""

# Step 2: Test Admin Login
echo "📝 Step 2: Testing Admin Login..."
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartplates.dev",
    "password": "admin123"
  }' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $ADMIN_LOGIN | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $ADMIN_LOGIN | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Admin Login Response: $RESPONSE_BODY"

if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ Admin login successful - should redirect to /admin"
else
    echo "❌ Admin login failed"
fi
echo ""

# Step 3: Create a regular user
echo "📝 Step 3: Creating a regular user..."
USER_REGISTER=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regular User",
    "email": "user@example.com",
    "password": "userpassword123",
    "confirmPassword": "userpassword123"
  }' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $USER_REGISTER | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $USER_REGISTER | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "User Registration Response: $RESPONSE_BODY"

if [ $HTTP_STATUS -eq 201 ]; then
    echo "✅ User registration successful - should redirect to /user"
else
    echo "❌ User registration failed"
fi
echo ""

# Step 4: Test User Login
echo "📝 Step 4: Testing User Login..."
USER_LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "userpassword123"
  }' \
  -w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $USER_LOGIN | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $USER_LOGIN | sed -e 's/HTTPSTATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "User Login Response: $RESPONSE_BODY"

if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ User login successful - should redirect to /user"
else
    echo "❌ User login failed"
fi
echo ""

echo "🎉 Role-based authentication testing completed!"
echo "=============================================="
echo ""
echo "Summary:"
echo "- Admin users should be redirected to: /admin"
echo "- Regular users should be redirected to: /user"
echo "- Test these by opening the browser and logging in with the credentials above"
