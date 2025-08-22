// Simple OpenAPI spec generation without external dependencies
interface OpenAPISpec {
  openapi: string;
  info: any;
  servers: any[];
  tags: any[];
  paths: Record<string, any>;
  components: any;
}

export function generateOpenApiSpec(): OpenAPISpec {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Content Radar API',
      version: '1.0.0',
      description: 'Strategic Intelligence Platform API - transforms raw content signals into strategic decisions',
      contact: {
        name: 'Content Radar API Support',
        url: 'https://github.com/your-org/content-radar'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'API Server'
      }
    ],
    tags: [
      { name: 'health', description: 'Health and readiness checks' },
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'projects', description: 'Project management' },
      { name: 'captures', description: 'Content capture operations' },
      { name: 'moments', description: 'Cultural moments detection' },
      { name: 'briefs', description: 'Strategic brief management' },
      { name: 'canvas', description: 'Brief canvas operations' },
      { name: 'export', description: 'Export functionality' },
      { name: 'analysis', description: 'Content analysis operations' }
    ],
    paths: {
      '/healthz': {
        get: {
          tags: ['health'],
          summary: 'Application health check',
          description: 'Health check endpoint - always returns 200 with basic app info',
          responses: {
            '200': {
              description: 'Application is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' }
                }
              }
            }
          }
        }
      },
      '/readyz': {
        get: {
          tags: ['health'],
          summary: 'Application readiness check',
          description: 'Readiness check endpoint - checks DB and worker status',
          responses: {
            '200': {
              description: 'Application is ready',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReadinessResponse' }
                }
              }
            },
            '503': {
              description: 'Application is not ready',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReadinessResponse' }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' }
              },
              required: ['code', 'message']
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok'] },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            environment: { type: 'string' },
            uptime: { type: 'number' }
          }
        },
        ReadinessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ready', 'not ready'] },
            timestamp: { type: 'string', format: 'date-time' },
            checks: {
              type: 'object',
              properties: {
                database: { type: 'string' },
                workers: { type: 'string' }
              }
            }
          }
        }
      }
    }
  };
}