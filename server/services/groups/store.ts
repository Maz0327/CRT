import { Pool } from "pg";
import type { CaptureGroup } from "../../../shared/types/capture-groups";

export class GroupStore {
  constructor(private pool: Pool) {}

  async createGroup(input: { projectId: string; userId: string; name: string }): Promise<CaptureGroup> {
    const { rows } = await this.pool.query(
      `insert into capture_groups (project_id, user_id, name) values ($1,$2,$3)
       returning id, project_id, user_id, name, status, created_at, updated_at`,
      [input.projectId, input.userId, input.name]
    );
    return rows[0];
  }

  async addItem(groupId: string, captureId: string, position?: number) {
    await this.pool.query(
      `insert into capture_group_items (group_id, capture_id, position)
       values ($1,$2, coalesce($3,0))
       on conflict (group_id, capture_id) do nothing`,
      [groupId, captureId, position ?? 0]
    );
  }

  async removeItem(groupId: string, captureId: string) {
    await this.pool.query(
      `delete from capture_group_items where group_id=$1 and capture_id=$2`,
      [groupId, captureId]
    );
  }

  async getGroup(groupId: string) {
    const [groupRes, itemsRes] = await Promise.all([
      this.pool.query(`select * from capture_groups where id=$1`, [groupId]),
      this.pool.query(`select * from capture_group_items where group_id=$1 order by position asc, added_at asc`, [groupId]),
    ]);
    if (groupRes.rowCount === 0) return null;
    return { group: groupRes.rows[0], items: itemsRes.rows };
  }

  async setStatus(groupId: string, status: 'draft'|'analyzing'|'complete'|'error') {
    await this.pool.query(`update capture_groups set status=$2, updated_at=now() where id=$1`, [groupId, status]);
  }
}