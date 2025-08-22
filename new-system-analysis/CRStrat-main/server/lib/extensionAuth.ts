import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabaseAdmin';
import crypto from 'crypto';

// Generate a secure token for Chrome Extension
export async function generateExtensionToken(userId: string, name: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Store token in database
  const { error } = await supabaseAdmin
    .from('extension_tokens')
    .insert({
      user_id: userId,
      name: name,
      token_hash: tokenHash,
      revoked: false
    });
    
  if (error) {
    throw new Error(`Failed to create extension token: ${error.message}`);
  }
  
  return token;
}

// Verify extension token middleware
export async function verifyExtensionToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-extension-token'] as string;
  
  if (!token) {
    return res.status(401).json({ error: 'Extension token required' });
  }
  
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const { data: tokenData, error } = await supabaseAdmin
      .from('extension_tokens')
      .select('user_id, revoked')
      .eq('token_hash', tokenHash)
      .single();
      
    if (error || !tokenData || tokenData.revoked) {
      return res.status(401).json({ error: 'Invalid or revoked token' });
    }
    
    // Update last used timestamp
    await supabaseAdmin
      .from('extension_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);
    
    // Attach user ID to request
    (req as any).extensionUserId = tokenData.user_id;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Token verification failed' });
  }
}

// Revoke extension token
export async function revokeExtensionToken(tokenId: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('extension_tokens')
    .update({ revoked: true })
    .eq('id', tokenId)
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Failed to revoke token: ${error.message}`);
  }
}

// List user's extension tokens
export async function getUserExtensionTokens(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('extension_tokens')
    .select('id, name, created_at, last_used_at, revoked')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to fetch tokens: ${error.message}`);
  }
  
  return data;
}