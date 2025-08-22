export async function embed({ text, provider = 'openai', model = 'text-embedding-3-small' }: {
  text: string; 
  provider?: 'openai'; 
  model?: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    // fallback dims to avoid failure; do not write row if no key (handled by caller)
    return { vector: undefined as any, model, dim: 1536 };
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        model, 
        input: text.slice(0, 8000) // Ensure we don't exceed token limits
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI embeddings error: ${response.status}`);
    }
    
    const data = await response.json();
    const vec = data.data?.[0]?.embedding;
    
    if (!vec) {
      throw new Error('No embedding returned');
    }
    
    return { vector: vec, model, dim: vec.length };
  } catch (error) {
    console.warn('Embeddings error:', error);
    throw error;
  }
}