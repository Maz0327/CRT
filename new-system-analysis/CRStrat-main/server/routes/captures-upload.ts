import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { storage } from '../storage';
import { putObjectFromStream, getPublicUrl } from '../lib/supabaseStorage';

const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED = (process.env.CAPTURE_ALLOWED_MIME ?? '').split(',').map(s=>s.trim()).filter(Boolean);
const MAX_BYTES = Number(process.env.CAPTURE_MAX_UPLOAD_BYTES ?? 52428800);

export const capturesUpload = Router();

/**
 * POST /api/projects/:projectId/captures/upload
 * multipart/form-data with fields:
 *  files: File[] (multiple)
 *  notes: string[] (optional, same order as files)
 *  titles: string[] (optional)
 */
capturesUpload.post('/api/projects/:projectId/captures/upload', upload.array('files'), async (req, res, next) => {
  try {
    // Extract user from middleware (assuming auth middleware sets req.user)
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = user.id;
    const projectId = req.params.projectId;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const notes = Array.isArray(req.body.notes) ? req.body.notes : (req.body.notes ? [req.body.notes] : []);
    const titles = Array.isArray(req.body.titles) ? req.body.titles : (req.body.titles ? [req.body.titles] : []);

    if (!files.length) return res.status(400).json({ error: 'NO_FILES' });

    const created: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const note = notes[i] ?? null;
      const title = titles[i] ?? f.originalname;

      if (f.size > MAX_BYTES) return res.status(413).json({ error: 'FILE_TOO_LARGE', max: MAX_BYTES });
      
      if (ALLOWED.length && !ALLOWED.some(pattern => {
        if (pattern.endsWith('/*')) return f.mimetype.startsWith(pattern.slice(0, -1));
        return f.mimetype === pattern;
      })) return res.status(415).json({ error: 'UNSUPPORTED_TYPE', mimetype: f.mimetype });

      const captureId = randomUUID();
      const key = `${userId}/${projectId}/${captureId}/${encodeURIComponent(f.originalname)}`;

      // Upload to storage
      await putObjectFromStream({ 
        bucket: process.env.SUPABASE_STORAGE_BUCKET!, 
        key, 
        stream: bufferToStream(f.buffer), 
        contentType: f.mimetype 
      });

      const file_pages = f.mimetype === 'application/pdf' ? await tryCountPdfPages(f.buffer) : null;

      // Create capture record using direct SQL
      const insertResult = await (storage as any).client.query(`
        INSERT INTO captures (
          id, user_id, project_id, title, url, platform, content, summary, tags, metadata,
          status, source, screenshot_url, truth_analysis, analysis_status, google_analysis,
          note, file_key, file_mime, file_bytes, file_pages, original_filename, source_url,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23,
          NOW(), NOW()
        ) RETURNING id, title, project_id, created_at
      `, [
        captureId, userId, projectId, title,
        getPublicUrl({ bucket: process.env.SUPABASE_STORAGE_BUCKET!, key }),
        'file-upload', title, '', [], {},
        'active', 'upload', null, {}, 'pending', {},
        note, key, f.mimetype, f.size, file_pages, f.originalname, null
      ]);
      
      const capture = insertResult.rows[0];

      created.push({
        id: capture.id,
        title: capture.title,
        project_id: capture.project_id,
        created_at: capture.created_at
      });
    }

    res.json({ ok: true, created });
  } catch (err) { 
    console.error('Upload error:', err);
    next(err); 
  }
});

// Utilities
function bufferToStream(buf: Buffer): Readable {
  const r = new Readable();
  r.push(buf);
  r.push(null);
  return r;
}

async function tryCountPdfPages(buf: Buffer): Promise<number | null> {
  try {
    const pdfParse = (await import('pdf-parse')).default as any;
    const data = await pdfParse(buf);
    const pages = Number(data.numpages || data.numPages || 0);
    const max = Number(process.env.CAPTURE_MAX_PDF_PAGES ?? 200);
    return Math.min(pages, max);
  } catch { 
    return null; 
  }
}