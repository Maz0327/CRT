// Analysis Tag Mapping Service
// Converts AI analysis labels to normalized, searchable tags

export function toTags(labels: { name: string }[], limit = 8): string[] {
  if (!Array.isArray(labels)) return [];
  
  const raw = labels
    .map(l => l.name?.toLowerCase()?.trim())
    .filter(Boolean) // Remove empty/undefined values
    .slice(0, limit * 2); // Get more to filter from
  
  // Map to kebab-case and apply synonyms
  const mapped = raw
    .map(s => s.replace(/\s+/g, "-")) // Convert spaces to kebab-case
    .map(applyTagSynonyms) // Apply common mappings
    .filter(tag => tag.length > 1 && tag.length < 25) // Reasonable length
    .filter(tag => !EXCLUDED_TAGS.includes(tag)); // Filter noise
  
  // Deduplicate and return limited set
  const dedup = Array.from(new Set(mapped));
  return dedup.slice(0, limit);
}

// Common tag synonym mappings
function applyTagSynonyms(tag: string): string {
  const synonymMap: Record<string, string> = {
    // Social platforms
    'x-(twitter)': 'twitter',
    'x-formerly-twitter': 'twitter',
    'twitter/x': 'twitter',
    
    // Content types  
    'social-media': 'social',
    'social-media-post': 'social',
    'social-network': 'social',
    'screenshot': 'screen',
    'text-image': 'text',
    'web-page': 'web',
    'website': 'web',
    
    // Brands/logos
    'brand-logo': 'logo',
    'company-logo': 'logo',
    'brand-mark': 'logo',
    
    // UI elements
    'user-interface': 'ui',
    'interface': 'ui',
    'button': 'ui',
    'menu': 'ui',
    
    // Generic improvements
    'human-face': 'person',
    'person-face': 'person',
    'facial-features': 'person',
  };
  
  return synonymMap[tag] || tag;
}

// Tags to exclude (too generic or noisy)
const EXCLUDED_TAGS = [
  'image',
  'photo',
  'picture',
  'content',
  'media',
  'digital',
  'online',
  'internet',
  'computer',
  'device',
  'screen',
  'display',
  'visual',
  'graphic',
  'design',
  'layout',
  'interface',
  'element',
  'object',
  'item',
  'thing',
  'stuff',
  'data',
  'information',
  'text-or-image', 
  'generic',
  'standard',
  'basic',
  'simple',
  'common',
];

// Validate tag quality
export function isValidTag(tag: string): boolean {
  if (!tag || typeof tag !== 'string') return false;
  if (tag.length < 2 || tag.length > 25) return false;
  if (EXCLUDED_TAGS.includes(tag.toLowerCase())) return false;
  if (/^\d+$/.test(tag)) return false; // No pure numbers
  if (!/^[a-z0-9-_]+$/.test(tag)) return false; // Only alphanumeric, hyphens, underscores
  return true;
}

// Extract meaningful tags from analysis results
export function extractMeaningfulTags(analysisResult: any): { name: string }[] {
  const tags: { name: string }[] = [];
  
  // From direct labels
  if (Array.isArray(analysisResult.labels)) {
    analysisResult.labels.forEach((label: any) => {
      if (typeof label === 'string') {
        tags.push({ name: label });
      } else if (label.name) {
        tags.push({ name: label.name });
      }
    });
  }
  
  // From OCR text (extract meaningful words)
  if (Array.isArray(analysisResult.ocr)) {
    const ocrText = analysisResult.ocr
      .map((item: any) => item.text || item)
      .join(' ')
      .toLowerCase();
    
    // Extract brand names, hashtags, @mentions
    const brandMatches = ocrText.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]*)*\b/g) || [];
    const hashtagMatches = ocrText.match(/#[\w-]+/g) || [];
    const mentionMatches = ocrText.match(/@[\w-]+/g) || [];
    
    [...brandMatches, ...hashtagMatches, ...mentionMatches].forEach(match => {
      tags.push({ name: match.replace(/[#@]/g, '') });
    });
  }
  
  // From summary keywords (simple extraction)
  if (typeof analysisResult.summary === 'string') {
    const summaryWords = analysisResult.summary
      .toLowerCase()
      .match(/\b\w{4,}\b/g) || []; // Words 4+ chars
    
    // Take first few meaningful words
    summaryWords.slice(0, 3).forEach((word: string) => {
      if (!EXCLUDED_TAGS.includes(word)) {
        tags.push({ name: word });
      }
    });
  }
  
  return tags;
}