import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Capture } from "@shared/supabase-schema";

// Fixed Truth Analysis Engine - Single AI call for all 4 layers
export class TruthAnalysisEngine {
  private openai: OpenAI;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  // Main analysis method - single call for efficiency
  async analyzeCapture(capture: Capture): Promise<{
    truthAnalysis: any;
    suggestedBriefSection: string;
    culturalRelevance: string;
    strategicValue: string;
  }> {
    try {
      // For visual content, use Gemini
      if (capture.type === 'screenshot' && capture.screenshotUrl && this.genAI) {
        return await this.analyzeWithGemini(capture);
      }

      // For text content, use GPT-5
      return await this.analyzeWithGPT(capture);
    } catch (error) {
      console.error('Truth Analysis failed:', error);
      throw error;
    }
  }

  private async analyzeWithGPT(capture: Capture) {
    const prompt = `Analyze this captured content using the Truth Analysis Framework. Extract strategic insights in a single pass.

Content Type: ${capture.type}
Platform: ${capture.platform || 'Unknown'}
Content: ${capture.content || 'No text content'}
User Note: ${capture.content || 'None'}
Metadata: ${JSON.stringify(capture.metadata || {})}

Provide analysis in this exact JSON format:
{
  "truthAnalysis": {
    "fact": {
      "claims": ["List objective facts from the content"],
      "metrics": {"engagement": "number", "reach": "number", "other": "value"},
      "timestamp": "when this occurred"
    },
    "observation": {
      "patterns": ["What behavioral patterns are visible"],
      "behaviors": ["Specific audience behaviors noticed"],
      "context": "The situational context"
    },
    "insight": {
      "implications": ["Strategic implications of these observations"],
      "opportunities": ["Potential opportunities for brands"],
      "risks": ["Potential risks or challenges"]
    },
    "humanTruth": {
      "core": "The fundamental human truth revealed",
      "emotional": "The emotional driver behind the behavior",
      "cultural": "The cultural context or moment",
      "psychological": "The psychological need being fulfilled"
    }
  },
  "suggestedBriefSection": "Which Jimmy John's brief section this belongs in: performance|cultural-signals|platform-signals|opportunities|cohorts|ideation",
  "culturalRelevance": "Score 0-10 for cultural relevance",
  "strategicValue": "Score 0-10 for strategic value to brands"
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-5", // GPT-5 is the newest OpenAI model with enhanced reasoning capabilities
      messages: [
        {
          role: "system",
          content: "You are a strategic intelligence analyst specializing in cultural insights and human truths. Analyze content to reveal deep strategic opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      truthAnalysis: result.truthAnalysis,
      suggestedBriefSection: result.suggestedBriefSection || 'cultural-signals',
      culturalRelevance: (parseFloat(result.culturalRelevance) || 5.0).toFixed(1),
      strategicValue: (parseFloat(result.strategicValue) || 5.0).toFixed(1)
    };
  }

  private async analyzeWithGemini(capture: Capture) {
    if (!this.genAI) throw new Error('Gemini API not configured');

    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analyze this visual content using the Truth Analysis Framework. This is a ${capture.type} from ${capture.platform || 'unknown platform'}.

OCR/Content: ${capture.content || 'No text extracted'}
User Note: ${capture.content || 'None'}

Analyze the visual and contextual elements to extract:
1. FACT: What objectively exists in this image (text, visuals, metrics)
2. OBSERVATION: What patterns and behaviors are visible
3. INSIGHT: What strategic implications this reveals
4. HUMAN TRUTH: The deeper psychological/cultural driver

Also determine:
- Which brief section this belongs in (performance, cultural-signals, platform-signals, opportunities, cohorts, ideation)
- Cultural relevance score (0-10)
- Strategic value score (0-10)

Respond in JSON format with truthAnalysis, suggestedBriefSection, culturalRelevance, and strategicValue.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from Gemini response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse Gemini response');
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      truthAnalysis: parsed.truthAnalysis || this.getDefaultTruthAnalysis(),
      suggestedBriefSection: parsed.suggestedBriefSection || 'cultural-signals',
      culturalRelevance: (parseFloat(parsed.culturalRelevance) || 5.0).toFixed(1),
      strategicValue: (parseFloat(parsed.strategicValue) || 5.0).toFixed(1)
    };
  }

  private getDefaultTruthAnalysis() {
    return {
      fact: {
        claims: ["Content captured for analysis"],
        metrics: {},
        timestamp: new Date().toISOString()
      },
      observation: {
        patterns: ["Pending analysis"],
        behaviors: [],
        context: "Awaiting processing"
      },
      insight: {
        implications: [],
        opportunities: [],
        risks: []
      },
      humanTruth: {
        core: "Pending analysis",
        emotional: "",
        cultural: "",
        psychological: ""
      }
    };
  }

  // Batch processing for efficiency
  async analyzeBatch(captures: Capture[]): Promise<Map<string, any>> {
    const results = new Map();
    
    // Process in parallel with concurrency limit
    const batchSize = 5;
    for (let i = 0; i < captures.length; i += batchSize) {
      const batch = captures.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(capture => 
          this.analyzeCapture(capture)
            .then(result => ({ id: capture.id, result }))
            .catch(error => ({ id: capture.id, error: error.message }))
        )
      );
      
      batchResults.forEach((item) => {
        if ('error' in item) {
          console.error(`Failed to analyze capture ${item.id}:`, item.error);
          results.set(item.id, null);
        } else {
          results.set(item.id, item.result);
        }
      });
    }
    
    return results;
  }
}