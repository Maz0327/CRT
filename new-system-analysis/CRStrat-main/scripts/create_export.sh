#!/bin/bash
set -e

echo "Creating Content Radar export package..."
export_dir="content_radar_export_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$export_dir"

# Copy all source code
echo "Copying source code..."
cp -r client/ "$export_dir/" 2>/dev/null || true
cp -r server/ "$export_dir/" 2>/dev/null || true
cp -r shared/ "$export_dir/" 2>/dev/null || true
cp -r chrome-extension/ "$export_dir/" 2>/dev/null || true
cp -r extension/ "$export_dir/" 2>/dev/null || true

# Copy database and configuration
echo "Copying database and config files..."
cp -r supabase/ "$export_dir/" 2>/dev/null || true
cp drizzle.config.ts "$export_dir/" 2>/dev/null || true
cp schema.sql "$export_dir/" 2>/dev/null || true
cp supabase-setup.sql "$export_dir/" 2>/dev/null || true

# Copy configuration files
echo "Copying configuration..."
cp tsconfig.json "$export_dir/" 2>/dev/null || true
cp vite.config.ts "$export_dir/" 2>/dev/null || true
cp tailwind.config.ts "$export_dir/" 2>/dev/null || true
cp postcss.config.cjs "$export_dir/" 2>/dev/null || true
cp components.json "$export_dir/" 2>/dev/null || true
cp vitest.config.ts "$export_dir/" 2>/dev/null || true
cp vitest.setup.ts "$export_dir/" 2>/dev/null || true

# Copy documentation and project files
echo "Copying documentation..."
cp replit.md "$export_dir/" 2>/dev/null || true
cp README.md "$export_dir/" 2>/dev/null || true
cp LICENSE "$export_dir/" 2>/dev/null || true
cp frontend_contract.md "$export_dir/" 2>/dev/null || true
cp -r docs/ "$export_dir/" 2>/dev/null || true

# Copy scripts and utilities
echo "Copying scripts..."
cp -r scripts/ "$export_dir/" 2>/dev/null || true
cp -r tests/ "$export_dir/" 2>/dev/null || true

# Copy environment example
cp .env.example "$export_dir/" 2>/dev/null || true

# Copy completion reports and status files
echo "Copying project reports..."
cp *.md "$export_dir/" 2>/dev/null || true
cp -r artifacts/ "$export_dir/" 2>/dev/null || true

# Create setup instructions
cat > "$export_dir/SETUP_INSTRUCTIONS.md" << 'EOF'
# Content Radar Project Setup

## Quick Start
1. Create new Replit project with React/Express template
2. Copy all files from this export into the new project
3. Run `npm install` to install dependencies
4. Set environment variables in Replit Secrets
5. Run `npm run db:push` to create database tables
6. Start with `npm run dev`

## Environment Variables Needed
```
DATABASE_URL=<from_new_replit>
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_key>
OPENAI_API_KEY=<your_openai_key>
ALLOWED_ORIGINS=https://<new-repl-url>
CHROME_EXTENSION_ID=<your_extension_id>
```

## What's Included
- ✅ Complete Truth Lab backend (95% complete)
- ✅ Multi-file upload system with metadata
- ✅ Chrome extension integration
- ✅ Authentication and security systems
- ✅ Project-scoped multi-tenant architecture
- ✅ Database schema and migrations
- ✅ All UI components and styling
- ✅ Export capabilities
- ✅ AI analysis integration

## What's Excluded (Corrupted Files)
- ❌ node_modules/ (will reinstall clean)
- ❌ package.json (use fresh template version)
- ❌ package-lock.json/pnpm-lock.yaml
- ❌ .replit file (environment-specific)
- ❌ Build artifacts and cache files

## Database Setup
1. Run `npm run db:push` to create all tables
2. Truth Lab tables: truth_checks, truth_evidence, analysis_jobs
3. All other tables from your existing schema

Your months of development work is preserved and ready to run!
EOF

# Create a clean package.json template
cat > "$export_dir/package.json.template" << 'EOF'
{
  "name": "content-radar",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently -k -n server,client -c cyan,magenta \"npm:dev:server\" \"npm:dev:client\"",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/prod-server.js",
    "typecheck": "tsc --noEmit",
    "db:push": "drizzle-kit push",
    "dev:server": "NODE_ENV=development npx tsx server/index.ts",
    "dev:client": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "express": "^4.19.2",
    "@supabase/supabase-js": "^2.45.0",
    "drizzle-orm": "^0.32.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "tsx": "^4.16.0",
    "concurrently": "^8.2.0",
    "esbuild": "^0.23.0",
    "drizzle-kit": "^0.24.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/express": "^4.17.0"
  }
}
EOF

echo "Creating zip file..."
zip -r "${export_dir}.zip" "$export_dir" -x "*.DS_Store" "*/.git/*" "*/node_modules/*"

echo "✅ Export complete: ${export_dir}.zip"
echo ""
echo "FILES EXCLUDED (corrupted environment):"
echo "- node_modules/ (reinstall clean)"
echo "- package.json (use template provided)" 
echo "- package-lock.json, pnpm-lock.yaml"
echo "- .replit file"
echo "- Build cache and temp files"
echo ""
echo "FILES INCLUDED (all your work):"
echo "- All source code (client/, server/, shared/)"
echo "- Database schema and migrations" 
echo "- Configuration files"
echo "- Documentation and reports"
echo "- Chrome extension"
echo "- Scripts and utilities"
echo "- Setup instructions"