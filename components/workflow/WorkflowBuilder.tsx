"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Workflow, WorkflowExecution, WorkflowStepResult } from "@/types";
import { WorkflowExecutor } from "@/lib/workflows/executor";
import { workflowTemplates } from "@/lib/workflows/templates";

interface WorkflowBuilderProps {
  selectedWorkflow: Workflow | null;
  onWorkflowSelect: (workflow: Workflow) => void;
}

export function WorkflowBuilder({ selectedWorkflow, onWorkflowSelect }: WorkflowBuilderProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<WorkflowExecution | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsExecuting(true);
    setExecutionResults(null);
    setCurrentStepIndex(0);

    const executor = new WorkflowExecutor();

    const execution = await executor.executeWorkflow(
      selectedWorkflow,
      userInputs,
      (stepResult: WorkflowStepResult) => {
        // Update UI as each step completes
        setCurrentStepIndex(stepResult.stepNumber);
      }
    );

    setExecutionResults(execution);
    setIsExecuting(false);
  };

  const requiredVariables = selectedWorkflow
    ? WorkflowExecutor.extractVariables(selectedWorkflow)
    : [];

  return (
    <div className="space-y-4">
      {/* Workflow Template Selection */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-accent">🔗</span>
            Workflow Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workflowTemplates.map((template) => (
              <Card
                key={template.templateId}
                className={`cursor-pointer border transition-all hover:border-primary/50 ${
                  selectedWorkflow?.workflowName === template.templateName
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => {
                  const workflow = {
                    id: template.templateId,
                    workflowName: template.templateName,
                    workflowDescription: template.templateDescription,
                    category: template.category,
                    steps: template.steps.map((step, idx) => ({
                      ...step,
                      id: `${template.templateId}-step-${idx}`,
                      stepNumber: idx + 1,
                    })),
                    isBuiltIn: true,
                    createdAt: new Date(),
                    useCount: 0,
                  };
                  onWorkflowSelect(workflow);
                  setUserInputs({});
                  setExecutionResults(null);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h3 className="font-semibold text-sm">{template.templateName}</h3>
                          <p className="text-xs text-muted-foreground">{template.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.templateDescription}
                  </p>
                  <div className="mt-2 text-xs text-primary">
                    {template.steps.length} steps
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Workflow Details */}
      {selectedWorkflow && (
        <>
          {/* Workflow Steps Visualization */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-accent">📋</span>
                Workflow Steps: {selectedWorkflow.workflowName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedWorkflow.workflowDescription}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <Card
                      className={`border transition-all ${
                        isExecuting && currentStepIndex === step.stepNumber
                          ? "border-primary bg-primary/5"
                          : currentStepIndex > step.stepNumber && executionResults
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-border"
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isExecuting && currentStepIndex === step.stepNumber
                              ? "bg-primary text-primary-foreground"
                              : currentStepIndex > step.stepNumber && executionResults
                              ? "bg-green-500 text-white"
                              : "bg-surface text-muted-foreground"
                          }`}>
                            {currentStepIndex > step.stepNumber && executionResults ? "✓" : step.stepNumber}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">{step.platform.icon} {step.platform.name}</span>
                              {step.useOutputFromStep && (
                                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                                  Uses Step {step.useOutputFromStep}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {index < selectedWorkflow.steps.length - 1 && (
                      <div className="flex justify-center my-2">
                        <div className="w-0.5 h-4 bg-border"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Input Variables */}
          {requiredVariables.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-accent">🎯</span>
                  Input Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requiredVariables.map((variable) => (
                    <div key={variable}>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        {variable}
                      </label>
                      <Input
                        placeholder={`Enter ${variable}...`}
                        value={userInputs[variable] || ""}
                        onChange={(e) =>
                          setUserInputs((prev) => ({
                            ...prev,
                            [variable]: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execute Button */}
          <Button
            onClick={handleExecuteWorkflow}
            disabled={isExecuting || requiredVariables.some(v => !userInputs[v])}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                Executing Step {currentStepIndex} of {selectedWorkflow.steps.length}...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Execute Workflow
              </>
            )}
          </Button>

          {/* Execution Results */}
          {executionResults && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-accent">📊</span>
                  Execution Results
                  {executionResults.status === "completed" && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded ml-2">
                      Completed
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executionResults.stepResults.map((result) => (
                    <Card key={result.stepId} className="border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              Step {result.stepNumber}: {result.platform.icon} {result.platform.name}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.tokenCount} tokens • {result.executionTimeMs}ms
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Input:</h4>
                            <div className="text-sm bg-surface p-2 rounded text-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {result.inputPrompt}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Output:</h4>
                            <div className="text-sm bg-surface p-2 rounded text-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {result.outputResult}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
