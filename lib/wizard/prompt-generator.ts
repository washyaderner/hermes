import {
  QuickModeData,
  GodModeData,
  ReasoningTreeNode,
  RoleType,
  ToneStyle,
  OutputFormatType,
} from "@/types";
import { generateId } from "@/lib/utils";

/**
 * Prompt Generation Engine for Wizard Interface
 *
 * Converts QuickModeData or GodModeData into optimized prompts
 * with reasoning tree visualization
 */

// ============================================================================
// Role Definitions
// ============================================================================

const ROLE_PROMPTS: Record<RoleType, string> = {
  "writing-assistant": "You are a skilled writing assistant who helps create clear, engaging content.",
  "senior-developer": "You are an experienced senior software developer with expertise in best practices and clean code.",
  "data-analyst": "You are a data analyst skilled at interpreting data, finding insights, and presenting findings clearly.",
  "marketing-expert": "You are a marketing expert who understands audience engagement and persuasive communication.",
  "teacher": "You are an experienced educator who excels at explaining complex topics in accessible ways.",
  "researcher": "You are a thorough researcher skilled at gathering information, analyzing sources, and synthesizing findings.",
  "legal-advisor": "You are a legal advisor who provides clear guidance on legal matters and compliance.",
  "consultant": "You are a professional consultant who analyzes problems and provides strategic recommendations.",
  "designer": "You are a creative designer who understands visual communication and user experience.",
  "custom": "",
};

// ============================================================================
// Tone Modifiers
// ============================================================================

const TONE_MODIFIERS: Record<ToneStyle, string> = {
  professional: "Maintain a professional and business-appropriate tone.",
  casual: "Use a casual, conversational tone.",
  friendly: "Be warm and friendly in your approach.",
  authoritative: "Speak with authority and confidence.",
  empathetic: "Show empathy and understanding.",
  humorous: "Include appropriate humor when suitable.",
  academic: "Use an academic, scholarly tone.",
  creative: "Be creative and imaginative.",
  direct: "Be direct and to the point.",
  diplomatic: "Use diplomatic and tactful language.",
};

// ============================================================================
// Format Instructions
// ============================================================================

const FORMAT_INSTRUCTIONS: Record<OutputFormatType, string> = {
  xml: "Structure your response using XML tags for clear organization.",
  markdown: "Format your response in Markdown with proper headings and formatting.",
  javascript: "Provide JavaScript code with proper syntax and comments.",
  twitter: "Write in a concise Twitter post format (280 characters or less).",
  linkedin: "Write in a professional LinkedIn post format with engaging hooks.",
  instagram: "Write in an Instagram caption style with hashtags and emojis.",
  tiktok: "Write in a short, engaging TikTok video script format with hooks.",
  "twitter-thread": "Structure as a Twitter thread with numbered tweets (1/n format).",
  "blog-post": "Structure as a complete blog post with introduction, body, and conclusion.",
  "research-paper": "Format as an academic research paper with citations and sections.",
  conversational: "Respond in a natural, conversational style.",
  spartan: "Be extremely concise and minimal with words.",
  laconic: "Use the absolute minimum words necessary, be brief and to the point.",
  minimalist: "Keep it simple and minimal, focus only on essentials.",
  custom: "",
};

// ============================================================================
// Quick Mode Generation
// ============================================================================

export function generateFromQuickMode(
  data: QuickModeData
): { prompt: string; reasoningTree: ReasoningTreeNode } {
  const steps: { step: string; description: string; decision?: string }[] = [];

  // Root node
  const rootNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "Analyzing Initial Prompt",
    description: "Processing your input and understanding requirements",
    decision: undefined,
    children: [],
    isActive: false,
    isComplete: true,
  };

  // Build prompt sections
  let promptSections: string[] = [];

  // Step 1: Role configuration
  if (data.role && data.role !== "custom") {
    const rolePrompt = ROLE_PROMPTS[data.role];
    promptSections.push(rolePrompt);

    const roleNode: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Configuring Role",
      description: "Setting up the appropriate persona",
      decision: `Selected role: ${data.role}`,
      children: [],
      isActive: false,
      isComplete: true,
    };
    rootNode.children.push(roleNode);
  } else if (data.role === "custom" && data.customRole) {
    promptSections.push(`You are a ${data.customRole}.`);

    const customRoleNode: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Configuring Custom Role",
      description: "Setting up your specialized persona",
      decision: `Custom role: ${data.customRole}`,
      children: [],
      isActive: false,
      isComplete: true,
    };
    rootNode.children.push(customRoleNode);
  }

  // Step 2: Main task
  promptSections.push(`\n${data.initialPrompt}`);

  const taskNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "Processing Main Task",
    description: "Incorporating your core request",
    decision: "Task added to prompt structure",
    children: [],
    isActive: false,
    isComplete: true,
  };
  rootNode.children.push(taskNode);

  // Step 3: Tone configuration
  if (data.tone) {
    const toneInstruction = TONE_MODIFIERS[data.tone];
    promptSections.push(`\n${toneInstruction}`);

    const toneNode: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Applying Tone",
      description: "Setting the communication style",
      decision: `Tone: ${data.tone}`,
      children: [],
      isActive: false,
      isComplete: true,
    };
    rootNode.children.push(toneNode);
  }

  // Step 4: Format configuration
  if (data.format) {
    const formatInstruction = FORMAT_INSTRUCTIONS[data.format];
    if (formatInstruction) {
      promptSections.push(`\n${formatInstruction}`);
    }

    const formatNode: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Setting Output Format",
      description: "Defining the response structure",
      decision: `Format: ${data.format}`,
      children: [],
      isActive: false,
      isComplete: true,
    };
    rootNode.children.push(formatNode);
  }

  // Final assembly
  const finalNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "Finalizing Prompt",
    description: "Assembling all components into optimized prompt",
    decision: "Prompt generation complete",
    children: [],
    isActive: false,
    isComplete: true,
  };
  rootNode.children.push(finalNode);

  const finalPrompt = promptSections.join("\n");

  return {
    prompt: finalPrompt,
    reasoningTree: rootNode,
  };
}

// ============================================================================
// God Mode Generation
// ============================================================================

export function generateFromGodMode(
  data: GodModeData
): { prompt: string; reasoningTree: ReasoningTreeNode } {
  const rootNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "God Mode Analysis",
    description: "Processing comprehensive prompt configuration",
    decision: undefined,
    children: [],
    isActive: false,
    isComplete: true,
  };

  let promptSections: string[] = [];

  // Identity Section
  const identityNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "Configuring Identity",
    description: "Setting up role and expertise",
    decision: undefined,
    children: [],
    isActive: false,
    isComplete: true,
  };

  if (data.identity.role && data.identity.role !== "custom") {
    const rolePrompt = ROLE_PROMPTS[data.identity.role];
    promptSections.push(`<role>\n${rolePrompt}\n</role>`);
    identityNode.decision = `Primary role: ${data.identity.role}`;
  } else if (data.identity.role === "custom" && data.identity.customRole) {
    promptSections.push(`<role>\nYou are a ${data.identity.customRole}.\n</role>`);
    identityNode.decision = `Custom role: ${data.identity.customRole}`;
  }

  if (data.identity.expertise.length > 0) {
    const expertiseChild: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Adding Expertise",
      description: "Defining specialized knowledge areas",
      decision: `${data.identity.expertise.length} expertise areas defined`,
      children: [],
      isActive: false,
      isComplete: true,
    };
    identityNode.children.push(expertiseChild);
  }

  rootNode.children.push(identityNode);

  // Task Section
  const taskNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "Defining Task",
    description: "Structuring the main objective",
    decision: "Task requirements configured",
    children: [],
    isActive: false,
    isComplete: true,
  };

  let taskSection = "<task>\n";
  taskSection += `<objective>\n${data.task.mainTask}\n</objective>\n`;

  if (data.task.context) {
    taskSection += `<context>\n${data.task.context}\n</context>\n`;

    const contextChild: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Adding Context",
      description: "Providing background information",
      decision: "Context integrated",
      children: [],
      isActive: false,
      isComplete: true,
    };
    taskNode.children.push(contextChild);
  }

  if (data.task.background) {
    taskSection += `<background>\n${data.task.background}\n</background>\n`;
  }

  if (data.task.specificRequirements.length > 0) {
    taskSection += "<requirements>\n";
    data.task.specificRequirements.forEach((req) => {
      taskSection += `- ${req}\n`;
    });
    taskSection += "</requirements>\n";

    const reqChild: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Adding Requirements",
      description: "Specifying detailed constraints",
      decision: `${data.task.specificRequirements.length} requirements added`,
      children: [],
      isActive: false,
      isComplete: true,
    };
    taskNode.children.push(reqChild);
  }

  taskSection += "</task>";
  promptSections.push(taskSection);
  rootNode.children.push(taskNode);

  // Examples Section
  if (data.examples.length > 0) {
    const examplesNode: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Adding Examples",
      description: "Providing reference patterns",
      decision: `${data.examples.length} examples included`,
      children: [],
      isActive: false,
      isComplete: true,
    };

    let examplesSection = "\n<examples>\n";
    data.examples.forEach((example, idx) => {
      examplesSection += `Example ${idx + 1}:\n`;
      examplesSection += `Input: ${example.input}\n`;
      examplesSection += `Output: ${example.output}\n`;
      if (example.explanation) {
        examplesSection += `Explanation: ${example.explanation}\n`;
      }
      examplesSection += "\n";
    });
    examplesSection += "</examples>";
    promptSections.push(examplesSection);
    rootNode.children.push(examplesNode);
  }

  // Constraints Section
  if (data.constraints.mustNotDo.length > 0 || data.constraints.negativeExamples.length > 0) {
    const constraintsNode: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Applying Constraints",
      description: "Defining boundaries and limitations",
      decision: `${data.constraints.mustNotDo.length} constraints applied`,
      children: [],
      isActive: false,
      isComplete: true,
    };

    let constraintsSection = "\n<constraints>\n";
    if (data.constraints.mustNotDo.length > 0) {
      constraintsSection += "You must NOT:\n";
      data.constraints.mustNotDo.forEach((constraint) => {
        constraintsSection += `- ${constraint}\n`;
      });
    }
    constraintsSection += "</constraints>";
    promptSections.push(constraintsSection);
    rootNode.children.push(constraintsNode);
  }

  // Output Configuration Section
  const outputNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "Configuring Output",
    description: "Setting format and style requirements",
    decision: undefined,
    children: [],
    isActive: false,
    isComplete: true,
  };

  let outputSection = "\n<output_requirements>\n";

  if (data.outputConfig.format && data.outputConfig.format !== "custom") {
    const formatInstruction = FORMAT_INSTRUCTIONS[data.outputConfig.format];
    if (formatInstruction) {
      outputSection += `Format: ${formatInstruction}\n`;
    }
    outputNode.decision = `Format: ${data.outputConfig.format}`;
  } else if (data.outputConfig.format === "custom" && data.outputConfig.customFormat) {
    outputSection += `Format: ${data.outputConfig.customFormat}\n`;
    outputNode.decision = `Custom format specified`;
  }

  if (data.outputConfig.lengthMin !== undefined || data.outputConfig.lengthMax !== undefined) {
    let lengthReq = "Length: ";
    if (data.outputConfig.lengthMin) {
      lengthReq += `minimum ${data.outputConfig.lengthMin} words`;
    }
    if (data.outputConfig.lengthMax) {
      if (data.outputConfig.lengthMin) lengthReq += ", ";
      lengthReq += `maximum ${data.outputConfig.lengthMax} words`;
    }
    outputSection += `${lengthReq}\n`;

    const lengthChild: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Setting Length Constraints",
      description: "Defining response size limits",
      decision: lengthReq,
      children: [],
      isActive: false,
      isComplete: true,
    };
    outputNode.children.push(lengthChild);
  }

  if (data.outputConfig.styleModifiers.length > 0) {
    outputSection += `Style: ${data.outputConfig.styleModifiers.join(", ")}\n`;

    const styleChild: ReasoningTreeNode = {
      nodeId: generateId(),
      step: "Applying Style Modifiers",
      description: "Fine-tuning communication style",
      decision: `${data.outputConfig.styleModifiers.length} modifiers applied`,
      children: [],
      isActive: false,
      isComplete: true,
    };
    outputNode.children.push(styleChild);
  }

  if (data.outputConfig.structureRequirements.length > 0) {
    outputSection += "Structure requirements:\n";
    data.outputConfig.structureRequirements.forEach((req) => {
      outputSection += `- ${req}\n`;
    });
  }

  outputSection += "</output_requirements>";
  promptSections.push(outputSection);
  rootNode.children.push(outputNode);

  // Final assembly
  const finalNode: ReasoningTreeNode = {
    nodeId: generateId(),
    step: "Finalizing God Mode Prompt",
    description: "Assembling comprehensive prompt structure",
    decision: "Advanced prompt generation complete",
    children: [],
    isActive: false,
    isComplete: true,
  };
  rootNode.children.push(finalNode);

  const finalPrompt = promptSections.join("\n\n");

  return {
    prompt: finalPrompt,
    reasoningTree: rootNode,
  };
}

// ============================================================================
// Simulation Helper for Progressive Revelation
// ============================================================================

export function simulateReasoningProgress(
  tree: ReasoningTreeNode,
  onProgress: (node: ReasoningTreeNode) => void
): Promise<void> {
  return new Promise((resolve) => {
    const allNodes: ReasoningTreeNode[] = [];

    // Collect all nodes in order
    const collectNodes = (node: ReasoningTreeNode) => {
      allNodes.push(node);
      node.children.forEach(collectNodes);
    };
    collectNodes(tree);

    // Animate nodes appearing one by one
    let index = 0;
    const interval = setInterval(() => {
      if (index < allNodes.length) {
        const node = allNodes[index];
        node.isActive = true;
        onProgress(node);

        // Mark as complete after a brief moment
        setTimeout(() => {
          node.isActive = false;
          node.isComplete = true;
          onProgress(node);
        }, 300);

        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 500);
  });
}
