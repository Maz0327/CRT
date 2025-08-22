# API Documentation

## Overview

The Strategic Intelligence Platform provides a comprehensive RESTful API for content analysis, signal capture, and strategic intelligence operations.

## Base URL
```
https://your-deployment-url.replit.app/api
```

## Authentication

The API uses session-based authentication. All protected endpoints require a valid session.

### Authentication Endpoints

#### Login
```http
GET /api/login
```
Redirects to OpenID Connect authentication flow.

#### Logout
```http
GET /api/logout
```
Destroys session and redirects to logout page.

#### Get Current User
```http
GET /api/auth/me
```
Returns current authenticated user information.

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

## Content Capture & Analysis

### Captures

#### Get Recent Captures
```http
GET /api/captures/recent
```
Returns the most recent content captures.

**Response:**
```json
[
  {
    "id": "capture-id",
    "title": "Content Title",
    "content": "Content text...",
    "platform": "twitter",
    "viralScore": 85,
    "tags": ["tag1", "tag2"],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### Create Capture
```http
POST /api/captures
```

**Request Body:**
```json
{
  "title": "Content Title",
  "content": "Content text...",
  "url": "https://example.com",
  "platform": "twitter",
  "projectId": "project-id"
}
```

#### Get Capture by ID
```http
GET /api/captures/:id
```

#### Update Capture
```http
PATCH /api/captures/:id
```

#### Delete Capture
```http
DELETE /api/captures/:id
```

### AI Analysis

#### Quick Analysis
```http
POST /api/ai/quick-analysis
```

**Request Body:**
```json
{
  "content": "Content to analyze...",
  "type": "quick",
  "context": "additional context"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "viralScore": 85,
    "sentiment": "positive",
    "keyTopics": ["AI", "technology"],
    "hooks": ["compelling opening", "emotional appeal"],
    "strategicCategory": "innovation"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### Truth Analysis
```http
POST /api/truth-analysis
```

**Request Body:**
```json
{
  "content": "Content to analyze...",
  "captureId": "optional-capture-id"
}
```

**Response:**
```json
{
  "success": true,
  "truthAnalysis": {
    "factLayer": {
      "score": 0.9,
      "analysis": "Factual accuracy assessment..."
    },
    "observationLayer": {
      "score": 0.8,
      "analysis": "Pattern identification..."
    },
    "insightLayer": {
      "score": 0.85,
      "analysis": "Strategic implications..."
    },
    "humanTruthLayer": {
      "score": 0.75,
      "analysis": "Cultural resonance..."
    }
  }
}
```

## Data Collection

### BrightData Integration

#### Trigger Data Collection
```http
POST /api/bright-data/trigger
```

**Request Body:**
```json
{
  "platform": "twitter",
  "query": "AI trends",
  "keywords": ["artificial intelligence", "machine learning"]
}
```

**Response:**
```json
{
  "success": true,
  "platform": "twitter",
  "query": "AI trends",
  "dataCount": 25,
  "data": [
    {
      "title": "Post title",
      "content": "Post content...",
      "engagement": {
        "likes": 100,
        "shares": 50,
        "comments": 25
      },
      "author": "username",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Strategic Intelligence

### Projects

#### Get Projects
```http
GET /api/projects
```

#### Create Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "clientId": "client-id"
}
```

### Client Profiles

#### Get Client Profiles
```http
GET /api/client-profiles
```

#### Create Client Profile
```http
POST /api/client-profiles
```

**Request Body:**
```json
{
  "name": "Client Name",
  "industry": "Technology",
  "brandVoice": "Professional",
  "targetAudience": "Tech professionals",
  "strategicObjectives": ["Increase engagement", "Build thought leadership"]
}
```

### DSD Briefs

#### Get DSD Briefs
```http
GET /api/dsd-briefs
```

#### Create DSD Brief
```http
POST /api/dsd-briefs
```

**Request Body:**
```json
{
  "title": "Brief Title",
  "clientId": "client-id",
  "defineSection": {
    "problemStatement": "Problem description...",
    "objectives": ["Objective 1", "Objective 2"]
  },
  "shiftSection": {
    "culturalMoment": "Cultural context...",
    "trendAnalysis": "Trend insights..."
  },
  "deliverSection": {
    "recommendations": ["Recommendation 1", "Recommendation 2"],
    "actionItems": ["Action 1", "Action 2"]
  }
}
```

### Cultural Moments

#### Get Cultural Moments
```http
GET /api/cultural-moments
```

#### Create Cultural Moment
```http
POST /api/cultural-moments
```

**Request Body:**
```json
{
  "title": "Cultural Moment Title",
  "description": "Description of the cultural moment",
  "intensity": 8.5,
  "platforms": ["twitter", "tiktok"],
  "demographics": ["gen-z", "millennials"],
  "duration": "ongoing"
}
```

### Hypothesis Tracking

#### Get Hypotheses
```http
GET /api/hypothesis-validations
```

#### Create Hypothesis
```http
POST /api/hypothesis-validations
```

**Request Body:**
```json
{
  "hypothesis": "Hypothesis statement",
  "prediction": "Expected outcome",
  "confidence": 0.8,
  "timeframe": "30 days",
  "metrics": ["engagement", "reach"]
}
```

## Analytics & Metrics

### Platform Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "totalContent": 1250,
  "recentScans": [
    {
      "platform": "twitter",
      "count": 45,
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ],
  "platformBreakdown": {
    "twitter": 450,
    "instagram": 320,
    "tiktok": 280,
    "youtube": 200
  },
  "viralScoreAverage": 72.5,
  "trendsDetected": 15
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Common Error Codes
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Rate Limited (too many requests)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to ensure fair usage:
- **Authentication endpoints**: 10 requests per minute
- **Data collection endpoints**: 5 requests per minute
- **Analysis endpoints**: 20 requests per minute
- **General endpoints**: 100 requests per minute

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## WebSocket API

For real-time updates, the platform provides WebSocket connectivity:

```javascript
const ws = new WebSocket('wss://your-deployment-url.replit.app/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

### WebSocket Events
- `capture_created` - New content capture
- `analysis_complete` - AI analysis finished
- `brief_generated` - DSD brief created
- `cultural_moment_detected` - New cultural moment identified

## SDK and Client Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- React hooks library