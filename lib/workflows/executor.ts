import { Workflow, WorkflowExecution, WorkflowStepResult, WorkflowStep } from "@/types";
import { generateId } from "@/lib/utils";
import { countTokens } from "@/lib/prompt-engine/analyzer";

/**
 * Workflow execution engine
 * Orchestrates multi-step prompt workflows with step dependencies
 */
export class WorkflowExecutor {
  private currentExecution: WorkflowExecution | null = null;

  /**
   * Start executing a workflow
   */
  async startWorkflow(workflow: Workflow, initialInput: Record<string, string>): Promise<WorkflowExecution> {
    const executionId = generateId();

    this.currentExecution = {
      executionId,
      workflowId: workflow.id,
      startedAt: new Date(),
      currentStepNumber: 1,
      stepResults: [],
      status: "running",
    };

    return this.currentExecution;
  }

  /**
   * Execute a single workflow step
   */
  async executeStep(
    step: WorkflowStep,
    previousResults: WorkflowStepResult[],
    userInputVariables: Record<string, string>
  ): Promise<WorkflowStepResult> {
    const startTime = Date.now();

    // Build the input prompt by replacing variables and previous outputs
    let inputPrompt = this.buildInputPrompt(
      step.promptTemplate,
      previousResults,
      step.useOutputFromStep,
      userInputVariables
    );

    // Apply transformation if specified
    if (step.transformationType && step.transformationType !== "none") {
      inputPrompt = this.applyTransformation(inputPrompt, step.transformationType);
    }

    // Simulate AI execution (in real implementation, this would call the actual API)
    const outputResult = await this.simulateApiCall(inputPrompt, step.platform.id);

    const executionTimeMs = Date.now() - startTime;

    const stepResult: WorkflowStepResult = {
      stepId: step.id,
      stepNumber: step.stepNumber,
      inputPrompt,
      outputResult,
      platform: step.platform,
      tokenCount: countTokens(outputResult),
      executedAt: new Date(),
      executionTimeMs,
    };

    return stepResult;
  }

  /**
   * Build input prompt by replacing placeholders with actual values
   */
  private buildInputPrompt(
    template: string,
    previousResults: WorkflowStepResult[],
    useOutputFromStep: number | undefined,
    userVariables: Record<string, string>
  ): string {
    let processedPrompt = template;

    // Replace {previous} with output from the immediately previous step
    if (useOutputFromStep && previousResults.length >= useOutputFromStep) {
      const previousOutput = previousResults[useOutputFromStep - 1].outputResult;
      processedPrompt = processedPrompt.replace(/\{previous\}/g, previousOutput);
    }

    // Replace {stepN} with output from specific steps
    previousResults.forEach((result) => {
      const stepPlaceholder = new RegExp(`\\{step${result.stepNumber}\\}`, 'g');
      processedPrompt = processedPrompt.replace(stepPlaceholder, result.outputResult);
    });

    // Replace user-provided variables
    Object.entries(userVariables).forEach(([key, value]) => {
      const variablePlaceholder = new RegExp(`\\{${key}\\}`, 'g');
      processedPrompt = processedPrompt.replace(variablePlaceholder, value);
    });

    return processedPrompt;
  }

  /**
   * Apply transformation to input
   */
  private applyTransformation(
    input: string,
    transformationType: "summarize" | "expand" | "rephrase" | "extract"
  ): string {
    const transformationPrefixes = {
      summarize: "Summarize the following concisely:\n\n",
      expand: "Expand on the following with more details:\n\n",
      rephrase: "Rephrase the following in different words:\n\n",
      extract: "Extract the key information from the following:\n\n",
    };

    return transformationPrefixes[transformationType] + input;
  }

  /**
   * Simulate API call (replace with actual API integration)
   */
  private async simulateApiCall(prompt: string, platformId: string): Promise<string> {
    // In production, this would make actual API calls to the platforms
    // For now, we'll simulate with a delay and mock response

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    return `[Simulated response from ${platformId}]\n\nProcessed prompt:\n${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}\n\n[This would be the actual AI-generated response in production]`;
  }

  /**
   * Execute entire workflow end-to-end
   */
  async executeWorkflow(
    workflow: Workflow,
    userInputVariables: Record<string, string>,
    onStepComplete?: (step: WorkflowStepResult) => void
  ): Promise<WorkflowExecution> {
    const execution = await this.startWorkflow(workflow, userInputVariables);

    try {
      for (const step of workflow.steps) {
        execution.currentStepNumber = step.stepNumber;

        const stepResult = await this.executeStep(
          step,
          execution.stepResults,
          userInputVariables
        );

        execution.stepResults.push(stepResult);

        // Callback for progress updates
        if (onStepComplete) {
          onStepComplete(stepResult);
        }
      }

      execution.status = "completed";
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = "failed";
      execution.errorMessage = error instanceof Error ? error.message : "Unknown error";
      execution.completedAt = new Date();
    }

    this.currentExecution = null;
    return execution;
  }

  /**
   * Pause current execution
   */
  pauseExecution(): void {
    if (this.currentExecution) {
      this.currentExecution.status = "paused";
    }
  }

  /**
   * Get current execution status
   */
  getCurrentExecution(): WorkflowExecution | null {
    return this.currentExecution;
  }

  /**
   * Extract variables from workflow template
   */
  static extractVariables(workflow: Workflow): string[] {
    const variableSet = new Set<string>();

    workflow.steps.forEach(step => {
      const matches = step.promptTemplate.match(/\{([^}]+)\}/g);
      if (matches) {
        matches.forEach(match => {
          const variable = match.slice(1, -1); // Remove { }
          // Exclude special keywords
          if (!['previous', 'step1', 'step2', 'step3', 'step4', 'step5'].includes(variable)) {
            variableSet.add(variable);
          }
        });
      }
    });

    return Array.from(variableSet);
  }
}

/**
 * Helper function to create workflow from template
 */
export function createWorkflowFromTemplate(
  template: any,
  workflowName?: string
): Workflow {
  return {
    id: generateId(),
    workflowName: workflowName || template.templateName,
    workflowDescription: template.templateDescription,
    category: template.category,
    steps: template.steps.map((step: any, index: number) => ({
      ...step,
      id: generateId(),
      stepNumber: index + 1,
    })),
    isBuiltIn: false,
    createdAt: new Date(),
    useCount: 0,
  };
}
