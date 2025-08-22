import type { Express } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const createAnnotationSchema = z.object({
  captureId: z.string().uuid(),
  canvasData: z.object({
    version: z.string(),
    objects: z.array(z.any()),
    background: z.string().optional(),
    overlay: z.any().optional(),
  }),
  annotationType: z.enum(['canvas', 'highlight', 'comment']).optional(),
  coordinates: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  parentId: z.string().uuid().optional(),
  isShared: z.boolean().optional(),
  collaborators: z.array(z.string()).optional(),
});

export function setupAnnotationsRoutes(app: Express) {
  // Get annotations for a capture
  app.get('/api/captures/:captureId/annotations', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { captureId } = req.params;
      const annotations = await storage.getAnnotations(captureId);
      
      // Filter annotations user has access to
      const accessibleAnnotations = annotations.filter(ann => 
        ann.userId === req.session.user!.id || 
        ann.isShared || 
        (ann.collaborators as string[]).includes(req.session.user!.id)
      );

      res.json(accessibleAnnotations);
    } catch (error) {
      console.error('Error fetching annotations:', error);
      res.status(500).json({ error: 'Failed to fetch annotations' });
    }
  });

  // Get single annotation
  app.get('/api/annotations/:id', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const annotation = await storage.getAnnotationById(req.params.id);
      
      if (!annotation) {
        return res.status(404).json({ error: 'Annotation not found' });
      }

      // Check access
      if (
        annotation.userId !== req.session.user.id &&
        !annotation.isShared &&
        !(annotation.collaborators as string[]).includes(req.session.user.id)
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(annotation);
    } catch (error) {
      console.error('Error fetching annotation:', error);
      res.status(500).json({ error: 'Failed to fetch annotation' });
    }
  });

  // Create annotation
  app.post('/api/annotations', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = createAnnotationSchema.parse(req.body);
      
      // Verify user has access to the capture
      const capture = await storage.getCaptureById(validatedData.captureId);
      if (!capture) {
        return res.status(404).json({ error: 'Capture not found' });
      }

      const project = await storage.getProjectById(capture.projectId);
      if (!project || project.userId !== req.session.user.id) {
        return res.status(403).json({ error: 'Access denied to capture' });
      }

      const annotation = await storage.createAnnotation({
        ...validatedData,
        userId: req.session.user.id,
      });

      res.status(201).json(annotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid annotation data', details: error.errors });
      }
      console.error('Error creating annotation:', error);
      res.status(500).json({ error: 'Failed to create annotation' });
    }
  });

  // Update annotation
  app.patch('/api/annotations/:id', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const annotation = await storage.getAnnotationById(req.params.id);
      
      if (!annotation) {
        return res.status(404).json({ error: 'Annotation not found' });
      }

      // Only owner can update
      if (annotation.userId !== req.session.user.id) {
        return res.status(403).json({ error: 'Only owner can update annotation' });
      }

      const updated = await storage.updateAnnotation(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating annotation:', error);
      res.status(500).json({ error: 'Failed to update annotation' });
    }
  });

  // Delete annotation
  app.delete('/api/annotations/:id', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const annotation = await storage.getAnnotationById(req.params.id);
      
      if (!annotation) {
        return res.status(404).json({ error: 'Annotation not found' });
      }

      // Only owner can delete
      if (annotation.userId !== req.session.user.id) {
        return res.status(403).json({ error: 'Only owner can delete annotation' });
      }

      await storage.deleteAnnotation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting annotation:', error);
      res.status(500).json({ error: 'Failed to delete annotation' });
    }
  });

  // Share/unshare annotation
  app.post('/api/annotations/:id/share', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { isShared, collaborators } = req.body;
      
      const annotation = await storage.getAnnotationById(req.params.id);
      
      if (!annotation) {
        return res.status(404).json({ error: 'Annotation not found' });
      }

      // Only owner can change sharing settings
      if (annotation.userId !== req.session.user.id) {
        return res.status(403).json({ error: 'Only owner can change sharing settings' });
      }

      const updated = await storage.updateAnnotation(req.params.id, {
        isShared: isShared ?? annotation.isShared,
        collaborators: collaborators ?? annotation.collaborators,
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating sharing settings:', error);
      res.status(500).json({ error: 'Failed to update sharing settings' });
    }
  });
}