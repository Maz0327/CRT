import { Router } from 'express';
import { generateOpenApiSpec } from '../openapi';

const router = Router();

// Serve OpenAPI spec
router.get('/openapi.json', (req, res) => {
  try {
    const spec = generateOpenApiSpec();
    res.json(spec);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'OPENAPI_GENERATION_ERROR',
        message: 'Failed to generate OpenAPI specification',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Serve API documentation (ReDoc)
router.get('/docs', (req, res) => {
  const enableApiDocs = process.env.ENABLE_API_DOCS === 'true' || process.env.NODE_ENV !== 'production';
  
  if (!enableApiDocs) {
    return res.status(404).json({
      error: {
        code: 'DOCS_DISABLED',
        message: 'API documentation is disabled in this environment'
      }
    });
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Content Radar API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url="/api/openapi.json"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js"></script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;