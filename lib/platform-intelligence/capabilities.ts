import { PlatformCapability } from "@/types";

/**
 * Platform Capabilities Matrix
 * Contains feature support, strengths, costs, and performance metrics for each platform
 */
export const platformCapabilities: Record<string, PlatformCapability> = {
  // AI Assistants
  "claude-sonnet": {
    platformId: "claude-sonnet",
    supportedFeatures: [
      "xml-tags",
      "thinking-tags",
      "system-prompts",
      "streaming",
      "temperature-control",
      "vision",
    ],
    strengths: [
      "creative-writing",
      "reasoning",
      "code-generation",
      "conversation",
    ],
    limitations: [
      "No native JSON mode (use XML instead)",
      "No function calling",
      "No web search",
    ],
    maxContextWindow: 200000,
    costPer1kTokens: 0.003,
    avgResponseTime: 2.5,
    reliabilityScore: 98,
  },

  "chatgpt-4": {
    platformId: "chatgpt-4",
    supportedFeatures: [
      "json-mode",
      "function-calling",
      "system-prompts",
      "streaming",
      "temperature-control",
      "vision",
      "web-search",
    ],
    strengths: [
      "data-analysis",
      "reasoning",
      "code-generation",
      "conversation",
    ],
    limitations: [
      "Slower response times",
      "Higher cost",
      "No XML tags support",
    ],
    maxContextWindow: 128000,
    costPer1kTokens: 0.01,
    avgResponseTime: 3.5,
    reliabilityScore: 95,
  },

  "chatgpt-3.5": {
    platformId: "chatgpt-3.5",
    supportedFeatures: [
      "json-mode",
      "function-calling",
      "system-prompts",
      "streaming",
      "temperature-control",
    ],
    strengths: ["speed", "cost-efficiency", "conversation"],
    limitations: [
      "Less capable reasoning",
      "Shorter context window",
      "Lower quality outputs",
    ],
    maxContextWindow: 16000,
    costPer1kTokens: 0.0005,
    avgResponseTime: 1.2,
    reliabilityScore: 92,
  },

  "gemini-pro": {
    platformId: "gemini-pro",
    supportedFeatures: [
      "json-mode",
      "system-prompts",
      "streaming",
      "temperature-control",
      "vision",
      "web-search",
    ],
    strengths: [
      "data-analysis",
      "reasoning",
      "speed",
      "cost-efficiency",
    ],
    limitations: [
      "No XML tags",
      "Less creative than Claude",
      "Inconsistent formatting",
    ],
    maxContextWindow: 1000000,
    costPer1kTokens: 0.00025,
    avgResponseTime: 1.8,
    reliabilityScore: 90,
  },

  // Speed-Optimized
  "groq-llama": {
    platformId: "groq-llama",
    supportedFeatures: [
      "system-prompts",
      "streaming",
      "temperature-control",
    ],
    strengths: ["speed", "cost-efficiency"],
    limitations: [
      "Lower quality outputs",
      "Limited features",
      "Smaller context window",
    ],
    maxContextWindow: 8000,
    costPer1kTokens: 0.0001,
    avgResponseTime: 0.3,
    reliabilityScore: 85,
  },

  // Image Generation
  "midjourney": {
    platformId: "midjourney",
    supportedFeatures: ["image-generation"],
    strengths: ["image-generation", "creative-writing"],
    limitations: [
      "Text-only prompts",
      "No conversation",
      "No code generation",
    ],
    maxContextWindow: 500,
    costPer1kTokens: 0.0, // Per-image pricing
    avgResponseTime: 30,
    reliabilityScore: 88,
  },

  "dall-e-3": {
    platformId: "dall-e-3",
    supportedFeatures: ["image-generation", "vision"],
    strengths: ["image-generation"],
    limitations: [
      "Text-only prompts",
      "No conversation",
      "Strict content policy",
    ],
    maxContextWindow: 400,
    costPer1kTokens: 0.0, // Per-image pricing
    avgResponseTime: 15,
    reliabilityScore: 92,
  },

  // Code-Specific
  "cursor-ai": {
    platformId: "cursor-ai",
    supportedFeatures: [
      "code-execution",
      "file-uploads",
      "system-prompts",
      "streaming",
    ],
    strengths: ["code-generation", "reasoning"],
    limitations: [
      "Code-focused only",
      "No image generation",
      "Limited creative writing",
    ],
    maxContextWindow: 100000,
    costPer1kTokens: 0.002,
    avgResponseTime: 2.0,
    reliabilityScore: 94,
  },

  "github-copilot": {
    platformId: "github-copilot",
    supportedFeatures: [
      "code-execution",
      "streaming",
      "system-prompts",
    ],
    strengths: ["code-generation", "speed"],
    limitations: [
      "Code completions only",
      "No long-form content",
      "Limited reasoning",
    ],
    maxContextWindow: 8000,
    costPer1kTokens: 0.001,
    avgResponseTime: 0.5,
    reliabilityScore: 90,
  },

  // Research & Analysis
  "perplexity": {
    platformId: "perplexity",
    supportedFeatures: [
      "web-search",
      "system-prompts",
      "streaming",
    ],
    strengths: ["data-analysis", "reasoning"],
    limitations: [
      "Focused on research/facts",
      "Less creative",
      "No code execution",
    ],
    maxContextWindow: 16000,
    costPer1kTokens: 0.002,
    avgResponseTime: 4.0,
    reliabilityScore: 93,
  },

  "notebooklm": {
    platformId: "notebooklm",
    supportedFeatures: [
      "file-uploads",
      "web-search",
      "system-prompts",
    ],
    strengths: ["data-analysis", "reasoning"],
    limitations: [
      "Document-focused",
      "No code generation",
      "Requires source materials",
    ],
    maxContextWindow: 50000,
    costPer1kTokens: 0.0,
    avgResponseTime: 3.0,
    reliabilityScore: 91,
  },
};

/**
 * Get capability info for a platform
 */
export function getPlatformCapability(platformId: string): PlatformCapability | undefined {
  return platformCapabilities[platformId];
}

/**
 * Get all platforms that support a specific feature
 */
export function getPlatformsByFeature(feature: string): PlatformCapability[] {
  return Object.values(platformCapabilities).filter((cap) =>
    cap.supportedFeatures.includes(feature as any)
  );
}

/**
 * Get all platforms with a specific strength
 */
export function getPlatformsByStrength(strength: string): PlatformCapability[] {
  return Object.values(platformCapabilities).filter((cap) =>
    cap.strengths.includes(strength as any)
  );
}

/**
 * Compare platforms by cost
 */
export function comparePlatformsByCost(platformIds: string[]): PlatformCapability[] {
  return platformIds
    .map((id) => platformCapabilities[id])
    .filter(Boolean)
    .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);
}

/**
 * Compare platforms by speed
 */
export function comparePlatformsBySpeed(platformIds: string[]): PlatformCapability[] {
  return platformIds
    .map((id) => platformCapabilities[id])
    .filter(Boolean)
    .sort((a, b) => a.avgResponseTime - b.avgResponseTime);
}
