import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Enhanced truth analysis framework types
export interface EnhancedTruthAnalysis {
  fact: {
    claims: string[];
    sources: string[];
    verificationStatus: 'verified' | 'unverified' | 'disputed';
    confidence: number;
  };
  observation: {
    behaviorPatterns: string[];
    audienceSignals: {
      demographics: string[];
      psychographics: string[];
      engagement: string[];
    };
    contextualFactors: string[];
    crossPlatformSignals?: Array<{
      platform: string;
      signal: string;
      strength: number;
    }>;
  };
  insight: {
    strategicImplications: string[];
    opportunityMapping: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    riskAssessment: {
      reputational: string[];
      competitive: string[];
      operational: string[];
    };
    competitiveIntelligence?: {
      gaps: string[];
      advantages: string[];
      threats: string[];
    };
  };
  humanTruth: {
    emotionalUndercurrent: {
      primary: string;
      secondary: string[];
      triggers: string[];
    };
    culturalContext: {
      moment: string;
      relevance: number;
      socialDynamics: string[];
    };
    psychologicalDrivers: {
      motivations: string[];
      barriers: string[];
      biases: string[];
    };
    communicationCues: {
      tone: string;
      messaging: string[];
      channels: string[];
    };
  };
}

export interface AnalysisContext {
  hasVisuals?: boolean;
  isStrategicBrief?: boolean;
  requiresCulturalContext?: boolean;
  isComplexReasoning?: boolean;
  isBulkProcessing?: boolean;
  platform?: string;
  signalType?: string;
}

export interface EnhancedAnalysisResult {
  summary: string;
  hooks: string[];
  viralScore: number;
  category?: string;
  truthAnalysis?: EnhancedTruthAnalysis;
  visualAnalysis?: any;
  aiModel: string;
}

export class EnhancedAIAnalyzer {
  private geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  /**
   * Smart model selection based on content type and analysis needs
   */
  async analyzeContent(
    title: string, 
    content: string, 
    context: AnalysisContext = {}
  ): Promise<EnhancedAnalysisResult> {
    // Determine which AI model to use based on context
    if (context.hasVisuals) {
      return this.geminiMultimodalAnalysis(title, content, context);
    }
    
    if (context.isStrategicBrief) {
      return this.openaiStrategicAnalysis(title, content, context);
    }
    
    if (context.requiresCulturalContext || context.isComplexReasoning) {
      return this.geminiDeepAnalysis(title, content, context);
    }
    
    // Default to Gemini for most tasks (better cost efficiency)
    return this.geminiAnalysis(title, content, context);
  }

  /**
   * Gemini 2.5 Pro analysis for general content and cultural intelligence
   */
  private async geminiAnalysis(
    title: string, 
    content: string, 
    context: AnalysisContext
  ): Promise<EnhancedAnalysisResult> {
    try {
      const prompt = `You are a strategic intelligence analyst specializing in ${context.platform || 'social media'} trends. Analyze this content and provide:

1. A 2-3 sentence executive summary capturing key insights and strategic value
2. 3-5 engaging content hooks for different audiences (make them diverse and creative)
3. A viral potential score from 1-10 based on novelty, engagement potential, cultural relevance
4. The most appropriate category for strategic intelligence
5. A deep truth analysis following this framework:
   - FACT: Verifiable claims, sources, and confidence level
   - OBSERVATION: Behavior patterns, audience signals, contextual factors
   - INSIGHT: Strategic implications, opportunities, risks
   - HUMAN TRUTH: Emotional drivers, cultural context, psychological factors

Title: ${title}
Content: ${content}

Respond with a JSON object in this exact format:
{
  "summary": "Executive summary here",
  "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "viralScore": 8.5,
  "category": "cultural-moment",
  "truthAnalysis": {
    "fact": {
      "claims": ["claim1", "claim2"],
      "sources": ["source1", "source2"],
      "verificationStatus": "verified",
      "confidence": 0.85
    },
    "observation": {
      "behaviorPatterns": ["pattern1", "pattern2"],
      "audienceSignals": {
        "demographics": ["demo1"],
        "psychographics": ["psycho1"],
        "engagement": ["engagement1"]
      },
      "contextualFactors": ["factor1", "factor2"]
    },
    "insight": {
      "strategicImplications": ["implication1", "implication2"],
      "opportunityMapping": {
        "immediate": ["opp1"],
        "shortTerm": ["opp2"],
        "longTerm": ["opp3"]
      },
      "riskAssessment": {
        "reputational": ["risk1"],
        "competitive": ["risk2"],
        "operational": ["risk3"]
      }
    },
    "humanTruth": {
      "emotionalUndercurrent": {
        "primary": "primary emotion",
        "secondary": ["emotion2"],
        "triggers": ["trigger1"]
      },
      "culturalContext": {
        "moment": "cultural moment description",
        "relevance": 0.9,
        "socialDynamics": ["dynamic1"]
      },
      "psychologicalDrivers": {
        "motivations": ["motivation1"],
        "barriers": ["barrier1"],
        "biases": ["bias1"]
      },
      "communicationCues": {
        "tone": "conversational",
        "messaging": ["message1"],
        "channels": ["channel1"]
      }
    }
  }
}`;

      const result = await this.geminiModel.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      return {
        summary: analysisResult.summary || 'Unable to generate summary',
        hooks: analysisResult.hooks || ['Hook generation failed'],
        viralScore: Math.max(1, Math.min(10, analysisResult.viralScore || 5)),
        category: analysisResult.category,
        truthAnalysis: analysisResult.truthAnalysis,
        aiModel: 'gemini-2.5-pro'
      };
    } catch (error) {
      console.error('Error with Gemini analysis:', error);
      // Fallback to OpenAI if Gemini fails
      return this.openaiAnalysis(title, content, context);
    }
  }

  /**
   * Gemini multimodal analysis for visual content
   */
  private async geminiMultimodalAnalysis(
    title: string,
    content: string,
    context: AnalysisContext & { imageData?: string }
  ): Promise<EnhancedAnalysisResult> {
    try {
      const parts = [
        {
          text: `Analyze this social media post with visual content for strategic intelligence:
          
Title: ${title}
Caption/Content: ${content}
Platform: ${context.platform || 'unknown'}

Provide:
1. Visual trend analysis and brand elements detected
2. Viral potential based on visual + text combination
3. Strategic opportunities for brands
4. Cultural significance of visual elements

Format your response as JSON with these fields:
summary, hooks, viralScore, category, visualAnalysis, truthAnalysis`
        }
      ];

      if (context.imageData) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: context.imageData
          }
        } as any);
      }

      const result = await this.geminiModel.generateContent(parts);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini multimodal response');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      return {
        ...analysisResult,
        aiModel: 'gemini-2.5-pro-vision'
      };
    } catch (error) {
      console.error('Error with Gemini multimodal analysis:', error);
      return this.geminiAnalysis(title, content, context);
    }
  }

  /**
   * OpenAI GPT-5 Thinking analysis for strategic briefs and complex reasoning
   */
  private async openaiStrategicAnalysis(
    title: string,
    content: string,
    context: AnalysisContext
  ): Promise<EnhancedAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a senior strategic intelligence analyst creating executive-level strategic briefs. 
Focus on Define → Shift → Deliver methodology:
- DEFINE: Market context, cultural moments, audience insights
- SHIFT: Strategic opportunities, positioning gaps, competitive advantages
- DELIVER: Actionable recommendations, execution frameworks, success metrics

Analyze content for strategic value and business implications.`
          },
          {
            role: "user",
            content: `Analyze this content for strategic intelligence:

Title: ${title}
Content: ${content}
Context: ${JSON.stringify(context)}

Provide comprehensive strategic analysis in JSON format with:
summary, hooks (5+), viralScore, category, and detailed truthAnalysis following the fact→observation→insight→humanTruth framework.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        summary: result.summary || 'Unable to generate strategic summary',
        hooks: result.hooks || [],
        viralScore: result.viralScore || 5,
        category: result.category || 'strategic-intelligence',
        truthAnalysis: result.truthAnalysis,
        aiModel: 'gpt-5'
      };
    } catch (error) {
      console.error('Error with OpenAI strategic analysis:', error);
      return this.geminiAnalysis(title, content, context);
    }
  }

  /**
   * Gemini deep analysis for complex cultural understanding
   */
  private async geminiDeepAnalysis(
    title: string,
    content: string,
    context: AnalysisContext
  ): Promise<EnhancedAnalysisResult> {
    // Use Gemini's advanced reasoning for deep cultural analysis
    const enhancedContext = {
      ...context,
      requiresCulturalContext: true,
      isComplexReasoning: true
    };
    
    return this.geminiAnalysis(title, content, enhancedContext);
  }

  /**
   * Fallback OpenAI analysis
   */
  private async openaiAnalysis(
    title: string,
    content: string,
    context: AnalysisContext
  ): Promise<EnhancedAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a viral content strategist and trend analyst. Analyze content and provide strategic intelligence.`
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${content}\n\nProvide analysis with: summary, hooks array, viralScore, category, and basic truthAnalysis.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        summary: result.summary || 'Analysis unavailable',
        hooks: result.hooks || ['Hook generation failed'],
        viralScore: result.viralScore || 5,
        category: result.category,
        truthAnalysis: result.truthAnalysis,
        aiModel: 'gpt-5'
      };
    } catch (error) {
      console.error('Error with OpenAI fallback:', error);
      // Ultimate fallback
      return {
        summary: `${title.slice(0, 100)}... Content from ${context.platform || 'platform'}.`,
        hooks: ['Trending content alert', 'Check out this viral moment'],
        viralScore: 5.0,
        category: 'uncategorized',
        aiModel: 'fallback'
      };
    }
  }

  /**
   * Batch analysis with intelligent model selection
   */
  async batchAnalyze(
    items: Array<{
      title: string;
      content: string;
      context: AnalysisContext;
    }>
  ): Promise<EnhancedAnalysisResult[]> {
    // Process in parallel with smart model selection
    const results = await Promise.allSettled(
      items.map(item => this.analyzeContent(item.title, item.content, item.context))
    );
    
    return results.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            summary: `Analysis failed for: ${items[index].title}`,
            hooks: ['Analysis unavailable'],
            viralScore: 5.0,
            aiModel: 'error'
          }
    );
  }

  /**
   * Generate strategic brief content hooks
   */
  async generateStrategicHooks(
    title: string,
    content: string,
    existingHooks: string[],
    targetAudience?: string
  ): Promise<string[]> {
    const context: AnalysisContext = {
      isStrategicBrief: true,
      platform: 'strategic-brief'
    };

    const result = await this.openaiStrategicAnalysis(
      title,
      `${content}\n\nTarget Audience: ${targetAudience || 'General'}\nExisting hooks to avoid: ${existingHooks.join(', ')}`,
      context
    );

    return result.hooks.filter(hook => !existingHooks.includes(hook));
  }

  /**
   * Direct Gemini analysis method for compatibility with existing services
   */
  async analyzeWithGemini(
    prompt: string,
    context: any = {}
  ): Promise<any> {
    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = result.response.text();
      
      // Try to parse as JSON if it looks like JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.warn('Failed to parse Gemini response as JSON, returning raw text');
        }
      }
      
      return {
        content: response,
        analysis: response,
        result: response
      };
    } catch (error) {
      console.error('Error with analyzeWithGemini:', error);
      throw error;
    }
  }
}