import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function putObjectFromStream({ 
  bucket, 
  key, 
  stream, 
  contentType 
}: { 
  bucket: string; 
  key: string; 
  stream: NodeJS.ReadableStream; 
  contentType?: string 
}) {
  try {
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(key, buffer, {
        contentType,
        upsert: true
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase storage upload error:', error);
    throw error;
  }
}

export function getPublicUrl({ bucket, key }: { bucket: string; key: string }) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(key);
  
  return data.publicUrl;
}

export async function deleteObject({ bucket, key }: { bucket: string; key: string }) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([key]);
    
  if (error) throw error;
}

// Utility to convert buffer to readable stream
export function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}