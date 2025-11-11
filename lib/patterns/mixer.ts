import { PromptPattern, PatternCombination, Intent } from "@/types";
import { promptPatterns, getPatternById } from "./library";

/**
 * Pre-defined effective pattern combinations
 */
export const patternCombinations: PatternCombination[] = [
  {
    combinationId: "combo-reasoning-pro",
    combinationName: "Reasoning Pro",
    patterns: [
      getPatternById("pattern-cot")!,
      getPatternById("pattern-few-shot")!,
      getPatternById("pattern-self-consistency")!,
    ],
    combinationTemplate: `{few-shot-examples}

{task}

{chain-of-thought}

{self-consistency-paths}`,
    effectivenessScore: 94,
    useCount: 0,
    successRate: 0.92,
    applicableIntents: ["analysis", "code", "data_processing"],
    description: "Combines examples, step-by-step reasoning, and multiple paths for maximum accuracy",
  },
  {
    combinationId: "combo-creative-expert",
    combinationName: "Creative Expert",
    patterns: [
      getPatternById("pattern-persona")!,
      getPatternById("pattern-tot")!,
      getPatternById("pattern-instruction")!,
    ],
    combinationTemplate: `{persona-definition}

{task}

{tree-of-thoughts}

{instruction-format}`,
    effectivenessScore: 89,
    useCount: 0,
    successRate: 0.88,
    applicableIntents: ["creative", "conversation"],
    description: "Expert persona explores multiple creative approaches with clear instructions",
  },
  {
    combinationId: "combo-safe-and-smart",
    combinationName: "Safe & Smart",
    patterns: [
      getPatternById("pattern-constitutional")!,
      getPatternById("pattern-cot")!,
      getPatternById("pattern-instruction")!,
    ],
    combinationTemplate: `{constitutional-guidelines}

{task}

{instruction-format}

{chain-of-thought}`,
    effectivenessScore: 91,
    useCount: 0,
    successRate: 0.90,
    applicableIntents: ["conversation", "instruction", "creative"],
    description: "Ethical guidelines + structured reasoning for safe, reliable outputs",
  },
  {
    combinationId: "combo-debug-master",
    combinationName: "Debug Master",
    patterns: [
      getPatternById("pattern-react")!,
      getPatternById("pattern-cot")!,
      getPatternById("pattern-few-shot")!,
    ],
    combinationTemplate: `{few-shot-examples}

{task}

{react-thought-action}

{chain-of-thought}`,
    effectivenessScore: 90,
    useCount: 0,
    successRate: 0.87,
    applicableIntents: ["code", "data_processing", "analysis"],
    description: "Iterative investigation with examples and reasoning for debugging tasks",
  },
];

/**
 * Apply a single pattern to a prompt
 */
export function applyPattern(
  prompt: string,
  pattern: PromptPattern,
  context?: string
): string {
  let result = pattern.template;

  // Replace placeholders
  result = result.replace(/{task}/g, prompt);
  result = result.replace(/{context}/g, context || "");

  // Pattern-specific replacements
  if (pattern.patternType === "persona") {
    result = result.replace(/{persona}/g, "expert");
    result = result.replace(/{domain}/g, "this field");
  }

  if (pattern.patternType === "constitutional-ai") {
    result = result.replace(/{additional_guidelines}/g, "");
  }

  if (pattern.patternType === "instruction-following") {
    result = result.replace(/{instruction1}/g, "Complete the task thoroughly");
    result = result.replace(/{instruction2}/g, "Follow the format specified");
    result = result.replace(/{instruction3}/g, "Explain your reasoning");
    result = result.replace(/{format_requirements}/g, "Clear, structured output");
    result = result.replace(/{constraints}/g, "None");
  }

  return result.trim();
}

/**
 * Combine multiple patterns into a single prompt
 */
export function combinePatterns(
  prompt: string,
  patterns: PromptPattern[],
  context?: string
): string {
  if (patterns.length === 0) return prompt;
  if (patterns.length === 1) return applyPattern(prompt, patterns[0], context);

  // Build combined prompt
  let combined = "";

  // Group patterns by category for smart ordering
  const reasoning = patterns.filter((p) => p.category === "reasoning");
  const examples = patterns.filter((p) => p.category === "examples");
  const structure = patterns.filter((p) => p.category === "structure");
  const safety = patterns.filter((p) => p.category === "safety");
  const persona = patterns.filter((p) => p.category === "persona");

  // Optimal order: Safety → Persona → Examples → Structure → Reasoning
  const orderedPatterns = [...safety, ...persona, ...examples, ...structure, ...reasoning];

  // Add each pattern's key elements
  orderedPatterns.forEach((pattern) => {
    if (pattern.patternType === "constitutional-ai") {
      combined += "Guidelines for this response:\n";
      combined += "1. Be helpful and provide accurate information\n";
      combined += "2. Be harmless - avoid biased or dangerous content\n";
      combined += "3. Be honest - acknowledge limitations\n\n";
    }

    if (pattern.patternType === "persona") {
      combined += "Role: You are an expert in this domain.\n\n";
    }

    if (pattern.patternType === "few-shot") {
      combined += "[Examples would be inserted here based on context]\n\n";
    }

    if (pattern.patternType === "instruction-following") {
      combined += "Instructions:\n";
      combined += "- Follow the format specified\n";
      combined += "- Provide clear explanations\n\n";
    }
  });

  // Add the actual task
  combined += `Task: ${prompt}\n\n`;

  // Add context if provided
  if (context) {
    combined += `Context: ${context}\n\n`;
  }

  // Add reasoning patterns last
  const hasCoT = reasoning.some((p) => p.patternType === "chain-of-thought");
  const hasReact = reasoning.some((p) => p.patternType === "react");
  const hasToT = reasoning.some((p) => p.patternType === "tree-of-thoughts");

  if (hasToT) {
    combined += "Explore multiple approaches before deciding:\n";
    combined += "- Approach 1: [Details]\n";
    combined += "- Approach 2: [Details]\n";
    combined += "- Evaluation: [Compare approaches]\n\n";
  }

  if (hasCoT || reasoning.length > 0) {
    combined += "Let's think through this step by step:\n";
  }

  if (hasReact) {
    combined += "Use the Thought-Action-Observation pattern:\n";
    combined += "- Thought: [What to do]\n";
    combined += "- Action: [Do it]\n";
    combined += "- Observation: [Result]\n";
  }

  return combined.trim();
}

/**
 * Calculate effectiveness score for a pattern combination
 */
export function calculateCombinationScore(patterns: PromptPattern[]): number {
  if (patterns.length === 0) return 0;
  if (patterns.length === 1) return patterns[0].effectivenessScore;

  // Base score: average of individual pattern scores
  const avgScore = patterns.reduce((sum, p) => sum + p.effectivenessScore, 0) / patterns.length;

  // Bonus for compatible patterns
  let compatibilityBonus = 0;
  for (let i = 0; i < patterns.length; i++) {
    for (let j = i + 1; j < patterns.length; j++) {
      if (patterns[i].compatiblePatterns.includes(patterns[j].patternId)) {
        compatibilityBonus += 5;
      }
    }
  }

  // Penalty for too many patterns (complexity)
  let complexityPenalty = 0;
  if (patterns.length > 3) {
    complexityPenalty = (patterns.length - 3) * 3;
  }

  // Final score (capped at 100)
  return Math.min(100, Math.max(0, avgScore + compatibilityBonus - complexityPenalty));
}

/**
 * Suggest best pattern combination for an intent
 */
export function suggestPatternsForIntent(intent: Intent): PromptPattern[] {
  const recommendations: Record<Intent, string[]> = {
    creative: ["pattern-persona", "pattern-tot", "pattern-instruction"],
    code: ["pattern-cot", "pattern-few-shot", "pattern-react"],
    analysis: ["pattern-cot", "pattern-self-consistency", "pattern-tot"],
    conversation: ["pattern-persona", "pattern-constitutional", "pattern-instruction"],
    data_processing: ["pattern-cot", "pattern-few-shot", "pattern-instruction"],
    instruction: ["pattern-instruction", "pattern-cot", "pattern-few-shot"],
    unknown: ["pattern-cot", "pattern-instruction"],
  };

  const patternIds = recommendations[intent] || [];
  return patternIds.map((id) => getPatternById(id)!).filter(Boolean);
}

/**
 * Check if patterns are compatible
 */
export function arePatternsCompatible(pattern1: PromptPattern, pattern2: PromptPattern): boolean {
  return (
    pattern1.compatiblePatterns.includes(pattern2.patternId) ||
    pattern2.compatiblePatterns.includes(pattern1.patternId)
  );
}

/**
 * Get best pre-defined combination for intent
 */
export function getBestCombinationForIntent(intent: Intent): PatternCombination | undefined {
  const applicable = patternCombinations.filter((combo) =>
    combo.applicableIntents.includes(intent)
  );

  if (applicable.length === 0) return undefined;

  // Return highest effectiveness score
  return applicable.reduce((best, current) =>
    current.effectivenessScore > best.effectivenessScore ? current : best
  );
}
