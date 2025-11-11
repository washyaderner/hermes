import { Workflow, WorkflowExecution } from "@/types";
import { setCompressedItem, getCompressedItem } from "@/lib/storage/compression";

const WORKFLOWS_STORAGE_KEY = "hermes_workflows";
const WORKFLOW_EXECUTIONS_STORAGE_KEY = "hermes_workflow_executions";

/**
 * Save custom workflows to localStorage
 */
export function saveWorkflowsToStorage(workflows: Workflow[]): void {
  try {
    setCompressedItem(WORKFLOWS_STORAGE_KEY, workflows);
  } catch (error) {
    console.error("Failed to save workflows to localStorage:", error);
  }
}

/**
 * Load custom workflows from localStorage
 */
export function loadWorkflowsFromStorage(): Workflow[] {
  try {
    const compressedData = getCompressedItem<Workflow[]>(WORKFLOWS_STORAGE_KEY);
    if (compressedData) {
      return compressedData.map((workflow: any) => ({
        ...workflow,
        createdAt: new Date(workflow.createdAt),
        lastUsedAt: workflow.lastUsedAt ? new Date(workflow.lastUsedAt) : undefined,
      }));
    }

    // Fallback to uncompressed format
    const stored = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((workflow: any) => ({
        ...workflow,
        createdAt: new Date(workflow.createdAt),
        lastUsedAt: workflow.lastUsedAt ? new Date(workflow.lastUsedAt) : undefined,
      }));
    }
  } catch (error) {
    console.error("Failed to load workflows from localStorage:", error);
  }
  return [];
}

/**
 * Save workflow execution history to localStorage
 */
export function saveWorkflowExecutionsToStorage(executions: WorkflowExecution[]): void {
  try {
    // Keep only last 20 executions to save space
    const limitedExecutions = executions.slice(0, 20);
    setCompressedItem(WORKFLOW_EXECUTIONS_STORAGE_KEY, limitedExecutions);
  } catch (error) {
    console.error("Failed to save workflow executions to localStorage:", error);
  }
}

/**
 * Load workflow execution history from localStorage
 */
export function loadWorkflowExecutionsFromStorage(): WorkflowExecution[] {
  try {
    const compressedData = getCompressedItem<WorkflowExecution[]>(WORKFLOW_EXECUTIONS_STORAGE_KEY);
    if (compressedData) {
      return compressedData.map((execution: any) => ({
        ...execution,
        startedAt: new Date(execution.startedAt),
        completedAt: execution.completedAt ? new Date(execution.completedAt) : undefined,
        stepResults: execution.stepResults.map((result: any) => ({
          ...result,
          executedAt: new Date(result.executedAt),
        })),
      }));
    }

    // Fallback to uncompressed format
    const stored = localStorage.getItem(WORKFLOW_EXECUTIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((execution: any) => ({
        ...execution,
        startedAt: new Date(execution.startedAt),
        completedAt: execution.completedAt ? new Date(execution.completedAt) : undefined,
        stepResults: execution.stepResults.map((result: any) => ({
          ...result,
          executedAt: new Date(result.executedAt),
        })),
      }));
    }
  } catch (error) {
    console.error("Failed to load workflow executions from localStorage:", error);
  }
  return [];
}

/**
 * Add a new custom workflow
 */
export function addWorkflow(workflow: Workflow): void {
  const workflows = loadWorkflowsFromStorage();
  workflows.unshift(workflow); // Add to beginning
  saveWorkflowsToStorage(workflows);
}

/**
 * Update an existing workflow
 */
export function updateWorkflow(workflowId: string, updates: Partial<Workflow>): void {
  const workflows = loadWorkflowsFromStorage();
  const index = workflows.findIndex(w => w.id === workflowId);

  if (index >= 0) {
    workflows[index] = { ...workflows[index], ...updates };
    saveWorkflowsToStorage(workflows);
  }
}

/**
 * Delete a workflow
 */
export function deleteWorkflow(workflowId: string): void {
  const workflows = loadWorkflowsFromStorage();
  const filtered = workflows.filter(w => w.id !== workflowId);
  saveWorkflowsToStorage(filtered);
}

/**
 * Record workflow execution
 */
export function recordWorkflowExecution(execution: WorkflowExecution): void {
  const executions = loadWorkflowExecutionsFromStorage();
  executions.unshift(execution);
  saveWorkflowExecutionsToStorage(executions);

  // Update workflow use count and last used date
  updateWorkflow(execution.workflowId, {
    lastUsedAt: new Date(),
    useCount: (loadWorkflowsFromStorage().find(w => w.id === execution.workflowId)?.useCount || 0) + 1,
  });
}
