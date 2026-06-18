#!/bin/bash

# Performance timing measurement script
# Usage: ./test-timing.sh
# 
# Environment variables (with safe defaults):
#   ADMIN_EMAIL    - Admin email (default: admin@giftapp.com)
#   ADMIN_PASSWORD - Admin password (default: Admin123!)
#   API_URL        - Backend URL (default: http://localhost:3001)

set -e

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@giftapp.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"
API_URL="${API_URL:-http://localhost:3001}"

echo "=== GiftApp Performance Timing Test ==="
echo "API: $API_URL"
echo "Admin: $ADMIN_EMAIL"
echo ""

# Check if backend is running
if ! curl -s "$API_URL/api" > /dev/null 2>&1; then
  echo "Error: Backend is not running at $API_URL"
  echo "Start it with: cd backend && npm run start:dev"
  exit 1
fi

# Get auth token
echo "Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: Failed to get auth token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✓ Authenticated"
echo ""
echo "Testing endpoints..."
echo ""

echo "=== Dashboard Stats ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Campaigns ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/campaigns" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Employees ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/employees" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Beneficiaries ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/beneficiaries" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Gifts ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/gifts" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Selections ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/selections" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Support Requests ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/support-requests" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Companies ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/companies" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=== Admin Users ==="
curl -s -w "Time: %{time_total}s\n" \
  "$API_URL/api/admin/users" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "✓ Timing test complete"
echo ""
echo "Check backend logs for detailed timing information."
echo "Enable timing logs by setting: ENABLE_TIMING_LOGS=true in .env"
