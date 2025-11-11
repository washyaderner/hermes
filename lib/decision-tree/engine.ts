import {
  DecisionTreeNode,
  DecisionTreePathTemplate,
  DecisionTreeStrategy,
  DecisionTreePath,
  SavedDecisionTreeRoute,
  Platform,
} from "@/types";
import { generateId } from "@/lib/utils";
import { analyzePrompt } from "@/lib/prompt-engine/analyzer";
import { TEMPLATES_BY_STRATEGY } from "./templates";

/**
 * Decision Tree Engine
 *
 * Generates branching enhancement paths that users can explore interactively
 */

// ============================================================================
// Core Tree Generation
// ============================================================================

/**
 * Create the root node from an original prompt
 */
export function createRootNode(originalPrompt: string): DecisionTreeNode {
  const analysis = analyzePrompt(originalPrompt);

  return {
    nodeId: generateId(),
    level: 0,
    parentNodeId: null,
    promptText: originalPrompt,
    pathTemplate: null,
    explanation: "Original prompt - choose a path to enhance",
    qualityScore: analysis.qualityScore,
    children: [],
    isSelected: true,
    generatedAt: new Date(),
  };
}

/**
 * Generate three child nodes for a given parent node
 * Each child represents a different enhancement strategy
 */
export function generateChildNodes(
  parentNode: DecisionTreeNode,
  strategy: DecisionTreeStrategy
): DecisionTreeNode[] {
  const templates = TEMPLATES_BY_STRATEGY[strategy];

  if (!templates || templates.length === 0) {
    console.warn(`No templates found for strategy: ${strategy}`);
    return [];
  }

  // Generate 3 child nodes (one for each template in the strategy)
  return templates.map((template) => {
    const enhancedPrompt = applyTemplateToPrompt(parentNode.promptText, template);
    const analysis = analyzePrompt(enhancedPrompt);

    return {
      nodeId: generateId(),
      level: parentNode.level + 1,
      parentNodeId: parentNode.nodeId,
      promptText: enhancedPrompt,
      pathTemplate: template,
      explanation: generateExplanation(template, parentNode.promptText, enhancedPrompt),
      qualityScore: analysis.qualityScore,
      children: [],
      isSelected: false,
      generatedAt: new Date(),
    };
  });
}

/**
 * Apply a template to transform a prompt
 */
function applyTemplateToPrompt(
  originalPrompt: string,
  template: DecisionTreePathTemplate
): string {
  // In a real implementation, this would call the AI API
  // For now, we'll simulate the transformation with template-based rules

  const { pathType, instructions } = template;

  // Apply different transformations based on path type
  switch (pathType) {
    case "creative":
      return enhanceCreatively(originalPrompt);
    case "technical":
      return enhanceTechnically(originalPrompt);
    case "simple":
      return simplifyPrompt(originalPrompt);
    case "clarity":
      return enhanceClarity(originalPrompt);
    case "brevity":
      return enhanceBrevity(originalPrompt);
    case "detail":
      return enhanceDetail(originalPrompt);
    case "expert":
      return targetExpert(originalPrompt);
    case "beginner":
      return targetBeginner(originalPrompt);
    case "general":
      return targetGeneral(originalPrompt);
    default:
      return originalPrompt;
  }
}

// ============================================================================
// Transformation Functions
// ============================================================================

function enhanceCreatively(prompt: string): string {
  // Add creative elements
  const prefixes = [
    "Craft an imaginative and engaging response that ",
    "Create a vivid and captivating narrative where ",
    "Paint a creative picture by ",
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}${prompt.toLowerCase()}. Use descriptive language, metaphors, and creative angles to make it memorable.`;
}

function enhanceTechnically(prompt: string): string {
  // Add technical precision
  return `${prompt}\n\nRequirements:\n- Use industry-standard terminology and best practices\n- Include specific technical parameters and constraints\n- Provide measurable success criteria\n- Reference relevant standards or frameworks`;
}

function simplifyPrompt(prompt: string): string {
  // Simplify language
  const simplified = prompt
    .replace(/utilize/gi, "use")
    .replace(/implement/gi, "create")
    .replace(/facilitate/gi, "help");

  return `${simplified}\n\nPlease explain in simple, everyday language that anyone can understand.`;
}

function enhanceClarity(prompt: string): string {
  return `${prompt}\n\nPlease ensure:\n1. All expectations are explicitly stated\n2. Any ambiguous terms are clearly defined\n3. Specific examples are provided where helpful\n4. The structure is logical and easy to follow`;
}

function enhanceBrevity(prompt: string): string {
  // Make concise
  const concise = prompt
    .replace(/please /gi, "")
    .replace(/I would like you to /gi, "")
    .replace(/could you /gi, "");

  return `${concise}\n\n(Keep response concise and to-the-point)`;
}

function enhanceDetail(prompt: string): string {
  return `${prompt}\n\nProvide comprehensive details including:\n- Relevant context and background\n- Specific examples and use cases\n- Edge cases and potential issues\n- Best practices and recommendations\n- Step-by-step approach if applicable`;
}

function targetExpert(prompt: string): string {
  return `${prompt}\n\n[Expert-level response expected: Use advanced terminology, assume domain expertise, discuss sophisticated concepts and techniques]`;
}

function targetBeginner(prompt: string): string {
  return `${prompt}\n\n[Beginner-friendly response: Explain from first principles, define all terms, provide step-by-step guidance with examples]`;
}

function targetGeneral(prompt: string): string {
  return `${prompt}\n\n[General audience: Balance accessibility with technical accuracy, explain key concepts clearly]`;
}

// ============================================================================
// Explanation Generation
// ============================================================================

function generateExplanation(
  template: DecisionTreePathTemplate,
  originalPrompt: string,
  enhancedPrompt: string
): string {
  const { pathType, strategy } = template;

  const explanations: Record<string, string> = {
    creative:
      "This path adds creative flair and engaging language to make your prompt more captivating. Great for content creation and storytelling.",
    technical:
      "This path increases technical precision and specificity. Ideal when you need exact specifications or industry-standard terminology.",
    simple:
      "This path simplifies the language for better accessibility. Perfect when your audience may not have technical expertise.",
    clarity:
      "This path maximizes clarity by making all expectations explicit and removing ambiguity. Best for complex requests.",
    brevity:
      "This path makes your prompt concise and direct. Use when you want quick, to-the-point responses.",
    detail:
      "This path adds comprehensive context and detail. Ideal for complex tasks requiring thorough understanding.",
    expert:
      "This path targets expert audiences with advanced concepts. Best when working with domain specialists.",
    beginner:
      "This path makes content accessible to beginners. Perfect for tutorials and educational content.",
    general:
      "This path balances accessibility with accuracy. Great for mixed or general audiences.",
  };

  return explanations[pathType] || "Enhanced version of your prompt";
}

// ============================================================================
// Path Management
// ============================================================================

/**
 * Build a path from root to a selected node
 */
export function buildPathToNode(
  root: DecisionTreeNode,
  targetNodeId: string
): DecisionTreeNode[] {
  const path: DecisionTreeNode[] = [];

  function traverse(node: DecisionTreeNode): boolean {
    path.push(node);

    if (node.nodeId === targetNodeId) {
      return true;
    }

    for (const child of node.children) {
      if (traverse(child)) {
        return true;
      }
    }

    path.pop();
    return false;
  }

  traverse(root);
  return path;
}

/**
 * Calculate total quality improvement along a path
 */
export function calculatePathQualityImprovement(path: DecisionTreeNode[]): number {
  if (path.length < 2) return 0;

  const firstScore = path[0].qualityScore;
  const lastScore = path[path.length - 1].qualityScore;

  return lastScore - firstScore;
}

/**
 * Create a DecisionTreePath object from selected nodes
 */
export function createDecisionTreePath(
  selectedNodes: DecisionTreeNode[]
): DecisionTreePath {
  const strategies = new Set<DecisionTreeStrategy>();
  const pathTypes = new Set<string>();

  selectedNodes.forEach((node) => {
    if (node.pathTemplate) {
      strategies.add(node.pathTemplate.strategy);
      pathTypes.add(node.pathTemplate.pathType);
    }
  });

  const finalNode = selectedNodes[selectedNodes.length - 1];
  const qualityImprovement = calculatePathQualityImprovement(selectedNodes);

  return {
    pathId: generateId(),
    nodes: selectedNodes,
    strategy: Array.from(strategies)[0] || "style",
    pathTypes: Array.from(pathTypes) as any[],
    finalPrompt: finalNode.promptText,
    totalQualityImprovement: qualityImprovement,
    isSaved: false,
    createdAt: new Date(),
  };
}

// ============================================================================
// Route Saving and Reuse
// ============================================================================

const STORAGE_KEY = "hermes_decision_tree_routes";

/**
 * Save a successful path as a reusable route
 */
export function savePathAsRoute(
  path: DecisionTreePath,
  routeName: string,
  description: string
): SavedDecisionTreeRoute {
  const templates = path.nodes
    .filter((node) => node.pathTemplate !== null)
    .map((node) => node.pathTemplate!);

  const route: SavedDecisionTreeRoute = {
    routeId: generateId(),
    routeName,
    description,
    strategy: path.strategy,
    pathTypes: path.pathTypes,
    templates,
    usageCount: 0,
    avgQualityImprovement: path.totalQualityImprovement,
    createdAt: new Date(),
    lastUsed: new Date(),
  };

  // Save to localStorage
  const existingRoutes = loadSavedRoutes();
  existingRoutes.push(route);
  saveSavedRoutes(existingRoutes);

  return route;
}

/**
 * Load saved routes from localStorage
 */
export function loadSavedRoutes(): SavedDecisionTreeRoute[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const routes = JSON.parse(stored);
    return routes.map((route: any) => ({
      ...route,
      createdAt: new Date(route.createdAt),
      lastUsed: new Date(route.lastUsed),
    }));
  } catch (error) {
    console.error("Failed to load saved routes:", error);
    return [];
  }
}

/**
 * Save routes to localStorage
 */
function saveSavedRoutes(routes: SavedDecisionTreeRoute[]): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = routes.map((route) => ({
      ...route,
      createdAt: route.createdAt.toISOString(),
      lastUsed: route.lastUsed.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error("Failed to save routes:", error);
  }
}

/**
 * Apply a saved route to a new prompt
 */
export function applyRouteToPrompt(
  prompt: string,
  route: SavedDecisionTreeRoute
): DecisionTreeNode {
  const root = createRootNode(prompt);

  // Apply each template in sequence
  let currentPrompt = prompt;
  let currentNode = root;

  route.templates.forEach((template, index) => {
    const enhancedPrompt = applyTemplateToPrompt(currentPrompt, template);
    const analysis = analyzePrompt(enhancedPrompt);

    const childNode: DecisionTreeNode = {
      nodeId: generateId(),
      level: index + 1,
      parentNodeId: currentNode.nodeId,
      promptText: enhancedPrompt,
      pathTemplate: template,
      explanation: generateExplanation(template, currentPrompt, enhancedPrompt),
      qualityScore: analysis.qualityScore,
      children: [],
      isSelected: true,
      generatedAt: new Date(),
    };

    currentNode.children.push(childNode);
    currentNode = childNode;
    currentPrompt = enhancedPrompt;
  });

  // Update route usage
  route.usageCount++;
  route.lastUsed = new Date();
  const routes = loadSavedRoutes();
  const routeIndex = routes.findIndex((r) => r.routeId === route.routeId);
  if (routeIndex !== -1) {
    routes[routeIndex] = route;
    saveSavedRoutes(routes);
  }

  return root;
}

/**
 * Delete a saved route
 */
export function deleteSavedRoute(routeId: string): void {
  const routes = loadSavedRoutes();
  const filtered = routes.filter((r) => r.routeId !== routeId);
  saveSavedRoutes(filtered);
}
