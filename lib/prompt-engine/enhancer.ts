import { Platform, Intent, Domain, Tone } from "@/types";
import { analyzePrompt } from "./analyzer";

// Add system message based on platform
export function addSystemMessage(
  prompt: string,
  platform: Platform,
  customMessage?: string
): string {
  if (customMessage) {
    return `System: ${customMessage}\n\nUser: ${prompt}`;
  }

  if (platform.systemPromptTemplate) {
    return `System: ${platform.systemPromptTemplate}\n\nUser: ${prompt}`;
  }

  return prompt;
}

// Inject few-shot examples based on intent
export function injectExamples(prompt: string, count: number, intent: Intent): string {
  if (count === 0) return prompt;

  const examples: Record<Intent, string[]> = {
    creative: [
      "Example 1: A serene landscape with mountains at sunset, painted in watercolor style.\nResult: Beautiful watercolor painting with warm colors and soft edges.",
      "Example 2: A futuristic city with flying cars and neon lights.\nResult: Cyberpunk cityscape with vibrant neon colors and dynamic composition.",
    ],
    code: [
      "Example 1: Write a function that reverses a string.\nResult: function reverseString(str) { return str.split('').reverse().join(''); }",
      "Example 2: Create a class for a user profile.\nResult: class UserProfile { constructor(name, email) { this.name = name; this.email = email; } }",
    ],
    analysis: [
      "Example 1: Analyze the pros and cons of remote work.\nResult: Pros: flexibility, no commute, work-life balance. Cons: isolation, communication challenges, distractions.",
      "Example 2: Compare SQL and NoSQL databases.\nResult: SQL: structured, ACID compliant, relational. NoSQL: flexible, scalable, document-based.",
    ],
    conversation: [
      "Example 1: What is machine learning?\nResult: Machine learning is a subset of AI that enables systems to learn from data without explicit programming.",
    ],
    data_processing: [
      "Example 1: Convert CSV to JSON format.\nResult: Parse CSV rows and convert each to JSON object with key-value pairs.",
    ],
    instruction: [
      "Example 1: How to make a paper airplane?\nResult: 1. Fold paper in half. 2. Create wings. 3. Adjust nose. 4. Test fly.",
    ],
    unknown: [],
  };

  const relevantExamples = examples[intent].slice(0, count);
  if (relevantExamples.length === 0) return prompt;

  return `Here are some examples:\n\n${relevantExamples.join("\n\n")}\n\nNow, ${prompt}`;
}

// Apply Spartan tone (concise, direct, no fluff)
export function applySpartanTone(prompt: string): string {
  // Add directive for conciseness
  return `${prompt}\n\nBe extremely concise and direct. No pleasantries or filler. Just the essential information.`;
}

// Apply tone modifications
export function applyTone(prompt: string, tone: Tone): string {
  const toneInstructions: Record<Tone, string> = {
    professional:
      "Maintain a professional, respectful tone. Use formal language and clear structure.",
    casual:
      "Use a friendly, conversational tone. Be approachable and relatable.",
    academic:
      "Use scholarly language with proper citations and formal structure. Be precise and analytical.",
    spartan:
      "Be extremely concise and direct. No pleasantries or filler. Just essential information.",
    laconic:
      "Use minimal words. Be brief and to the point. Maximum efficiency.",
    sarcastic:
      "Use a witty, slightly sarcastic tone. Be clever but not offensive.",
  };

  return `${prompt}\n\nTone: ${toneInstructions[tone]}`;
}

// Optimize token usage
export function optimizeTokens(prompt: string, maxTokens: number): string {
  const words = prompt.split(/\s+/);
  const estimatedTokens = Math.ceil(prompt.length / 4);

  if (estimatedTokens > maxTokens) {
    // Trim to fit within limit
    const targetLength = maxTokens * 4 * 0.9; // 90% of limit for safety
    let optimized = prompt.substring(0, targetLength);

    // Try to end at a sentence
    const lastPeriod = optimized.lastIndexOf(".");
    if (lastPeriod > targetLength * 0.7) {
      optimized = optimized.substring(0, lastPeriod + 1);
    }

    return optimized + "\n\n[Note: Prompt optimized to fit token limit]";
  }

  return prompt;
}

// Resolve ambiguity
export function resolveAmbiguity(prompt: string): string {
  const analysis = analyzePrompt(prompt);

  if (analysis.missingComponents.length === 0) return prompt;

  let enhanced = prompt;

  // Add clarifying questions or defaults
  const clarifications: string[] = [];

  if (analysis.missingComponents.includes("Context or background information")) {
    clarifications.push(
      "Please provide relevant context, constraints, and current situation."
    );
  }

  if (analysis.missingComponents.includes("Clear goal or desired outcome")) {
    clarifications.push("Specify the exact outcome or deliverable you need.");
  }

  if (analysis.missingComponents.includes("Output format specification")) {
    clarifications.push(
      "Indicate preferred format (e.g., markdown, JSON, bullet points)."
    );
  }

  if (clarifications.length > 0) {
    enhanced += `\n\nClarifications needed:\n${clarifications.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;
  }

  return enhanced;
}

// Add platform-specific formatting
export function addPlatformSpecifics(prompt: string, platform: Platform): string {
  let enhanced = prompt;

  // Apply platform template if available
  if (platform.userPromptTemplate) {
    enhanced = platform.userPromptTemplate.replace("{prompt}", prompt);
  }

  // Add special requirements as suffix
  if (platform.specialRequirements && platform.specialRequirements.length > 0) {
    const requirements = platform.specialRequirements
      .map((req) => `- ${req}`)
      .join("\n");
    enhanced += `\n\nPlatform-specific requirements:\n${requirements}`;
  }

  // Add API format note
  enhanced += `\n\n[Output format: ${platform.apiFormat.toUpperCase()}]`;

  // Add token limit warning if necessary
  const estimatedTokens = Math.ceil(enhanced.length / 4);
  if (estimatedTokens > platform.maxTokens * 0.8) {
    enhanced += `\n\n⚠️ Warning: Approaching token limit (${estimatedTokens}/${platform.maxTokens})`;
  }

  return enhanced;
}

// Main enhancement function
export function enhancePrompt(
  prompt: string,
  platform: Platform,
  options: {
    tone?: Tone;
    fewShotCount?: number;
    systemMessage?: string;
    resolveAmbiguity?: boolean;
  } = {}
): string {
  const analysis = analyzePrompt(prompt);
  let enhanced = prompt;

  // 1. Resolve ambiguity if requested
  if (options.resolveAmbiguity && analysis.missingComponents.length > 0) {
    enhanced = resolveAmbiguity(enhanced);
  }

  // 2. Add few-shot examples if requested
  if (options.fewShotCount && options.fewShotCount > 0) {
    enhanced = injectExamples(enhanced, options.fewShotCount, analysis.intent);
  }

  // 3. Apply tone if specified
  if (options.tone) {
    enhanced = applyTone(enhanced, options.tone);
  }

  // 4. Add platform-specific formatting
  enhanced = addPlatformSpecifics(enhanced, platform);

  // 5. Add system message if provided
  if (options.systemMessage) {
    enhanced = addSystemMessage(enhanced, platform, options.systemMessage);
  }

  // 6. Optimize tokens if necessary
  enhanced = optimizeTokens(enhanced, platform.maxTokens);

  return enhanced;
}

// Generate multiple variations
export function generateVariations(
  prompt: string,
  platform: Platform,
  count: number = 3
): string[] {
  const variations: string[] = [];
  const analysis = analyzePrompt(prompt);

  // Variation 1: Conservative (minimal changes)
  variations.push(
    enhancePrompt(prompt, platform, {
      tone: "professional",
      fewShotCount: 0,
    })
  );

  // Variation 2: Balanced (moderate enhancements)
  if (count >= 2) {
    variations.push(
      enhancePrompt(prompt, platform, {
        tone: "professional",
        fewShotCount: analysis.complexity > 5 ? 2 : 1,
        resolveAmbiguity: true,
      })
    );
  }

  // Variation 3: Aggressive (maximum optimization)
  if (count >= 3) {
    variations.push(
      enhancePrompt(prompt, platform, {
        tone: "spartan",
        fewShotCount: analysis.complexity > 7 ? 3 : 2,
        resolveAmbiguity: true,
      })
    );
  }

  return variations;
}

// Calculate improvement score
export function calculateImprovement(
  originalScore: number,
  enhancedScore: number
): number {
  return Math.round(((enhancedScore - originalScore) / originalScore) * 100);
}

// Generate improvement explanations
export function explainImprovements(
  original: string,
  enhanced: string,
  platform: Platform
): string[] {
  const improvements: string[] = [];
  const originalAnalysis = analyzePrompt(original);
  const enhancedAnalysis = analyzePrompt(enhanced);

  // Check for added context
  if (enhanced.length > original.length * 1.2) {
    improvements.push("Added context and clarifying details");
  }

  // Check for structure
  if (enhanced.includes("\n\n") && !original.includes("\n\n")) {
    improvements.push("Improved structure with clear sections");
  }

  // Check for examples
  if (enhanced.includes("Example") && !original.includes("Example")) {
    improvements.push("Added few-shot examples for clarity");
  }

  // Check for tone specification
  if (enhanced.includes("Tone:")) {
    improvements.push("Specified tone and style requirements");
  }

  // Check for platform optimization
  if (enhanced.includes(platform.name) || enhanced.includes("format:")) {
    improvements.push(`Optimized for ${platform.name} platform`);
  }

  // Check for resolved ambiguity
  if (
    originalAnalysis.missingComponents.length >
    enhancedAnalysis.missingComponents.length
  ) {
    improvements.push("Resolved ambiguities and missing components");
  }

  // Check for token optimization
  if (enhancedAnalysis.tokenCount < originalAnalysis.tokenCount) {
    improvements.push("Optimized token usage");
  }

  // Check for quality improvement
  if (enhancedAnalysis.qualityScore > originalAnalysis.qualityScore) {
    const improvement = enhancedAnalysis.qualityScore - originalAnalysis.qualityScore;
    improvements.push(`Quality score increased by ${improvement} points`);
  }

  return improvements.length > 0
    ? improvements
    : ["Applied platform-specific formatting"];
}
