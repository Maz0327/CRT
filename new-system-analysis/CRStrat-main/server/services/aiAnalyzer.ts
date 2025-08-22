import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AnalysisResult {
  summary: string;
  hook1: string;
  hook2: string;
  viralScore: number;
  category?: string;
}

export class AIAnalyzer {
  async analyzeContent(title: string, content: string, platform: string): Promise<AnalysisResult> {
    try {
      // GPT-5 is the newest OpenAI model with enhanced reasoning capabilities
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a viral content strategist and trend analyst. Analyze content from ${platform} and provide:
1. A 2-sentence summary that captures the key points and why it's trending
2. Two engaging content hooks that could be used for social media
3. A viral score from 1-10 based on engagement potential, novelty, controversy, and relevance
4. Suggest the best category if not already classified

Respond with JSON in this exact format:
{
  "summary": "Two sentence summary here.",
  "hook1": "First engaging hook",
  "hook2": "Second engaging hook", 
  "viralScore": 8.5,
  "category": "suggested-category"
}`
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        summary: result.summary || 'Unable to generate summary',
        hook1: result.hook1 || 'Hook generation failed',
        hook2: result.hook2 || 'Hook generation failed',
        viralScore: Math.max(1, Math.min(10, result.viralScore || 5)),
        category: result.category
      };
    } catch (error) {
      console.error('Error analyzing content with AI:', error);
      
      // Fallback analysis
      return {
        summary: `${title.slice(0, 100)}... This content is trending on ${platform}.`,
        hook1: `This ${platform} trend is getting attention`,
        hook2: `People are talking about this on ${platform}`,
        viralScore: 5.0
      };
    }
  }

  async generateAdditionalHooks(title: string, content: string, existingHooks: string[]): Promise<string[]> {
    try {
      // GPT-5 is the newest OpenAI model with enhanced reasoning capabilities
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Generate 3 additional unique and engaging content hooks for social media. Make them different from the existing hooks and focus on different angles (emotional, curiosity, controversy, etc.).

Respond with JSON in this format:
{
  "hooks": ["hook1", "hook2", "hook3"]
}`
          },
          {
            role: "user",
            content: `Title: ${title}\nContent: ${content}\n\nExisting hooks to avoid:\n${existingHooks.join('\n')}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.hooks || [];
    } catch (error) {
      console.error('Error generating additional hooks:', error);
      return [];
    }
  }

  async batchAnalyze(items: Array<{title: string, content: string, platform: string}>): Promise<AnalysisResult[]> {
    const results = await Promise.allSettled(
      items.map(item => this.analyzeContent(item.title, item.content, item.platform))
    );
    
    return results.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            summary: `Analysis failed for: ${items[index].title}`,
            hook1: 'Analysis unavailable',
            hook2: 'Analysis unavailable', 
            viralScore: 5.0
          }
    );
  }
}
