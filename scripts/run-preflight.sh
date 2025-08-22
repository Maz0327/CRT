#!/bin/bash
set -e

echo "=== Content Radar Preflight Check ==="
echo "Running in $(pwd)"
echo "------------------------------------"

# Track results
declare -A RESULTS

# Helper to mark checks
mark_result() {
  if [ $1 -eq 0 ]; then
    RESULTS[$2]="✅ PASS"
  else
    RESULTS[$2]="❌ FAIL"
  fi
}

### 1. Environment Checks
echo "[1/6] Checking environment variables..."
REQUIRED_VARS=(NODE_ENV MEDIA_PROVIDER ENABLE_WORKERS SUPABASE_STORAGE_BUCKET ANALYSIS_MAX_SYNC_IMAGE_BYTES ALLOWED_ORIGINS CHROME_EXTENSION_ID)
MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo "   ❌ Missing $VAR"
    MISSING=1
  fi
done
if [ $MISSING -eq 0 ]; then
  echo "   ✅ All environment variables set"
fi
mark_result $MISSING "Environment"

### 2. Backend Health
echo "[2/6] Checking backend health..."
curl -s http://localhost:3000/healthz | grep -q '"status":"ok"'
mark_result $? "Healthz"

curl -s http://localhost:3000/readyz | grep -q '"status":"ready"'
mark_result $? "Readyz"

### 3. Database Checks
echo "[3/6] Checking database migrations & RLS..."
DB_CHECK=$(supabase db inspect | grep -c "canvas_pages")
if [ "$DB_CHECK" -gt 0 ]; then
  echo "   ✅ Tables found"
  mark_result 0 "Database"
else
  echo "   ❌ Tables missing"
  mark_result 1 "Database"
fi

### 4. Frontend Build
echo "[4/6] Building UI..."
npm run build >/dev/null 2>&1
mark_result $? "UI Build"

### 5. Feature Smoke Tests
echo "[5/6] Running smoke tests..."
ts-node scripts/smoke-tests.ts >/dev/null 2>&1
mark_result $? "Smoke Tests"

### 6. CSP/CORS Checks
echo "[6/6] Checking CSP/CORS..."
grep -q "chrome-extension" server/lib/security.ts
mark_result $? "CSP Config"

### Summary
echo "------------------------------------"
echo "=== Preflight Summary ==="
for KEY in "${!RESULTS[@]}"; do
  echo "$KEY: ${RESULTS[$KEY]}"
done

# Exit nonzero if any failed
for VAL in "${RESULTS[@]}"; do
  if [[ "$VAL" == "❌ FAIL" ]]; then
    echo "Preflight check FAILED ❌"
    exit 1
  fi
done

echo "All checks passed ✅ - System is READY for beta"
