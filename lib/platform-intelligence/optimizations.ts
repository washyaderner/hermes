import { PlatformOptimization } from "@/types";

/**
 * Platform-Specific Optimization Rules
 * Contains best practices, formatting guidelines, and optimization strategies for each platform
 */
export const platformOptimizations: Record<string, PlatformOptimization> = {
  "claude-sonnet": {
    platformId: "claude-sonnet",
    platformName: "Claude Sonnet",
    optimizationRules: {
      useXmlTags: true,
      useThinkingTags: true,
      includeSystemPrompt: true,
      preferredTone: ["professional", "academic"],
      maxPromptLength: 200000,
      specialFormatting: "Use XML tags for structure: <context>, <instructions>, <examples>",
      examplePromptStructure: `<context>
Background information here
</context>

<instructions>
Clear task description
</instructions>

<examples>
Example inputs and outputs
</examples>`,
    },
    bestPractices: [
      "Use XML tags to structure complex prompts",
      "Add <thinking> tags for chain-of-thought reasoning",
      "Provide clear examples in <example> tags",
      "Use specific, detailed instructions",
      "Claude excels at long-form, nuanced tasks",
    ],
    avoidPatterns: [
      "Don't use JSON mode syntax (use XML instead)",
      "Avoid function calling syntax",
      "Don't over-simplify prompts (Claude handles complexity well)",
    ],
  },

  "chatgpt-4": {
    platformId: "chatgpt-4",
    platformName: "ChatGPT-4",
    optimizationRules: {
      useJsonMode: true,
      includeSystemPrompt: true,
      preferredTone: ["professional", "casual"],
      maxPromptLength: 128000,
      specialFormatting: "Use clear sections and markdown formatting",
      examplePromptStructure: `# Task
Describe the task clearly

# Context
Provide background information

# Requirements
- List specific requirements
- Be explicit about format

# Examples
Show input/output examples`,
    },
    bestPractices: [
      "Use JSON mode for structured outputs",
      "Leverage function calling for complex workflows",
      "Provide clear, step-by-step instructions",
      "Use markdown for formatting",
      "Include examples for complex tasks",
      "ChatGPT-4 excels at reasoning and analysis",
    ],
    avoidPatterns: [
      "Don't use XML tags (not natively supported)",
      "Avoid overly verbose prompts",
      "Don't rely on implicit understanding",
    ],
  },

  "chatgpt-3.5": {
    platformId: "chatgpt-3.5",
    platformName: "ChatGPT-3.5",
    optimizationRules: {
      useJsonMode: true,
      includeSystemPrompt: true,
      preferredTone: ["casual", "professional"],
      maxPromptLength: 16000,
      specialFormatting: "Keep prompts concise and direct",
      examplePromptStructure: `Task: [clear one-liner]

Context: [brief background]

Format: [expected output format]

Example: [one clear example]`,
    },
    bestPractices: [
      "Keep prompts short and focused",
      "Use simple, direct language",
      "Provide one clear example",
      "Best for simple, straightforward tasks",
      "Optimize for speed over quality",
    ],
    avoidPatterns: [
      "Don't send very long prompts",
      "Avoid complex reasoning tasks",
      "Don't expect nuanced understanding",
    ],
  },

  "gemini-pro": {
    platformId: "gemini-pro",
    platformName: "Gemini Pro",
    optimizationRules: {
      useJsonMode: true,
      includeSystemPrompt: true,
      preferredTone: ["professional", "academic"],
      maxPromptLength: 1000000,
      specialFormatting: "Use markdown and clear structure",
      examplePromptStructure: `## Objective
Clear goal statement

## Context
Relevant background

## Instructions
1. Step one
2. Step two

## Output Format
Expected structure`,
    },
    bestPractices: [
      "Leverage massive context window for document analysis",
      "Use markdown formatting",
      "Provide structured instructions",
      "Great for data analysis and research",
      "Can handle very long inputs",
    ],
    avoidPatterns: [
      "Don't use XML tags",
      "Avoid overly creative tasks",
      "Don't expect consistent tone",
    ],
  },

  "groq-llama": {
    platformId: "groq-llama",
    platformName: "Groq Llama",
    optimizationRules: {
      includeSystemPrompt: true,
      preferredTone: ["casual"],
      maxPromptLength: 8000,
      specialFormatting: "Very short, direct prompts",
      examplePromptStructure: `[Direct question or command in one sentence]

Context: [1-2 sentences max]

Format: [output format]`,
    },
    bestPractices: [
      "Optimize for speed with minimal prompts",
      "Use for quick, simple tasks",
      "Keep everything under 100 words if possible",
      "Best for rapid prototyping",
    ],
    avoidPatterns: [
      "Don't send long prompts",
      "Avoid complex reasoning",
      "Don't expect high-quality outputs",
    ],
  },

  "midjourney": {
    platformId: "midjourney",
    platformName: "Midjourney",
    optimizationRules: {
      maxPromptLength: 500,
      specialFormatting: "Use comma-separated keywords with style parameters",
      examplePromptStructure: `[subject], [style], [lighting], [mood], [composition] --ar 16:9 --v 6 --style raw`,
    },
    bestPractices: [
      "Use descriptive adjectives and style keywords",
      "Add aspect ratio: --ar 16:9, --ar 1:1, --ar 9:16",
      "Specify version: --v 6 for latest",
      "Add style modifiers: --style raw, --style expressive",
      "Use artist/style references: 'in the style of...'",
      "Include lighting and mood descriptors",
    ],
    avoidPatterns: [
      "Don't write long sentences",
      "Avoid abstract concepts without visual anchors",
      "Don't use negative prompts (use --no instead)",
    ],
  },

  "dall-e-3": {
    platformId: "dall-e-3",
    platformName: "DALL-E 3",
    optimizationRules: {
      maxPromptLength: 400,
      specialFormatting: "Natural language descriptions",
      examplePromptStructure: `A [detailed description of scene], with [specific details], in [art style], [lighting/mood]`,
    },
    bestPractices: [
      "Use natural, descriptive language",
      "Be specific about composition and framing",
      "Describe style, lighting, and mood",
      "Works well with detailed narratives",
      "Can generate text in images",
    ],
    avoidPatterns: [
      "Avoid celebrity names or copyrighted characters",
      "Don't use technical parameters (no --ar)",
      "Avoid violent or explicit content",
    ],
  },

  "cursor-ai": {
    platformId: "cursor-ai",
    platformName: "Cursor AI",
    optimizationRules: {
      includeSystemPrompt: true,
      preferredTone: ["professional"],
      maxPromptLength: 100000,
      specialFormatting: "Include file paths and code context",
      examplePromptStructure: `File: [file path]

Context: [what the code does]

Task: [specific change needed]

Requirements:
- [requirement 1]
- [requirement 2]`,
    },
    bestPractices: [
      "Always include file paths",
      "Reference specific functions or classes",
      "Provide code context",
      "Be explicit about language and framework",
      "Use @filename to reference files",
      "Great for refactoring and code review",
    ],
    avoidPatterns: [
      "Don't give vague instructions",
      "Avoid non-code tasks",
      "Don't expect creative writing",
    ],
  },

  "github-copilot": {
    platformId: "github-copilot",
    platformName: "GitHub Copilot",
    optimizationRules: {
      maxPromptLength: 8000,
      specialFormatting: "Use code comments as prompts",
      examplePromptStructure: `// Function to [describe functionality]
// Input: [parameter description]
// Output: [return value description]
// Example: [usage example]`,
    },
    bestPractices: [
      "Write clear code comments",
      "Provide function signatures",
      "Include type annotations",
      "Best for code completions and snippets",
      "Use descriptive variable names",
    ],
    avoidPatterns: [
      "Don't write long prose",
      "Avoid non-code tasks",
      "Don't expect full file generation",
    ],
  },

  "perplexity": {
    platformId: "perplexity",
    platformName: "Perplexity",
    optimizationRules: {
      includeSystemPrompt: true,
      preferredTone: ["professional", "academic"],
      maxPromptLength: 16000,
      specialFormatting: "Research-style questions",
      examplePromptStructure: `Research Question: [specific question]

Context: [why this matters]

Requirements:
- Focus on [specific aspect]
- Include citations
- Compare sources`,
    },
    bestPractices: [
      "Ask specific research questions",
      "Request citations and sources",
      "Great for fact-checking and research",
      "Use for current events and recent information",
      "Ask for multiple perspectives",
    ],
    avoidPatterns: [
      "Don't use for creative writing",
      "Avoid subjective or opinion-based questions",
      "Don't expect code generation",
    ],
  },

  "notebooklm": {
    platformId: "notebooklm",
    platformName: "NotebookLM",
    optimizationRules: {
      includeSystemPrompt: true,
      preferredTone: ["professional", "academic"],
      maxPromptLength: 50000,
      specialFormatting: "Document analysis queries",
      examplePromptStructure: `Document(s): [uploaded files]

Analysis Task: [what to analyze]

Focus Areas:
- [area 1]
- [area 2]

Output: [format needed]`,
    },
    bestPractices: [
      "Upload source documents first",
      "Ask document-specific questions",
      "Great for summarization and analysis",
      "Request quotes and citations",
      "Use for research synthesis",
    ],
    avoidPatterns: [
      "Don't use without uploading sources",
      "Avoid general knowledge questions",
      "Don't expect code generation",
    ],
  },
};

/**
 * Get optimization rules for a platform
 */
export function getPlatformOptimization(platformId: string): PlatformOptimization | undefined {
  return platformOptimizations[platformId];
}

/**
 * Apply platform-specific optimizations to a prompt
 */
export function applyPlatformOptimization(
  prompt: string,
  platformId: string
): { optimizedPrompt: string; appliedOptimizations: string[] } {
  const optimization = platformOptimizations[platformId];
  if (!optimization) {
    return { optimizedPrompt: prompt, appliedOptimizations: [] };
  }

  let optimizedPrompt = prompt;
  const appliedOptimizations: string[] = [];

  // Apply XML tags for Claude
  if (optimization.optimizationRules.useXmlTags && !prompt.includes("<")) {
    optimizedPrompt = `<instructions>\n${prompt}\n</instructions>`;
    appliedOptimizations.push("Added XML structure");
  }

  // Truncate if exceeds max length
  const maxLength = optimization.optimizationRules.maxPromptLength;
  if (maxLength && optimizedPrompt.length > maxLength) {
    optimizedPrompt = optimizedPrompt.slice(0, maxLength - 50) + "...";
    appliedOptimizations.push(`Truncated to ${maxLength} chars`);
  }

  return { optimizedPrompt, appliedOptimizations };
}
