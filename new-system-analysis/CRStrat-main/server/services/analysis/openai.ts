import OpenAI from 'openai';
import type { MediaProvider, AnalyzeInput } from './provider';
import { AnalysisResultSchema } from './schema';

export default class OpenAIProvider implements MediaProvider {
  client: OpenAI;
  constructor() {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyze(input: AnalyzeInput) {
    // Minimal pattern: send a prompt referencing the storage path;
    // In production, you'd fetch signed URLs/bytes and attach as image content.
    const prompt = [
      `You are a vision assistant. Analyze the ${input.kind}.`,
      `Return a concise JSON with fields: summary, shots[], labels[], ocr[], meta{provider, model}.`,
      `Only describe what is visible. No speculation.`
    ].join('\n');

    // Use 4o-mini for speed; switch if you need 4o:
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt },
        { role: 'user', content: `SOURCE: ${input.sourcePath}` }
      ],
      // You can also pass images via "image_url" content if you have signed URL
    });

    const text = response.choices[0]?.message?.content || '{}';
    try {
      const parsed = JSON.parse(text);
      parsed.meta = { ...(parsed.meta || {}), provider: 'openai' };
      return AnalysisResultSchema.parse(parsed);
    } catch {
      // Fall back to simple structure if model returned prose
      return AnalysisResultSchema.parse({
        summary: text.slice(0, 800),
        shots: [],
        labels: [],
        meta: { provider: 'openai', model: 'gpt-4o-mini' }
      });
    }
  }
}