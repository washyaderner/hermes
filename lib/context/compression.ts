import { Context, ContextTemplate } from "@/types";
import { getContextTemplateById } from "./templates";

/**
 * Compress context into token-efficient format
 */
export function compressContext(context: Context, template: ContextTemplate): string {
  const { compressedFormat, fields: templateFields } = template;
  const { fields } = context;

  // Replace placeholders in compressed format with actual values
  let compressed = compressedFormat;

  // Sort fields by token weight (higher weight = more important)
  const sortedFields = templateFields
    .filter(f => fields[f.fieldId] && fields[f.fieldId].trim() !== "")
    .sort((a, b) => b.tokenWeight - a.tokenWeight);

  // Build compressed string
  const parts: string[] = [];

  for (const field of sortedFields) {
    const value = fields[field.fieldId];
    if (value && value.trim()) {
      // Abbreviate field names for compression
      const abbrev = abbreviateFieldName(field.fieldName);
      parts.push(`${abbrev}:${compressValue(value)}`);
    }
  }

  return parts.join("|");
}

/**
 * Abbreviate field names for compression
 */
function abbreviateFieldName(fieldName: string): string {
  const abbreviations: Record<string, string> = {
    "Programming Language": "Lang",
    "Framework/Library": "Fmwk",
    "Code Conventions": "Conv",
    "Architecture Pattern": "Arch",
    "Version/Stack": "Ver",
    "Brand Tone": "Tone",
    "Core Values": "Val",
    "Target Audience": "Aud",
    "Words/Phrases to Avoid": "Avoid",
    "Example Copy": "Ex",
    "Academic Field": "Field",
    "Citation Style": "Cite",
    "Academic Audience": "Aud",
    "Rigor Level": "Rigor",
    "Methodology": "Method",
  };

  return abbreviations[fieldName] || fieldName.slice(0, 4);
}

/**
 * Compress a field value by removing redundant words
 */
function compressValue(value: string): string {
  // Remove common filler words
  const fillers = ["the", "a", "an", "is", "are", "be", "to", "of", "and", "or"];
  const words = value.split(/\s+/);

  // Keep first 50 chars max per field for extreme compression
  if (value.length > 50) {
    return value.slice(0, 50).trim() + "...";
  }

  return value;
}

/**
 * Build full raw context text (non-compressed)
 */
export function buildRawContext(context: Context, template: ContextTemplate): string {
  const parts: string[] = [];

  for (const field of template.fields) {
    const value = context.fields[field.fieldId];
    if (value && value.trim()) {
      parts.push(`${field.fieldName}: ${value}`);
    }
  }

  return parts.join("\n");
}

/**
 * Calculate context token count (rough estimate)
 */
export function estimateContextTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Merge multiple contexts efficiently
 */
export function mergeContexts(contexts: Context[]): string {
  if (contexts.length === 0) return "";
  if (contexts.length === 1) return contexts[0].compressedText;

  const parts: string[] = [];

  for (const context of contexts) {
    // Add context type prefix
    const prefix = context.contextType === "project" ? "📦" : "🎯";
    parts.push(`${prefix} ${context.compressedText}`);
  }

  return parts.join(" • ");
}

/**
 * Get context priority score for sorting
 */
export function getContextPriority(context: Context): number {
  // Project context has highest priority
  if (context.contextType === "project") return 3;
  // Session context next
  if (context.contextType === "session") return 2;
  // Presets last
  return 1;
}

/**
 * Smart context selection based on token budget
 */
export function selectContextsForBudget(
  contexts: Context[],
  maxTokens: number
): Context[] {
  // Sort by priority
  const sorted = [...contexts].sort((a, b) =>
    getContextPriority(b) - getContextPriority(a)
  );

  const selected: Context[] = [];
  let totalTokens = 0;

  for (const context of sorted) {
    if (totalTokens + context.tokenCount <= maxTokens) {
      selected.push(context);
      totalTokens += context.tokenCount;
    }
  }

  return selected;
}
