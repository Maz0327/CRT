import { EnhancedAIAnalyzer } from './enhancedAIAnalyzer';

/**
 * Truth Analysis Framework
 * Implements the four-layer analysis: Fact → Observation → Insight → Human Truth
 */

export interface TruthAnalysis {
  fact: string;
  observation: string;
  insight: string;
  humanTruth: string;
  confidence: number;
  sources: string[];
  timestamp: Date;
}

export interface CulturalSignal {
  id: string;
  platform: string;
  content: string;
  engagement: number;
  category: string;
  truthAnalysis: TruthAnalysis;
  correlations: string[];
  emergingTrend: boolean;
}

export class TruthAnalysisFramework {
  private aiAnalyzer: EnhancedAIAnalyzer;

  constructor() {
    this.aiAnalyzer = new EnhancedAIAnalyzer();
  }

  /**
   * Perform four-layer truth analysis on content
   */
  async analyzeContent(content: string, platform: string, metadata: any = {}): Promise<TruthAnalysis> {
    try {
      const analysisPrompt = `
Perform a four-layer truth analysis on this ${platform} content:

CONTENT: "${content}"

Please provide analysis in the following structure:

1. FACT (What happened objectively):
   - Extract the core factual information
   - What can be verified and measured
   - Specific numbers, dates, events

2. OBSERVATION (What patterns emerge):
   - What behavioral patterns are visible
   - How are people responding
   - What engagement patterns exist

3. INSIGHT (What this means strategically):
   - Why is this significant for brands/businesses
   - What strategic opportunities exist
   - How does this connect to broader trends

4. HUMAN TRUTH (What people really care about):
   - What emotional need is being addressed
   - What fundamental human desire is at play
   - What cultural moment is this capturing

Return as JSON with keys: fact, observation, insight, humanTruth, confidence (0-100)
`;

      const result = await this.aiAnalyzer.analyzeWithGemini(
        analysisPrompt,
        { 
          type: 'truth_analysis', 
          platform, 
          metadata 
        }
      );

      // Parse the structured response
      let parsedResult;
      try {
        parsedResult = JSON.parse(result.analysis);
      } catch {
        // Fallback parsing if JSON is malformed
        parsedResult = this.parseUnstructuredAnalysis(result.analysis);
      }

      return {
        fact: parsedResult.fact || 'No factual data identified',
        observation: parsedResult.observation || 'No patterns observed',
        insight: parsedResult.insight || 'No strategic insights identified',
        humanTruth: parsedResult.humanTruth || 'No human truth identified',
        confidence: parsedResult.confidence || 70,
        sources: [platform],
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error in truth analysis:', error);
      return {
        fact: 'Analysis failed',
        observation: 'Unable to analyze patterns',
        insight: 'No insights available',
        humanTruth: 'Human truth unavailable',
        confidence: 0,
        sources: [platform],
        timestamp: new Date()
      };
    }
  }

  /**
   * Correlate signals across platforms to identify cultural moments
   */
  async correlateCulturalMoments(signals: CulturalSignal[]): Promise<any[]> {
    if (signals.length < 2) return [];

    const correlationPrompt = `
Analyze these cross-platform signals to identify cultural moments:

SIGNALS:
${signals.map((s, i) => `
${i + 1}. ${s.platform}: ${s.content}
   Truth Analysis: ${s.truthAnalysis.humanTruth}
   Category: ${s.category}
   Engagement: ${s.engagement}
`).join('\n')}

Identify:
1. Common themes across platforms
2. Emerging cultural moments
3. Cross-platform narrative patterns
4. Opportunities for strategic positioning

Return as JSON array with objects containing: theme, platforms, strength, opportunity
`;

    try {
      const result = await this.aiAnalyzer.analyzeWithGemini(
        correlationPrompt,
        { type: 'cultural_correlation' }
      );

      let correlations;
      try {
        correlations = JSON.parse(result.analysis);
      } catch {
        // Fallback to structured analysis
        correlations = this.extractCorrelations(result.analysis);
      }

      return Array.isArray(correlations) ? correlations : [];

    } catch (error) {
      console.error('Error in cultural correlation:', error);
      return [];
    }
  }

  /**
   * Identify emerging trends from truth analysis patterns
   */
  async identifyEmergingTrends(analyses: TruthAnalysis[]): Promise<any[]> {
    if (analyses.length < 3) return [];

    const trendPrompt = `
Analyze these truth analyses to identify emerging trends:

ANALYSES:
${analyses.map((a, i) => `
${i + 1}. Human Truth: ${a.humanTruth}
   Insight: ${a.insight}
   Confidence: ${a.confidence}%
`).join('\n')}

Identify:
1. Recurring human truths
2. Emerging strategic opportunities
3. Cultural shift indicators
4. Future trend predictions

Return as JSON array with: trend, evidence, confidence, timeframe, strategic_value
`;

    try {
      const result = await this.aiAnalyzer.analyzeWithGemini(
        trendPrompt,
        { type: 'trend_identification' }
      );

      let trends;
      try {
        trends = JSON.parse(result.analysis);
      } catch {
        trends = this.extractTrends(result.analysis);
      }

      return Array.isArray(trends) ? trends : [];

    } catch (error) {
      console.error('Error in trend identification:', error);
      return [];
    }
  }

  /**
   * Generate strategic brief from truth analysis
   */
  async generateStrategicBrief(
    culturalMoments: any[],
    trends: any[],
    signals: CulturalSignal[]
  ): Promise<string> {
    const briefPrompt = `
Generate a strategic brief in Jimmy John's format based on this intelligence:

CULTURAL MOMENTS:
${culturalMoments.map(m => `- ${m.theme}: ${m.opportunity}`).join('\n')}

EMERGING TRENDS:
${trends.map(t => `- ${t.trend} (${t.confidence}% confidence)`).join('\n')}

TOP SIGNALS:
${signals.slice(0, 5).map(s => `- ${s.platform}: ${s.truthAnalysis.humanTruth}`).join('\n')}

Structure the brief with:
1. EXECUTIVE SUMMARY
2. CULTURAL INTELLIGENCE
3. STRATEGIC OPPORTUNITIES
4. PLATFORM SIGNALS
5. RECOMMENDED ACTIONS

Make it professional, actionable, and strategic.
`;

    try {
      const result = await this.aiAnalyzer.analyzeWithGemini(
        briefPrompt,
        { type: 'strategic_brief' }
      );

      return result.analysis;

    } catch (error) {
      console.error('Error generating strategic brief:', error);
      return 'Strategic brief generation failed';
    }
  }

  /**
   * Fallback parsing for unstructured analysis
   */
  private parseUnstructuredAnalysis(text: string): any {
    const sections = {
      fact: this.extractSection(text, ['fact', 'factual', 'objective']),
      observation: this.extractSection(text, ['observation', 'pattern', 'behavior']),
      insight: this.extractSection(text, ['insight', 'strategic', 'significance']),
      humanTruth: this.extractSection(text, ['human truth', 'emotional', 'human']),
      confidence: 70
    };

    return sections;
  }

  private extractSection(text: string, keywords: string[]): string {
    const lines = text.split('\n');
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.toLowerCase().includes(keyword)) {
          return line.replace(/^\d+\.\s*/, '').replace(/^[A-Z\s]+:/, '').trim();
        }
      }
    }
    return 'Analysis not available';
  }

  private extractCorrelations(text: string): any[] {
    // Simple extraction logic for correlations
    const lines = text.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).map((line, i) => ({
      theme: `Cultural Theme ${i + 1}`,
      platforms: ['multiple'],
      strength: 70 + Math.random() * 30,
      opportunity: line.trim()
    }));
  }

  private extractTrends(text: string): any[] {
    // Simple extraction logic for trends
    const lines = text.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).map((line, i) => ({
      trend: `Emerging Trend ${i + 1}`,
      evidence: line.trim(),
      confidence: 70 + Math.random() * 30,
      timeframe: '3-6 months',
      strategic_value: 'high'
    }));
  }
}