import { RealTimeTip } from "@/types";

/**
 * Real-Time Tips System
 *
 * Analyzes prompts as users type and provides contextual guidance
 */

// ============================================================================
// Tip Definitions
// ============================================================================

export const tooVagueTip: RealTimeTip = {
  tipId: "too-vague",
  trigger: "typing",
  priority: "high",
  condition: (prompt: string) => {
    const vagueWords = ["something", "stuff", "things", "help me", "do this"];
    const hasVagueWords = vagueWords.some((word) =>
      prompt.toLowerCase().includes(word)
    );
    const isTooShort = prompt.trim().split(/\s+/).length < 5;
    return hasVagueWords && isTooShort;
  },
  message: "Your prompt seems vague. Try being more specific about what you want.",
  suggestion:
    "Instead of 'help me with something', try 'Write a 200-word blog post about X'",
  learnMore: "be-specific",
};

export const missingContextTip: RealTimeTip = {
  tipId: "missing-context",
  trigger: "typing",
  priority: "medium",
  condition: (prompt: string) => {
    const hasTask = /\b(write|create|build|fix|analyze|explain)\b/i.test(prompt);
    const hasContext = /\b(for|because|about|regarding|context|background)\b/i.test(
      prompt
    );
    return hasTask && !hasContext && prompt.length > 20;
  },
  message: "Consider adding context to help the AI understand your needs better.",
  suggestion:
    "Add details like: Who is the audience? What's the purpose? Any constraints?",
  learnMore: "provide-context",
};

export const tooLongTip: RealTimeTip = {
  tipId: "too-long",
  trigger: "typing",
  priority: "medium",
  condition: (prompt: string) => {
    const wordCount = prompt.trim().split(/\s+/).length;
    return wordCount > 500;
  },
  message:
    "This prompt is quite long (500+ words). Consider making it more concise.",
  suggestion:
    "Use bullet points for requirements and remove redundant explanations.",
  learnMore: "token-opt-101",
};

export const noStructureTip: RealTimeTip = {
  tipId: "no-structure",
  trigger: "pause",
  priority: "low",
  condition: (prompt: string) => {
    const wordCount = prompt.trim().split(/\s+/).length;
    const hasStructure = /[-•*]|\d+\.|<\w+>|\n\n/.test(prompt);
    return wordCount > 50 && !hasStructure;
  },
  message: "Long prompts benefit from structure. Consider organizing with bullet points.",
  suggestion: `Try this format:
Task: [What you want]
Requirements:
- Requirement 1
- Requirement 2
Format: [Expected output format]`,
  learnMore: "structure-prompt",
};

export const noExamplesTip: RealTimeTip = {
  tipId: "no-examples",
  trigger: "pause",
  priority: "low",
  condition: (prompt: string) => {
    const hasFormatRequest =
      /\b(format|style|structure|pattern|template)\b/i.test(prompt);
    const hasExamples = /example|like this|such as/i.test(prompt);
    return hasFormatRequest && !hasExamples && prompt.length > 30;
  },
  message: "When requesting specific formats, examples help clarify expectations.",
  suggestion: `Add examples like:
Input: "example input"
Output: "expected output"`,
  learnMore: "few-shot-when",
};

export const possibleInjectionTip: RealTimeTip = {
  tipId: "possible-injection",
  trigger: "typing",
  priority: "high",
  condition: (prompt: string) => {
    const injectionPatterns = [
      /ignore.*(previous|above|prior)/i,
      /you are now/i,
      /system:/i,
      /\[INST\]/i,
      /<\/instructions>/i,
    ];
    return injectionPatterns.some((pattern) => pattern.test(prompt));
  },
  message:
    "⚠️ This looks like a prompt injection attempt. Use delimiters if this is user input.",
  suggestion: `Wrap user input:
<user_input>
${"{user_text}"}
</user_input>`,
  learnMore: "prompt-injection-basics",
};

export const missingConstraintsTip: RealTimeTip = {
  tipId: "missing-constraints",
  trigger: "pause",
  priority: "medium",
  condition: (prompt: string) => {
    const hasOpenEndedTask = /write|create|generate|explain/i.test(prompt);
    const hasConstraints =
      /\b(max|min|limit|no more than|at most|at least|must|should not)\b/i.test(
        prompt
      );
    const wordCount = prompt.trim().split(/\s+/).length;
    return hasOpenEndedTask && !hasConstraints && wordCount > 10;
  },
  message: "Open-ended tasks benefit from constraints like length limits or format.",
  suggestion:
    "Add constraints like: 'Max 300 words', 'Use bullet points', 'No technical jargon'",
  learnMore: "set-constraints",
};

export const unclearAudienceTip: RealTimeTip = {
  tipId: "unclear-audience",
  trigger: "pause",
  priority: "low",
  condition: (prompt: string) => {
    const hasExplanationTask = /explain|describe|teach|introduce/i.test(prompt);
    const hasAudience = /\b(for|to|audience|beginner|expert|level)\b/i.test(prompt);
    return hasExplanationTask && !hasAudience && prompt.length > 20;
  },
  message: "When explaining concepts, specifying the audience level helps.",
  suggestion:
    "Add: 'for beginners', 'for experts', or 'for high school students'",
  learnMore: "be-specific",
};

export const redundancyTip: RealTimeTip = {
  tipId: "redundancy",
  trigger: "pause",
  priority: "low",
  condition: (prompt: string) => {
    const redundantPhrases = [
      /please help me to/i,
      /I would like you to please/i,
      /could you please/i,
      /detailed and comprehensive/i,
      /complete and thorough/i,
    ];
    return redundantPhrases.some((pattern) => pattern.test(prompt));
  },
  message: "Remove polite filler words to save tokens and improve clarity.",
  suggestion: "'Please help me write' → 'Write'",
  learnMore: "token-opt-101",
};

export const noFormatSpecifiedTip: RealTimeTip = {
  tipId: "no-format",
  trigger: "pause",
  priority: "low",
  condition: (prompt: string) => {
    const hasCreationTask = /write|create|generate|produce/i.test(prompt);
    const hasFormat =
      /\b(json|markdown|html|csv|bullet|list|paragraph|code)\b/i.test(prompt);
    const wordCount = prompt.trim().split(/\s+/).length;
    return hasCreationTask && !hasFormat && wordCount > 15;
  },
  message: "Specifying the output format helps get consistent results.",
  suggestion: "Add: 'Format: JSON', 'Use markdown', or 'Write as bullet points'",
  learnMore: "be-specific",
};

// ============================================================================
// Export All Tips
// ============================================================================

export const ALL_TIPS: RealTimeTip[] = [
  tooVagueTip,
  missingContextTip,
  tooLongTip,
  noStructureTip,
  noExamplesTip,
  possibleInjectionTip,
  missingConstraintsTip,
  unclearAudienceTip,
  redundancyTip,
  noFormatSpecifiedTip,
];

// ============================================================================
// Tip Analysis Engine
// ============================================================================

/**
 * Analyze a prompt and return applicable tips
 */
export function analyzePromptForTips(
  prompt: string,
  trigger: "typing" | "pause" = "typing",
  tipFrequency: "high" | "medium" | "low" = "medium"
): RealTimeTip[] {
  if (!prompt || prompt.trim().length === 0) {
    return [];
  }

  // Filter tips by trigger type
  const relevantTips = ALL_TIPS.filter((tip) => tip.trigger === trigger);

  // Find applicable tips
  const applicableTips = relevantTips.filter((tip) => {
    try {
      return tip.condition(prompt);
    } catch (error) {
      console.error(`Error checking tip ${tip.tipId}:`, error);
      return false;
    }
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  applicableTips.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // Limit number of tips based on frequency setting
  const maxTips = tipFrequency === "high" ? 3 : tipFrequency === "medium" ? 2 : 1;
  return applicableTips.slice(0, maxTips);
}

/**
 * Get a specific tip by ID
 */
export function getTipById(tipId: string): RealTimeTip | null {
  return ALL_TIPS.find((tip) => tip.tipId === tipId) || null;
}

/**
 * Filter tips by priority
 */
export function getTipsByPriority(priority: "high" | "medium" | "low"): RealTimeTip[] {
  return ALL_TIPS.filter((tip) => tip.priority === priority);
}
