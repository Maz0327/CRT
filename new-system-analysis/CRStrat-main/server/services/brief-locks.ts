// Brief Canvas Locking Service
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { nanoid } from "nanoid";

export interface BriefLock {
  brief_id: string;
  locked_by: string;
  lock_token: string;
  expires_at: string;
}

export class BriefLockService {
  private static LOCK_DURATION = 120; // 120 seconds

  /**
   * Acquire or refresh a lock for a brief
   */
  static async acquireLock(briefId: string, userId: string): Promise<{ lockToken: string; expiresAt: Date }> {
    const lockToken = nanoid(32);
    const expiresAt = new Date(Date.now() + BriefLockService.LOCK_DURATION * 1000);

    const { error } = await supabaseAdmin
      .from('brief_locks')
      .upsert({
        brief_id: briefId,
        locked_by: userId,
        lock_token: lockToken,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'brief_id'
      });

    if (error) {
      throw new Error(`Failed to acquire lock: ${error.message}`);
    }

    return { lockToken, expiresAt };
  }

  /**
   * Extend lock TTL with same token
   */
  static async heartbeat(briefId: string, token: string): Promise<{ expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + BriefLockService.LOCK_DURATION * 1000);

    const { data, error } = await supabaseAdmin
      .from('brief_locks')
      .update({
        expires_at: expiresAt.toISOString()
      })
      .eq('brief_id', briefId)
      .eq('lock_token', token)
      .gte('expires_at', new Date().toISOString())
      .select()
      .single();

    if (error || !data) {
      throw new Error('Lock token invalid or expired');
    }

    return { expiresAt };
  }

  /**
   * Check if brief is writable by this user/token
   */
  static async assertWritable(briefId: string, userId: string, token?: string): Promise<void> {
    // Get current lock if any
    const { data: lock } = await supabaseAdmin
      .from('brief_locks')
      .select('*')
      .eq('brief_id', briefId)
      .gte('expires_at', new Date().toISOString())
      .single();

    // No active lock - anyone can write
    if (!lock) {
      return;
    }

    // Lock exists - check ownership and token
    if (lock.locked_by !== userId) {
      throw new Error('Brief is locked by another user');
    }

    if (token && lock.lock_token !== token) {
      throw new Error('Invalid lock token');
    }
  }

  /**
   * Get current lock status
   */
  static async getLockStatus(briefId: string): Promise<{
    locked: boolean;
    locked_by?: string;
    expires_at?: string;
  }> {
    const { data: lock } = await supabaseAdmin
      .from('brief_locks')
      .select('*')
      .eq('brief_id', briefId)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (!lock) {
      return { locked: false };
    }

    return {
      locked: true,
      locked_by: lock.locked_by,
      expires_at: lock.expires_at
    };
  }

  /**
   * Release a lock
   */
  static async releaseLock(briefId: string, token: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('brief_locks')
      .delete()
      .eq('brief_id', briefId)
      .eq('lock_token', token);

    if (error) {
      throw new Error(`Failed to release lock: ${error.message}`);
    }
  }
}