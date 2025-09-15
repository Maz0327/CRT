// Brief Canvas API Routes
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { BriefLockService } from "../services/brief-locks";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

// Block operation schemas
const BlockOpSchema = z.object({
  type: z.enum(['upsert_block', 'delete_block', 'upsert_page', 'reorder_pages']),
  payload: z.any()
});

const CanvasPatchSchema = z.object({
  ops: z.array(BlockOpSchema),
  lockToken: z.string().optional()
});

// GET /api/briefs/:id/canvas - Full canvas state
router.get("/:id/canvas", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;

    // Verify brief ownership
    const { data: brief, error: briefError } = await supabaseAdmin
      .from('dsd_briefs')
      .select('id, title, status, updated_at')
      .eq('id', briefId)
      .eq('user_id', userId)
      .single();

    if (briefError || !brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    // Get pages
    const { data: pages } = await supabaseAdmin
      .from('brief_pages')
      .select('*')
      .eq('brief_id', briefId)
      .order('index_no');

    // Get blocks (handle existing table structure)
    const { data: blocks } = await supabaseAdmin
      .from('brief_blocks')
      .select('*')
      .eq('brief_id', briefId)
      .order('z');

    // Get lock status
    const lockStatus = await BriefLockService.getLockStatus(briefId);

    res.json({
      brief,
      pages: pages || [],
      blocks: blocks || [],
      lock: lockStatus,
      autosave: {
        intervalMs: 1500,
        maxBatch: 50
      }
    });

  } catch (error) {
    console.error('Canvas get error:', error);
    res.status(500).json({ error: "Failed to get canvas state" });
  }
});

// PATCH /api/briefs/:id/canvas - Batch operations
router.patch("/:id/canvas", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;
    
    const { ops, lockToken } = CanvasPatchSchema.parse(req.body);

    // Verify ownership and lock
    await BriefLockService.assertWritable(briefId, userId, lockToken);

    const { data: brief } = await supabaseAdmin
      .from('dsd_briefs')
      .select('id')
      .eq('id', briefId)
      .eq('user_id', userId)
      .single();

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    const results = [];

    // Process operations
    for (const op of ops) {
      switch (op.type) {
        case 'upsert_block':
          const blockData = {
            ...op.payload,
            brief_id: briefId,
            updated_at: new Date().toISOString()
          };
          
          const { data: block, error: blockError } = await supabaseAdmin
            .from('brief_blocks')
            .upsert(blockData)
            .select()
            .single();

          if (blockError) {
            console.error('Block upsert error:', blockError);
          } else {
            results.push({ type: 'block_updated', data: block });
          }
          break;

        case 'delete_block':
          const { error: deleteError } = await supabaseAdmin
            .from('brief_blocks')
            .delete()
            .eq('id', op.payload.id)
            .eq('brief_id', briefId);

          if (!deleteError) {
            results.push({ type: 'block_deleted', data: { id: op.payload.id } });
          }
          break;

        case 'upsert_page':
          const pageData = {
            ...op.payload,
            brief_id: briefId,
            updated_at: new Date().toISOString()
          };

          const { data: page, error: pageError } = await supabaseAdmin
            .from('brief_pages')
            .upsert(pageData)
            .select()
            .single();

          if (pageError) {
            console.error('Page upsert error:', pageError);
          } else {
            results.push({ type: 'page_updated', data: page });
          }
          break;

        case 'reorder_pages':
          // Update page indices
          for (const pageUpdate of op.payload.pages) {
            await supabaseAdmin
              .from('brief_pages')
              .update({ index_no: pageUpdate.index_no, updated_at: new Date().toISOString() })
              .eq('id', pageUpdate.id)
              .eq('brief_id', briefId);
          }
          results.push({ type: 'pages_reordered', data: op.payload.pages });
          break;
      }
    }

    // Update brief timestamp
    await supabaseAdmin
      .from('dsd_briefs')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', briefId);

    res.json({
      success: true,
      results,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Canvas patch error:', error);
    if (error.message.includes('locked')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update canvas" });
  }
});

// POST /api/briefs/:id/snapshots - Create snapshot
router.post("/:id/snapshots", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;
    const { reason } = req.body;

    // Verify ownership
    const { data: brief } = await supabaseAdmin
      .from('dsd_briefs')
      .select('id')
      .eq('id', briefId)
      .eq('user_id', userId)
      .single();

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    // Get current state
    const { data: pages } = await supabaseAdmin
      .from('brief_pages')
      .select('*')
      .eq('brief_id', briefId)
      .order('index_no');

    const { data: blocks } = await supabaseAdmin
      .from('brief_blocks')
      .select('*')
      .eq('brief_id', briefId)
      .order('z');

    // Create snapshot
    const { data: snapshot, error: snapshotError } = await supabaseAdmin
      .from('brief_snapshots')
      .insert({
        brief_id: briefId,
        created_by: userId,
        reason: reason || 'manual_snapshot',
        data: {
          pages: pages || [],
          blocks: blocks || []
        }
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('Snapshot error:', snapshotError);
      return res.status(500).json({ error: "Failed to create snapshot" });
    }

    res.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        created_at: snapshot.created_at,
        reason: snapshot.reason
      }
    });

  } catch (error) {
    console.error('Create snapshot error:', error);
    res.status(500).json({ error: "Failed to create snapshot" });
  }
});

// GET /api/briefs/:id/snapshots - List snapshots
router.get("/:id/snapshots", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 10, 50);

    // Verify ownership
    const { data: brief } = await supabaseAdmin
      .from('dsd_briefs')
      .select('id')
      .eq('id', briefId)
      .eq('user_id', userId)
      .single();

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    const { data: snapshots, count } = await supabaseAdmin
      .from('brief_snapshots')
      .select('id, created_at, created_by, reason', { count: 'exact' })
      .eq('brief_id', briefId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    res.json({
      snapshots: snapshots || [],
      total: count || 0,
      page,
      pageSize
    });

  } catch (error) {
    console.error('List snapshots error:', error);
    res.status(500).json({ error: "Failed to list snapshots" });
  }
});

// POST /api/briefs/:id/snapshots/:snapshotId/restore - Restore snapshot
router.post("/:id/snapshots/:snapshotId/restore", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;
    const snapshotId = req.params.snapshotId;
    const { lockToken } = req.body;

    // Verify writability
    await BriefLockService.assertWritable(briefId, userId, lockToken);

    // Verify ownership and get snapshot
    const { data: snapshot, error: snapshotError } = await supabaseAdmin
      .from('brief_snapshots')
      .select('data')
      .eq('id', snapshotId)
      .eq('brief_id', briefId)
      .single();

    if (snapshotError || !snapshot) {
      return res.status(404).json({ error: "Snapshot not found" });
    }

    const { data: brief } = await supabaseAdmin
      .from('dsd_briefs')
      .select('id')
      .eq('id', briefId)
      .eq('user_id', userId)
      .single();

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    // Clear existing pages and blocks
    await supabaseAdmin.from('brief_blocks').delete().eq('brief_id', briefId);
    await supabaseAdmin.from('brief_pages').delete().eq('brief_id', briefId);

    const snapshotData = snapshot.data as any;

    // Restore pages
    if (snapshotData.pages?.length > 0) {
      await supabaseAdmin
        .from('brief_pages')
        .insert(snapshotData.pages.map((p: any) => ({ ...p, brief_id: briefId })));
    }

    // Restore blocks
    if (snapshotData.blocks?.length > 0) {
      await supabaseAdmin
        .from('brief_blocks')
        .insert(snapshotData.blocks.map((b: any) => ({ ...b, brief_id: briefId })));
    }

    // Update brief timestamp
    const updatedAt = new Date().toISOString();
    await supabaseAdmin
      .from('dsd_briefs')
      .update({ updated_at: updatedAt })
      .eq('id', briefId);

    res.json({
      success: true,
      updated_at: updatedAt
    });

  } catch (error) {
    console.error('Restore snapshot error:', error);
    if (error.message.includes('locked')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to restore snapshot" });
  }
});

// POST /api/briefs/:id/lock - Acquire lock
router.post("/:id/lock", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;

    // Verify brief ownership
    const { data: brief } = await supabaseAdmin
      .from('dsd_briefs')
      .select('id')
      .eq('id', briefId)
      .eq('user_id', userId)
      .single();

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    const { lockToken, expiresAt } = await BriefLockService.acquireLock(briefId, userId);

    res.json({
      lockToken,
      expires_at: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Acquire lock error:', error);
    res.status(500).json({ error: "Failed to acquire lock" });
  }
});

// POST /api/briefs/:id/lock/heartbeat - Extend lock
router.post("/:id/lock/heartbeat", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;
    const { lockToken } = req.body;

    if (!lockToken) {
      return res.status(400).json({ error: "Lock token required" });
    }

    const { expiresAt } = await BriefLockService.heartbeat(briefId, lockToken);

    res.json({
      expires_at: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Lock heartbeat error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/briefs/:id/publish - Publish brief
router.post("/:id/publish", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const briefId = req.params.id;

    // Verify ownership
    const { data: brief } = await supabaseAdmin
      .from('dsd_briefs')
      .select('id, status')
      .eq('id', briefId)
      .eq('user_id', userId)
      .single();

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    // Set status to ready
    await supabaseAdmin
      .from('dsd_briefs')
      .update({
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', briefId);

    // Create publish snapshot
    const { data: pages } = await supabaseAdmin
      .from('brief_pages')
      .select('*')
      .eq('brief_id', briefId)
      .order('index_no');

    const { data: blocks } = await supabaseAdmin
      .from('brief_blocks')
      .select('*')
      .eq('brief_id', briefId)
      .order('z');

    await supabaseAdmin
      .from('brief_snapshots')
      .insert({
        brief_id: briefId,
        created_by: userId,
        reason: 'publish',
        data: {
          pages: pages || [],
          blocks: blocks || []
        }
      });

    res.json({
      success: true,
      status: 'ready',
      message: 'Brief published successfully'
    });

  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ error: "Failed to publish brief" });
  }
});

export default router;