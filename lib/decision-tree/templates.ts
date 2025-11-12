import { DecisionTreePathTemplate, DecisionTreeStrategy, DecisionTreePathType } from "@/types";

/**
 * Decision Tree Path Templates
 *
 * These templates define different enhancement strategies that users can explore
 * in a branching tree structure.
 */

// ============================================================================
// Style Strategy Templates
// ============================================================================

export const creativeTemplate: DecisionTreePathTemplate = {
  templateId: "style-creative",
  templateName: "Make it More Creative",
  strategy: "style",
  pathType: "creative",
  description: "Enhance the prompt with creative and imaginative elements",
  instructions:
    "Rewrite this prompt to be more creative, imaginative, and engaging. Add vivid descriptions, metaphors, and creative angles while maintaining the core intent.",
  systemPrompt: `You are enhancing prompts to be more creative and imaginative. Focus on:
- Adding vivid, descriptive language
- Including creative metaphors and analogies
- Suggesting innovative approaches
- Making the prompt more engaging and interesting
- Maintaining clarity while adding creative flair`,
  examples: [
    "Transform 'Write a blog post' → 'Craft an engaging narrative that captivates readers from the first sentence'",
    "Transform 'Explain AI' → 'Paint a vivid picture of how artificial intelligence is reshaping our world'",
  ],
};

export const technicalTemplate: DecisionTreePathTemplate = {
  templateId: "style-technical",
  templateName: "Make it More Technical",
  strategy: "style",
  pathType: "technical",
  description: "Enhance the prompt with technical precision and specificity",
  instructions:
    "Rewrite this prompt to be more technical, precise, and specific. Add technical terminology, specifications, and concrete parameters while maintaining accuracy.",
  systemPrompt: `You are enhancing prompts to be more technical and precise. Focus on:
- Adding specific technical terminology
- Including measurable parameters and constraints
- Specifying technical requirements
- Using industry-standard language
- Providing concrete specifications`,
  examples: [
    "Transform 'Build a website' → 'Develop a responsive web application using React 18, TypeScript, and Tailwind CSS'",
    "Transform 'Analyze data' → 'Perform statistical analysis using regression models with 95% confidence intervals'",
  ],
};

export const simpleTemplate: DecisionTreePathTemplate = {
  templateId: "style-simple",
  templateName: "Make it Simpler",
  strategy: "style",
  pathType: "simple",
  description: "Simplify the prompt for easier understanding",
  instructions:
    "Rewrite this prompt to be simpler, clearer, and more accessible. Remove jargon, break down complex concepts, and use plain language.",
  systemPrompt: `You are enhancing prompts to be simpler and more accessible. Focus on:
- Using plain, everyday language
- Breaking down complex concepts
- Removing unnecessary jargon
- Making instructions straightforward
- Ensuring anyone can understand it`,
  examples: [
    "Transform 'Implement a RESTful API' → 'Create a simple way for apps to talk to each other'",
    "Transform 'Optimize algorithm efficiency' → 'Make the program run faster'",
  ],
};

// ============================================================================
// Optimization Strategy Templates
// ============================================================================

export const clarityTemplate: DecisionTreePathTemplate = {
  templateId: "optimization-clarity",
  templateName: "Optimize for Clarity",
  strategy: "optimization",
  pathType: "clarity",
  description: "Enhance clarity and reduce ambiguity",
  instructions:
    "Rewrite this prompt to maximize clarity and minimize ambiguity. Make expectations explicit, define terms, and remove any vague language.",
  systemPrompt: `You are enhancing prompts for maximum clarity. Focus on:
- Making all expectations explicit
- Defining ambiguous terms
- Removing vague language
- Adding specific examples
- Structuring information logically`,
  examples: [
    "Transform 'Make it better' → 'Improve code readability by: 1) adding comments, 2) using descriptive variable names, 3) breaking functions into smaller units'",
    "Transform 'Write good content' → 'Create a 500-word article with clear structure: introduction, 3 main points with examples, and conclusion'",
  ],
};

export const brevityTemplate: DecisionTreePathTemplate = {
  templateId: "optimization-brevity",
  templateName: "Optimize for Brevity",
  strategy: "optimization",
  pathType: "brevity",
  description: "Make the prompt concise and to-the-point",
  instructions:
    "Rewrite this prompt to be as concise as possible while retaining all essential information. Remove redundancy and unnecessary words.",
  systemPrompt: `You are enhancing prompts for brevity. Focus on:
- Removing redundant words
- Using concise phrasing
- Keeping only essential information
- Using bullet points where appropriate
- Making every word count`,
  examples: [
    "Transform 'Please write a comprehensive article' → 'Write an article about X'",
    "Transform 'I would like you to create' → 'Create'",
  ],
};

export const detailTemplate: DecisionTreePathTemplate = {
  templateId: "optimization-detail",
  templateName: "Optimize for Detail",
  strategy: "optimization",
  pathType: "detail",
  description: "Add comprehensive detail and context",
  instructions:
    "Rewrite this prompt to include comprehensive detail, context, and background information. Add specific examples, edge cases, and relevant context.",
  systemPrompt: `You are enhancing prompts with detailed information. Focus on:
- Adding relevant context and background
- Including specific examples
- Covering edge cases
- Providing comprehensive requirements
- Explaining the "why" behind requests`,
  examples: [
    "Transform 'Create a function' → 'Create a pure function that takes an array of numbers, handles empty arrays and non-numeric values gracefully, and returns the average'",
    "Transform 'Design a UI' → 'Design a responsive UI that works on mobile (320px+) and desktop (1920px), follows WCAG 2.1 AA standards, and uses our brand colors'",
  ],
};

// ============================================================================
// Audience Strategy Templates
// ============================================================================

export const expertTemplate: DecisionTreePathTemplate = {
  templateId: "audience-expert",
  templateName: "Target Expert Audience",
  strategy: "audience",
  pathType: "expert",
  description: "Optimize for expert-level audience with domain knowledge",
  instructions:
    "Rewrite this prompt assuming an expert audience with deep domain knowledge. Use advanced terminology, assume foundational knowledge, and focus on sophisticated concepts.",
  systemPrompt: `You are enhancing prompts for expert audiences. Focus on:
- Using advanced domain terminology
- Assuming foundational knowledge
- Focusing on sophisticated concepts
- Referencing industry standards
- Discussing advanced techniques`,
  examples: [
    "Transform 'Explain machine learning' → 'Discuss the implications of catastrophic forgetting in continual learning systems and potential mitigation strategies'",
    "Transform 'Code review tips' → 'Apply SOLID principles and design patterns to identify architectural anti-patterns and technical debt'",
  ],
};

export const beginnerTemplate: DecisionTreePathTemplate = {
  templateId: "audience-beginner",
  templateName: "Target Beginner Audience",
  strategy: "audience",
  pathType: "beginner",
  description: "Optimize for beginners with no prior knowledge",
  instructions:
    "Rewrite this prompt for absolute beginners. Explain concepts from first principles, define all terminology, and provide step-by-step guidance.",
  systemPrompt: `You are enhancing prompts for beginner audiences. Focus on:
- Explaining concepts from first principles
- Defining all technical terms
- Providing step-by-step instructions
- Using analogies and examples
- Being patient and thorough`,
  examples: [
    "Transform 'Implement authentication' → 'Create a login system (step-by-step): 1) Create a form where users enter username/password, 2) Check if they match...'",
    "Transform 'Optimize performance' → 'Make your app faster (explained simply): First, find what's slow. Then, try these beginner-friendly fixes...'",
  ],
};

export const generalTemplate: DecisionTreePathTemplate = {
  templateId: "audience-general",
  templateName: "Target General Audience",
  strategy: "audience",
  pathType: "general",
  description: "Balance accessibility with technical accuracy",
  instructions:
    "Rewrite this prompt for a general audience that may have some technical familiarity but isn't an expert. Balance accessibility with accuracy.",
  systemPrompt: `You are enhancing prompts for general audiences. Focus on:
- Balancing technical accuracy with accessibility
- Explaining key concepts without oversimplifying
- Using common terminology with brief explanations
- Assuming moderate technical literacy
- Being clear without being condescending`,
  examples: [
    "Transform 'Implement OAuth 2.0' → 'Set up secure login using OAuth 2.0 (a widely-used authentication standard)'",
    "Transform 'Refactor code' → 'Improve your code structure by reorganizing it for better readability and maintainability'",
  ],
};

// ============================================================================
// Export all templates
// ============================================================================

export const ALL_TEMPLATES: DecisionTreePathTemplate[] = [
  // Style templates
  creativeTemplate,
  technicalTemplate,
  simpleTemplate,
  // Optimization templates
  clarityTemplate,
  brevityTemplate,
  detailTemplate,
  // Audience templates
  expertTemplate,
  beginnerTemplate,
  generalTemplate,
];

export const TEMPLATES_BY_STRATEGY: Record<
  DecisionTreeStrategy,
  DecisionTreePathTemplate[]
> = {
  style: [creativeTemplate, technicalTemplate, simpleTemplate],
  optimization: [clarityTemplate, brevityTemplate, detailTemplate],
  audience: [expertTemplate, beginnerTemplate, generalTemplate],
};

export function getTemplateById(templateId: string): DecisionTreePathTemplate | null {
  return ALL_TEMPLATES.find((t) => t.templateId === templateId) || null;
}

export function getTemplatesByStrategy(
  strategy: DecisionTreeStrategy
): DecisionTreePathTemplate[] {
  return TEMPLATES_BY_STRATEGY[strategy] || [];
}

export function getTemplateByPathType(
  pathType: DecisionTreePathType
): DecisionTreePathTemplate | null {
  return ALL_TEMPLATES.find((t) => t.pathType === pathType) || null;
}
