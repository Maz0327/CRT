# Strategic Intelligence Platform

> **Advanced AI-powered content intelligence platform featuring DSD Signal Drop methodology, Truth Analysis Framework, and comprehensive strategic brief generation capabilities.**

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Node.js-blue)
![AI Integration](https://img.shields.io/badge/AI-GPT--5%20%7C%20Google%20Cloud-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Overview

The Strategic Intelligence Platform transforms raw content signals into actionable business intelligence through advanced AI analysis, strategic frameworks, and automated brief generation. Built for businesses seeking cultural insights, viral trend prediction, and strategic content intelligence.

### Key Capabilities

- **🎯 DSD Signal Drop Methodology**: Define→Shift→Deliver strategic brief building
- **🧠 Truth Analysis Framework**: 4-layer philosophical analysis (Fact→Observation→Insight→Human Truth)
- **📊 Viral Intelligence**: Advanced scoring (0-100) with cultural resonance tracking
- **🌐 Multi-Platform Scraping**: Real-time data from Twitter, Instagram, TikTok, YouTube, Reddit, LinkedIn
- **🔬 Collective Intelligence Network**: Anonymized pattern recognition with confidence scoring
- **🎨 Professional UI**: TrendFinder-LVUI-Push design system with sophisticated animations
- **🔌 Chrome Extension**: Enhanced capture with DSD tagging and AI integration

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript and Vite
- **Shadcn/UI** components with Radix UI primitives
- **TailwindCSS** for styling with dark mode support
- **TanStack React Query** for state management
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** with Drizzle ORM
- **Session-based authentication** with PostgreSQL storage
- **RESTful API** with comprehensive error handling
- **Rate limiting** and security middleware

### AI & Integrations
- **OpenAI GPT-5** with selective reasoning (50% cost savings vs GPT-4o)
- **Google Cloud AI** (Vision, NLP, Custom Search)
- **BrightData API** for social media scraping
- **Chrome Extension** with WebSocket connectivity

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key
- BrightData API credentials (optional)
- Google Cloud API credentials (optional)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/strategic-intelligence-platform.git
   cd strategic-intelligence-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/strategic_intel
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   BRIGHT_DATA_API_TOKEN=your_bright_data_token
   SESSION_SECRET=your_session_secret
   ```

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🎯 Core Features

### Strategic Intelligence Pipeline

#### 1. **Signal Capture**
- Multi-platform content scraping
- Chrome extension for precision capture
- Context-aware content analysis
- DSD tag assignment (Life Lens, Raw Behavior, Channel Vibes)

#### 2. **Truth Analysis Framework**
- **Fact Layer**: Objective content verification
- **Observation Layer**: Pattern and trend identification  
- **Insight Layer**: Strategic implications analysis
- **Human Truth Layer**: Cultural and emotional resonance

#### 3. **DSD Brief Generation**
- **Define**: Problem statement and objectives
- **Shift**: Cultural moment and trend analysis
- **Deliver**: Actionable recommendations and strategic guidance

#### 4. **Collective Intelligence**
- Cross-user pattern recognition
- Anonymized insight aggregation
- Confidence scoring that improves with scale
- Cultural moment emergence detection

### Advanced Analytics

- **Viral Scoring**: 0-100 scale with cultural resonance metrics
- **Cross-generational Analysis**: Multi-demographic trend tracking
- **Hypothesis Validation**: Prediction accuracy measurement
- **Brand Voice Alignment**: Content-brand fit scoring

## 📖 Usage Guide

### Dashboard Navigation
- **Today's Briefing**: Real-time intelligence hub
- **Explore Signals**: Multi-platform content discovery
- **Signal Capture**: Manual and automated content collection
- **Strategic Brief Lab**: DSD methodology workspace
- **Data Sources**: Platform scraping management

### Chrome Extension
1. Install the extension from `chrome-extension/` directory
2. Pin to toolbar for quick access
3. Use precision capture on any webpage
4. AI analysis integration with main platform

### API Integration
See [API Documentation](./docs/API.md) for detailed endpoint reference.

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and API client
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── services/          # Business logic services
├── shared/                # Shared TypeScript types
├── chrome-extension/      # Chrome extension source
└── docs/                  # Additional documentation
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Update database schema
npm run db:studio    # Open database GUI
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Database Schema
The platform uses an 11-table PostgreSQL schema supporting:
- User management and authentication
- Project and capture organization
- Strategic intelligence features
- Session storage
- Analytics and metrics

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Fork this repository to Replit
2. Configure environment secrets
3. Run `npm run dev`
4. Deploy using Replit's deployment system

### Self-Hosted Deployment
See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🔌 Integrations

### Data Sources
- **BrightData**: Social media content scraping
- **Google Cloud**: AI analysis and search
- **OpenAI**: GPT-5 reasoning and content analysis

### Export Capabilities
- Google Slides integration for DSD briefs
- CSV/Markdown exports
- Quote Bank extraction
- Manual Boost Planner generation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-5 API access
- **BrightData** for social media scraping infrastructure
- **Google Cloud** for AI services
- **Replit** for development and hosting platform
- **TrendFinder-LVUI-Push** for design system inspiration

## 📞 Support

- 📧 Email: support@strategicintelligence.com
- 📖 Documentation: [docs.strategicintelligence.com](https://docs.strategicintelligence.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/strategic-intelligence-platform/issues)

---

**Built with ❤️ for strategic intelligence professionals worldwide**