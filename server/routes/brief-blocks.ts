import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/supabase-auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();
const BlockKind = z.enum(['text','image','capture','quote','heading','list','shape']);

const BlockCreate = z.object({
  kind: BlockKind,
  content: z.any().optional().default({}),
  x: z.number().nonnegative().default(0),
  y: z.number().nonnegative().default(0),
  w: z.number().positive().default(400),
  h: z.number().positive().default(200),
  z: z.number().int().default(0),
  order_index: z.number().int().default(0),
});

const BlockPatch = z.object({
  content: z.any().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  z: z.number().int().optional(),
  order_index: z.number().int().optional(),
});

// List blocks for a brief
router.get('/api/briefs/:id/blocks', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const briefId = req.params.id;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('brief_blocks')
      .select('*')
      .eq('brief_id', briefId)
      .order('order_index', { ascending: true });
      
    if (error) return res.status(400).json({ error: error.message });
    res.json({ data });
  } catch (error) {
    console.error('Error listing brief blocks:', error);
    res.status(500).json({ error: 'Failed to list brief blocks' });
  }
});

// Create a block
router.post('/api/briefs/:id/blocks', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const briefId = req.params.id;
  
  try {
    const body = BlockCreate.parse(req.body || {});
    const { data, error } = await supabaseAdmin
      .from('brief_blocks')
      .insert({ brief_id: briefId, ...body })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    console.error('Error creating brief block:', error);
    res.status(500).json({ error: 'Failed to create brief block' });
  }
});

// Patch a block
router.patch('/api/briefs/:id/blocks/:blockId', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const briefId = req.params.id;
  const blockId = req.params.blockId;
  
  try {
    const patch = BlockPatch.parse(req.body || {});
    const { data, error } = await supabaseAdmin
      .from('brief_blocks')
      .update(patch)
      .eq('id', blockId)
      .eq('brief_id', briefId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    console.error('Error updating brief block:', error);
    res.status(500).json({ error: 'Failed to update brief block' });
  }
});

// Delete a block
router.delete('/api/briefs/:id/blocks/:blockId', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const briefId = req.params.id;
  const blockId = req.params.blockId;
  
  try {
    const { error } = await supabaseAdmin
      .from('brief_blocks')
      .delete()
      .eq('id', blockId)
      .eq('brief_id', briefId);

    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting brief block:', error);
    res.status(500).json({ error: 'Failed to delete brief block' });
  }
});

export default router;