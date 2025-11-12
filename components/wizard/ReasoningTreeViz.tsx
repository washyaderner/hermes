"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReasoningTreeNode } from "@/types";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface ReasoningTreeVizProps {
  tree: ReasoningTreeNode | null;
  finalPrompt: string;
}

export function ReasoningTreeViz({ tree, finalPrompt }: ReasoningTreeVizProps) {
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);

  useEffect(() => {
    if (tree) {
      // Animate steps appearing one by one
      const allSteps: string[] = [];
      const traverse = (node: ReasoningTreeNode) => {
        allSteps.push(node.nodeId);
        node.children.forEach(traverse);
      };
      traverse(tree);

      allSteps.forEach((stepId, index) => {
        setTimeout(() => {
          setVisibleSteps((prev) => [...prev, stepId]);
        }, index * 500);
      });
    }
  }, [tree]);

  const renderNode = (node: ReasoningTreeNode, depth: number = 0) => {
    const isVisible = visibleSteps.includes(node.nodeId);
    const isComplete = node.isComplete;

    return (
      <div
        key={node.nodeId}
        className={`transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ marginLeft: depth * 32 }}
      >
        <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card mb-2">
          <div className="flex-shrink-0 mt-1">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : node.isActive ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1">
            <div className="font-semibold text-sm mb-1">{node.step}</div>
            <div className="text-sm text-muted-foreground mb-1">{node.description}</div>
            {node.decision && (
              <div className="text-sm text-primary font-medium">→ {node.decision}</div>
            )}
          </div>
        </div>

        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-surface">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Building Your Prompt...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tree && renderNode(tree)}

            {finalPrompt && (
              <div className="mt-6 p-4 bg-primary/5 border-2 border-primary rounded-lg">
                <div className="text-sm font-semibold text-primary mb-2">
                  ✨ Final Prompt Generated
                </div>
                <div className="text-sm whitespace-pre-wrap font-mono bg-background p-4 rounded">
                  {finalPrompt}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="animate-pulse text-sm text-muted-foreground">
            Analyzing requirements and optimizing structure...
          </div>
        </div>
      </div>
    </div>
  );
}
