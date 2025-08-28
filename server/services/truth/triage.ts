/**
 * Triage computation for Truth Lab results
 * Analyzes result quality and determines if human review is needed
 */

export interface TriageResult {
  model_confidence: number;
  triage_label: 'none' | 'needs_review' | 'in_review' | 'resolved';
  triage_reasons: string[];
}

// Phrases that indicate vague or hedging output
const HEDGING_PHRASES = [
  'might be', 'could be', 'possibly', 'as an ai', 'cannot', 
  'it seems', 'appears to', 'likely', 'may be', 'perhaps',
  'i think', 'i believe', 'uncertain', 'unclear'
];

export function computeTriage(result: any): TriageResult {
  const reasons: string[] = [];
  let confidence = 0.0;

  // Extract key sections from result
  const fact = result?.fact || '';
  const observation = result?.observation || '';
  const insight = result?.insight || '';
  const humanTruth = result?.human_truth || '';
  const culturalMoment = result?.cultural_moment || '';
  const evidence = result?.evidence || [];

  // Base confidence calculation
  confidence += getSectionScore(fact, 'fact');
  confidence += getSectionScore(observation, 'observation');
  confidence += getSectionScore(insight, 'insight');
  confidence += getSectionScore(humanTruth, 'human_truth');
  confidence += getSectionScore(culturalMoment, 'cultural_moment');

  // Evidence bonus
  if (evidence.length >= 2) {
    confidence += 0.15;
  } else if (evidence.length === 1) {
    confidence += 0.08;
  }

  // Check for missing critical sections
  const criticalSections = [fact, observation, insight, humanTruth];
  const missingSections = criticalSections.filter(section => 
    !section || section.trim().length < 20
  );

  if (missingSections.length >= 2) {
    reasons.push('missing_sections');
  }

  // Check for hedging language
  const allText = [fact, observation, insight, humanTruth, culturalMoment].join(' ').toLowerCase();
  const hasHedging = HEDGING_PHRASES.some(phrase => allText.includes(phrase));
  
  if (hasHedging) {
    reasons.push('hedging_language');
    confidence -= 0.1; // Penalty for vague language
  }

  // Clamp confidence to [0.0, 1.0]
  confidence = Math.max(0.0, Math.min(1.0, confidence));

  // Determine triage label
  let triage_label: TriageResult['triage_label'] = 'none';
  
  if (confidence < 0.60) {
    triage_label = 'needs_review';
    reasons.push('low_confidence');
  } else if (reasons.length > 0) {
    triage_label = 'needs_review';
  }

  return {
    model_confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
    triage_label,
    triage_reasons: [...new Set(reasons)] // Remove duplicates
  };
}

function getSectionScore(section: string, type: string): number {
  if (!section || typeof section !== 'string') return 0;
  
  const length = section.trim().length;
  
  // Base scores by section type
  const baseScores = {
    fact: 0.15,
    observation: 0.15,
    insight: 0.20,
    human_truth: 0.25,
    cultural_moment: 0.15
  };

  const baseScore = baseScores[type as keyof typeof baseScores] || 0.1;
  
  // Length penalties/bonuses
  if (length < 10) return 0; // Too short
  if (length < 30) return baseScore * 0.5; // Short but present
  if (length > 200) return baseScore * 1.2; // Good length bonus
  
  return baseScore;
}