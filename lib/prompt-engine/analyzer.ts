import { Intent, Domain, PromptAnalysis } from "@/types";

// Helper function to count tokens (rough approximation)
export function countTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Classify the intent of a prompt
export function classifyIntent(prompt: string): Intent {
  const lower = prompt.toLowerCase();

  // Creative patterns
  if (
    lower.match(
      /\b(create|generate|design|draw|paint|imagine|visualize|compose|write|story|art|image|video|music)\b/
    )
  ) {
    return "creative";
  }

  // Code patterns
  if (
    lower.match(
      /\b(code|program|function|class|debug|implement|algorithm|script|api|database|sql)\b/
    )
  ) {
    return "code";
  }

  // Analysis patterns
  if (
    lower.match(
      /\b(analyze|examine|evaluate|assess|compare|investigate|study|research|find|search)\b/
    )
  ) {
    return "analysis";
  }

  // Data processing patterns
  if (
    lower.match(
      /\b(process|transform|convert|parse|extract|filter|sort|aggregate|calculate)\b/
    )
  ) {
    return "data_processing";
  }

  // Instruction patterns
  if (
    lower.match(
      /\b(how to|explain|teach|show me|guide|steps|instructions|tutorial)\b/
    )
  ) {
    return "instruction";
  }

  // Conversation patterns
  if (lower.match(/\b(what is|tell me|why|who|when|where|opinion|think)\b/)) {
    return "conversation";
  }

  return "unknown";
}

// Detect the domain of a prompt
export function detectDomain(prompt: string): Domain {
  const lower = prompt.toLowerCase();

  // Technical domain
  if (
    lower.match(
      /\b(api|algorithm|code|programming|software|hardware|network|server|database|cloud|devops|system|architecture)\b/
    )
  ) {
    return "technical";
  }

  // Business domain
  if (
    lower.match(
      /\b(business|marketing|sales|revenue|profit|customer|client|strategy|management|operations|finance)\b/
    )
  ) {
    return "business";
  }

  // Academic domain
  if (
    lower.match(
      /\b(research|study|academic|theory|hypothesis|experiment|thesis|paper|journal|citation)\b/
    )
  ) {
    return "academic";
  }

  // Creative domain
  if (
    lower.match(
      /\b(art|design|creative|story|narrative|character|plot|visual|aesthetic|composition)\b/
    )
  ) {
    return "creative";
  }

  return "general";
}

// Assess complexity of a prompt (1-10 scale)
export function assessComplexity(prompt: string): number {
  let score = 1;

  // Length factor
  const wordCount = prompt.split(/\s+/).length;
  if (wordCount > 100) score += 3;
  else if (wordCount > 50) score += 2;
  else if (wordCount > 20) score += 1;

  // Multiple questions or tasks
  const questionCount = (prompt.match(/\?/g) || []).length;
  score += Math.min(questionCount, 2);

  // Complex vocabulary
  const complexWords = prompt.match(
    /\b\w{12,}\b/g
  ); // Words with 12+ characters
  if (complexWords && complexWords.length > 3) score += 1;

  // Technical jargon
  if (
    prompt.match(
      /\b(algorithm|implementation|architecture|optimization|integration)\b/i
    )
  ) {
    score += 1;
  }

  // Multiple constraints or requirements
  const constraints = prompt.match(/\b(must|should|need to|require|ensure)\b/gi);
  if (constraints && constraints.length > 2) score += 1;

  return Math.min(score, 10);
}

// Find missing components in a prompt
export function findMissingComponents(prompt: string): string[] {
  const missing: string[] = [];
  const lower = prompt.toLowerCase();

  // Check for context
  if (
    !lower.match(/\b(context|background|situation|scenario|currently)\b/) &&
    prompt.length > 50
  ) {
    missing.push("Context or background information");
  }

  // Check for specific goals
  if (
    !lower.match(/\b(goal|objective|want|need|result|output|outcome)\b/) &&
    prompt.length > 30
  ) {
    missing.push("Clear goal or desired outcome");
  }

  // Check for constraints
  if (
    !lower.match(/\b(limit|constraint|within|maximum|minimum|must not)\b/) &&
    prompt.length > 50
  ) {
    missing.push("Constraints or limitations");
  }

  // Check for examples (for complex tasks)
  if (
    assessComplexity(prompt) > 6 &&
    !lower.match(/\b(example|instance|like|such as|for example)\b/)
  ) {
    missing.push("Examples or reference cases");
  }

  // Check for format specification
  if (
    lower.match(/\b(generate|create|write|produce)\b/) &&
    !lower.match(/\b(format|structure|style|template)\b/)
  ) {
    missing.push("Output format specification");
  }

  return missing;
}

// Detect conflicts in a prompt
export function detectConflicts(prompt: string): string[] {
  const conflicts: string[] = [];
  const lower = prompt.toLowerCase();

  // Contradictory requirements
  if (lower.includes("brief") && lower.includes("detailed")) {
    conflicts.push("Contradictory length requirements (brief vs detailed)");
  }

  if (lower.includes("simple") && lower.includes("complex")) {
    conflicts.push("Contradictory complexity (simple vs complex)");
  }

  if (lower.includes("formal") && lower.includes("casual")) {
    conflicts.push("Contradictory tone (formal vs casual)");
  }

  // Unrealistic constraints
  if (
    lower.match(/\b(comprehensive|complete|thorough)\b/) &&
    lower.match(/\b(short|brief|quick|concise)\b/)
  ) {
    conflicts.push("Unrealistic scope (comprehensive but short)");
  }

  // Token limit conflicts
  const hasMaxTokens = lower.match(/\b(\d+)\s*(token|word|character)s?\b/);
  if (hasMaxTokens) {
    const limit = parseInt(hasMaxTokens[1]);
    const estimatedTokens = countTokens(prompt);
    if (limit < estimatedTokens * 5) {
      conflicts.push(`Token limit (${limit}) may be too low for requirements`);
    }
  }

  return conflicts;
}

// Extract the core pain point or need
export function extractPainPoint(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Look for explicit problem statements
  if (lower.match(/\b(problem|issue|challenge|difficulty|struggling)\b/)) {
    const match = prompt.match(
      /(problem|issue|challenge|difficulty|struggling)[^.!?]*/i
    );
    if (match) return match[0].trim();
  }

  // Look for need statements
  if (lower.match(/\b(need|want|require|looking for)\b/)) {
    const match = prompt.match(/(need|want|require|looking for)[^.!?]*/i);
    if (match) return match[0].trim();
  }

  // Look for help requests
  if (lower.match(/\b(help|assist|support)\b/)) {
    const match = prompt.match(/(help|assist|support)[^.!?]*/i);
    if (match) return match[0].trim();
  }

  // Fallback: return first sentence
  const firstSentence = prompt.match(/^[^.!?]+[.!?]/);
  if (firstSentence) return firstSentence[0].trim();

  return "User wants to accomplish a task";
}

// Calculate quality score (0-100)
export function calculateQualityScore(prompt: string): number {
  let score = 50; // Start at 50%

  // Length bonus (not too short, not too long)
  const wordCount = prompt.split(/\s+/).length;
  if (wordCount >= 10 && wordCount <= 100) score += 10;
  else if (wordCount >= 5 && wordCount <= 200) score += 5;
  else if (wordCount < 5) score -= 15;

  // Clarity bonus (has clear action words)
  if (prompt.match(/\b(create|analyze|generate|explain|write|build)\b/i)) {
    score += 10;
  }

  // Context bonus
  if (
    prompt.match(/\b(context|background|currently|situation|scenario)\b/i)
  ) {
    score += 10;
  }

  // Specificity bonus
  if (prompt.match(/\b(specific|exactly|precisely|particular)\b/i)) {
    score += 5;
  }

  // Missing components penalty
  const missing = findMissingComponents(prompt);
  score -= missing.length * 5;

  // Conflicts penalty
  const conflicts = detectConflicts(prompt);
  score -= conflicts.length * 10;

  // Grammar and formatting bonus
  if (prompt.match(/^[A-Z]/) && prompt.match(/[.!?]$/)) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

// Main analysis function
export function analyzePrompt(prompt: string): PromptAnalysis {
  return {
    intent: classifyIntent(prompt),
    domain: detectDomain(prompt),
    complexity: assessComplexity(prompt),
    missingComponents: findMissingComponents(prompt),
    conflicts: detectConflicts(prompt),
    painPoint: extractPainPoint(prompt),
    tokenCount: countTokens(prompt),
    qualityScore: calculateQualityScore(prompt),
  };
}
