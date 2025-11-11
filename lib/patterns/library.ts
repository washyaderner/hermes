import { PromptPattern } from "@/types";

/**
 * Proven Prompt Engineering Patterns Library
 * Based on research and best practices from:
 * - Chain-of-Thought Prompting (Wei et al., 2022)
 * - Tree of Thoughts (Yao et al., 2023)
 * - ReAct (Yao et al., 2022)
 * - Constitutional AI (Anthropic, 2022)
 * - Few-Shot Learning (Brown et al., 2020)
 */

// Chain of Thought Pattern
export const chainOfThoughtPattern: PromptPattern = {
  patternId: "pattern-cot",
  patternName: "Chain of Thought",
  patternType: "chain-of-thought",
  description: "Encourages step-by-step reasoning by asking the model to think through the problem systematically",
  icon: "🔗",
  category: "reasoning",
  difficulty: "beginner",
  applicableIntents: ["analysis", "code", "instruction", "data_processing"],
  template: `{task}

Let's think through this step by step:

1. First, let's understand what we need to do
2. Then, let's break down the problem
3. Finally, let's work towards the solution

{context}`,
  exampleUsage: `Calculate the total cost of 3 shirts at $25 each and 2 pants at $40 each, with 10% tax.

Let's think through this step by step:

1. First, let's calculate the cost of shirts: 3 × $25 = $75
2. Then, calculate the cost of pants: 2 × $40 = $80
3. Add them together: $75 + $80 = $155
4. Calculate 10% tax: $155 × 0.10 = $15.50
5. Add tax to get total: $155 + $15.50 = $170.50`,
  effectivenessScore: 92,
  benefits: [
    "Improves accuracy on complex reasoning tasks",
    "Makes the model's logic transparent",
    "Reduces errors in multi-step problems",
    "Works across all model sizes",
  ],
  bestPractices: [
    "Use phrases like 'Let's think step by step' or 'First, Second, Third'",
    "Break complex problems into smaller steps",
    "Works especially well for math, logic, and code problems",
  ],
  compatiblePatterns: ["pattern-few-shot", "pattern-react", "pattern-self-consistency"],
};

// Few-Shot Pattern
export const fewShotPattern: PromptPattern = {
  patternId: "pattern-few-shot",
  patternName: "Few-Shot Learning",
  patternType: "few-shot",
  description: "Provides examples before the actual task to help the model understand the pattern",
  icon: "🎯",
  category: "examples",
  difficulty: "beginner",
  applicableIntents: ["creative", "code", "conversation", "data_processing"],
  template: `{task}

Examples:

{examples}

Now apply the same pattern:

{context}`,
  exampleUsage: `Convert these sentences to JSON format.

Examples:

Input: "John is 25 years old and lives in NYC"
Output: {"name": "John", "age": 25, "city": "NYC"}

Input: "Sarah is 30 years old and lives in LA"
Output: {"name": "Sarah", "age": 30, "city": "LA"}

Now apply the same pattern:

Input: "Mike is 28 years old and lives in Chicago"`,
  effectivenessScore: 88,
  benefits: [
    "Clarifies expected output format",
    "Reduces need for lengthy explanations",
    "Improves consistency across responses",
    "Works for classification, formatting, and style tasks",
  ],
  bestPractices: [
    "Provide 2-5 diverse examples",
    "Use examples that cover edge cases",
    "Ensure examples match your desired output format exactly",
    "Order examples from simple to complex",
  ],
  compatiblePatterns: ["pattern-cot", "pattern-instruction"],
};

// Tree of Thoughts Pattern
export const treeOfThoughtsPattern: PromptPattern = {
  patternId: "pattern-tot",
  patternName: "Tree of Thoughts",
  patternType: "tree-of-thoughts",
  description: "Explores multiple reasoning paths and evaluates them before choosing the best solution",
  icon: "🌳",
  category: "reasoning",
  difficulty: "advanced",
  applicableIntents: ["analysis", "creative", "instruction"],
  template: `{task}

Let's explore multiple approaches:

Approach 1: {context}
- Pros:
- Cons:
- Outcome:

Approach 2:
- Pros:
- Cons:
- Outcome:

Approach 3:
- Pros:
- Cons:
- Outcome:

Evaluation: Which approach is best and why?

Final Solution: Based on the evaluation, here's the recommended approach...`,
  exampleUsage: `Design a mobile app for tracking fitness goals.

Let's explore multiple approaches:

Approach 1: Gamification-focused
- Pros: High engagement, fun, motivating
- Cons: May feel gimmicky to some users
- Outcome: Good for younger demographics

Approach 2: Data-driven analytics
- Pros: Detailed insights, science-backed
- Cons: May overwhelm casual users
- Outcome: Good for serious athletes

Approach 3: Minimalist simplicity
- Pros: Easy to use, low friction
- Cons: May lack features for power users
- Outcome: Good for beginners

Final Solution: Hybrid approach combining simple daily tracking with optional advanced features...`,
  effectivenessScore: 85,
  benefits: [
    "Considers multiple solutions before committing",
    "Reduces bias towards first solution",
    "Better for creative and strategic problems",
    "Improves decision quality",
  ],
  bestPractices: [
    "Use for open-ended problems with multiple valid solutions",
    "Explore 3-5 different approaches",
    "Explicitly evaluate pros/cons",
    "Best for creative, strategic, or design tasks",
  ],
  compatiblePatterns: ["pattern-cot", "pattern-self-consistency"],
};

// ReAct Pattern (Reasoning + Acting)
export const reactPattern: PromptPattern = {
  patternId: "pattern-react",
  patternName: "ReAct (Reasoning + Acting)",
  patternType: "react",
  description: "Alternates between reasoning about a problem and taking actions, creating a thought-action-observation loop",
  icon: "🔄",
  category: "reasoning",
  difficulty: "intermediate",
  applicableIntents: ["code", "data_processing", "analysis"],
  template: `{task}

Let's solve this using the Thought-Action-Observation pattern:

Thought 1: What do I need to do first?
Action 1: [Describe the action]
Observation 1: [What we learned]

Thought 2: Based on observation 1, what's next?
Action 2: [Next action]
Observation 2: [What we learned]

Thought 3: Can we now solve the problem?
Action 3: [Final action]
Observation 3: [Result]

{context}`,
  exampleUsage: `Debug why a website is loading slowly.

Thought 1: I should check the network requests to see what's taking long
Action 1: Analyze network tab in DevTools
Observation 1: Found that images are taking 5+ seconds to load

Thought 2: The images seem to be the bottleneck, let me check their size
Action 2: Inspect image file sizes
Observation 2: Images are uncompressed PNGs, averaging 5MB each

Thought 3: I should recommend image optimization
Action 3: Suggest converting to WebP and implementing lazy loading
Observation 3: This should reduce load time by 70-80%`,
  effectivenessScore: 87,
  benefits: [
    "Breaks down complex tasks into manageable steps",
    "Makes reasoning process explicit",
    "Good for debugging and troubleshooting",
    "Encourages iterative problem-solving",
  ],
  bestPractices: [
    "Use for problems that require investigation",
    "Alternate between thinking and doing",
    "Best for debugging, research, and multi-step tasks",
    "Works well with tool use and function calling",
  ],
  compatiblePatterns: ["pattern-cot", "pattern-tot"],
};

// Constitutional AI Pattern
export const constitutionalAIPattern: PromptPattern = {
  patternId: "pattern-constitutional",
  patternName: "Constitutional AI",
  patternType: "constitutional-ai",
  description: "Adds safety guidelines and principles to ensure responses are helpful, harmless, and honest",
  icon: "🛡️",
  category: "safety",
  difficulty: "intermediate",
  applicableIntents: ["conversation", "creative", "instruction"],
  template: `{task}

Guidelines for this response:
1. Be helpful and provide accurate information
2. Be harmless - avoid biased, offensive, or dangerous content
3. Be honest - acknowledge limitations and uncertainties
4. Respect privacy and ethical boundaries
5. {additional_guidelines}

{context}`,
  exampleUsage: `Write a blog post about healthy weight loss.

Guidelines for this response:
1. Be helpful and provide accurate information
2. Be harmless - avoid promoting unhealthy diets or body image issues
3. Be honest - acknowledge that individual results vary
4. Respect privacy and ethical boundaries
5. Cite reputable health sources

Content: [Balanced, evidence-based article about healthy weight loss]`,
  effectivenessScore: 90,
  benefits: [
    "Reduces harmful or biased outputs",
    "Ensures ethical compliance",
    "Builds trust with users",
    "Aligns outputs with values and guidelines",
  ],
  bestPractices: [
    "Define clear principles upfront",
    "Use for sensitive or public-facing content",
    "Combine with specific domain guidelines",
    "Review outputs for alignment with principles",
  ],
  compatiblePatterns: ["pattern-instruction", "pattern-persona"],
};

// Zero-Shot Chain of Thought
export const zeroShotCoTPattern: PromptPattern = {
  patternId: "pattern-zero-shot-cot",
  patternName: "Zero-Shot CoT",
  patternType: "zero-shot-cot",
  description: "Simple addition of 'Let's think step by step' to trigger reasoning without examples",
  icon: "💭",
  category: "reasoning",
  difficulty: "beginner",
  applicableIntents: ["analysis", "code", "instruction", "data_processing"],
  template: `{task}

Let's think step by step.

{context}`,
  exampleUsage: `If a train travels 60 miles per hour for 2.5 hours, how far does it travel?

Let's think step by step.

Step 1: Speed = 60 mph
Step 2: Time = 2.5 hours
Step 3: Distance = Speed × Time = 60 × 2.5 = 150 miles`,
  effectivenessScore: 85,
  benefits: [
    "Simplest way to improve reasoning",
    "No examples needed",
    "Works across all tasks",
    "Minimal prompt engineering required",
  ],
  bestPractices: [
    "Use when you don't have good examples",
    "Great starting point for complex problems",
    "Can be combined with other patterns",
  ],
  compatiblePatterns: ["pattern-cot", "pattern-react", "pattern-instruction"],
};

// Self-Consistency Pattern
export const selfConsistencyPattern: PromptPattern = {
  patternId: "pattern-self-consistency",
  patternName: "Self-Consistency",
  patternType: "self-consistency",
  description: "Generate multiple reasoning paths and select the most consistent answer",
  icon: "🎲",
  category: "reasoning",
  difficulty: "advanced",
  applicableIntents: ["analysis", "code", "data_processing"],
  template: `{task}

Generate 3 different reasoning paths:

Path 1:
{context}

Path 2:
{context}

Path 3:
{context}

Final Answer: [Select the most consistent/common answer across all paths]`,
  exampleUsage: `Calculate the probability of rolling a sum of 7 with two dice.

Path 1: List all combinations (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 ways. Total possibilities = 36. Probability = 6/36 = 1/6

Path 2: For sum of 7, count pairs: 1+6, 2+5, 3+4 and their reverses = 6 outcomes. P = 6/36 = 1/6

Path 3: Using symmetry, 7 is the center sum with max combinations. Count systematically = 6 ways. P = 6/36 = 1/6

Final Answer: 1/6 (all paths agree)`,
  effectivenessScore: 91,
  benefits: [
    "Improves accuracy by sampling multiple times",
    "Reduces impact of reasoning errors",
    "Best for problems with objective answers",
    "Self-validates the solution",
  ],
  bestPractices: [
    "Use for math, logic, and code problems",
    "Generate 3-5 independent paths",
    "Choose answer that appears most frequently",
    "Combine with Chain of Thought",
  ],
  compatiblePatterns: ["pattern-cot", "pattern-tot"],
};

// Persona Pattern
export const personaPattern: PromptPattern = {
  patternId: "pattern-persona",
  patternName: "Persona",
  patternType: "persona",
  description: "Assign a specific role or expertise to guide the style and knowledge of the response",
  icon: "🎭",
  category: "persona",
  difficulty: "beginner",
  applicableIntents: ["creative", "conversation", "instruction"],
  template: `You are a {persona} with expertise in {domain}.

{task}

Respond as this expert would, using appropriate terminology and knowledge.

{context}`,
  exampleUsage: `You are a senior software architect with expertise in distributed systems.

Design a scalable architecture for a real-time chat application.

Respond as this expert would, using appropriate terminology and knowledge.

[Response includes CAP theorem, message queues, WebSocket architecture, etc.]`,
  effectivenessScore: 82,
  benefits: [
    "Sets appropriate tone and expertise level",
    "Improves domain-specific accuracy",
    "Makes responses more engaging",
    "Good for educational content",
  ],
  bestPractices: [
    "Be specific about the persona's expertise",
    "Use for domain-specific tasks",
    "Combine with instruction-following",
    "Works well for tutoring and education",
  ],
  compatiblePatterns: ["pattern-instruction", "pattern-constitutional"],
};

// Instruction-Following Pattern
export const instructionPattern: PromptPattern = {
  patternId: "pattern-instruction",
  patternName: "Instruction-Following",
  patternType: "instruction-following",
  description: "Provides clear, structured instructions with explicit format requirements",
  icon: "📋",
  category: "structure",
  difficulty: "beginner",
  applicableIntents: ["creative", "code", "data_processing", "instruction"],
  template: `Task: {task}

Instructions:
1. {instruction1}
2. {instruction2}
3. {instruction3}

Format: {format_requirements}

Constraints: {constraints}

{context}`,
  exampleUsage: `Task: Write a product description

Instructions:
1. Highlight 3 key benefits
2. Use persuasive but honest language
3. Include a call-to-action
4. Keep it under 100 words

Format: Single paragraph, professional tone

Constraints: No superlatives like "best" or "perfect"

[Product description follows]`,
  effectivenessScore: 88,
  benefits: [
    "Ensures output meets specific requirements",
    "Reduces back-and-forth clarifications",
    "Works for any task type",
    "Easy to iterate and refine",
  ],
  bestPractices: [
    "Number your instructions clearly",
    "Be explicit about format requirements",
    "State constraints upfront",
    "Use for well-defined tasks",
  ],
  compatiblePatterns: ["pattern-few-shot", "pattern-persona", "pattern-constitutional"],
};

// Export all patterns
export const promptPatterns: PromptPattern[] = [
  chainOfThoughtPattern,
  fewShotPattern,
  treeOfThoughtsPattern,
  reactPattern,
  constitutionalAIPattern,
  zeroShotCoTPattern,
  selfConsistencyPattern,
  personaPattern,
  instructionPattern,
];

// Helper functions
export function getPatternById(patternId: string): PromptPattern | undefined {
  return promptPatterns.find((p) => p.patternId === patternId);
}

export function getPatternsByIntent(intent: string): PromptPattern[] {
  return promptPatterns.filter((p) => p.applicableIntents.includes(intent as any));
}

export function getPatternsByCategory(category: string): PromptPattern[] {
  return promptPatterns.filter((p) => p.category === category);
}

export function getPatternsByDifficulty(difficulty: string): PromptPattern[] {
  return promptPatterns.filter((p) => p.difficulty === difficulty);
}
