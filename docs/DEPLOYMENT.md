# Deployment Guide

## Overview

This guide covers deploying the Strategic Intelligence Platform to various environments, with a focus on Replit deployment as the primary option.

## Replit Deployment (Recommended)

### Prerequisites
- Replit account
- Required API keys (OpenAI, BrightData, Google Cloud)

### Step 1: Fork to Replit
1. Visit the [project repository](https://github.com/yourusername/strategic-intelligence-platform)
2. Click "Fork to Replit" or import from GitHub
3. Wait for the automatic setup to complete

### Step 2: Configure Environment Secrets
In your Replit project, go to the Secrets tab and add:

```env
# Database (automatically provided by Replit)
DATABASE_URL=postgresql://...

# Session Security
SESSION_SECRET=your-secure-random-string-here

# AI Services
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=your-gemini-key

# Data Sources (Optional)
BRIGHT_DATA_API_TOKEN=your-bright-data-token
BRIGHT_DATA_USERNAME=your-username
BRIGHT_DATA_PASSWORD=your-password
BRIGHT_DATA_BROWSER_USER=your-browser-user
BRIGHT_DATA_BROWSER_PASS=your-browser-pass

# Google Cloud Services (Optional)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path-to-key-file
```

### Step 3: Database Setup
The platform automatically creates the database schema on first run:

```bash
# Run this once in the Replit shell
npm run db:push
```

### Step 4: Start the Application
```bash
npm run dev
```

The application will be available at your Replit URL: `https://your-project-name.your-username.replit.dev`

### Step 5: Configure Chrome Extension (Optional)
1. Navigate to `chrome-extension/` directory
2. Update `manifest.json` with your Replit URL:
   ```json
   {
     "permissions": [
       "https://your-project-name.your-username.replit.dev/*"
     ]
   }
   ```
3. Load the extension in Chrome Developer Mode

## Self-Hosted Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Nginx (recommended for production)
- SSL certificate

### Step 1: Server Setup
```bash
# Clone repository
git clone https://github.com/yourusername/strategic-intelligence-platform.git
cd strategic-intelligence-platform

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 2: Database Configuration
```bash
# Create database
sudo -u postgres createdb strategic_intelligence

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run db:push
```

### Step 3: Environment Configuration
Create `.env` file:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/strategic_intelligence
SESSION_SECRET=your-super-secure-session-secret
OPENAI_API_KEY=your-openai-key
# ... other API keys
```

### Step 4: Process Management
Using PM2 for process management:
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'strategic-intelligence',
    script: 'server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster'
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.pem;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Proxy to application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/strategic_intelligence
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=strategic_intelligence
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

## Cloud Platform Deployment

### AWS Deployment
Using AWS ECS with Fargate:

1. **Build and push Docker image**:
   ```bash
   # Build image
   docker build -t strategic-intelligence .
   
   # Tag for ECR
   docker tag strategic-intelligence:latest \
     your-account.dkr.ecr.region.amazonaws.com/strategic-intelligence:latest
   
   # Push to ECR
   docker push your-account.dkr.ecr.region.amazonaws.com/strategic-intelligence:latest
   ```

2. **Create ECS task definition** and **service**
3. **Configure RDS PostgreSQL** instance
4. **Set up Application Load Balancer**
5. **Configure Route 53** for DNS

### Google Cloud Platform
Using Cloud Run:

```bash
# Deploy to Cloud Run
gcloud run deploy strategic-intelligence \
  --image gcr.io/your-project/strategic-intelligence \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,OPENAI_API_KEY=$OPENAI_API_KEY
```

### Azure Container Instances
```bash
# Deploy to Azure
az container create \
  --resource-group myResourceGroup \
  --name strategic-intelligence \
  --image your-registry.azurecr.io/strategic-intelligence:latest \
  --dns-name-label strategic-intelligence \
  --ports 3000 \
  --environment-variables DATABASE_URL=$DATABASE_URL OPENAI_API_KEY=$OPENAI_API_KEY
```

## Environment-Specific Configuration

### Development Environment
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/strategic_intelligence_dev
ENABLE_LOGGING=true
DEBUG_MODE=true
```

### Staging Environment
```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db-url/strategic_intelligence_staging
RATE_LIMIT_ENABLED=true
LOG_LEVEL=info
```

### Production Environment
```env
NODE_ENV=production
DATABASE_URL=postgresql://production-db-url/strategic_intelligence_prod
RATE_LIMIT_ENABLED=true
LOG_LEVEL=warn
SECURE_COOKIES=true
```

## Database Migration Strategy

### Development to Production
1. **Schema Migration**:
   ```bash
   # Generate migration
   npm run db:generate
   
   # Apply to production
   npm run db:migrate
   ```

2. **Data Migration** (if needed):
   ```bash
   # Export development data
   pg_dump strategic_intelligence_dev > dev_data.sql
   
   # Import to production (sanitized)
   psql strategic_intelligence_prod < sanitized_data.sql
   ```

## Monitoring and Observability

### Health Checks
The application provides health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database connectivity
- `GET /api/health/services` - External service status

### Logging Configuration
```javascript
// Production logging setup
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Metrics Collection
```javascript
// Prometheus metrics example
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});
```

## Security Considerations

### SSL/TLS Configuration
- Use strong cipher suites
- Enable HSTS headers
- Configure OCSP stapling
- Use certificate transparency monitoring

### Database Security
- Use connection pooling with limited connections
- Enable SSL for database connections
- Regular security updates
- Access control with least privilege

### Application Security
- Keep dependencies updated
- Use security headers
- Implement rate limiting
- Monitor for suspicious activity

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump strategic_intelligence_prod > $BACKUP_DIR/strategic_intelligence_$DATE.sql
gzip $BACKUP_DIR/strategic_intelligence_$DATE.sql

# Keep last 30 days
find $BACKUP_DIR -name "strategic_intelligence_*.sql.gz" -mtime +30 -delete
```

### File Backups
- Application code (Git repository)
- User uploads (if any)
- Configuration files
- SSL certificates

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   ```bash
   # Check database connectivity
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Memory Issues**:
   ```bash
   # Monitor memory usage
   npm run monitor:memory
   ```

3. **API Rate Limiting**:
   ```bash
   # Check rate limit logs
   grep "Rate limit" /var/log/strategic-intelligence.log
   ```

### Performance Optimization
- Enable database query caching
- Use CDN for static assets
- Implement response compression
- Monitor and optimize slow queries

### Rollback Procedures
1. **Application Rollback**:
   ```bash
   # Using PM2
   pm2 stop strategic-intelligence
   git checkout previous-stable-tag
   npm install
   npm run build
   pm2 start strategic-intelligence
   ```

2. **Database Rollback**:
   ```bash
   # Restore from backup
   psql strategic_intelligence_prod < backup_file.sql
   ```

This deployment guide should cover most scenarios for getting the Strategic Intelligence Platform running in production environments.