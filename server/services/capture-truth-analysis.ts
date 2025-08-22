import OpenAI from "openai";

// Truth Analysis Framework - Core Strategic Intelligence Processing
export class CaptureTruthAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
  }

  /**
   * Processes capture content through the Truth Analysis Framework
   * Generates: Fact → Observation → Insight → Human Truth
   */
  async analyzeCaptureContent(capture: {
    id: string;
    title?: string | null;
    content: string;
    platform?: string | null;
    metadata?: any;
  }): Promise<{
    truthAnalysis: {
      fact: { claims: string[]; sources: string[]; verificationStatus: string; confidence: number };
      observation: { behaviorPatterns: string[]; audienceSignals: any; contextualFactors: string[] };
      insight: { strategicImplications: string[]; opportunityMapping: any; riskAssessment: any };
      humanTruth: { emotionalUndercurrent: any; culturalContext: any; psychologicalDrivers: any };
    };
    summary: string;
    strategicValue: number;
    culturalRelevance: number;
    suggestedBriefSection: string;
  }> {
    try {
      console.log(`🔍 Processing Truth Analysis for capture: ${capture.id}`);
      
      const analysisPrompt = `
You are a strategic intelligence analyst using the Truth Analysis Framework. Analyze this content through 4 layers:

CONTENT TO ANALYZE:
Title: ${capture.title || 'No title'}
Platform: ${capture.platform || 'Unknown'}
Content: ${capture.content}
Context: ${JSON.stringify(capture.metadata || {}, null, 2)}

Apply the Truth Analysis Framework:

1. FACT LAYER
- Extract verifiable claims and data points
- Identify sources and evidence quality
- Assess factual accuracy and completeness

2. OBSERVATION LAYER  
- Identify behavior patterns and audience signals
- Note contextual factors and situational elements
- Document what's happening without interpretation

3. INSIGHT LAYER
- Draw strategic implications from observations
- Map opportunities and competitive advantages  
- Assess risks and potential challenges

4. HUMAN TRUTH LAYER
- Uncover emotional undercurrents driving behavior
- Understand cultural context and meaning
- Identify psychological drivers and motivations

Provide response in JSON format:
{
  "truthAnalysis": {
    "fact": {
      "claims": ["claim1", "claim2"],
      "sources": ["source1", "source2"], 
      "verificationStatus": "verified|partial|unverified",
      "confidence": 0-100
    },
    "observation": {
      "behaviorPatterns": ["pattern1", "pattern2"],
      "audienceSignals": {"engagement": "high", "sentiment": "positive"},
      "contextualFactors": ["factor1", "factor2"]
    },
    "insight": {
      "strategicImplications": ["implication1", "implication2"],
      "opportunityMapping": {"immediate": ["opp1"], "longTerm": ["opp2"]},
      "riskAssessment": {"low": ["risk1"], "medium": ["risk2"], "high": ["risk3"]}
    },
    "humanTruth": {
      "emotionalUndercurrent": {"primary": "emotion", "intensity": "high|medium|low"},
      "culturalContext": {"moment": "description", "relevance": "high|medium|low"},
      "psychologicalDrivers": ["driver1", "driver2"]
    }
  },
  "summary": "concise strategic summary",
  "strategicValue": 1-10,
  "culturalRelevance": 1-10,
  "suggestedBriefSection": "performance|cultural-signals|platform-signals|opportunities|cohorts|ideation"
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-5", // GPT-5 is the newest OpenAI model with enhanced reasoning capabilities
        messages: [
          { role: "system", content: "You are a strategic intelligence analyst specializing in the Truth Analysis Framework. Always respond with valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Ensure values are properly validated and converted
      const validatedResult = {
        ...result,
        strategicValue: Math.max(1, Math.min(10, parseInt(result.strategicValue) || 5)),
        culturalRelevance: Math.max(1, Math.min(10, parseInt(result.culturalRelevance) || 5)),
        suggestedBriefSection: result.suggestedBriefSection || 'performance'
      };
      
      console.log(`✅ Truth Analysis completed for capture ${capture.id}`);
      console.log(`   Strategic Value: ${validatedResult.strategicValue}/10`);
      console.log(`   Cultural Relevance: ${validatedResult.culturalRelevance}/10`);
      console.log(`   Brief Section: ${validatedResult.suggestedBriefSection}`);

      return validatedResult;

    } catch (error) {
      console.error(`❌ Truth Analysis failed for capture ${capture.id}:`, error);
      
      // Return fallback analysis structure
      return {
        truthAnalysis: {
          fact: { 
            claims: ["Processing failed - manual review required"], 
            sources: [], 
            verificationStatus: "unverified", 
            confidence: 0 
          },
          observation: { 
            behaviorPatterns: [], 
            audienceSignals: {}, 
            contextualFactors: ["Analysis error occurred"] 
          },
          insight: { 
            strategicImplications: ["Manual analysis needed"], 
            opportunityMapping: {}, 
            riskAssessment: {} 
          },
          humanTruth: { 
            emotionalUndercurrent: {}, 
            culturalContext: {}, 
            psychologicalDrivers: [] 
          }
        },
        summary: "Error occurred during analysis - requires manual review",
        strategicValue: 1,
        culturalRelevance: 1,
        suggestedBriefSection: "performance"
      };
    }
  }

  /**
   * Quick Truth Analysis for real-time processing
   */
  async quickTruthAnalysis(content: string): Promise<{
    fact: string;
    observation: string;
    insight: string;
    humanTruth: string;
  }> {
    try {
      const quickPrompt = `
Analyze this content using the Truth Analysis Framework. Provide one concise sentence for each layer:

Content: ${content}

Respond in JSON:
{
  "fact": "What factually happened or is claimed",
  "observation": "What behavior or pattern is observable", 
  "insight": "What strategic implication this reveals",
  "humanTruth": "What deeper human need or emotion drives this"
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-5", // GPT-5 is the newest OpenAI model with enhanced reasoning capabilities
        messages: [
          { role: "system", content: "You are a strategic analyst. Always respond with valid JSON." },
          { role: "user", content: quickPrompt }
        ],
        response_format: { type: "json_object" },

        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error("❌ Quick Truth Analysis failed:", error);
      return {
        fact: "Analysis failed",
        observation: "Error occurred",
        insight: "Manual review needed", 
        humanTruth: "Unknown motivation"
      };
    }
  }
}