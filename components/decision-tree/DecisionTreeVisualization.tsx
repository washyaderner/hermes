"use client";

import { DecisionTreeNode } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Circle } from "lucide-react";

interface DecisionTreeVisualizationProps {
  rootNode: DecisionTreeNode;
  selectedPath: DecisionTreeNode[];
  onNodeSelect: (node: DecisionTreeNode) => void;
}

export function DecisionTreeVisualization({
  rootNode,
  selectedPath,
  onNodeSelect,
}: DecisionTreeVisualizationProps) {
  const selectedNodeIds = new Set(selectedPath.map((n) => n.nodeId));

  // Recursive component to render tree nodes
  const TreeNode = ({ node, depth = 0 }: { node: DecisionTreeNode; depth?: number }) => {
    const isSelected = selectedNodeIds.has(node.nodeId);
    const hasChildren = node.children.length > 0;
    const isLeaf = !hasChildren;

    return (
      <div className="relative">
        {/* Node Card */}
        <Card
          className={`
            transition-all duration-200 cursor-pointer
            ${isSelected ? "border-primary border-2 shadow-md" : "border-border hover:border-primary/50"}
            ${depth > 0 ? "ml-12" : ""}
          `}
          onClick={() => onNodeSelect(node)}
        >
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {node.pathTemplate ? (
                    <div className="font-semibold text-sm">{node.pathTemplate.templateName}</div>
                  ) : (
                    <div className="font-semibold text-sm">Original Prompt</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={node.qualityScore >= 70 ? "default" : "secondary"}>
                  {node.qualityScore}/100
                </Badge>
                <Badge variant="outline">Level {node.level}</Badge>
              </div>
            </div>

            {/* Explanation */}
            <div className="text-sm text-muted-foreground mb-3">{node.explanation}</div>

            {/* Prompt Text */}
            <div className="text-sm bg-accent/50 rounded p-3 border border-border">
              <div className="font-medium text-xs text-muted-foreground mb-1">Prompt:</div>
              <div className="line-clamp-3">{node.promptText}</div>
            </div>

            {/* Template Details */}
            {node.pathTemplate && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{node.pathTemplate.strategy}</Badge>
                  <Badge variant="outline">{node.pathTemplate.pathType}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {node.pathTemplate.description}
                </div>
              </div>
            )}

            {/* Children indicator */}
            {hasChildren && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {node.children.length} refinement options available
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Children */}
        {hasChildren && isSelected && (
          <div className="mt-4 space-y-4">
            {/* Connection line */}
            <div className="ml-6 w-0.5 h-4 bg-border" />

            {/* Child nodes */}
            <div className="space-y-4">
              {node.children.map((child, index) => (
                <div key={child.nodeId} className="relative">
                  {/* Horizontal connector */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 flex items-center">
                    <div className="h-0.5 w-full bg-border" />
                    <ChevronRight className="h-4 w-4 text-border -ml-1" />
                  </div>

                  {/* Child node */}
                  <TreeNode node={child} depth={depth + 1} />

                  {/* Vertical connector to next sibling */}
                  {index < node.children.length - 1 && (
                    <div className="ml-6 w-0.5 h-4 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Path Summary */}
      {selectedPath.length > 1 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold mb-1">Current Path</div>
                <div className="text-xs text-muted-foreground">
                  {selectedPath.length - 1} refinements applied
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">Quality Improvement</div>
                <div className="text-2xl font-bold text-primary">
                  +
                  {(
                    selectedPath[selectedPath.length - 1].qualityScore -
                    selectedPath[0].qualityScore
                  ).toFixed(0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tree Visualization */}
      <div className="overflow-x-auto">
        <TreeNode node={rootNode} />
      </div>

      {/* Instructions */}
      {selectedPath.length === 1 && (
        <Card className="bg-accent/30">
          <CardContent className="p-4">
            <div className="text-sm">
              <div className="font-semibold mb-2">How to use Decision Tree Mode:</div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Click on a refinement option below to explore that path</li>
                <li>After selecting, you'll see 3 more refinement options</li>
                <li>Continue refining until you're satisfied with the result</li>
                <li>Save successful paths as reusable routes</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
