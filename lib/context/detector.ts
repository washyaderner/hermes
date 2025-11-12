import { ContextDetection, Intent, ContextTemplate } from "@/types";
import { contextTemplates, codebaseTemplate, brandVoiceTemplate, academicTemplate } from "./templates";

// Keywords for different context types
const codeKeywords = [
  "function", "class", "variable", "component", "API", "database",
  "typescript", "javascript", "python", "java", "rust", "go",
  "react", "vue", "angular", "django", "flask", "express",
  "code", "implement", "refactor", "debug", "test", "deploy",
  "algorithm", "data structure", "performance", "optimize",
];

const brandKeywords = [
  "brand", "marketing", "copy", "content", "campaign",
  "social media", "email", "newsletter", "blog post",
  "tone", "voice", "messaging", "audience", "customer",
  "tagline", "slogan", "headline", "description",
  "product launch", "announcement", "press release",
];

const academicKeywords = [
  "research", "study", "paper", "thesis", "dissertation",
  "analysis", "literature review", "methodology", "findings",
  "hypothesis", "theory", "experiment", "survey", "data",
  "cite", "reference", "bibliography", "abstract", "conclusion",
  "peer review", "publication", "journal", "conference",
];

/**
 * Detect context needs from a prompt
 */
export function detectContextNeeds(prompt: string, currentIntent?: Intent): ContextDetection {
  const lowerPrompt = prompt.toLowerCase();

  // Count keyword matches
  const codeMatches = codeKeywords.filter(kw => lowerPrompt.includes(kw.toLowerCase()));
  const brandMatches = brandKeywords.filter(kw => lowerPrompt.includes(kw.toLowerCase()));
  const academicMatches = academicKeywords.filter(kw => lowerPrompt.includes(kw.toLowerCase()));

  const scores = {
    code: codeMatches.length,
    brand: brandMatches.length,
    academic: academicMatches.length,
  };

  // Determine top detection
  const maxScore = Math.max(scores.code, scores.brand, scores.academic);

  // If no clear detection, return low confidence
  if (maxScore === 0) {
    return {
      detectedIntent: currentIntent || "unknown",
      suggestedTemplates: [],
      detectedKeywords: [],
      confidence: 0,
      reasoning: "No clear context indicators found in prompt",
      missingContextFields: [],
    };
  }

  let suggestedTemplates: ContextTemplate[] = [];
  let detectedIntent: Intent = "unknown";
  let detectedKeywords: string[] = [];
  let reasoning = "";
  let missingContextFields: string[] = [];

  // Code context detected
  if (scores.code === maxScore && scores.code > 0) {
    suggestedTemplates.push(codebaseTemplate);
    detectedIntent = "code";
    detectedKeywords = codeMatches;
    reasoning = `Detected ${codeMatches.length} code-related keywords. Consider adding programming language and framework context.`;
    missingContextFields = ["language", "framework"];

    // Check for specific missing context
    if (!lowerPrompt.match(/typescript|javascript|python|java|rust|go|ruby|php|c\+\+|c#/)) {
      missingContextFields.push("Programming language not specified");
    }
  }

  // Brand context detected
  if (scores.brand === maxScore && scores.brand > 0) {
    suggestedTemplates.push(brandVoiceTemplate);
    detectedIntent = "creative";
    detectedKeywords = brandMatches;
    reasoning = `Detected ${brandMatches.length} marketing/brand keywords. Consider adding brand voice and tone context.`;
    missingContextFields = ["tone", "values", "audience"];

    // Check for specific missing context
    if (!lowerPrompt.match(/tone|voice|style|brand/)) {
      missingContextFields.push("Brand tone not specified");
    }
  }

  // Academic context detected
  if (scores.academic === maxScore && scores.academic > 0) {
    suggestedTemplates.push(academicTemplate);
    detectedIntent = "analysis";
    detectedKeywords = academicMatches;
    reasoning = `Detected ${academicMatches.length} academic keywords. Consider adding field and citation style context.`;
    missingContextFields = ["field", "citationStyle"];

    // Check for specific missing context
    if (!lowerPrompt.match(/apa|mla|chicago|ieee|harvard/i)) {
      missingContextFields.push("Citation style not specified");
    }
  }

  // Calculate confidence based on keyword density
  const wordCount = prompt.split(/\s+/).length;
  const keywordDensity = maxScore / Math.max(wordCount, 1);
  const confidence = Math.min(keywordDensity * 10, 1); // Cap at 1.0

  return {
    detectedIntent,
    suggestedTemplates,
    detectedKeywords,
    confidence,
    reasoning,
    missingContextFields,
  };
}

/**
 * Check if prompt would benefit from additional context
 */
export function shouldSuggestContext(prompt: string, activeContextCount: number): boolean {
  // Don't suggest if already have multiple contexts
  if (activeContextCount >= 2) {
    return false;
  }

  // Suggest for prompts longer than 20 words without context
  if (prompt.split(/\s+/).length > 20 && activeContextCount === 0) {
    return true;
  }

  // Detect if context would help
  const detection = detectContextNeeds(prompt);
  return detection.confidence > 0.3;
}
