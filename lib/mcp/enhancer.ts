import {
  MCPTool,
  MCPToolContext,
  MCPEnhancementSuggestion,
  MCPToolCategory,
} from "@/types";
import { generateId } from "@/lib/utils";

/**
 * Tool-Aware Prompt Enhancement
 *
 * Analyzes prompts and suggests enhancements based on available MCP tools
 */

// ============================================================================
// Pattern Detection
// ============================================================================

interface ToolPattern {
  category: MCPToolCategory;
  patterns: RegExp[];
  indicators: string[];
}

const TOOL_PATTERNS: ToolPattern[] = [
  {
    category: "filesystem",
    patterns: [
      /read\s+(the\s+)?file/gi,
      /show\s+(me\s+)?(the\s+)?contents?\s+of/gi,
      /list\s+(all\s+)?files/gi,
      /create\s+(a\s+)?file/gi,
      /write\s+to\s+file/gi,
      /\b[\w\/.-]+\.(ts|js|tsx|jsx|json|py|md|txt)\b/gi,
    ],
    indicators: ["file", "directory", "folder", "path", "src/", "package.json"],
  },
  {
    category: "web",
    patterns: [
      /search\s+(for|the\s+web|online)/gi,
      /fetch\s+(from\s+)?(url|website)/gi,
      /browse\s+to/gi,
      /https?:\/\/[^\s]+/gi,
      /visit\s+the\s+website/gi,
    ],
    indicators: ["website", "url", "search", "online", "web", "http"],
  },
  {
    category: "database",
    patterns: [
      /query\s+(the\s+)?database/gi,
      /select\s+.+\s+from/gi,
      /insert\s+into/gi,
      /update\s+.+\s+set/gi,
      /show\s+(me\s+)?(the\s+)?schema/gi,
      /database\s+table/gi,
    ],
    indicators: ["database", "table", "query", "SQL", "schema", "records"],
  },
  {
    category: "api",
    patterns: [
      /call\s+(the\s+)?api/gi,
      /make\s+(a\s+)?(GET|POST|PUT|DELETE)\s+request/gi,
      /fetch\s+from\s+(the\s+)?endpoint/gi,
      /api\s+endpoint/gi,
    ],
    indicators: ["API", "endpoint", "request", "response", "REST"],
  },
  {
    category: "code-execution",
    patterns: [
      /run\s+(the\s+)?code/gi,
      /execute\s+(the\s+)?script/gi,
      /compile\s+and\s+run/gi,
      /test\s+(the\s+)?function/gi,
    ],
    indicators: ["execute", "run", "compile", "test", "script"],
  },
];

// ============================================================================
// Tool Detection
// ============================================================================

/**
 * Detect which tool categories would be useful for a prompt
 */
export function detectRelevantToolCategories(prompt: string): MCPToolCategory[] {
  const relevantCategories = new Set<MCPToolCategory>();

  TOOL_PATTERNS.forEach((pattern) => {
    // Check regex patterns
    const hasPatternMatch = pattern.patterns.some((regex) => regex.test(prompt));

    // Check text indicators
    const hasIndicator = pattern.indicators.some((indicator) =>
      prompt.toLowerCase().includes(indicator.toLowerCase())
    );

    if (hasPatternMatch || hasIndicator) {
      relevantCategories.add(pattern.category);
    }
  });

  return Array.from(relevantCategories);
}

/**
 * Find tools that match the prompt intent
 */
export function findRelevantTools(
  prompt: string,
  toolContext: MCPToolContext
): MCPTool[] {
  const relevantCategories = detectRelevantToolCategories(prompt);
  const relevantTools: MCPTool[] = [];

  relevantCategories.forEach((category) => {
    const categoryTools = toolContext.toolsByCategory[category] || [];
    relevantTools.push(...categoryTools);
  });

  return relevantTools;
}

// ============================================================================
// Tool-Aware Enhancement
// ============================================================================

/**
 * Enhance prompt with tool awareness
 */
export function enhancePromptWithTools(
  prompt: string,
  toolContext: MCPToolContext
): MCPEnhancementSuggestion {
  const relevantTools = findRelevantTools(prompt, toolContext);

  if (relevantTools.length === 0) {
    // No tools needed, return original prompt
    return {
      suggestionId: generateId(),
      originalPrompt: prompt,
      enhancedPrompt: prompt,
      toolsUsed: [],
      improvements: [],
      reasoning: "No specific tools required for this prompt",
    };
  }

  // Build enhanced prompt with tool context
  let enhancedPrompt = prompt;
  const improvements: string[] = [];
  const toolsUsed: string[] = [];

  // Add tool availability context
  const toolDescriptions = relevantTools
    .map((tool) => `- ${tool.name}: ${tool.description}`)
    .join("\n");

  enhancedPrompt += `\n\n<available_tools>\n${toolDescriptions}\n</available_tools>`;
  improvements.push("Added context about available tools");

  // Add specific enhancements based on tool categories
  const categories = detectRelevantToolCategories(prompt);

  if (categories.includes("filesystem")) {
    enhancedPrompt += `\n\nNote: When referencing files, use specific paths (e.g., src/components/Button.tsx) for better tool integration.`;
    improvements.push("Added file path specification guidance");
    toolsUsed.push(...relevantTools.filter((t) => t.category === "filesystem").map((t) => t.name));
  }

  if (categories.includes("web")) {
    enhancedPrompt += `\n\nNote: For web content, provide full URLs (e.g., https://example.com/page) for direct fetching.`;
    improvements.push("Added URL specification guidance");
    toolsUsed.push(...relevantTools.filter((t) => t.category === "web").map((t) => t.name));
  }

  if (categories.includes("database")) {
    enhancedPrompt += `\n\nNote: For database operations, specify table names and query structure clearly.`;
    improvements.push("Added database query structure guidance");
    toolsUsed.push(...relevantTools.filter((t) => t.category === "database").map((t) => t.name));
  }

  const reasoning = `Detected ${relevantTools.length} relevant tool(s) in categories: ${categories.join(", ")}. Enhanced prompt to leverage these tools effectively.`;

  return {
    suggestionId: generateId(),
    originalPrompt: prompt,
    enhancedPrompt,
    toolsUsed,
    improvements,
    reasoning,
  };
}

// ============================================================================
// Category-Specific Enhancements
// ============================================================================

/**
 * Optimize prompt for filesystem operations
 */
export function optimizeForFilesystem(prompt: string): string {
  let optimized = prompt;

  // Extract potential file paths and make them explicit
  const fileExtensions = /\b[\w\/.-]+\.(ts|js|tsx|jsx|json|py|md|txt|yaml|yml|css|scss)\b/gi;
  const matches = Array.from(prompt.matchAll(fileExtensions));

  if (matches.length > 0) {
    const paths = matches.map((m) => m[0]).filter((p, i, arr) => arr.indexOf(p) === i);
    optimized += `\n\n<file_paths>\n${paths.join("\n")}\n</file_paths>`;
  }

  return optimized;
}

/**
 * Optimize prompt for web operations
 */
export function optimizeForWeb(prompt: string): string {
  let optimized = prompt;

  // Extract URLs and make them explicit
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = Array.from(prompt.matchAll(urlPattern));

  if (urls.length > 0) {
    const uniqueUrls = urls.map((m) => m[0]).filter((u, i, arr) => arr.indexOf(u) === i);
    optimized += `\n\n<urls>\n${uniqueUrls.join("\n")}\n</urls>`;
  }

  return optimized;
}

/**
 * Optimize prompt for database operations
 */
export function optimizeForDatabase(prompt: string): string {
  let optimized = prompt;

  // Look for table names or SQL keywords
  const hasSQLKeywords =
    /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|TABLE|DATABASE)\b/gi.test(prompt);

  if (hasSQLKeywords) {
    optimized += `\n\n<sql_context>\nDatabase operation detected. Ensure query is properly formatted and parameterized.\n</sql_context>`;
  }

  return optimized;
}

/**
 * Apply category-specific optimizations
 */
export function applyToolOptimizations(
  prompt: string,
  categories: MCPToolCategory[]
): string {
  let optimized = prompt;

  if (categories.includes("filesystem")) {
    optimized = optimizeForFilesystem(optimized);
  }

  if (categories.includes("web")) {
    optimized = optimizeForWeb(optimized);
  }

  if (categories.includes("database")) {
    optimized = optimizeForDatabase(optimized);
  }

  return optimized;
}

// ============================================================================
// Batch Enhancement
// ============================================================================

/**
 * Enhance multiple prompts with tool awareness
 */
export function enhancePromptsWithTools(
  prompts: string[],
  toolContext: MCPToolContext
): MCPEnhancementSuggestion[] {
  return prompts.map((prompt) => enhancePromptWithTools(prompt, toolContext));
}
