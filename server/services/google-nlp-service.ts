import { google } from 'googleapis';

export class GoogleNLPService {
  private language: any;

  constructor() {
    this.language = google.language({
      version: 'v1',
      auth: process.env.GOOGLE_API_KEY
    });
  }

  async analyzeTextContent(content: string) {
    try {
      const document = {
        content: content,
        type: 'PLAIN_TEXT'
      };

      // Run multiple analysis types in parallel
      const [
        sentimentResult,
        entityResult,
        syntaxResult
      ] = await Promise.all([
        this.language.documents.analyzeSentiment({
          requestBody: { document }
        }),
        this.language.documents.analyzeEntities({
          requestBody: { 
            document,
            encodingType: 'UTF8'
          }
        }),
        this.language.documents.analyzeSyntax({
          requestBody: { 
            document,
            encodingType: 'UTF8'
          }
        })
      ]);

      return this.processNLPResults({
        sentiment: sentimentResult.data,
        entities: entityResult.data,
        syntax: syntaxResult.data
      });
    } catch (error) {
      console.error('Google NLP API error:', error);
      throw new Error('Failed to analyze text with Google NLP');
    }
  }

  private processNLPResults(results: any) {
    const analysis = {
      sentiment: this.processSentiment(results.sentiment),
      entities: this.processEntities(results.entities),
      keyPhrases: this.processKeyPhrases(results.syntax),
      strategicInsights: [] as string[]
    };

    analysis.strategicInsights = this.generateNLPInsights(analysis);
    return analysis;
  }

  private processSentiment(sentimentData: any) {
    const sentiment = sentimentData.documentSentiment;
    
    return {
      score: sentiment.score, // -1 to 1 (negative to positive)
      magnitude: sentiment.magnitude, // 0 to infinity (emotional intensity)
      label: this.getSentimentLabel(sentiment.score),
      confidence: Math.abs(sentiment.score) // How confident we are in the sentiment
    };
  }

  private processEntities(entitiesData: any) {
    if (!entitiesData.entities) return [];

    return entitiesData.entities
      .filter((entity: any) => entity.salience > 0.1) // Only significant entities
      .map((entity: any) => ({
        name: entity.name,
        type: entity.type,
        salience: entity.salience, // Importance score 0-1
        mentions: entity.mentions?.length || 0,
        sentiment: entity.sentiment ? {
          score: entity.sentiment.score,
          magnitude: entity.sentiment.magnitude
        } : null
      }))
      .sort((a: any, b: any) => b.salience - a.salience) // Sort by importance
      .slice(0, 10); // Top 10 entities
  }

  private processKeyPhrases(syntaxData: any) {
    if (!syntaxData.tokens) return [];

    // Extract noun phrases and important adjectives
    const keyPhrases = syntaxData.tokens
      .filter((token: any) => 
        token.partOfSpeech.tag === 'NOUN' || 
        token.partOfSpeech.tag === 'ADJ' ||
        token.partOfSpeech.tag === 'VERB'
      )
      .map((token: any) => ({
        word: token.text.content,
        pos: token.partOfSpeech.tag,
        lemma: token.lemma
      }))
      .slice(0, 20);

    return keyPhrases;
  }

  private generateNLPInsights(analysis: any): string[] {
    const insights: string[] = [];

    // Sentiment insights
    if (analysis.sentiment.magnitude > 0.6) {
      if (analysis.sentiment.score > 0.3) {
        insights.push('Strong positive sentiment suggests high engagement potential');
      } else if (analysis.sentiment.score < -0.3) {
        insights.push('Strong negative sentiment indicates controversial or crisis content');
      } else {
        insights.push('Mixed emotions detected - content may spark debate or discussion');
      }
    }

    // Entity insights
    const topEntities = analysis.entities.slice(0, 3);
    if (topEntities.length > 0) {
      const entityTypes = topEntities.map((e: any) => e.type).filter((type: string, index: number, arr: string[]) => arr.indexOf(type) === index);
      
      if (entityTypes.includes('PERSON')) {
        insights.push('Personal branding or influencer content detected');
      }
      if (entityTypes.includes('ORGANIZATION')) {
        insights.push('Corporate or brand-focused content identified');
      }
      if (entityTypes.includes('LOCATION')) {
        insights.push('Geographic or location-based relevance detected');
      }
    }

    // High-salience entity insights
    const highSalienceEntities = analysis.entities.filter((e: any) => e.salience > 0.5);
    if (highSalienceEntities.length > 0) {
      insights.push(`Focused content with ${highSalienceEntities.length} primary topics: ${highSalienceEntities.map((e: any) => e.name).join(', ')}`);
    }

    // Keyword density insights
    const nouns = analysis.keyPhrases.filter((phrase: any) => phrase.pos === 'NOUN');
    if (nouns.length > 10) {
      insights.push('Content-rich with multiple topics and concepts');
    } else if (nouns.length < 5) {
      insights.push('Focused, specific content with clear messaging');
    }

    return insights;
  }

  private getSentimentLabel(score: number): string {
    if (score > 0.6) return 'Very Positive';
    if (score > 0.2) return 'Positive';
    if (score > -0.2) return 'Neutral';
    if (score > -0.6) return 'Negative';
    return 'Very Negative';
  }
}

export const googleNLPService = new GoogleNLPService();