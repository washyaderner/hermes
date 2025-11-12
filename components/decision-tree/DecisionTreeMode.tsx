"use client";

import { useState, useEffect } from "react";
import {
  DecisionTreeNode,
  DecisionTreeStrategy,
  SavedDecisionTreeRoute,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  createRootNode,
  generateChildNodes,
  buildPathToNode,
  createDecisionTreePath,
  savePathAsRoute,
  loadSavedRoutes,
  applyRouteToPrompt,
  deleteSavedRoute,
} from "@/lib/decision-tree/engine";
import { DecisionTreeVisualization } from "./DecisionTreeVisualization";
import {
  GitBranch,
  Save,
  Trash2,
  Play,
  RotateCcw,
  Info,
  TrendingUp,
} from "lucide-react";

interface DecisionTreeModeProps {
  initialPrompt: string;
  onPromptChange: (prompt: string) => void;
  onClose?: () => void;
}

export function DecisionTreeMode({
  initialPrompt,
  onPromptChange,
  onClose,
}: DecisionTreeModeProps) {
  const [rootNode, setRootNode] = useState<DecisionTreeNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<DecisionTreeNode[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<DecisionTreeStrategy>("style");
  const [savedRoutes, setSavedRoutes] = useState<SavedDecisionTreeRoute[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");

  // Initialize root node
  useEffect(() => {
    if (initialPrompt) {
      const root = createRootNode(initialPrompt);
      setRootNode(root);
      setSelectedPath([root]);
    }
  }, [initialPrompt]);

  // Load saved routes
  useEffect(() => {
    setSavedRoutes(loadSavedRoutes());
  }, []);

  // Generate initial branches when root is created
  useEffect(() => {
    if (rootNode && rootNode.children.length === 0) {
      handleGenerateBranches(rootNode);
    }
  }, [rootNode]);

  const handleGenerateBranches = (node: DecisionTreeNode) => {
    const children = generateChildNodes(node, selectedStrategy);
    node.children = children;
    setRootNode({ ...rootNode! });
  };

  const handleNodeSelect = (node: DecisionTreeNode) => {
    if (!rootNode) return;

    // Build path from root to selected node
    const path = buildPathToNode(rootNode, node.nodeId);
    setSelectedPath(path);

    // Update prompt in parent component
    onPromptChange(node.promptText);

    // Generate children if this node doesn't have any yet
    if (node.children.length === 0 && node.level < 2) {
      handleGenerateBranches(node);
    }
  };

  const handleSavePath = () => {
    if (selectedPath.length < 2) {
      alert("Please refine your prompt at least once before saving");
      return;
    }

    if (!routeName) {
      alert("Please enter a name for this route");
      return;
    }

    const path = createDecisionTreePath(selectedPath);
    const route = savePathAsRoute(path, routeName, routeDescription);

    setSavedRoutes([...savedRoutes, route]);
    setShowSaveDialog(false);
    setRouteName("");
    setRouteDescription("");

    alert("Route saved successfully!");
  };

  const handleApplyRoute = (route: SavedDecisionTreeRoute) => {
    if (!initialPrompt) return;

    const tree = applyRouteToPrompt(initialPrompt, route);
    setRootNode(tree);

    // Build the selected path
    const path: DecisionTreeNode[] = [tree];
    let current = tree;
    while (current.children.length > 0) {
      const selected = current.children.find((c) => c.isSelected);
      if (selected) {
        path.push(selected);
        current = selected;
      } else {
        break;
      }
    }

    setSelectedPath(path);
    onPromptChange(path[path.length - 1].promptText);
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm("Are you sure you want to delete this route?")) {
      deleteSavedRoute(routeId);
      setSavedRoutes(savedRoutes.filter((r) => r.routeId !== routeId));
    }
  };

  const handleReset = () => {
    if (confirm("Reset the decision tree? This will clear your current path.")) {
      const root = createRootNode(initialPrompt);
      setRootNode(root);
      setSelectedPath([root]);
      onPromptChange(initialPrompt);
    }
  };

  const handleUseCurrentPrompt = () => {
    if (selectedPath.length > 1) {
      const finalPrompt = selectedPath[selectedPath.length - 1].promptText;
      onPromptChange(finalPrompt);
      if (onClose) onClose();
    }
  };

  if (!rootNode) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Enter a prompt to start exploring decision paths...
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentNode = selectedPath[selectedPath.length - 1];
  const qualityImprovement =
    selectedPath.length > 1 ? currentNode.qualityScore - selectedPath[0].qualityScore : 0;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Decision Tree Enhancement
              </CardTitle>
              <CardDescription>
                Explore different enhancement paths and save successful routes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {selectedPath.length > 1 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Path
                  </Button>
                  <Button size="sm" onClick={handleUseCurrentPrompt}>
                    <Play className="h-4 w-4 mr-2" />
                    Use This Prompt
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Strategy Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Enhancement Strategy:</label>
            <Select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value as DecisionTreeStrategy)}
              className="w-48"
            >
              <option value="style">Style (Creative/Technical/Simple)</option>
              <option value="optimization">Optimization (Clarity/Brevity/Detail)</option>
              <option value="audience">Audience (Expert/Beginner/General)</option>
            </Select>

            {qualityImprovement > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-success">
                  +{qualityImprovement.toFixed(0)} quality improvement
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tree Visualization */}
      <DecisionTreeVisualization
        rootNode={rootNode}
        selectedPath={selectedPath}
        onNodeSelect={handleNodeSelect}
      />

      {/* Saved Routes */}
      {savedRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Routes</CardTitle>
            <CardDescription>Reusable enhancement paths you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedRoutes.map((route) => (
                <Card key={route.routeId} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold mb-1">{route.routeName}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {route.description}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{route.strategy}</Badge>
                          {route.pathTypes.map((type) => (
                            <Badge key={type} variant="secondary">
                              {type}
                            </Badge>
                          ))}
                          <Badge variant="outline">{route.templates.length} steps</Badge>
                          <Badge variant="outline">Used {route.usageCount}x</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplyRoute(route)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRoute(route.routeId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Save Enhancement Path</CardTitle>
            <CardDescription>Save this path as a reusable route</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Route Name *</label>
              <Input
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g., Creative Technical Blog Posts"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={routeDescription}
                onChange={(e) => setRouteDescription(e.target.value)}
                placeholder="Describe when to use this route..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSavePath}>
                <Save className="h-4 w-4 mr-2" />
                Save Route
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-accent/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <div className="font-semibold mb-1">Tips:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Each node shows quality score and enhancement explanation</li>
                <li>You can refine up to 2 levels deep (6 total refinements)</li>
                <li>Save successful paths to reuse them on similar prompts</li>
                <li>Switch strategies to explore different enhancement approaches</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
