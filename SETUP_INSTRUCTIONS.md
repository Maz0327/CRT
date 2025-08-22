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
