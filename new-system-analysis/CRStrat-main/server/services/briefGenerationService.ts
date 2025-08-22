import { EnhancedAIAnalyzer } from './enhancedAIAnalyzer';
import { TruthAnalysisFramework, CulturalSignal } from './truthAnalysisFramework';

/**
 * Brief Generation Service
 * Creates professional strategic briefs following Jimmy John's format with flexible user copy control
 */

export interface BriefTemplate {
  id: string;
  name: string;
  structure: BriefSection[];
  userCopyControl: 'full' | 'hybrid' | 'assisted';
}

export interface BriefSection {
  id: string;
  title: string;
  type: 'header' | 'analysis' | 'data' | 'recommendations' | 'user_content';
  required: boolean;
  aiGenerated: boolean;
  userEditable: boolean;
}

export interface StrategicBrief {
  id: string;
  title: string;
  template: string;
  sections: BriefSectionContent[];
  metadata: BriefMetadata;
  status: 'draft' | 'review' | 'final';
  createdAt: Date;
  updatedAt: Date;
}

export interface BriefSectionContent {
  sectionId: string;
  title: string;
  content: string;
  aiGenerated: boolean;
  userModified: boolean;
  sources: string[];
}

export interface BriefMetadata {
  author: string;
  project: string;
  platforms: string[];
  keywords: string[];
  timeRange: string;
  signalCount: number;
  culturalMoments: number;
  confidence: number;
}

export class BriefGenerationService {
  private aiAnalyzer: EnhancedAIAnalyzer;
  private truthFramework: TruthAnalysisFramework;

  // Jimmy John's style brief templates
  private templates: BriefTemplate[] = [
    {
      id: 'jimmyjohns_strategic',
      name: 'Jimmy John\'s Strategic Brief',
      userCopyControl: 'hybrid',
      structure: [
        { id: 'executive_summary', title: 'Executive Summary', type: 'analysis', required: true, aiGenerated: true, userEditable: true },
        { id: 'cultural_intelligence', title: 'Cultural Intelligence', type: 'analysis', required: true, aiGenerated: true, userEditable: true },
        { id: 'platform_signals', title: 'Platform Signals', type: 'data', required: true, aiGenerated: true, userEditable: false },
        { id: 'strategic_opportunities', title: 'Strategic Opportunities', type: 'analysis', required: true, aiGenerated: true, userEditable: true },
        { id: 'recommended_actions', title: 'Recommended Actions', type: 'recommendations', required: true, aiGenerated: true, userEditable: true },
        { id: 'user_insights', title: 'Additional Insights', type: 'user_content', required: false, aiGenerated: false, userEditable: true }
      ]
    },
    {
      id: 'rapid_intelligence',
      name: 'Rapid Intelligence Brief',
      userCopyControl: 'full',
      structure: [
        { id: 'key_findings', title: 'Key Findings', type: 'analysis', required: true, aiGenerated: true, userEditable: true },
        { id: 'trend_analysis', title: 'Trend Analysis', type: 'data', required: true, aiGenerated: true, userEditable: false },
        { id: 'immediate_actions', title: 'Immediate Actions', type: 'recommendations', required: true, aiGenerated: true, userEditable: true }
      ]
    },
    {
      id: 'comprehensive_analysis',
      name: 'Comprehensive Cultural Analysis',
      userCopyControl: 'assisted',
      structure: [
        { id: 'cultural_overview', title: 'Cultural Overview', type: 'header', required: true, aiGenerated: true, userEditable: true },
        { id: 'truth_analysis', title: 'Truth Analysis Framework', type: 'analysis', required: true, aiGenerated: true, userEditable: false },
        { id: 'cross_platform_correlation', title: 'Cross-Platform Correlation', type: 'analysis', required: true, aiGenerated: true, userEditable: true },
        { id: 'emerging_narratives', title: 'Emerging Narratives', type: 'analysis', required: true, aiGenerated: true, userEditable: true },
        { id: 'strategic_positioning', title: 'Strategic Positioning', type: 'recommendations', required: true, aiGenerated: true, userEditable: true },
        { id: 'client_customization', title: 'Client-Specific Recommendations', type: 'user_content', required: false, aiGenerated: false, userEditable: true }
      ]
    }
  ];

  constructor() {
    this.aiAnalyzer = new EnhancedAIAnalyzer();
    this.truthFramework = new TruthAnalysisFramework();
  }

  /**
   * Generate strategic brief from signals and cultural analysis
   */
  async generateBrief(
    templateId: string,
    signals: CulturalSignal[],
    culturalMoments: any[],
    trends: any[],
    metadata: Partial<BriefMetadata>
  ): Promise<StrategicBrief> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const briefId = `brief_${Date.now()}`;
    const sections: BriefSectionContent[] = [];

    console.log(`[Brief Generation] Creating ${template.name} with ${signals.length} signals`);

    // Generate each section based on template structure
    for (const sectionDef of template.structure) {
      if (sectionDef.aiGenerated) {
        try {
          const content = await this.generateSectionContent(
            sectionDef,
            signals,
            culturalMoments,
            trends,
            metadata
          );

          sections.push({
            sectionId: sectionDef.id,
            title: sectionDef.title,
            content,
            aiGenerated: true,
            userModified: false,
            sources: this.extractSources(signals)
          });
        } catch (error) {
          console.error(`Error generating section ${sectionDef.id}:`, error);
          sections.push({
            sectionId: sectionDef.id,
            title: sectionDef.title,
            content: `Section generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            aiGenerated: false,
            userModified: false,
            sources: []
          });
        }
      } else {
        // User content section - placeholder
        sections.push({
          sectionId: sectionDef.id,
          title: sectionDef.title,
          content: `[User Content Area - Add your insights here]`,
          aiGenerated: false,
          userModified: false,
          sources: []
        });
      }
    }

    return {
      id: briefId,
      title: `Strategic Brief - ${metadata.project || 'Intelligence Analysis'}`,
      template: templateId,
      sections,
      metadata: {
        author: metadata.author || 'Strategic Intelligence System',
        project: metadata.project || 'Untitled Project',
        platforms: metadata.platforms || [],
        keywords: metadata.keywords || [],
        timeRange: metadata.timeRange || '24h',
        signalCount: signals.length,
        culturalMoments: culturalMoments.length,
        confidence: this.calculateOverallConfidence(signals)
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate content for specific brief section
   */
  private async generateSectionContent(
    section: BriefSection,
    signals: CulturalSignal[],
    culturalMoments: any[],
    trends: any[],
    metadata: Partial<BriefMetadata>
  ): Promise<string> {
    switch (section.id) {
      case 'executive_summary':
        return this.generateExecutiveSummary(signals, culturalMoments, trends);
      
      case 'cultural_intelligence':
        return this.generateCulturalIntelligence(culturalMoments, signals);
      
      case 'platform_signals':
        return this.generatePlatformSignals(signals);
      
      case 'strategic_opportunities':
        return this.generateStrategicOpportunities(trends, culturalMoments);
      
      case 'recommended_actions':
        return this.generateRecommendedActions(trends, signals);
      
      case 'truth_analysis':
        return this.generateTruthAnalysis(signals);
      
      case 'cross_platform_correlation':
        return this.generateCrossPlatformAnalysis(culturalMoments);
      
      case 'emerging_narratives':
        return this.generateEmergingNarratives(trends, signals);
      
      case 'strategic_positioning':
        return this.generateStrategicPositioning(culturalMoments, trends);
      
      default:
        return `Content for ${section.title} section`;
    }
  }

  /**
   * Generate Executive Summary section
   */
  private async generateExecutiveSummary(
    signals: CulturalSignal[],
    culturalMoments: any[],
    trends: any[]
  ): Promise<string> {
    const topSignals = signals.slice(0, 3);
    const keyMoments = culturalMoments.slice(0, 2);
    
    const prompt = `
Generate a professional executive summary for a strategic intelligence brief:

TOP SIGNALS:
${topSignals.map(s => `• ${s.platform}: ${s.truthAnalysis.humanTruth}`).join('\n')}

CULTURAL MOMENTS:
${keyMoments.map(m => `• ${m.theme}: ${m.opportunity}`).join('\n')}

EMERGING TRENDS:
${trends.slice(0, 3).map(t => `• ${t.trend} (${t.confidence}% confidence)`).join('\n')}

Write a concise executive summary (2-3 paragraphs) that:
1. Highlights the most significant cultural developments
2. Identifies key strategic opportunities
3. Provides clear direction for action

Use professional, strategic language suitable for executive leadership.
`;

    const result = await this.aiAnalyzer.analyzeWithGemini(prompt, { type: 'executive_summary' });
    return result.analysis;
  }

  /**
   * Generate Cultural Intelligence section
   */
  private async generateCulturalIntelligence(
    culturalMoments: any[],
    signals: CulturalSignal[]
  ): Promise<string> {
    const prompt = `
Analyze cultural intelligence from these signals and moments:

CULTURAL MOMENTS:
${culturalMoments.map(m => `• ${m.theme}: ${m.opportunity} (Strength: ${m.strength}%)`).join('\n')}

HUMAN TRUTHS FROM SIGNALS:
${signals.slice(0, 5).map(s => `• ${s.platform}: ${s.truthAnalysis.humanTruth}`).join('\n')}

Generate a cultural intelligence analysis that includes:
1. Dominant cultural themes and their implications
2. Underlying human motivations and desires
3. Cultural tensions and opportunities
4. Brand positioning implications

Focus on actionable cultural insights for strategic decision-making.
`;

    const result = await this.aiAnalyzer.analyzeWithGemini(prompt, { type: 'cultural_intelligence' });
    return result.analysis;
  }

  /**
   * Generate Platform Signals section
   */
  private generatePlatformSignals(signals: CulturalSignal[]): string {
    const platformGroups = signals.reduce((acc, signal) => {
      if (!acc[signal.platform]) acc[signal.platform] = [];
      acc[signal.platform].push(signal);
      return acc;
    }, {} as Record<string, CulturalSignal[]>);

    let content = '## Platform Signal Analysis\n\n';

    for (const [platform, platformSignals] of Object.entries(platformGroups)) {
      const totalEngagement = platformSignals.reduce((sum, s) => sum + s.engagement, 0);
      const avgConfidence = platformSignals.reduce((sum, s) => sum + s.truthAnalysis.confidence, 0) / platformSignals.length;

      content += `### ${platform.toUpperCase()}\n`;
      content += `- **Signals Detected:** ${platformSignals.length}\n`;
      content += `- **Total Engagement:** ${totalEngagement.toLocaleString()}\n`;
      content += `- **Average Confidence:** ${avgConfidence.toFixed(1)}%\n\n`;

      content += '**Key Signals:**\n';
      platformSignals.slice(0, 3).forEach((signal, i) => {
        content += `${i + 1}. **${signal.truthAnalysis.insight}**\n`;
        content += `   - Human Truth: ${signal.truthAnalysis.humanTruth}\n`;
        content += `   - Engagement: ${signal.engagement.toLocaleString()}\n\n`;
      });
    }

    return content;
  }

  /**
   * Generate Strategic Opportunities section
   */
  private async generateStrategicOpportunities(
    trends: any[],
    culturalMoments: any[]
  ): Promise<string> {
    const prompt = `
Identify strategic opportunities based on these trends and cultural moments:

EMERGING TRENDS:
${trends.map(t => `• ${t.trend}: ${t.evidence} (Confidence: ${t.confidence}%)`).join('\n')}

CULTURAL OPPORTUNITIES:
${culturalMoments.map(m => `• ${m.theme}: ${m.opportunity}`).join('\n')}

Generate strategic opportunities analysis including:
1. Immediate opportunities (0-3 months)
2. Medium-term positioning (3-12 months)  
3. Long-term strategic moves (12+ months)
4. Risk considerations and mitigation strategies

Focus on actionable opportunities with clear business value.
`;

    const result = await this.aiAnalyzer.analyzeWithGemini(prompt, { type: 'strategic_opportunities' });
    return result.analysis;
  }

  /**
   * Generate Recommended Actions section
   */
  private async generateRecommendedActions(
    trends: any[],
    signals: CulturalSignal[]
  ): Promise<string> {
    const highConfidenceSignals = signals.filter(s => s.truthAnalysis.confidence > 80);
    
    const prompt = `
Generate specific recommended actions based on this intelligence:

HIGH-CONFIDENCE SIGNALS:
${highConfidenceSignals.slice(0, 5).map(s => `• ${s.platform}: ${s.truthAnalysis.insight} (${s.truthAnalysis.confidence}% confidence)`).join('\n')}

VALIDATED TRENDS:
${trends.filter(t => t.confidence > 75).map(t => `• ${t.trend}: ${t.strategic_value} value`).join('\n')}

Provide specific, actionable recommendations in these categories:
1. **Immediate Actions** (Next 30 days)
2. **Content Strategy** (Platform-specific recommendations)
3. **Brand Positioning** (Cultural alignment opportunities)
4. **Measurement & Monitoring** (KPIs and success metrics)

Each recommendation should include timeline, resources needed, and expected outcomes.
`;

    const result = await this.aiAnalyzer.analyzeWithGemini(prompt, { type: 'recommended_actions' });
    return result.analysis;
  }

  /**
   * Generate Truth Analysis section
   */
  private generateTruthAnalysis(signals: CulturalSignal[]): string {
    let content = '## Truth Analysis Framework Results\n\n';
    
    const categories = ['ai_ml', 'business', 'social_trend', 'technology'];
    
    for (const category of categories) {
      const categorySignals = signals.filter(s => s.category === category);
      if (categorySignals.length === 0) continue;
      
      content += `### ${category.toUpperCase().replace('_', ' ')}\n\n`;
      
      categorySignals.slice(0, 2).forEach((signal, i) => {
        content += `**Signal ${i + 1}:**\n`;
        content += `- **Fact:** ${signal.truthAnalysis.fact}\n`;
        content += `- **Observation:** ${signal.truthAnalysis.observation}\n`;
        content += `- **Insight:** ${signal.truthAnalysis.insight}\n`;
        content += `- **Human Truth:** ${signal.truthAnalysis.humanTruth}\n`;
        content += `- **Confidence:** ${signal.truthAnalysis.confidence}%\n\n`;
      });
    }
    
    return content;
  }

  /**
   * Generate Cross-Platform Analysis section
   */
  private async generateCrossPlatformAnalysis(culturalMoments: any[]): Promise<string> {
    const prompt = `
Analyze cross-platform correlations and patterns:

CULTURAL MOMENTS:
${culturalMoments.map(m => `• Theme: ${m.theme}\n  Platforms: ${m.platforms.join(', ')}\n  Strength: ${m.strength}%`).join('\n\n')}

Generate analysis covering:
1. Cross-platform narrative consistency
2. Platform-specific cultural adaptations
3. Amplification patterns across channels
4. Timing and sequence analysis

Focus on how cultural moments spread and evolve across different platforms.
`;

    const result = await this.aiAnalyzer.analyzeWithGemini(prompt, { type: 'cross_platform_analysis' });
    return result.analysis;
  }

  /**
   * Generate Emerging Narratives section
   */
  private async generateEmergingNarratives(trends: any[], signals: CulturalSignal[]): Promise<string> {
    const narrativeSignals = signals.filter(s => s.emergingTrend);
    
    const prompt = `
Identify emerging narratives from these trends and signals:

EMERGING TRENDS:
${trends.map(t => `• ${t.trend}: ${t.evidence}`).join('\n')}

NARRATIVE-DRIVING SIGNALS:
${narrativeSignals.slice(0, 5).map(s => `• ${s.platform}: ${s.truthAnalysis.humanTruth}`).join('\n')}

Analyze emerging narratives including:
1. Dominant story themes
2. Counter-narratives and tensions
3. Narrative evolution predictions
4. Brand narrative opportunities

Focus on how these narratives could shape future cultural conversations.
`;

    const result = await this.aiAnalyzer.analyzeWithGemini(prompt, { type: 'emerging_narratives' });
    return result.analysis;
  }

  /**
   * Generate Strategic Positioning section
   */
  private async generateStrategicPositioning(culturalMoments: any[], trends: any[]): Promise<string> {
    const prompt = `
Develop strategic positioning recommendations based on:

CULTURAL MOMENTS:
${culturalMoments.map(m => `• ${m.theme}: ${m.opportunity}`).join('\n')}

STRATEGIC TRENDS:
${trends.filter(t => t.strategic_value === 'high').map(t => `• ${t.trend}: ${t.timeframe}`).join('\n')}

Generate positioning strategy including:
1. Cultural alignment opportunities
2. Differentiation strategies
3. Timing considerations
4. Risk and reward analysis

Focus on how brands can authentically position themselves within these cultural moments.
`;

    const result = await this.aiAnalyzer.analyzeWithGemini(prompt, { type: 'strategic_positioning' });
    return result.analysis;
  }

  /**
   * Get available templates
   */
  getTemplates(): BriefTemplate[] {
    return this.templates;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): BriefTemplate | undefined {
    return this.templates.find(t => t.id === templateId);
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(signals: CulturalSignal[]): number {
    if (signals.length === 0) return 0;
    
    const totalConfidence = signals.reduce((sum, s) => sum + s.truthAnalysis.confidence, 0);
    return Math.round(totalConfidence / signals.length);
  }

  /**
   * Extract sources from signals
   */
  private extractSources(signals: CulturalSignal[]): string[] {
    const sources = new Set<string>();
    signals.forEach(signal => {
      signal.truthAnalysis.sources.forEach(source => sources.add(source));
    });
    return Array.from(sources);
  }

  /**
   * Update brief section content (user editing)
   */
  async updateBriefSection(
    briefId: string, 
    sectionId: string, 
    newContent: string, 
    userId: string
  ): Promise<boolean> {
    // This would update the brief in storage
    console.log(`[Brief Generation] User ${userId} updated section ${sectionId} in brief ${briefId}`);
    return true;
  }

  /**
   * Export brief to different formats
   */
  async exportBrief(brief: StrategicBrief, format: 'markdown' | 'pdf' | 'docx'): Promise<string> {
    switch (format) {
      case 'markdown':
        return this.exportToMarkdown(brief);
      case 'pdf':
        // Would integrate with PDF generation library
        return 'PDF export not yet implemented';
      case 'docx':
        // Would integrate with DOCX generation library
        return 'DOCX export not yet implemented';
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export brief to Markdown format
   */
  private exportToMarkdown(brief: StrategicBrief): string {
    let markdown = `# ${brief.title}\n\n`;
    
    // Metadata
    markdown += `**Project:** ${brief.metadata.project}\n`;
    markdown += `**Author:** ${brief.metadata.author}\n`;
    markdown += `**Date:** ${brief.createdAt.toLocaleDateString()}\n`;
    markdown += `**Platforms:** ${brief.metadata.platforms.join(', ')}\n`;
    markdown += `**Signal Count:** ${brief.metadata.signalCount}\n`;
    markdown += `**Confidence:** ${brief.metadata.confidence}%\n\n`;
    
    markdown += '---\n\n';
    
    // Sections
    brief.sections.forEach(section => {
      markdown += `## ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
      
      if (section.sources.length > 0) {
        markdown += `*Sources: ${section.sources.join(', ')}*\n\n`;
      }
    });
    
    return markdown;
  }
}