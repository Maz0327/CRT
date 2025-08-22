-- Enable RLS
ALTER TABLE canvas_pages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_blocks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_locks     ENABLE ROW LEVEL SECURITY;

-- Isolation policies
DROP POLICY IF EXISTS canvas_pages_isolation     ON canvas_pages;
DROP POLICY IF EXISTS canvas_blocks_isolation    ON canvas_blocks;
DROP POLICY IF EXISTS canvas_snapshots_isolation ON canvas_snapshots;
DROP POLICY IF EXISTS canvas_locks_isolation     ON canvas_locks;

CREATE POLICY canvas_pages_isolation
  ON canvas_pages FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY canvas_blocks_isolation
  ON canvas_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM canvas_pages
      WHERE canvas_pages.id = canvas_blocks.page_id
        AND canvas_pages.user_id = auth.uid()
    )
  );

CREATE POLICY canvas_snapshots_isolation
  ON canvas_snapshots FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY canvas_locks_isolation
  ON canvas_locks FOR ALL
  USING (user_id = auth.uid());