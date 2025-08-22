import cors from 'cors';
import { env } from './env';

function computeAllowedOrigins(): string[] {
  const list: string[] = [];
  if (env.ALLOWED_ORIGINS) {
    for (const raw of env.ALLOWED_ORIGINS.split(',')) {
      const o = raw.trim();
      if (o) list.push(o);
    }
  }
  if (env.VITE_SITE_URL) list.push(env.VITE_SITE_URL);
  if (env.CHROME_EXTENSION_ID) list.push(`chrome-extension://${env.CHROME_EXTENSION_ID}`);

  // Local dev only
  if (env.NODE_ENV !== 'production') {
    list.push('http://localhost:5173','http://127.0.0.1:5173','http://localhost:5000');
  }
  return Array.from(new Set(list));
}

const allowedOrigins = computeAllowedOrigins();

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl/same-origin
    if (allowedOrigins.some(o => origin === o || (o.endsWith('*') && origin.startsWith(o.slice(0,-1))))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Project-ID']
});