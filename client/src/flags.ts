// Feature flags for Content Radar application
export const FEATURES = {
  // Google export functionality
  BRIEF_EXPORT: true,
  GOOGLE_SLIDES_EXPORT: true,
  GOOGLE_DRIVE_INTEGRATION: true,
  
  // AI features
  FAST_MEDIA_ANALYSIS: true,
  DEEP_MEDIA_ANALYSIS: true,
  AI_ARRANGE_BLOCKS: false,
  AUTO_TAG_FROM_ANALYSIS: false,
  
  // Advanced features
  REAL_TIME_COLLABORATION: false,
  CHROME_EXTENSION: true,
  TRUTH_ANALYSIS_V2: false,
  
  // System features
  BACKGROUND_JOBS: true,
  SYSTEM_MONITORING: true,
  ERROR_TRACKING: true,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}

export function getEnabledFeatures(): FeatureFlag[] {
  return Object.entries(FEATURES)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag as FeatureFlag);
}

export function getDisabledFeatures(): FeatureFlag[] {
  return Object.entries(FEATURES)
    .filter(([, enabled]) => !enabled)
    .map(([flag]) => flag as FeatureFlag);
}

// Backward-compat alias
export const FLAGS = FEATURES;