import { Platform, Intent, Domain, Tone } from "@/types";
import { analyzePrompt } from "./analyzer";

/**
 * Hermes Prompt Enhancement Engine
 *
 * Applies real prompt engineering techniques:
 * - Structured role/task/constraint framing
 * - Platform-specific formatting (XML tags for Claude, JSON mode hints for GPT, etc.)
 * - Intent-aware enhancement strategies
 * - Few-shot injection with relevant examples
 * - Token-efficient output
 */

// ============================================================================
// Core Enhancement Pipeline
// ============================================================================

export interface EnhanceOptions {
  tone?: Tone;
  fewShotCount?: number;
  systemMessage?: string;
  resolveAmbiguity?: boolean;
  datasetContent?: string;
  contextText?: string;
  role?: string;
  constraints?: string[];
  outputFormat?: string;
}

/**
 * Main enhancement function - builds a properly structured prompt
 */
export function enhancePrompt(
  prompt: string,
  platform: Platform,
  options: EnhanceOptions = {}
): string {
  const analysis = analyzePrompt(prompt);
  const sections: string[] = [];

  // 1. System framing (role + expertise)
  const systemFrame = buildSystemFrame(analysis.intent, analysis.domain, options);
  if (systemFrame) sections.push(systemFrame);

  // 2. Context injection (dataset, user context)
  const context = buildContextSection(options.datasetContent, options.contextText);
  if (context) sections.push(context);

  // 3. Task definition (the actual prompt, restructured)
  sections.push(buildTaskSection(prompt, analysis, options));

  // 4. Output specification
  const outputSpec = buildOutputSpec(analysis.intent, platform, options);
  if (outputSpec) sections.push(outputSpec);

  // 5. Constraints and guardrails
  const constraints = buildConstraints(analysis, options);
  if (constraints) sections.push(constraints);

  // 6. Few-shot examples
  if (options.fewShotCount && options.fewShotCount > 0) {
    const examples = buildFewShotExamples(analysis.intent, options.fewShotCount);
    if (examples) sections.push(examples);
  }

  // 7. Apply platform-specific formatting
  let result = formatForPlatform(sections, platform);

  // 8. Token optimization
  result = optimizeTokens(result, platform.maxTokens);

  return result;
}

// ============================================================================
// Section Builders
// ============================================================================

function buildSystemFrame(
  intent: Intent,
  domain: Domain,
  options: EnhanceOptions
): string | null {
  if (options.systemMessage) {
    return options.systemMessage;
  }

  const role = options.role || inferRole(intent, domain);
  if (!role) return null;

  const toneDirective = getToneDirective(options.tone);

  let frame = `You are ${role}.`;
  if (toneDirective) {
    frame += ` ${toneDirective}`;
  }

  return frame;
}

function inferRole(intent: Intent, domain: Domain): string | null {
  const roleMap: Record<string, Record<string, string>> = {
    code: {
      technical: "a senior software engineer with deep systems knowledge",
      business: "a technical lead who bridges engineering and business requirements",
      general: "an experienced developer focused on clean, maintainable code",
    },
    creative: {
      creative: "a skilled creative writer with a distinctive voice",
      business: "a senior copywriter who drives conversions through compelling narrative",
      general: "a creative professional who balances originality with clarity",
    },
    analysis: {
      technical: "a data analyst who extracts actionable insights from complex systems",
      business: "a strategic analyst who translates data into business decisions",
      academic: "a researcher committed to rigorous, evidence-based analysis",
      general: "an analytical thinker who breaks down complexity into clear findings",
    },
    instruction: {
      technical: "an experienced technical writer who makes complex topics accessible",
      academic: "an educator who builds understanding through structured explanation",
      general: "a clear communicator who explains things step by step",
    },
    conversation: {
      general: "a knowledgeable assistant who gives direct, useful answers",
    },
    data_processing: {
      technical: "a data engineer focused on accuracy and efficient transformation",
      general: "a detail-oriented processor who handles data with precision",
    },
  };

  const intentRoles = roleMap[intent] || roleMap.conversation;
  return intentRoles?.[domain] || intentRoles?.general || null;
}

function getToneDirective(tone?: Tone): string | null {
  if (!tone) return null;

  const directives: Record<Tone, string> = {
    professional: "Communicate with precision and authority. No filler.",
    casual: "Keep it conversational and approachable, but still useful.",
    academic: "Use rigorous, precise language. Cite reasoning. Be thorough.",
    spartan: "Maximum information density. Zero fluff. Every word earns its place.",
    laconic: "Brevity is everything. Say it in the fewest words possible.",
    sarcastic: "Be sharp and witty, but make sure the actual content is solid.",
  };

  return directives[tone] || null;
}

function buildContextSection(
  datasetContent?: string,
  contextText?: string
): string | null {
  const parts: string[] = [];

  if (contextText) {
    parts.push(contextText.trim());
  }

  if (datasetContent) {
    // Trim to reasonable size for context
    const trimmed = datasetContent.substring(0, 3000);
    parts.push(`Reference material:\n${trimmed}`);
  }

  if (parts.length === 0) return null;

  return parts.join("\n\n");
}

function buildTaskSection(
  prompt: string,
  analysis: ReturnType<typeof analyzePrompt>,
  options: EnhanceOptions
): string {
  const cleaned = prompt.trim();

  // For simple, well-formed prompts - don't over-engineer
  if (analysis.qualityScore >= 75 && analysis.missingComponents.length === 0) {
    return cleaned;
  }

  // For underspecified prompts - add structure
  let task = cleaned;

  // If the prompt is vague, add specificity hints
  if (analysis.missingComponents.length > 0 && options.resolveAmbiguity) {
    const additions: string[] = [];

    for (const missing of analysis.missingComponents) {
      if (missing.includes("Context")) {
        additions.push("Provide relevant context where it aids understanding.");
      }
      if (missing.includes("goal")) {
        additions.push("Be specific about the desired outcome.");
      }
      if (missing.includes("format")) {
        additions.push("Structure the output for readability.");
      }
    }

    if (additions.length > 0) {
      task += "\n\n" + additions.join(" ");
    }
  }

  return task;
}

function buildOutputSpec(
  intent: Intent,
  platform: Platform,
  options: EnhanceOptions
): string | null {
  const specs: string[] = [];

  // Format specification
  if (options.outputFormat) {
    specs.push(`Format: ${options.outputFormat}`);
  }

  // Intent-specific output guidance
  const intentGuidance: Partial<Record<Intent, string>> = {
    code: "Include working code with brief inline comments for non-obvious logic. No boilerplate explanations.",
    analysis: "Lead with the key finding. Support with evidence. End with actionable recommendation.",
    creative: "Focus on originality and voice. Show, don't tell.",
    instruction: "Use numbered steps. Each step should be independently actionable.",
    data_processing: "Return structured data. Validate format before output.",
  };

  const guidance = intentGuidance[intent];
  if (guidance) {
    specs.push(guidance);
  }

  if (specs.length === 0) return null;

  return specs.join("\n");
}

function buildConstraints(
  analysis: ReturnType<typeof analyzePrompt>,
  options: EnhanceOptions
): string | null {
  const constraints: string[] = [];

  // User-specified constraints
  if (options.constraints && options.constraints.length > 0) {
    constraints.push(...options.constraints);
  }

  // Conflict resolution
  if (analysis.conflicts.length > 0) {
    for (const conflict of analysis.conflicts) {
      if (conflict.includes("brief vs detailed")) {
        constraints.push("Prioritize completeness over brevity when they conflict.");
      }
    }
  }

  if (constraints.length === 0) return null;

  return "Constraints:\n" + constraints.map(c => `- ${c}`).join("\n");
}

function buildFewShotExamples(intent: Intent, count: number): string | null {
  const examples = getFewShotExamples(intent);
  const selected = examples.slice(0, count);

  if (selected.length === 0) return null;

  const formatted = selected.map((ex, i) =>
    `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`
  ).join("\n\n");

  return `Here are examples of the expected quality:\n\n${formatted}`;
}

interface FewShotExample {
  input: string;
  output: string;
}

function getFewShotExamples(intent: Intent): FewShotExample[] {
  const examples: Record<string, FewShotExample[]> = {
    creative: [
      {
        input: "Write about a sunset",
        output: "The horizon swallowed the sun in slow motion, leaving behind a bruise of violet and copper that bled into the water. The boats in the harbor became silhouettes, rocking gently as if nodding off to sleep."
      },
      {
        input: "Describe a busy market",
        output: "Voices layered over each other like competing radio stations. A woman haggled over pomegranates while her kid tugged her sleeve toward the honey stand. Everything smelled like cardamom and diesel."
      },
    ],
    code: [
      {
        input: "Function to debounce API calls",
        output: "function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}"
      },
      {
        input: "Rate limiter middleware",
        output: "const rateLimit = (windowMs: number, max: number) => {\n  const hits = new Map<string, number[]>();\n  return (req: Request) => {\n    const key = req.headers.get('x-forwarded-for') || 'unknown';\n    const now = Date.now();\n    const window = hits.get(key)?.filter(t => t > now - windowMs) || [];\n    if (window.length >= max) return new Response('Too many requests', { status: 429 });\n    window.push(now);\n    hits.set(key, window);\n  };\n};"
      },
    ],
    analysis: [
      {
        input: "Analyze the impact of remote work",
        output: "Key finding: Remote work increases individual output by 13% (Stanford, 2023) but reduces spontaneous collaboration by 20%. The net effect depends on role type - creative roles suffer, execution roles benefit. Recommendation: Hybrid model with 2-3 office days for collaborative roles."
      },
    ],
    instruction: [
      {
        input: "How to set up SSH keys",
        output: "1. Generate key pair: ssh-keygen -t ed25519 -C \"your@email.com\"\n2. Start agent: eval \"$(ssh-agent -s)\"\n3. Add key: ssh-add ~/.ssh/id_ed25519\n4. Copy public key: cat ~/.ssh/id_ed25519.pub\n5. Paste into GitHub > Settings > SSH Keys > New\n6. Test: ssh -T git@github.com"
      },
    ],
    conversation: [],
    data_processing: [
      {
        input: "Convert CSV dates from US to ISO format",
        output: "import csv\nfrom datetime import datetime\n\ndef convert_dates(input_file, output_file):\n    with open(input_file) as f_in, open(output_file, 'w', newline='') as f_out:\n        reader = csv.DictReader(f_in)\n        writer = csv.DictWriter(f_out, fieldnames=reader.fieldnames)\n        writer.writeheader()\n        for row in reader:\n            row['date'] = datetime.strptime(row['date'], '%m/%d/%Y').strftime('%Y-%m-%d')\n            writer.writerow(row)"
      },
    ],
    unknown: [],
  };

  return examples[intent] || [];
}

// ============================================================================
// Platform-Specific Formatting
// ============================================================================

function formatForPlatform(sections: string[], platform: Platform): string {
  const id = platform.id;

  // Claude - use XML tags for structure
  if (id === "claude") {
    return formatForClaude(sections);
  }

  // ChatGPT - use markdown headers
  if (id === "chatgpt" || id === "gpt4") {
    return formatForChatGPT(sections);
  }

  // Midjourney - completely different format
  if (id === "midjourney") {
    return formatForMidjourney(sections);
  }

  // DALL-E - descriptive prompt style
  if (id === "dalle") {
    return formatForImageGen(sections);
  }

  // Image generation platforms
  if (platform.category === "Image Generation") {
    return formatForImageGen(sections);
  }

  // Default - clean sections with spacing
  return formatDefault(sections);
}

function formatForClaude(sections: string[]): string {
  if (sections.length <= 1) return sections.join("\n\n");

  const parts: string[] = [];
  const [system, ...rest] = sections;

  // First section as system context
  if (system) parts.push(system);

  // Remaining sections in XML tags
  const tagNames = ["context", "task", "output_format", "constraints", "examples"];
  rest.forEach((section, i) => {
    const tag = tagNames[i] || `section_${i + 1}`;
    parts.push(`<${tag}>\n${section}\n</${tag}>`);
  });

  return parts.join("\n\n");
}

function formatForChatGPT(sections: string[]): string {
  if (sections.length <= 1) return sections.join("\n\n");

  const parts: string[] = [];
  const headers = ["## Role", "## Context", "## Task", "## Output Format", "## Constraints", "## Examples"];

  sections.forEach((section, i) => {
    if (i === 0 && section.startsWith("You are")) {
      // Role section - use as-is or with header
      parts.push(`${headers[0]}\n${section}`);
    } else {
      const header = headers[Math.min(i, headers.length - 1)];
      parts.push(`${header}\n${section}`);
    }
  });

  return parts.join("\n\n");
}

function formatForMidjourney(sections: string[]): string {
  // Midjourney wants comma-separated descriptors, not structured prompts
  const taskSection = sections.find(s => !s.startsWith("You are") && s.length > 10) || sections.join(" ");

  // Strip any structured formatting
  const cleaned = taskSection
    .replace(/\n+/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();

  // Add quality boosters if not already present
  const qualityTerms = ["high quality", "detailed", "professional", "8k", "masterpiece"];
  const hasQuality = qualityTerms.some(t => cleaned.toLowerCase().includes(t));

  const prompt = hasQuality ? cleaned : `${cleaned}, highly detailed, professional quality`;

  return `/imagine ${prompt} --v 6`;
}

function formatForImageGen(sections: string[]): string {
  // Image gen platforms want descriptive, comma-separated style
  const taskSection = sections.find(s => !s.startsWith("You are") && s.length > 10) || sections.join(" ");

  return taskSection
    .replace(/\n+/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
}

function formatDefault(sections: string[]): string {
  return sections.join("\n\n");
}

// ============================================================================
// Token Optimization
// ============================================================================

function optimizeTokens(prompt: string, maxTokens: number): string {
  const estimatedTokens = Math.ceil(prompt.length / 4);

  // Only optimize if we're over 80% of limit
  if (estimatedTokens <= maxTokens * 0.8) {
    return prompt;
  }

  // Trim to fit within limit
  const targetLength = Math.floor(maxTokens * 4 * 0.85);
  let optimized = prompt.substring(0, targetLength);

  // End at a sentence boundary
  const lastSentence = optimized.lastIndexOf(".");
  if (lastSentence > targetLength * 0.7) {
    optimized = optimized.substring(0, lastSentence + 1);
  }

  return optimized;
}

// ============================================================================
// Variation Generation
// ============================================================================

/**
 * Generates distinct variations with different enhancement strategies
 */
export function generateVariations(
  prompt: string,
  platform: Platform,
  count: number = 3,
  options: EnhanceOptions = {}
): string[] {
  const analysis = analyzePrompt(prompt);
  const variations: string[] = [];

  // Variation 1: Precise - minimal additions, focused on structure
  variations.push(
    enhancePrompt(prompt, platform, {
      ...options,
      tone: options.tone || "professional",
      fewShotCount: 0,
      resolveAmbiguity: false,
    })
  );

  // Variation 2: Comprehensive - adds context, resolves ambiguity
  if (count >= 2) {
    variations.push(
      enhancePrompt(prompt, platform, {
        ...options,
        tone: options.tone || "professional",
        fewShotCount: analysis.complexity > 5 ? 1 : 0,
        resolveAmbiguity: true,
      })
    );
  }

  // Variation 3: Expert - maximum structure, examples, constraints
  if (count >= 3) {
    variations.push(
      enhancePrompt(prompt, platform, {
        ...options,
        tone: options.tone || "spartan",
        fewShotCount: analysis.complexity > 4 ? 2 : 1,
        resolveAmbiguity: true,
      })
    );
  }

  return variations;
}

// ============================================================================
// Scoring and Explanation
// ============================================================================

export function calculateImprovement(
  originalScore: number,
  enhancedScore: number
): number {
  if (originalScore === 0) return 0;
  return Math.round(((enhancedScore - originalScore) / originalScore) * 100);
}

export function explainImprovements(
  original: string,
  enhanced: string,
  platform: Platform
): string[] {
  const improvements: string[] = [];
  const originalAnalysis = analyzePrompt(original);
  const enhancedAnalysis = analyzePrompt(enhanced);

  // Check for role/persona framing
  if (enhanced.match(/^You are |<role>|## Role/m) && !original.match(/^You are /m)) {
    improvements.push("Added expert role framing for better-quality responses");
  }

  // Check for structural improvement
  const originalSections = original.split(/\n\n+/).length;
  const enhancedSections = enhanced.split(/\n\n+/).length;
  if (enhancedSections > originalSections + 1) {
    improvements.push("Restructured into clear sections for model clarity");
  }

  // Platform-specific formatting
  if (platform.id === "claude" && enhanced.includes("</")) {
    improvements.push("Applied XML tag structure optimized for Claude");
  } else if ((platform.id === "chatgpt" || platform.id === "gpt4") && enhanced.includes("## ")) {
    improvements.push("Applied markdown structure optimized for ChatGPT");
  } else if (platform.id === "midjourney" && enhanced.includes("/imagine")) {
    improvements.push("Converted to Midjourney-native prompt format");
  } else if (platform.category === "Image Generation") {
    improvements.push(`Formatted as descriptive prompt for ${platform.name}`);
  }

  // Check for output specification
  if (enhanced.match(/Format:|output_format|## Output/i) && !original.match(/format/i)) {
    improvements.push("Added output format specification to reduce ambiguity");
  }

  // Check for constraint addition
  if (enhanced.match(/Constraints?:|<constraints>/i) && !original.match(/constraint|must not/i)) {
    improvements.push("Added guardrails to prevent common failure modes");
  }

  // Few-shot examples
  if (enhanced.includes("Example 1:") && !original.includes("Example")) {
    improvements.push("Added few-shot examples to demonstrate expected quality");
  }

  // Tone specification
  if (enhanced.match(/precision|brevity|conversational|rigorous/i) && !original.match(/tone|style/i)) {
    improvements.push("Set explicit tone to guide response style");
  }

  // Quality score improvement
  const scoreDiff = enhancedAnalysis.qualityScore - originalAnalysis.qualityScore;
  if (scoreDiff > 10) {
    improvements.push(`Quality score: ${originalAnalysis.qualityScore} -> ${enhancedAnalysis.qualityScore} (+${scoreDiff})`);
  }

  // Ambiguity resolution
  if (originalAnalysis.missingComponents.length > enhancedAnalysis.missingComponents.length) {
    const resolved = originalAnalysis.missingComponents.length - enhancedAnalysis.missingComponents.length;
    improvements.push(`Resolved ${resolved} ambiguit${resolved === 1 ? 'y' : 'ies'} in the original prompt`);
  }

  return improvements.length > 0
    ? improvements
    : [`Optimized for ${platform.name} with structured formatting`];
}

// ============================================================================
// Wizard Prompt Assembly
// ============================================================================

/**
 * Assembles a structured prompt from Quick Mode wizard data
 */
export function assembleFromQuickMode(data: {
  initialPrompt: string;
  role?: string;
  customRole?: string;
  tone?: string;
  format?: string;
}): string {
  const sections: string[] = [];

  // Role
  const role = data.customRole || formatRoleLabel(data.role);
  if (role) {
    sections.push(`You are ${role}.`);
  }

  // Tone
  const toneDirective = data.tone ? getToneDirective(data.tone as Tone) : null;
  if (toneDirective) {
    sections.push(toneDirective);
  }

  // Task
  sections.push(data.initialPrompt.trim());

  // Format
  if (data.format && data.format !== "markdown") {
    const formatMap: Record<string, string> = {
      "blog-post": "Format as a blog post with a compelling headline, intro hook, structured body with subheadings, and a conclusion.",
      "twitter": "Format as a tweet. 280 characters max. Punchy and shareable.",
      "linkedin": "Format as a LinkedIn post. Professional but personable. Hook in the first line.",
      "research-paper": "Format with abstract, introduction, methodology, findings, and conclusion. Cite reasoning.",
      "conversational": "Write in a natural, conversational tone as if explaining to a colleague.",
      "spartan": "Maximum density. Zero filler. Every sentence carries weight.",
      "xml": "Structure the output using XML tags for clear machine-readable sections.",
      "javascript": "Output as JavaScript code with clear variable names and brief comments.",
    };
    const instruction = formatMap[data.format] || `Format: ${data.format}`;
    sections.push(instruction);
  }

  return sections.join("\n\n");
}

/**
 * Assembles a structured prompt from God Mode wizard data
 */
export function assembleFromGodMode(data: {
  identity: { role: string; customRole?: string; expertise?: string[] };
  task: { mainTask: string; context?: string; background?: string; specificRequirements?: string[] };
  constraints: { mustNotDo?: string[]; limitations?: string[] };
  outputConfig: { format: string; customFormat?: string; lengthMin?: number; lengthMax?: number; styleModifiers?: string[] };
  examples?: { input: string; output: string }[];
}): string {
  const sections: string[] = [];

  // Identity
  const role = data.identity.customRole || formatRoleLabel(data.identity.role);
  if (role) {
    let identity = `You are ${role}.`;
    if (data.identity.expertise && data.identity.expertise.length > 0) {
      identity += ` Your expertise includes: ${data.identity.expertise.join(", ")}.`;
    }
    sections.push(identity);
  }

  // Context
  if (data.task.context || data.task.background) {
    const contextParts: string[] = [];
    if (data.task.background) contextParts.push(data.task.background.trim());
    if (data.task.context) contextParts.push(data.task.context.trim());
    sections.push(contextParts.join("\n\n"));
  }

  // Task
  let task = data.task.mainTask.trim();
  if (data.task.specificRequirements && data.task.specificRequirements.length > 0) {
    task += "\n\nRequirements:\n" + data.task.specificRequirements.map(r => `- ${r}`).join("\n");
  }
  sections.push(task);

  // Output config
  const outputParts: string[] = [];
  const format = data.outputConfig.customFormat || data.outputConfig.format;
  if (format && format !== "markdown") {
    outputParts.push(`Format: ${format}`);
  }
  if (data.outputConfig.lengthMin || data.outputConfig.lengthMax) {
    const min = data.outputConfig.lengthMin;
    const max = data.outputConfig.lengthMax;
    if (min && max) outputParts.push(`Length: ${min}-${max} words`);
    else if (min) outputParts.push(`Minimum length: ${min} words`);
    else if (max) outputParts.push(`Maximum length: ${max} words`);
  }
  if (data.outputConfig.styleModifiers && data.outputConfig.styleModifiers.length > 0) {
    outputParts.push(`Style: ${data.outputConfig.styleModifiers.join(", ")}`);
  }
  if (outputParts.length > 0) {
    sections.push(outputParts.join("\n"));
  }

  // Constraints
  const allConstraints: string[] = [];
  if (data.constraints.mustNotDo) allConstraints.push(...data.constraints.mustNotDo);
  if (data.constraints.limitations) allConstraints.push(...data.constraints.limitations);
  if (allConstraints.length > 0) {
    sections.push("Do NOT:\n" + allConstraints.map(c => `- ${c}`).join("\n"));
  }

  // Examples
  if (data.examples && data.examples.length > 0) {
    const exampleStr = data.examples
      .filter(e => e.input.trim() && e.output.trim())
      .map((e, i) => `Example ${i + 1}:\nInput: ${e.input}\nOutput: ${e.output}`)
      .join("\n\n");
    if (exampleStr) {
      sections.push(exampleStr);
    }
  }

  return sections.join("\n\n");
}

function formatRoleLabel(role?: string): string | null {
  if (!role) return null;
  const labels: Record<string, string> = {
    "writing-assistant": "a skilled writer who adapts to any format and audience",
    "senior-developer": "a senior software engineer focused on clean, production-ready code",
    "data-analyst": "a data analyst who extracts actionable insights",
    "marketing-expert": "a marketing strategist who drives measurable results",
    "teacher": "an experienced educator who builds understanding step by step",
    "researcher": "a rigorous researcher committed to evidence-based analysis",
    "legal-advisor": "a legal professional providing clear, accurate guidance",
    "consultant": "a strategic consultant who delivers practical recommendations",
    "designer": "a designer who balances aesthetics with usability",
  };
  return labels[role] || role;
}

