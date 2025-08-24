import { google } from 'googleapis';
import { googleAuthService } from './google-auth';

export class GoogleVisionService {
  private vision: any;

  constructor() {
    // Use API key for Vision API (simpler than OAuth for this use case)
    this.vision = google.vision({
      version: 'v1',
      auth: process.env.GOOGLE_API_KEY
    });
  }

  async analyzeImageContent(imageBase64: string) {
    try {
      const request = {
        image: {
          content: imageBase64
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'TEXT_DETECTION', maxResults: 10 },
          { type: 'LOGO_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          { type: 'SAFE_SEARCH_DETECTION' },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'FACE_DETECTION', maxResults: 5 }
        ]
      };

      const [result] = await this.vision.images.annotate({
        requestBody: {
          requests: [request]
        }
      });

      return this.processVisionResults(result.responses[0]);
    } catch (error) {
      console.error('Google Vision API error:', error);
      throw new Error('Failed to analyze image with Google Vision');
    }
  }

  private processVisionResults(response: any) {
    const analysis = {
      brandElements: [] as any[],
      objectsDetected: [] as any[],
      textContent: [] as string[],
      dominantColors: [] as any[],
      faces: [] as any[],
      safetyAnalysis: null,
      strategicInsights: [] as string[]
    };

    // Extract brand logos
    if (response.logoAnnotations) {
      analysis.brandElements = response.logoAnnotations.map((logo: any) => ({
        brand: logo.description,
        confidence: logo.score || 0
      }));
    }

    // Extract detected objects
    if (response.localizedObjectAnnotations) {
      analysis.objectsDetected = response.localizedObjectAnnotations.map((obj: any) => ({
        object: obj.name,
        confidence: obj.score || 0
      }));
    }

    // Extract text content
    if (response.textAnnotations && response.textAnnotations.length > 0) {
      analysis.textContent = response.textAnnotations.map((text: any) => text.description);
    }

    // Extract color analysis
    if (response.imagePropertiesAnnotation?.dominantColors?.colors) {
      analysis.dominantColors = response.imagePropertiesAnnotation.dominantColors.colors
        .slice(0, 5)
        .map((color: any) => ({
          color: this.rgbToHex(color.color),
          score: color.score || 0
        }));
    }

    // Face detection for demographics
    if (response.faceAnnotations) {
      analysis.faces = response.faceAnnotations.map((face: any) => ({
        joy: face.joyLikelihood,
        sorrow: face.sorrowLikelihood,
        anger: face.angerLikelihood,
        surprise: face.surpriseLikelihood,
        confidence: face.detectionConfidence || 0
      }));
    }

    // Safety analysis
    if (response.safeSearchAnnotation) {
      const { adult, violence, racy, medical, spoof } = response.safeSearchAnnotation;
      (analysis as any).safetyAnalysis = { adult, violence, racy, medical, spoof };
    }

    // Generate strategic insights
    (analysis as any).strategicInsights = this.generateStrategicInsights(analysis);

    return analysis;
  }

  private generateStrategicInsights(analysis: any): string[] {
    const insights: string[] = [];

    // Brand presence insights
    if (analysis.brandElements.length > 0) {
      const topBrands = analysis.brandElements
        .filter((brand: any) => brand.confidence > 0.7)
        .map((brand: any) => brand.brand);
      
      if (topBrands.length > 0) {
        insights.push(`Strong brand presence detected: ${topBrands.join(', ')}`);
      }
    }

    // Object composition insights
    if (analysis.objectsDetected.length > 0) {
      const topObjects = analysis.objectsDetected
        .filter((obj: any) => obj.confidence > 0.8)
        .map((obj: any) => obj.object);
      
      if (topObjects.length > 2) {
        insights.push(`Rich visual composition with ${topObjects.length} key elements: ${topObjects.slice(0, 3).join(', ')}`);
      }
    }

    // Text content insights
    if (analysis.textContent.length > 0) {
      const hasHashtags = analysis.textContent.some((text: string) => text.includes('#'));
      const hasMentions = analysis.textContent.some((text: string) => text.includes('@'));
      
      if (hasHashtags) {
        insights.push('Social media optimized with hashtag strategy');
      }
      if (hasMentions) {
        insights.push('Influencer or brand mention strategy detected');
      }
    }

    // Color psychology insights
    if (analysis.dominantColors.length > 0) {
      const colorCount = analysis.dominantColors.length;
      if (colorCount <= 2) {
        insights.push('Minimalist color palette suggests premium or professional branding');
      } else if (colorCount >= 4) {
        insights.push('Vibrant color palette suggests dynamic or youthful brand positioning');
      }
    }

    // Emotional engagement insights
    if (analysis.faces.length > 0) {
      const emotionalFaces = analysis.faces.filter((face: any) => 
        face.joy === 'LIKELY' || face.joy === 'VERY_LIKELY'
      );
      
      if (emotionalFaces.length > 0) {
        insights.push('Positive emotional engagement detected through facial expressions');
      }
    }

    return insights;
  }

  private rgbToHex(rgb: any): string {
    const r = rgb.red || 0;
    const g = rgb.green || 0;
    const b = rgb.blue || 0;
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}

export const googleVisionService = new GoogleVisionService();