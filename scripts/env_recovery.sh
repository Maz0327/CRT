# ===== Env Recovery: Vite + React plugin restore, verify, audit =====
set -euo pipefail

PM="npm"; command -v pnpm >/dev/null 2>&1 && PM="pnpm"
RUN() { if [ "$PM" = "pnpm" ]; then pnpm "$@"; else npm run "$@"; fi }

echo "==> Package manager: $PM"

# 0) Snapshot & cleanup
cp -f package.json package.json.bak 2>/dev/null || true
rm -rf node_modules pnpm-lock.yaml package-lock.json

# 1) Ensure deps/versions (pinned to stable, broad compatibility)
node - <<'NODE'
const fs=require('fs');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

pkg.dependencies = { ...(pkg.dependencies||{}) };
pkg.devDependencies = { ...(pkg.devDependencies||{}) };

const ensure = (bag, k, v)=>{ if(!bag[k]) bag[k]=v; };
const bumpMin = (bag, k, v)=>{ if(!bag[k]) bag[k]=v; };

ensure(pkg.dependencies, "react", "^18.2.0");
ensure(pkg.dependencies, "react-dom", "^18.2.0");

bumpMin(pkg.devDependencies, "vite", "^5.4.6");
bumpMin(pkg.devDependencies, "@vitejs/plugin-react", "^4.3.1");
bumpMin(pkg.devDependencies, "typescript", "^5.5.4");
bumpMin(pkg.devDependencies, "tsx", "^4.19.0");
bumpMin(pkg.devDependencies, "concurrently", "^8.2.2");
bumpMin(pkg.devDependencies, "esbuild", "^0.24.4");
bumpMin(pkg.devDependencies, "@tailwindcss/postcss", "^4.0.0");

fs.writeFileSync('package.json', JSON.stringify(pkg,null,2));
console.log("package.json deps ensured");
NODE

# 2) Clean npm/pnpm caches & install (with fallbacks)
if [ "$PM" = "pnpm" ]; then
  corepack enable || true
  pnpm store prune || true
  pnpm install --no-frozen-lockfile || \
  pnpm install --no-frozen-lockfile --force || \
  (echo "pnpm install failed, switching to npm"; PM="npm"; npm cache clean --force; npm i --legacy-peer-deps || npm i --force)
else
  npm cache verify || npm cache clean --force
  npm i --legacy-peer-deps || npm i --force
fi

# 3) Verify @vitejs/plugin-react; fallback to -swc if needed
node -e "require('@vitejs/plugin-react'); console.log('plugin-react OK')" || {
  echo "plugin-react unavailable; falling back to @vitejs/plugin-react-swc"
  if [ "$PM" = "pnpm" ]; then pnpm add -D @vitejs/plugin-react-swc; else npm i -D @vitejs/plugin-react-swc; fi
  export USE_SWC=1
}

# 4) Ensure vite.config.ts imports the correct plugin and uses it
if [ -f vite.config.ts ]; then
  if [ "${USE_SWC:-0}" = "1" ]; then
    # switch to swc plugin
    sed -i 's#@vitejs/plugin-react[^"]*#@vitejs/plugin-react-swc#g' vite.config.ts || true
    sed -i 's#react\([^a-zA-Z]\)#reactSWC\1#g' vite.config.ts || true
    if ! grep -q "plugin-react-swc" vite.config.ts; then
      # naive insert
      sed -i '1i import react from "@vitejs/plugin-react-swc";' vite.config.ts
    fi
  else
    # ensure plugin-react import present
    grep -q "@vitejs/plugin-react" vite.config.ts || sed -i '1i import react from "@vitejs/plugin-react";' vite.config.ts
  fi

  # ensure plugin array includes react()
  node - <<'NODE'
const fs=require('fs');let s=fs.readFileSync('vite.config.ts','utf8');
if(!/plugins\s*:\s*\[/.test(s)){
  s=s.replace(/defineConfig\(\{/, 'defineConfig({\n  plugins: [react()],');
}else if(!/react\(\)/.test(s)){
  s=s.replace(/plugins\s*:\s*\[/, 'plugins: [react(), ');
}
if(!/chunkSizeWarningLimit/.test(s)){
  s=s.replace(/defineConfig\(\{/, 'defineConfig({\n  build: { chunkSizeWarningLimit: 800 },');
}
fs.writeFileSync('vite.config.ts', s);
console.log("vite.config.ts ensured (plugins + chunkSizeWarningLimit)");
NODE
else
  echo "vite.config.ts missing; skipping plugin wiring (Vite may be app-local)."
fi

# 5) Minimal scripts sanity (won't override existing)
node - <<'NODE'
const fs=require('fs');const p='package.json';const pkg=JSON.parse(fs.readFileSync(p,'utf8'));
pkg.scripts ||= {};
pkg.scripts.typecheck = pkg.scripts.typecheck || "tsc -p tsconfig.json --noEmit";
pkg.scripts.build     = pkg.scripts.build     || "vite build";
pkg.scripts.dev       = pkg.scripts.dev       || "concurrently \"vite\" \"npx tsx server/index.ts\"";
fs.writeFileSync(p, JSON.stringify(pkg,null,2));
console.log("scripts ensured (typecheck/build/dev)");
NODE

# 6) Quick env guidance output (won't set secrets for you)
ENVX="artifacts/env_required.txt"
mkdir -p artifacts
cat > "$ENVX" <<'TXT'
Set these in Replit → Secrets before prod:
ALLOWED_ORIGINS=https://<your-repl-url>,chrome-extension://<YOUR_EXTENSION_ID>
CHROME_EXTENSION_ID=<YOUR_EXTENSION_ID>
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=300
TXT
echo "Wrote $ENVX"

# 7) Typecheck / Build / Smoke + Audit
( $PM run typecheck ) > logs/recovery_typecheck.out 2>&1 || true
( $PM run build )     > logs/recovery_build.out 2>&1 || true

REPORT="artifacts/recovery_audit.md"
: > "$REPORT"
echo "# Recovery Audit ($(date -u))" | tee -a "$REPORT"
echo -e "\n## Typecheck (tail)" | tee -a "$REPORT"
tail -n 60 logs/recovery_typecheck.out 2>/dev/null | tee -a "$REPORT" || true
echo -e "\n## Build (tail)" | tee -a "$REPORT"
tail -n 80 logs/recovery_build.out 2>/dev/null | tee -a "$REPORT" || true

echo -e "\n## Dependency snapshot" | tee -a "$REPORT"
if [ "$PM" = "pnpm" ]; then pnpm ls --depth=0 | tee -a "$REPORT" || true; else npm ls --depth=0 | tee -a "$REPORT" || true; fi

echo -e "\n---\nReport: $REPORT\nLogs in ./logs\n"
echo "✅ Env recovery script finished."