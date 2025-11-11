import { Intent, Platform, PlatformRecommendation, RoutingAnalysis } from "@/types";
import { analyzePrompt } from "@/lib/prompt-engine/analyzer";
import { platformCapabilities, getPlatformCapability } from "./capabilities";

/**
 * Intent-to-Platform mapping
 * Maps user intents to platform strengths
 */
const intentPlatformMap: Record<Intent, string[]> = {
  creative: ["claude-sonnet", "chatgpt-4", "gemini-pro"],
  code: ["cursor-ai", "github-copilot", "claude-sonnet", "chatgpt-4"],
  analysis: ["chatgpt-4", "gemini-pro", "perplexity", "claude-sonnet"],
  conversation: ["claude-sonnet", "chatgpt-4", "chatgpt-3.5"],
  data_processing: ["chatgpt-4", "gemini-pro", "notebooklm"],
  instruction: ["claude-sonnet", "chatgpt-4"],
  unknown: ["claude-sonnet", "chatgpt-4", "gemini-pro"],
};

/**
 * Analyze prompt and recommend best platforms
 */
export function routePlatform(
  prompt: string,
  availablePlatforms: Platform[]
): RoutingAnalysis {
  // Analyze the prompt
  const analysis = analyzePrompt(prompt);
  const intent = analysis.intent;

  // Get recommended platform IDs for this intent
  const recommendedPlatformIds = intentPlatformMap[intent] || [];

  // Score each available platform
  const recommendations: PlatformRecommendation[] = availablePlatforms
    .map((platform) => scorePlatform(prompt, platform, intent, analysis.tokenCount))
    .sort((a, b) => b.score - a.score);

  // Find best options
  const bestMatch = recommendations[0]?.platform || availablePlatforms[0];
  const cheapestOption = recommendations.reduce((prev, curr) =>
    curr.costEstimate < prev.costEstimate ? curr : prev
  ).platform;
  const fastestOption = recommendations.reduce((prev, curr) =>
    curr.estimatedResponseTime < prev.estimatedResponseTime ? curr : prev
  ).platform;

  // Calculate confidence based on quality score and intent detection
  const analysisConfidence = Math.min(
    analysis.qualityScore / 100 * 0.7 + 0.3,
    1.0
  );

  return {
    originalPrompt: prompt,
    detectedIntent: intent,
    recommendations,
    bestMatch,
    cheapestOption,
    fastestOption,
    analysisConfidence,
  };
}

/**
 * Score a platform for a given prompt
 */
function scorePlatform(
  prompt: string,
  platform: Platform,
  intent: Intent,
  tokenCount: number
): PlatformRecommendation {
  let score = 50; // Base score
  const reasoning: string[] = [];
  const strengths: string[] = [];
  const warnings: string[] = [];

  const capability = getPlatformCapability(platform.id);

  if (!capability) {
    return {
      platform,
      score: 0,
      reasoning: ["Platform capability data not found"],
      costEstimate: 0,
      estimatedResponseTime: 0,
      strengths: [],
      warnings: ["Unknown platform"],
      isRecommended: false,
    };
  }

  // Intent matching (40 points max)
  const intentPlatforms = intentPlatformMap[intent] || [];
  if (intentPlatforms.includes(platform.id)) {
    const intentBonus = 40 - (intentPlatforms.indexOf(platform.id) * 10);
    score += intentBonus;
    reasoning.push(`Strong match for ${intent} tasks`);
  }

  // Feature detection (20 points max)
  const promptLower = prompt.toLowerCase();

  // Check for image generation needs
  if (promptLower.match(/image|picture|photo|visual|draw|illustration/)) {
    if (capability.strengths.includes("image-generation")) {
      score += 20;
      reasoning.push("Supports image generation");
      strengths.push("Image generation capability");
    } else {
      score -= 10;
      warnings.push("Does not support image generation");
    }
  }

  // Check for code needs
  if (promptLower.match(/code|function|class|implement|debug|refactor/)) {
    if (capability.strengths.includes("code-generation")) {
      score += 15;
      reasoning.push("Excellent for code tasks");
      strengths.push("Strong code generation");
    }
  }

  // Check for research/analysis needs
  if (promptLower.match(/research|analyze|study|data|statistics|compare/)) {
    if (capability.strengths.includes("data-analysis")) {
      score += 15;
      reasoning.push("Great for analysis tasks");
      strengths.push("Data analysis capability");
    }
    if (capability.supportedFeatures.includes("web-search")) {
      score += 10;
      reasoning.push("Has web search for recent info");
      strengths.push("Real-time web search");
    }
  }

  // Context window check (10 points max)
  if (tokenCount > capability.maxContextWindow) {
    score -= 20;
    warnings.push(`Prompt exceeds context window (${capability.maxContextWindow} tokens)`);
  } else if (tokenCount > capability.maxContextWindow * 0.8) {
    score -= 5;
    warnings.push("Prompt is close to context limit");
  }

  // Reliability bonus (10 points max)
  score += (capability.reliabilityScore / 100) * 10;

  // Cost consideration (don't affect score, but note it)
  const costEstimate = (tokenCount / 1000) * capability.costPer1kTokens;

  // Speed consideration
  if (capability.strengths.includes("speed")) {
    strengths.push("Fast response times");
  }

  // Cost efficiency
  if (capability.strengths.includes("cost-efficiency")) {
    strengths.push("Cost-effective option");
  }

  // Add platform-specific strengths
  capability.strengths.forEach(strength => {
    if (!strengths.includes(strength)) {
      strengths.push(strength.replace(/-/g, " "));
    }
  });

  // Determine if recommended
  const isRecommended = score >= 70 && warnings.length === 0;

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    platform,
    score,
    reasoning,
    costEstimate,
    estimatedResponseTime: capability.avgResponseTime,
    strengths,
    warnings,
    isRecommended,
  };
}

/**
 * Quick platform recommendation based on keywords
 */
export function quickRecommend(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const recommendations: string[] = [];

  // Image generation
  if (lower.match(/image|picture|photo|visual|draw|illustration/)) {
    recommendations.push("midjourney", "dall-e-3");
  }

  // Code generation
  if (lower.match(/code|function|class|implement|debug|refactor/)) {
    recommendations.push("cursor-ai", "claude-sonnet", "chatgpt-4");
  }

  // Research
  if (lower.match(/research|study|recent|news|current|latest/)) {
    recommendations.push("perplexity", "chatgpt-4", "gemini-pro");
  }

  // Creative writing
  if (lower.match(/write|story|creative|blog|article|content/)) {
    recommendations.push("claude-sonnet", "chatgpt-4");
  }

  // Data analysis
  if (lower.match(/analyze|data|statistics|compare|evaluate/)) {
    recommendations.push("chatgpt-4", "gemini-pro", "notebooklm");
  }

  // Quick tasks (default to fast options)
  if (lower.match(/quick|fast|simple/) || prompt.length < 50) {
    recommendations.push("groq-llama", "chatgpt-3.5");
  }

  // Default recommendations
  if (recommendations.length === 0) {
    recommendations.push("claude-sonnet", "chatgpt-4", "gemini-pro");
  }

  return Array.from(new Set(recommendations)); // Remove duplicates
}

/**
 * Get compatibility warning between prompt and platform
 */
export function getCompatibilityWarning(
  prompt: string,
  platformId: string
): string | null {
  const capability = getPlatformCapability(platformId);
  if (!capability) return null;

  const lower = prompt.toLowerCase();

  // Check for image generation on text-only platforms
  if (lower.match(/image|picture|photo|visual/) &&
      !capability.strengths.includes("image-generation")) {
    return "⚠️ This platform doesn't support image generation";
  }

  // Check for code on non-code platforms
  if (lower.match(/code|function|implement/) &&
      !capability.strengths.includes("code-generation") &&
      platformId === "midjourney") {
    return "⚠️ This platform is for images, not code";
  }

  // Check for web search needs
  if (lower.match(/recent|latest|current|news|today/) &&
      !capability.supportedFeatures.includes("web-search")) {
    return "⚠️ This platform doesn't have real-time web access";
  }

  return null;
}
