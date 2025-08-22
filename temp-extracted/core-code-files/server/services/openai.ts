import OpenAI from "openai";
import type { AnalyzeContentData } from "@shared/schema";
import { debugLogger } from "./debug-logger";
import { analyticsService } from "./analytics";

// Using gpt-4o-mini for cost-efficient testing phase, can upgrade to gpt-4o later
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY,
  timeout: 45 * 1000, // 45 second timeout
  maxRetries: 2, // Built-in retries
});

export interface AnalysisResult {
  summary: string;
  sentiment: string;
  tone: string;
  keywords: string[];
  confidence: string;
}

export interface TruthAnalysis {
  fact: string;
  observation: string;
  insight: string;
  humanTruth: string;
  culturalMoment: string;
  attentionValue: 'high' | 'medium' | 'low';
  platform: string;
  cohortOpportunities: string[];
}

export interface EnhancedAnalysisResult extends AnalysisResult {
  truthAnalysis: TruthAnalysis;
  cohortSuggestions: string[];
  platformContext: string;
  viralPotential: 'high' | 'medium' | 'low';
  competitiveInsights: string[];
  strategicInsights: string[];
  strategicActions: string[];
}

export class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }
  }

  async analyzeContent(data: AnalyzeContentData, lengthPreference: 'short' | 'medium' | 'long' | 'bulletpoints' = 'medium', onProgress?: (stage: string, progress: number) => void): Promise<EnhancedAnalysisResult> {
    debugLogger.info('Starting OpenAI content analysis', { title: data.title, hasUrl: !!data.url, contentLength: data.content?.length, lengthPreference });
    
    const maxChunkLength = 10000; // ~2500 tokens per chunk for safety
    const content = data.content || '';
    
    // Check if content needs chunking
    if (content.length > maxChunkLength) {
      debugLogger.info('Content requires chunking', { originalLength: content.length, maxChunkLength });
      return await this.analyzeContentInChunks(data, lengthPreference, onProgress);
    }
    
    // Process normally for shorter content
    return await this.analyzeSingleContent(data, lengthPreference, onProgress);
  }

  private async analyzeContentInChunks(data: AnalyzeContentData, lengthPreference: 'short' | 'medium' | 'long' | 'bulletpoints' = 'medium', onProgress?: (stage: string, progress: number) => void): Promise<EnhancedAnalysisResult> {
    const content = data.content || '';
    const maxChunkLength = 10000;
    
    // Split content into chunks intelligently (by paragraphs when possible)
    const chunks = this.splitContentIntoChunks(content, maxChunkLength);
    debugLogger.info('Processing content in chunks', { totalChunks: chunks.length, originalLength: content.length });
    
    if (onProgress) {
      onProgress('Processing large content in segments', 10);
    }
    
    // Process each chunk
    const chunkResults: EnhancedAnalysisResult[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkData = { ...data, content: chunk };
      
      if (onProgress) {
        const progress = 10 + (i / chunks.length) * 70; // 10% to 80%
        onProgress(`Analyzing segment ${i + 1} of ${chunks.length}`, progress);
      }
      
      debugLogger.info(`Processing chunk ${i + 1}/${chunks.length}`, { chunkLength: chunk.length });
      
      try {
        const result = await this.analyzeSingleContent(chunkData, lengthPreference);
        chunkResults.push(result);
        
        // Small delay between chunks to prevent rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        debugLogger.error(`Failed to analyze chunk ${i + 1}`, error);
        // Continue with other chunks even if one fails
      }
    }
    
    if (onProgress) {
      onProgress('Combining analysis results', 85);
    }
    
    // Combine all chunk results into unified analysis
    const combinedResult = this.combineChunkResults(chunkResults, data);
    
    if (onProgress) {
      onProgress('Analysis complete', 100);
    }
    
    return combinedResult;
  }

  private splitContentIntoChunks(content: string, maxLength: number): string[] {
    const chunks: string[] = [];
    
    // First, try to split by paragraphs
    const paragraphs = content.split(/\n\s*\n/);
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 <= maxLength) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        
        // If single paragraph is too long, split by sentences
        if (paragraph.length > maxLength) {
          const sentences = paragraph.split(/[.!?]+\s+/);
          let sentenceChunk = '';
          
          for (const sentence of sentences) {
            if (sentenceChunk.length + sentence.length + 2 <= maxLength) {
              sentenceChunk += (sentenceChunk ? '. ' : '') + sentence;
            } else {
              if (sentenceChunk) {
                chunks.push(sentenceChunk + '.');
                sentenceChunk = '';
              }
              
              // If single sentence is still too long, force split
              if (sentence.length > maxLength) {
                const words = sentence.split(' ');
                let wordChunk = '';
                
                for (const word of words) {
                  if (wordChunk.length + word.length + 1 <= maxLength) {
                    wordChunk += (wordChunk ? ' ' : '') + word;
                  } else {
                    if (wordChunk) {
                      chunks.push(wordChunk);
                      wordChunk = '';
                    }
                    wordChunk = word;
                  }
                }
                
                if (wordChunk) {
                  sentenceChunk = wordChunk;
                }
              } else {
                sentenceChunk = sentence;
              }
            }
          }
          
          if (sentenceChunk) {
            currentChunk = sentenceChunk + '.';
          }
        } else {
          currentChunk = paragraph;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  private combineChunkResults(chunkResults: EnhancedAnalysisResult[], originalData: AnalyzeContentData): EnhancedAnalysisResult {
    if (chunkResults.length === 0) {
      throw new Error('No successful chunk analysis results to combine');
    }
    
    if (chunkResults.length === 1) {
      return chunkResults[0];
    }
    
    // Combine summaries
    const combinedSummary = `Comprehensive analysis of ${originalData.title || 'content'}: ${chunkResults.map(r => r.summary).join(' ')}`;
    
    // Aggregate sentiment (most common)
    const sentiments = chunkResults.map(r => r.sentiment);
    const sentimentCounts = sentiments.reduce((acc: Record<string, number>, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {});
    const dominantSentiment = Object.entries(sentimentCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
    
    // Combine tone (most professional approach)
    const tones = chunkResults.map(r => r.tone);
    const toneCounts = tones.reduce((acc: Record<string, number>, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {});
    const dominantTone = Object.entries(toneCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
    
    // Merge and deduplicate keywords
    const allKeywords = chunkResults.flatMap(r => r.keywords);
    const uniqueKeywords = Array.from(new Set(allKeywords)).slice(0, 7); // Top 7 unique keywords
    
    // Combine truth analysis (take most comprehensive)
    const truthAnalyses = chunkResults.map(r => r.truthAnalysis);
    const combinedTruthAnalysis = {
      fact: truthAnalyses.map(t => t.fact).join(' '),
      observation: truthAnalyses.map(t => t.observation).join(' '),
      insight: truthAnalyses.map(t => t.insight).join(' '),
      humanTruth: truthAnalyses.map(t => t.humanTruth).join(' '),
      culturalMoment: truthAnalyses.map(t => t.culturalMoment).join(' '),
      attentionValue: truthAnalyses.filter(t => t.attentionValue === 'high').length > 0 ? 'high' : 
                     truthAnalyses.filter(t => t.attentionValue === 'medium').length > 0 ? 'medium' : 'low',
      platform: truthAnalyses[0].platform,
      cohortOpportunities: Array.from(new Set(truthAnalyses.flatMap(t => t.cohortOpportunities))).slice(0, 5)
    };
    
    // Combine other arrays and deduplicate
    const combinedCohortSuggestions = Array.from(new Set(chunkResults.flatMap(r => r.cohortSuggestions))).slice(0, 5);
    const combinedCompetitiveInsights = Array.from(new Set(chunkResults.flatMap(r => r.competitiveInsights))).slice(0, 5);
    const combinedStrategicInsights = Array.from(new Set(chunkResults.flatMap(r => r.strategicInsights))).slice(0, 5);
    const combinedStrategicActions = Array.from(new Set(chunkResults.flatMap(r => r.strategicActions))).slice(0, 5);
    
    // Determine overall viral potential
    const viralPotentials = chunkResults.map(r => r.viralPotential);
    const viralPotential = viralPotentials.filter(v => v === 'high').length > 0 ? 'high' : 
                          viralPotentials.filter(v => v === 'medium').length > 0 ? 'medium' : 'low';
    
    return {
      summary: combinedSummary,
      sentiment: dominantSentiment,
      tone: dominantTone,
      keywords: uniqueKeywords,
      confidence: `${Math.round(chunkResults.reduce((acc, r) => acc + parseInt(r.confidence), 0) / chunkResults.length)}%`,
      truthAnalysis: combinedTruthAnalysis as TruthAnalysis,
      cohortSuggestions: combinedCohortSuggestions,
      platformContext: `Multi-segment analysis combining insights from ${chunkResults.length} content sections`,
      viralPotential: viralPotential as 'high' | 'medium' | 'low',
      competitiveInsights: combinedCompetitiveInsights,
      strategicInsights: combinedStrategicInsights,
      strategicActions: combinedStrategicActions
    };
  }

  private async analyzeSingleContent(data: AnalyzeContentData, lengthPreference: 'short' | 'medium' | 'long' | 'bulletpoints' = 'medium', onProgress?: (stage: string, progress: number) => void): Promise<EnhancedAnalysisResult> {
    const processedContent = data.content || '';
    const startTime = Date.now();
    
    const getLengthInstructions = (preference: string) => {
      switch (preference) {
        case 'short':
          return 'CRITICAL: Each truth analysis field (fact, observation, insight, humanTruth, culturalMoment) must be EXACTLY 1-2 sentences. No more, no less.';
        case 'medium':
          return 'CRITICAL: Each truth analysis field (fact, observation, insight, humanTruth, culturalMoment) must be EXACTLY 3-5 sentences. This is the default length.';
        case 'long':
          return 'CRITICAL: Each truth analysis field (fact, observation, insight, humanTruth, culturalMoment) must be EXACTLY 6-9 sentences with detailed explanations and context.';
        case 'bulletpoints':
          return 'CRITICAL: Each truth analysis field (fact, observation, insight, humanTruth, culturalMoment) must be formatted as bullet points using • symbols. Each field should have 3-5 bullet points with concise, impactful statements.';
        default:
          return 'CRITICAL: Each truth analysis field (fact, observation, insight, humanTruth, culturalMoment) must be EXACTLY 3-5 sentences. This is the default length.';
      }
    };
    
    // Streamlined prompt for faster processing and timeout prevention
    const prompt = `
Analyze this content for strategic insights. ${getLengthInstructions(lengthPreference)}

Title: ${data.title || 'N/A'}
Content: ${processedContent}
URL: ${data.url || 'N/A'}

Provide JSON with these fields:
{
  "summary": "Strategic overview",
  "sentiment": "positive/negative/neutral",
  "tone": "professional/casual/urgent",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "confidence": "85%",
  "truthAnalysis": {
    "fact": "What happened - ${lengthPreference === 'bulletpoints' ? 'Use bullet points with • symbols' : `Use ${lengthPreference} length`}",
    "observation": "What pattern you see - ${lengthPreference === 'bulletpoints' ? 'Use bullet points with • symbols' : `Use ${lengthPreference} length`}",
    "insight": "Why this is happening - ${lengthPreference === 'bulletpoints' ? 'Use bullet points with • symbols' : `Use ${lengthPreference} length`}",
    "humanTruth": "Deep psychological driver - ${lengthPreference === 'bulletpoints' ? 'Use bullet points with • symbols' : `Use ${lengthPreference} length`}",
    "culturalMoment": "Larger cultural shift - ${lengthPreference === 'bulletpoints' ? 'Use bullet points with • symbols' : `Use ${lengthPreference} length`}",
    "attentionValue": "high/medium/low",
    "platform": "Platform context",
    "cohortOpportunities": ["specific cohort names"]
  },
  "cohortSuggestions": ["cohort 1", "cohort 2", "cohort 3"],
  "platformContext": "Platform relevance",
  "viralPotential": "high/medium/low",
  "competitiveInsights": ["insight 1", "insight 2", "insight 3"],
  "strategicInsights": ["strategic insight 1", "strategic insight 2", "strategic insight 3"],
  "strategicActions": ["action 1", "action 2", "action 3"]
}
`;

    try {
      debugLogger.info('Sending request to OpenAI API', { model: 'gpt-4o-mini', promptLength: prompt.length });
      
      // Progress tracking for better UX
      if (onProgress) {
        onProgress('Initializing analysis', 10);
        setTimeout(() => onProgress('Processing content', 30), 500);
        setTimeout(() => onProgress('Analyzing cultural context', 50), 2000);
        setTimeout(() => onProgress('Generating insights', 70), 4000);
        setTimeout(() => onProgress('Finalizing results', 90), 6000);
      }
      
      // OpenAI API call with timeout prevention strategies
      debugLogger.info('Sending OpenAI API request', { 
        contentLength: processedContent.length,
        promptLength: prompt.length 
      });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Keeping cost-efficient model as requested
        messages: [
          {
            role: "system",
            content: "You are a strategic content analyst. Provide concise, actionable insights focusing on cultural intelligence and human behavior patterns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000, // Limit response length to prevent timeouts
      });
      
      return this.processOpenAIResponse(response, startTime);
    } catch (error: any) {
      debugLogger.error('OpenAI analysis failed', error);
      
      // Track failed API call - skip tracking if no valid user
      /* analyticsService.trackExternalApiCall({
        userId: 0, // System user for now, will be updated with actual user context
        service: 'openai',
        endpoint: 'chat/completions',
        method: 'POST',
        statusCode: 500,
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        metadata: {
          model: 'gpt-4o-mini',
          promptLength: prompt.length,
          contentLength: processedContent.length
        }
      }); */
      
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }

  private processOpenAIResponse(response: any, startTime: number): EnhancedAnalysisResult {
    const responseTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;
    const promptTokens = response.usage?.prompt_tokens || 0;
    const completionTokens = response.usage?.completion_tokens || 0;
    
    debugLogger.info('OpenAI API response received', { 
      responseTime, 
      tokensUsed,
      promptTokens,
      completionTokens
    });

    // Track successful API call - skip tracking if no valid user
    /* analyticsService.trackExternalApiCall({
      userId: 0, // System user for now, will be updated with actual user context
      service: 'openai',
      endpoint: 'chat/completions',
      method: 'POST',
      statusCode: 200,
      responseTime,
      tokensUsed,
      cost: Math.round(tokensUsed * 0.00015 * 100), // Cost in cents ($0.00015 per token for gpt-4o-mini)
      metadata: {
        model: 'gpt-4o-mini',
        promptTokens,
        completionTokens,
        finishReason: response.choices[0]?.finish_reason
      }
    }); */

    const result = JSON.parse(response.choices[0].message.content || "{}");
    debugLogger.info('OpenAI response parsed successfully', { 
      hasSummary: !!result.summary,
      sentiment: result.sentiment,
      keywordCount: result.keywords?.length || 0,
      confidence: result.confidence
    });
    
    return {
      summary: result.summary || "No summary available",
      sentiment: result.sentiment || "Neutral",
      tone: result.tone || "Professional",
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
      confidence: result.confidence || "85%",
      truthAnalysis: result.truthAnalysis || {
        fact: 'Not identified',
        observation: 'Not identified',
        insight: 'Not identified',
        humanTruth: 'Not identified',
        culturalMoment: 'Not identified',
        attentionValue: 'medium',
        platform: 'unknown',
        cohortOpportunities: []
      },
      cohortSuggestions: result.cohortSuggestions || [],
      platformContext: result.platformContext || 'Platform context not identified',
      viralPotential: result.viralPotential || 'medium',
      competitiveInsights: result.competitiveInsights || [],
      strategicInsights: result.strategicInsights || [],
      strategicActions: result.strategicActions || []
    };
  }
}

export const openaiService = new OpenAIService();
