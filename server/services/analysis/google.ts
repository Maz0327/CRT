import { GoogleGenerativeAI } from '@google/generative-ai';
import type { MediaProvider, AnalyzeInput } from './provider';
import { AnalysisResultSchema } from './schema';

export default class GoogleProvider implements MediaProvider {
  genai: GoogleGenerativeAI;
  constructor() {
    // Use GEMINI_API_KEY which is available, or fallback to GOOGLE_API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY missing');
    this.genai = new GoogleGenerativeAI(apiKey);
  }

  async analyze(input: AnalyzeInput) {
    const model = this.genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = [
      `Analyze this ${input.kind}. Return strict JSON (summary, shots[], labels[], ocr[], meta{provider,model}).`,
      `Be faithful to the pixels. No hallucinations.`
    ].join('\n');

    const res = await model.generateContent([prompt, { text: `SOURCE: ${input.sourcePath}` }]);
    const text = res.response.text() || '{}';
    try {
      const parsed = JSON.parse(text);
      parsed.meta = { ...(parsed.meta || {}), provider: 'google', model: 'gemini-1.5-flash' };
      return AnalysisResultSchema.parse(parsed);
    } catch {
      return AnalysisResultSchema.parse({
        summary: text.slice(0, 800),
        shots: [],
        labels: [],
        meta: { provider: 'google', model: 'gemini-1.5-flash' }
      });
    }
  }
}