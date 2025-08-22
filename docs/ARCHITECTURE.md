# Architecture Documentation

## System Overview

The Strategic Intelligence Platform is built as a modern full-stack application with a clear separation of concerns between frontend, backend, and external services.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                        Backend (Node.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                      Database (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────────┤
│                      External Services                         │
│              (OpenAI, BrightData, Google Cloud)                │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **TailwindCSS** for styling with CSS variables
- **Shadcn/UI** component library built on Radix UI
- **TanStack React Query** for server state management
- **Wouter** for client-side routing
- **Framer Motion** for animations

### Component Organization

```
client/src/
├── components/
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── layout/             # Layout components
│   ├── signals/            # Signal-specific components
│   ├── onboarding/         # Onboarding and tour components
│   └── strategic/          # Strategic intelligence components
├── pages/                  # Route components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configuration
└── types/                  # TypeScript type definitions
```

### State Management Strategy

#### Server State
- **TanStack React Query** manages all server communication
- Automatic caching, background updates, and optimistic updates
- Query invalidation for real-time data consistency

#### Client State
- **React useState/useReducer** for local component state
- **Context API** for theme and authentication state
- **localStorage** for user preferences and session persistence

#### Data Flow
```
User Action → Component → React Query → API Call → Backend → Database
     ↑                                                            ↓
UI Update ← Component ← Cache Update ← Response ← API Response ←──┘
```

### Design System

#### TrendFinder-LVUI-Push Integration
- **SidebarProvider** for consistent navigation
- **AppSidebar** with gradient backgrounds and animations
- **PageLayout** system for consistent page structure
- **StaggeredFadeIn** and **FadeIn** animation components

#### Color System
```css
:root {
  --primary: hsl(217, 70%, 53%);
  --primary-foreground: hsl(0, 0%, 98%);
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(240, 10%, 3.9%);
  /* ... additional color variables */
}

.dark {
  --background: hsl(240, 10%, 3.9%);
  --foreground: hsl(0, 0%, 98%);
  /* ... dark mode overrides */
}
```

## Backend Architecture

### Technology Stack
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Express Session** with PostgreSQL storage
- **Zod** for runtime validation
- **Passport.js** for authentication

### Application Structure

```
server/
├── routes.ts              # API route definitions
├── storage.ts             # Database operations interface
├── db.ts                  # Database connection and configuration
├── services/              # Business logic services
│   ├── aiAnalyzer.ts     # AI content analysis
│   ├── truthFramework.ts # Truth Analysis Framework
│   ├── brightDataService.ts # Data scraping
│   └── liveBrightDataService.ts # Real-time data
├── middleware/            # Express middleware
└── utils/                 # Utility functions
```

### Service Layer Architecture

#### AIAnalyzer Service
```typescript
interface IAIAnalyzer {
  analyzeContent(title: string, content: string, platform: string): Promise<AnalysisResult>
  generateHooks(content: string): Promise<string[]>
  calculateViralScore(content: string, engagement: EngagementMetrics): Promise<number>
}
```

#### Truth Analysis Framework
```typescript
interface ITruthFramework {
  analyzeContent(content: string, platform: string, context: AnalysisContext): Promise<TruthAnalysis>
}

interface TruthAnalysis {
  factLayer: LayerAnalysis
  observationLayer: LayerAnalysis
  insightLayer: LayerAnalysis
  humanTruthLayer: LayerAnalysis
}
```

#### BrightData Integration
```typescript
interface IBrightDataService {
  fetchLiveData(platform: string, keywords: string[], limit: number): Promise<ScrapedData>
  triggerCollection(platform: string, query: string): Promise<CollectionResult>
}
```

### Middleware Stack

1. **Request Logging** - Structured logging with request IDs
2. **Security Headers** - CORS, CSP, rate limiting
3. **Session Management** - PostgreSQL-backed sessions
4. **Authentication** - Passport.js with OpenID Connect
5. **Validation** - Zod schema validation
6. **Error Handling** - Centralized error processing

### API Design Patterns

#### RESTful Conventions
```
GET    /api/captures        # List resources
POST   /api/captures        # Create resource
GET    /api/captures/:id    # Get specific resource
PATCH  /api/captures/:id    # Update resource
DELETE /api/captures/:id    # Delete resource
```

#### Error Response Format
```typescript
interface APIError {
  error: string
  details?: string
  code?: string
  timestamp: string
}
```

## Database Architecture

### Schema Design

The platform uses an 11-table PostgreSQL schema optimized for strategic intelligence operations:

```sql
-- Core Tables
users                    # User management
sessions                 # Session storage
projects                 # Project organization
captures                 # Content captures

-- Strategic Intelligence Tables
client_profiles          # Client information and preferences
dsd_briefs              # DSD methodology briefs
cultural_moments        # Cultural trend tracking
hypothesis_validations  # Prediction tracking
collective_patterns     # Cross-user insights

-- Analytics Tables
user_settings           # User preferences
annotations             # User annotations
analytics_data          # Usage analytics
```

### Key Relationships

```
users (1) ──── (n) projects
projects (1) ──── (n) captures
captures (1) ──── (n) annotations
client_profiles (1) ──── (n) dsd_briefs
cultural_moments (n) ──── (n) captures
```

### Database Operations

#### Storage Interface
```typescript
interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>
  upsertUser(user: UpsertUser): Promise<User>
  
  // Capture operations
  createCapture(capture: CreateCapture): Promise<Capture>
  getRecentCaptures(limit?: number): Promise<Capture[]>
  
  // Strategic intelligence operations
  createDSDBrief(brief: CreateDSDBrief): Promise<DSDBrief>
  getCulturalMoments(): Promise<CulturalMoment[]>
  createHypothesis(hypothesis: CreateHypothesis): Promise<Hypothesis>
}
```

#### Migration Strategy
- **Drizzle Kit** for schema migrations
- **npm run db:push** for development schema updates
- Incremental migration files for production deployments

## External Service Integration

### OpenAI GPT-5 Integration

#### Configuration
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7, // Configured for GPT-5 compatibility
})
```

#### Usage Patterns
- **Selective Reasoning Mode** for 50% cost savings
- **Batch Processing** for multiple content analysis
- **Context Window Management** for large content

### BrightData Integration

#### Data Collection Flow
```
1. Trigger Collection Request
2. BrightData API Processing
3. Data Extraction & Parsing
4. Storage in Database
5. Real-time UI Updates
```

#### Supported Platforms
- Twitter/X
- Instagram
- TikTok
- YouTube
- Reddit
- LinkedIn

### Google Cloud Services

#### AI Services Integration
- **Google Vision API** for image analysis
- **Google NLP API** for text processing
- **Google Custom Search** for web content
- **BigQuery** for analytics processing

## Security Architecture

### Authentication Flow
```
1. User clicks login
2. Redirect to OpenID Provider (Replit)
3. User authenticates
4. Callback with authorization code
5. Exchange code for tokens
6. Create session
7. Store user in database
```

### Session Management
- **PostgreSQL-backed sessions** for scalability
- **Secure session cookies** with HttpOnly flag
- **Session timeout** and refresh handling
- **Cross-tab synchronization**

### API Security
- **Rate limiting** per endpoint
- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries
- **CORS configuration** for allowed origins

### Secret Management
- **Environment variables** for all sensitive data
- **Separate development/production** configurations
- **No secrets in code** or version control
- **Rotation procedures** for API keys

## Performance Optimization

### Frontend Performance
- **Code splitting** with React.lazy()
- **Component memoization** with React.memo
- **Virtual scrolling** for large data lists
- **Image optimization** with responsive loading

### Backend Performance
- **Database indexing** on frequently queried fields
- **Connection pooling** for database connections
- **Response caching** for static data
- **Pagination** for large result sets

### Database Performance
```sql
-- Key indexes for performance
CREATE INDEX idx_captures_created_at ON captures(created_at DESC);
CREATE INDEX idx_captures_platform ON captures(platform);
CREATE INDEX idx_captures_viral_score ON captures(viral_score DESC);
CREATE INDEX idx_sessions_expire ON sessions(expire);
```

## Deployment Architecture

### Replit Deployment
```
Internet → Replit Load Balancer → Application Container → PostgreSQL
```

### Environment Configuration
- **Development**: Local PostgreSQL, file-based sessions
- **Production**: Neon PostgreSQL, PostgreSQL sessions
- **Testing**: In-memory database, mock services

### Monitoring & Observability
- **Structured logging** with request correlation
- **Health check endpoints** for system monitoring
- **Performance metrics** collection
- **Error tracking** and alerting

## Chrome Extension Architecture

### Extension Structure
```
chrome-extension/
├── manifest.json         # Extension configuration
├── background.js         # Service worker
├── content.js           # Content script injection
├── popup/               # Extension popup UI
└── assets/              # Icons and static files
```

### Communication Flow
```
Web Page → Content Script → Background Script → Platform API → Database
```

### Security Considerations
- **Content Security Policy** enforcement
- **Origin validation** for API calls
- **Message passing** between scripts
- **Secure storage** for user preferences

## Scalability Considerations

### Horizontal Scaling
- **Stateless backend design** for multiple instances
- **Session storage in database** for shared state
- **Load balancer ready** architecture
- **Microservice preparation** with service interfaces

### Data Scaling
- **Database partitioning** strategies for large datasets
- **Read replicas** for analytics queries
- **Caching layers** for frequently accessed data
- **Archive strategies** for historical data

### API Scaling
- **Rate limiting** to prevent abuse
- **Background job processing** for heavy operations
- **Webhook integration** for real-time updates
- **API versioning** for backward compatibility

## Development Workflow

### Local Development
```bash
# Start all services
npm run dev

# Database operations
npm run db:push        # Update schema
npm run db:studio     # Database GUI

# Code quality
npm run lint          # ESLint
npm run type-check    # TypeScript validation
```

### Testing Strategy
- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Performance tests** for database queries

### Deployment Pipeline
1. **Code commit** to repository
2. **Automated testing** execution
3. **Build process** for production assets
4. **Database migration** if needed
5. **Application deployment** to Replit
6. **Health check verification**

This architecture provides a solid foundation for the Strategic Intelligence Platform while maintaining flexibility for future enhancements and scaling requirements.