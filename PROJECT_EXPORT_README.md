# Content Radar Project Export

## Project Package Information
- **Export Date**: August 9, 2025
- **File**: content-radar-project.tar.gz (95MB)
- **Format**: Compressed tar archive

## What's Included
- Complete source code (client + server)
- Database schema and migrations
- Configuration files
- Documentation (replit.md)
- Chrome extension code
- All TypeScript definitions

## What's Excluded (to reduce size)
- node_modules/ (dependencies)
- .git/ (version control history)
- dist/ and build/ (compiled outputs)
- package-lock.json (lockfile)
- Log files and cache

## Key Project Details

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-5 (recently upgraded from GPT-4o)
- **UI**: Shadcn/ui + Tailwind CSS
- **Data Sources**: Bright Data APIs for social media scraping

### Architecture Overview
- **Strategic Intelligence Platform** for content trend monitoring
- **Manual scanning system** (cost-optimized, no automated polling)
- **Truth Analysis Framework**: Fact → Observation → Insight → Human Truth
- **Project-based workflow**: Define → Shift → Deliver methodology
- **Chrome extension integration** for content capture

### Current Status (as of export)
- ✅ Core system fully functional
- ✅ Manual content scanning implemented
- ✅ GPT-5 integration complete (50% cost savings vs GPT-4o)
- ✅ Database schema finalized
- ✅ Authentication system working
- ✅ Supabase PostgreSQL integration
- 🚧 Strategic Brief Lab (planned next feature)
- 🚧 Advanced analytics dashboard (planned)

### Environment Requirements
1. **Node.js 18+**
2. **PostgreSQL database** (Supabase recommended)
3. **API Keys needed**:
   - OPENAI_API_KEY (GPT-5 access)
   - BRIGHT_DATA_API_TOKEN
   - BRIGHT_DATA_USERNAME/PASSWORD
   - GEMINI_API_KEY
   - DATABASE_URL (PostgreSQL connection string)

### Installation After Export
```bash
# Extract the archive
tar -xzf content-radar-project.tar.gz
cd workspace/

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Database setup
npm run db:push

# Start development server
npm run dev
```

### Key Features
- **Manual Content Scanning**: Cost-efficient scanning triggered by user
- **AI-Powered Analysis**: GPT-5 for content summarization and hook generation
- **Multi-Platform Support**: Reddit, YouTube, Instagram, TikTok, Twitter/X
- **Chrome Extension**: For manual content capture
- **Project Management**: Organize content by strategic projects
- **Export Capabilities**: CSV/JSON data export
- **Truth Analysis Engine**: 4-layer strategic content assessment

### Recent Improvements
- Removed expensive automated polling (5-second intervals)
- Implemented manual "Scan Now" approach for cost control
- Upgraded from GPT-4o to GPT-5 for 50% input token cost savings
- Fixed all TypeScript errors for production readiness
- Optimized database queries and storage interface

## For Analysts
This is a complete strategic intelligence platform designed to serve as a "second brain" and "third arm" for content strategists. The codebase demonstrates:

- **Cost-conscious AI integration** with manual triggers
- **Sophisticated content analysis pipeline** using multiple AI models
- **Strategic workflow methodology** (Define→Shift→Deliver)
- **Enterprise-ready architecture** with proper error handling
- **Scalable database design** for content intelligence

The project balances powerful AI capabilities with practical cost management, making it suitable for both startup and enterprise deployment scenarios.