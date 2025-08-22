import { openaiAnalysisService, TruthAnalysisResult } from './openai-analysis';
import { geminiVisualAnalysisService, VisualAnalysisResult } from './gemini-visual-analysis';
import { storage } from '../storage';
import type { Database } from '../../shared/database.types';

type Capture = Database['public']['Tables']['captures']['Row'];

export interface CaptureAnalysisResult {
  truthAnalysis: TruthAnalysisResult;
  visualAnalysis?: VisualAnalysisResult;
  processingTime: number;
  status: 'completed' | 'partial' | 'failed';
}

export class CaptureAnalysisService {
  private processingQueue: Map<string, Promise<CaptureAnalysisResult>> = new Map();

  async processCapture(captureId: string): Promise<CaptureAnalysisResult> {
    // Prevent duplicate processing
    if (this.processingQueue.has(captureId)) {
      return this.processingQueue.get(captureId)!;
    }

    const processingPromise = this.performAnalysis(captureId);
    this.processingQueue.set(captureId, processingPromise);

    try {
      const result = await processingPromise;
      
      // Update capture with analysis results
      await this.updateCaptureWithAnalysis(captureId, result);
      
      return result;
    } finally {
      // Clean up queue
      this.processingQueue.delete(captureId);
    }
  }

  private async performAnalysis(captureId: string): Promise<CaptureAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Get capture data
      const capture = await storage.getCaptureById(captureId);
      if (!capture) {
        throw new Error(`Capture ${captureId} not found`);
      }

      console.log(`🧠 Starting AI analysis for capture: ${capture.title}`);

      // Perform OpenAI text analysis
      const truthAnalysis = await openaiAnalysisService.analyzeCaptureContent(
        capture.content || '',
        capture.title || 'Untitled',
        capture.url || undefined,
        capture.type
      );

      console.log(`✅ OpenAI analysis completed for capture: ${capture.title}`);

      let visualAnalysis: VisualAnalysisResult | undefined;

      // Perform Gemini visual analysis if images present
      if (capture.type === 'image' && capture.content) {
        try {
          visualAnalysis = await geminiVisualAnalysisService.analyzeImage(
            capture.content,
            `${capture.title} - ${truthAnalysis.insight}`
          );
          console.log(`🎨 Gemini visual analysis completed for capture: ${capture.title}`);
        } catch (visualError) {
          console.warn(`⚠️ Visual analysis failed for capture ${captureId}:`, visualError);
          // Continue without visual analysis
        }
      }

      const processingTime = Date.now() - startTime;

      return {
        truthAnalysis,
        visualAnalysis,
        processingTime,
        status: visualAnalysis || capture.type !== 'image' ? 'completed' : 'partial'
      };

    } catch (error) {
      console.error(`❌ Analysis failed for capture ${captureId}:`, error);
      
      const processingTime = Date.now() - startTime;
      
      // Return fallback analysis
      return {
        truthAnalysis: {
          fact: "Content captured successfully",
          observation: "Analysis temporarily unavailable",
          insight: "Strategic analysis will be processed shortly",
          humanTruth: "Cultural intelligence processing",
          strategicValue: 5,
          viralPotential: 5,
          briefSectionSuggestion: 'define',
          keywords: [],
          tone: 'neutral',
          confidence: 50
        },
        processingTime,
        status: 'failed'
      };
    }
  }

  private async updateCaptureWithAnalysis(captureId: string, analysisResult: CaptureAnalysisResult): Promise<void> {
    try {
      // Handle truthAnalysis string parsing if necessary
      if (typeof analysisResult.truthAnalysis === 'string') {
        try {
          analysisResult.truthAnalysis = JSON.parse(analysisResult.truthAnalysis);
        } catch {
          analysisResult.truthAnalysis = {
            fact: "Content captured successfully",
            observation: "Analysis temporarily unavailable", 
            insight: "Strategic analysis pending",
            humanTruth: "Cultural intelligence processing",
            strategicValue: 5,
            viralPotential: 5,
            briefSectionSuggestion: 'define' as const,
            keywords: ["content", "analysis"],
            tone: "neutral",
            confidence: 50
          };
        }
      }

      const updates: Partial<Capture> = {
        ai_analysis: JSON.parse(JSON.stringify({
          truthAnalysis: analysisResult.truthAnalysis,
          visualAnalysis: analysisResult.visualAnalysis,
          processingTime: analysisResult.processingTime,
          status: analysisResult.status,
          timestamp: new Date().toISOString()
        }))
      };

      // Update auto-generated tags from analysis
      if (analysisResult.truthAnalysis?.keywords) {
        const autoTags = [
          ...analysisResult.truthAnalysis.keywords,
          analysisResult.truthAnalysis.briefSectionSuggestion,
          `confidence-${Math.round(analysisResult.truthAnalysis.confidence / 10) * 10}`,
          `strategic-value-${analysisResult.truthAnalysis.strategicValue}`,
          `viral-potential-${analysisResult.truthAnalysis.viralPotential}`
        ].filter(Boolean);

        updates.tags = autoTags;
      }

      await storage.updateCapture(captureId, updates);
      
      console.log(`📊 Capture ${captureId} updated with analysis results`);

    } catch (error) {
      console.error(`Failed to update capture ${captureId} with analysis:`, error);
      // Don't throw here - analysis was successful, just storage update failed
    }
  }

  // Process capture in background (fire and forget)
  processInBackground(captureId: string): void {
    this.processCapture(captureId).catch(error => {
      console.error(`Background processing failed for capture ${captureId}:`, error);
    });
  }

  // Get processing status
  getProcessingStatus(captureId: string): 'idle' | 'processing' {
    return this.processingQueue.has(captureId) ? 'processing' : 'idle';
  }

  // Quick analysis for immediate feedback
  async quickAnalysis(content: string, title: string): Promise<{summary: string, tags: string[]}> {
    return openaiAnalysisService.quickAnalysis(content, title);
  }
}

export const captureAnalysisService = new CaptureAnalysisService();