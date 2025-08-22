import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface TruthAnalysisResult {
  fact: string;
  observation: string;
  insight: string;
  humanTruth: string;
  culturalMoment?: string;
  strategicValue: number; // 1-10 scale
  viralPotential: number; // 1-10 scale
  briefSectionSuggestion: 'define' | 'shift' | 'deliver';
  keywords: string[];
  tone: string;
  confidence: number; // 0-100
}

export class OpenAIAnalysisService {
  async analyzeCaptureContent(content: string, title: string, url?: string, captureType: string = 'text', useReasoning: boolean = true): Promise<TruthAnalysisResult> {
    try {
      const analysisPrompt = `
You are a strategic intelligence expert analyzing content for cultural insights and business intelligence.

Content Type: ${captureType}
Title: ${title}
Content: ${content}
${url ? `Source URL: ${url}` : ''}

Perform a Truth Analysis Framework assessment:

1. FACT: What factually happened or was stated
2. OBSERVATION: What this reveals about behavior, trends, or patterns  
3. INSIGHT: Why this matters strategically or culturally
4. HUMAN TRUTH: The deeper psychological or cultural truth this represents

Also assess:
- Cultural Moment: Is this part of a broader cultural trend or zeitgeist moment?
- Strategic Value: Business/strategic importance (1-10 scale)
- Viral Potential: Likelihood to spread/engage audiences (1-10 scale)
- Brief Section: Where this fits in Define→Shift→Deliver framework
- Keywords: 3-5 strategic keywords
- Tone: Overall emotional tone (positive, negative, neutral, mixed)
- Confidence: Analysis confidence level (0-100)

Return as JSON with exact field names: fact, observation, insight, humanTruth, culturalMoment, strategicValue, viralPotential, briefSectionSuggestion, keywords, tone, confidence
`;

      // Updated to GPT-5 with selective reasoning for better strategic analysis
      const requestParams: any = {
        model: "gpt-5", // GPT-5 is the newest OpenAI model with enhanced reasoning capabilities
        messages: [
          {
            role: "system",
            content: "You are a strategic intelligence expert specializing in cultural analysis and business intelligence. Provide structured, actionable insights."
          },
          {
            role: "user", 
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" }
      };

      // Add reasoning for complex strategic analysis (fallback to standard if not supported)
      if (useReasoning) {
        requestParams.reasoning_effort = "medium";
      }

      let response;
      try {
        response = await openai.chat.completions.create(requestParams);
      } catch (error: any) {
        // If reasoning parameter not supported, retry with standard GPT-5
        if (useReasoning && error.message?.includes('reasoning_effort')) {
          console.log('⚠️ Reasoning not supported for Truth Analysis, falling back to standard GPT-5');
          requestParams.model = "gpt-5";
          delete requestParams.reasoning_effort;
          response = await openai.chat.completions.create(requestParams);
        } else {
          throw error;
        }
      }

      const analysisText = response.choices[0].message.content;
      if (!analysisText) {
        throw new Error("No analysis content received from OpenAI");
      }

      const analysis = JSON.parse(analysisText);

      // Validate and structure the response
      return {
        fact: analysis.fact || "Content captured for analysis",
        observation: analysis.observation || "Requires further analysis",
        insight: analysis.insight || "Strategic implications pending",
        humanTruth: analysis.humanTruth || "Cultural significance under review",
        culturalMoment: analysis.culturalMoment || null,
        strategicValue: Math.max(1, Math.min(10, analysis.strategicValue || 5)),
        viralPotential: Math.max(1, Math.min(10, analysis.viralPotential || 5)),
        briefSectionSuggestion: ['define', 'shift', 'deliver'].includes(analysis.briefSectionSuggestion) 
          ? analysis.briefSectionSuggestion 
          : 'define',
        keywords: Array.isArray(analysis.keywords) ? analysis.keywords.slice(0, 5) : [],
        tone: analysis.tone || 'neutral',
        confidence: Math.max(0, Math.min(100, analysis.confidence || 75))
      };

    } catch (error: any) {
      console.error("OpenAI analysis failed:", error);
      
      // Return fallback analysis instead of throwing
      return {
        fact: "Content captured successfully",
        observation: "Analysis temporarily unavailable",
        insight: "Strategic analysis will be processed shortly",
        humanTruth: "Cultural intelligence processing",
        culturalMoment: undefined,
        strategicValue: 5,
        viralPotential: 5,
        briefSectionSuggestion: 'define',
        keywords: [],
        tone: 'neutral',
        confidence: 50
      };
    }
  }

  async quickAnalysis(content: string, title: string, useReasoning: boolean = false): Promise<{summary: string, tags: string[]}> {
    try {
      const quickPrompt = `
Provide a quick 2-sentence strategic summary and 3-5 relevant tags for this content:

Title: ${title}
Content: ${content}

Return JSON with: summary (2 sentences), tags (3-5 strategic tags)
`;

      // Updated to GPT-5 with optional reasoning for quick analysis
      const requestParams: any = {
        model: "gpt-5", // GPT-5 is the newest OpenAI model with enhanced reasoning capabilities
        messages: [{ role: "user", content: quickPrompt }],
        response_format: { type: "json_object" },
        max_tokens: 200
      };

      // Add reasoning only when specifically requested for quick analysis
      if (useReasoning) {
        requestParams.reasoning_effort = "low";
      }

      let response;
      try {
        response = await openai.chat.completions.create(requestParams);
      } catch (error: any) {
        // If reasoning parameter not supported, retry without it
        if (useReasoning && error.message?.includes('reasoning_effort')) {
          console.log('⚠️ Reasoning not supported for quick analysis, falling back to standard GPT-5');
          delete requestParams.reasoning_effort;
          response = await openai.chat.completions.create(requestParams);
        } else {
          throw error;
        }
      }

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        summary: result.summary || "Strategic content captured for analysis",
        tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : []
      };

    } catch (error) {
      console.error("Quick analysis failed:", error);
      return {
        summary: "Content captured for strategic analysis",
        tags: ["strategic-content"]
      };
    }
  }
}

export const openaiAnalysisService = new OpenAIAnalysisService();