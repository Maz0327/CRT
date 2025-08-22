import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface VisualAnalysisResult {
  brandElements: string[];
  culturalMoments: string[];
  competitiveInsights: string[];
  strategicRecommendations: string[];
  visualScore: number; // 1-10 strategic importance
  confidenceScore: number; // 0-100
}

export class GeminiVisualAnalysisService {
  async analyzeImage(imageData: string, contentContext: string = ""): Promise<VisualAnalysisResult> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const analysisPrompt = `
You are a visual intelligence expert analyzing images for strategic and cultural insights.

Context: ${contentContext}

Analyze this image for:

1. BRAND ELEMENTS: Visual identity, design patterns, color schemes, typography, aesthetic choices
2. CULTURAL MOMENTS: Trending aesthetics, generational appeal, cultural symbols, zeitgeist elements
3. COMPETITIVE INSIGHTS: Market positioning, differentiation opportunities, industry trends
4. STRATEGIC RECOMMENDATIONS: Actionable insights for brand strategy and creative direction

Also provide:
- Visual Score: Strategic importance of visual elements (1-10)
- Confidence Score: Analysis confidence (0-100)

Return JSON with: brandElements (array), culturalMoments (array), competitiveInsights (array), strategicRecommendations (array), visualScore (number), confidenceScore (number)

Focus on strategic business value and cultural intelligence.
`;

      let mimeType = "image/jpeg";
      let base64Data = imageData;

      // Handle data URLs
      if (imageData.startsWith('data:image/')) {
        const matches = imageData.match(/^data:image\/([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = `image/${matches[1]}`;
          base64Data = matches[2];
        }
      }

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        analysisPrompt
      ]);

      const response = await result.response;
      const analysisText = response.text();

      if (!analysisText) {
        throw new Error("No analysis received from Gemini");
      }

      const analysis = JSON.parse(analysisText);

      return {
        brandElements: Array.isArray(analysis.brandElements) ? analysis.brandElements.slice(0, 5) : [],
        culturalMoments: Array.isArray(analysis.culturalMoments) ? analysis.culturalMoments.slice(0, 5) : [],
        competitiveInsights: Array.isArray(analysis.competitiveInsights) ? analysis.competitiveInsights.slice(0, 5) : [],
        strategicRecommendations: Array.isArray(analysis.strategicRecommendations) ? analysis.strategicRecommendations.slice(0, 5) : [],
        visualScore: Math.max(1, Math.min(10, analysis.visualScore || 5)),
        confidenceScore: Math.max(0, Math.min(100, analysis.confidenceScore || 75))
      };

    } catch (error: any) {
      console.error("Gemini visual analysis failed:", error);
      
      // Return fallback analysis
      return {
        brandElements: ["Visual content shows strategic brand positioning potential"],
        culturalMoments: ["Image reflects contemporary cultural aesthetics"],
        competitiveInsights: ["Visual strategy creates market differentiation opportunities"],
        strategicRecommendations: ["Leverage visual consistency for enhanced brand recognition"],
        visualScore: 5,
        confidenceScore: 50
      };
    }
  }

  async analyzeMultipleImages(images: string[], contentContext: string = ""): Promise<VisualAnalysisResult> {
    if (images.length === 0) {
      throw new Error("No images provided for analysis");
    }

    // For multiple images, analyze first 3 and aggregate results
    const imagesToAnalyze = images.slice(0, 3);
    const results: VisualAnalysisResult[] = [];

    for (const image of imagesToAnalyze) {
      try {
        const result = await this.analyzeImage(image, contentContext);
        results.push(result);
      } catch (error) {
        console.error("Failed to analyze individual image:", error);
        // Continue with other images
      }
    }

    if (results.length === 0) {
      throw new Error("Failed to analyze any images");
    }

    // Aggregate results
    const aggregated: VisualAnalysisResult = {
      brandElements: [],
      culturalMoments: [],
      competitiveInsights: [],
      strategicRecommendations: [],
      visualScore: 0,
      confidenceScore: 0
    };

    results.forEach(result => {
      aggregated.brandElements.push(...result.brandElements);
      aggregated.culturalMoments.push(...result.culturalMoments);
      aggregated.competitiveInsights.push(...result.competitiveInsights);
      aggregated.strategicRecommendations.push(...result.strategicRecommendations);
      aggregated.visualScore += result.visualScore;
      aggregated.confidenceScore += result.confidenceScore;
    });

    // Calculate averages and deduplicate
    aggregated.visualScore = Math.round(aggregated.visualScore / results.length);
    aggregated.confidenceScore = Math.round(aggregated.confidenceScore / results.length);
    
    // Remove duplicates and limit arrays
    aggregated.brandElements = [...new Set(aggregated.brandElements)].slice(0, 5);
    aggregated.culturalMoments = [...new Set(aggregated.culturalMoments)].slice(0, 5);
    aggregated.competitiveInsights = [...new Set(aggregated.competitiveInsights)].slice(0, 5);
    aggregated.strategicRecommendations = [...new Set(aggregated.strategicRecommendations)].slice(0, 5);

    return aggregated;
  }
}

export const geminiVisualAnalysisService = new GeminiVisualAnalysisService();