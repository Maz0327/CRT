import type { MediaProvider, AnalyzeInput } from './provider';
import { AnalysisResultSchema } from './schema';

export default class MockProvider implements MediaProvider {
  async analyze(input: AnalyzeInput) {
    const result = {
      summary: `Mock ${input.kind} ${input.mode} analysis for ${input.sourcePath}`,
      shots: [{ description: 'Sample shot description (mock)' }],
      labels: [{ name: 'example-label', kind: 'concept', conf: 0.42 }],
      meta: { provider: 'mock', model: 'mock-1' }
    };
    return AnalysisResultSchema.parse(result);
  }
}