"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowBuilder } from "@/components/workflow/WorkflowBuilder";
import { Workflow } from "@/types";
import { loadWorkflowsFromStorage, loadWorkflowExecutionsFromStorage } from "@/lib/workflows/storage";

export default function WorkflowsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [customWorkflows, setCustomWorkflows] = useState<Workflow[]>([]);
  const [executionCount, setExecutionCount] = useState(0);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Load custom workflows and execution history
    setCustomWorkflows(loadWorkflowsFromStorage());
    setExecutionCount(loadWorkflowExecutionsFromStorage().length);
  }, []);

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Hermes</h1>
              <p className="text-xs text-muted-foreground">Workflow Automation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/history")}
            >
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/templates")}
            >
              Templates
            </Button>
            <Button
              variant="default"
              size="sm"
            >
              🔗 Workflows
            </Button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                🔗 Workflow Automation
              </h1>
              <p className="text-muted-foreground">
                Chain multiple AI platforms together to create powerful multi-step workflows
              </p>
            </div>
            {executionCount > 0 && (
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{executionCount}</div>
                    <div className="text-xs text-muted-foreground">Executions</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <CardTitle className="text-base">Multi-Platform Chains</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Combine outputs from multiple AI platforms in sequence for powerful results
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <CardTitle className="text-base">Pre-Built Templates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  6 ready-to-use workflow templates for common tasks like content creation and research
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💾</span>
                  <CardTitle className="text-base">Save Custom Workflows</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and save your own workflows for repeated use across projects
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Workflow Builder */}
        <WorkflowBuilder
          selectedWorkflow={selectedWorkflow}
          onWorkflowSelect={setSelectedWorkflow}
        />

        {/* How it Works */}
        <Card className="border-primary/20 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-accent">💡</span>
              How Workflows Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Select a Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from pre-built workflows or create your own custom chain
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Provide Input Variables</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in required variables like topic, code, or sources for the workflow
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Execute and Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Each step runs sequentially, passing outputs to the next platform in the chain
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
