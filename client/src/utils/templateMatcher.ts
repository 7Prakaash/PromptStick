/**
 * Template Matcher Utility
 * Matches user queries to the most relevant template using keyword scoring
 */

export interface TemplateMatch {
  id: string;
  name: string;
  description: string;
  template: string;
  keywords: string[];
  defaultLLM?: string;
  defaultTone?: string;
  score: number;
}

/**
 * Normalize text for keyword matching
 * - Convert to lowercase
 * - Remove punctuation
 * - Split into words
 */
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with space
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 2); // Filter out very short words
}

/**
 * Calculate keyword overlap score between query and template
 */
function calculateScore(queryWords: string[], templateKeywords: string[]): number {
  let score = 0;
  const normalizedKeywords = templateKeywords.map(k => k.toLowerCase());
  
  for (const queryWord of queryWords) {
    // Exact keyword match
    if (normalizedKeywords.includes(queryWord)) {
      score += 10;
    }
    
    // Partial keyword match (query word is part of or contains a keyword)
    for (const keyword of normalizedKeywords) {
      if (keyword.includes(queryWord) && keyword.length > queryWord.length) {
        score += 5;
      } else if (queryWord.includes(keyword) && queryWord.length > keyword.length) {
        score += 5;
      }
    }
  }
  
  // Bonus for multi-word phrase matches
  const queryPhrase = queryWords.join(' ');
  for (const keyword of normalizedKeywords) {
    if (keyword.includes(' ') && queryPhrase.includes(keyword)) {
      score += 15;
    }
  }
  
  return score;
}

/**
 * Find the best matching template for a user query
 * @param query - User's input query
 * @param templates - Array of templates to match against
 * @param threshold - Minimum score required for a match (default: 10)
 * @returns Best matching template or null if no good match found
 */
export function findBestTemplate(
  query: string,
  templates: any[],
  threshold: number = 10
): TemplateMatch | null {
  if (!query || query.trim().length === 0) {
    return null;
  }
  
  const queryWords = normalizeText(query);
  
  if (queryWords.length === 0) {
    return null;
  }
  
  let bestMatch: TemplateMatch | null = null;
  let highestScore = 0;
  
  for (const template of templates) {
    const score = calculateScore(queryWords, template.keywords || []);
    
    if (score > highestScore && score >= threshold) {
      highestScore = score;
      bestMatch = {
        ...template,
        score
      };
    }
  }
  
  return bestMatch;
}

/**
 * Get multiple template matches sorted by score
 * Useful for showing alternatives or debugging
 */
export function findTemplateMatches(
  query: string,
  templates: any[],
  limit: number = 3
): TemplateMatch[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const queryWords = normalizeText(query);
  
  if (queryWords.length === 0) {
    return [];
  }
  
  const matches: TemplateMatch[] = templates
    .map(template => ({
      ...template,
      score: calculateScore(queryWords, template.keywords || [])
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return matches;
}
