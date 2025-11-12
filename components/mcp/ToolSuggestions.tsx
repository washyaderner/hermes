"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MCPToolContext, MCPEnhancementSuggestion } from "@/types";
import { enhancePromptWithTools } from "@/lib/mcp/enhancer";
import { Lightbulb, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";

interface ToolSuggestionsProps {
  prompt: string;
  toolContext: MCPToolContext;
  onApplySuggestion?: (enhancedPrompt: string) => void;
  onDismiss?: () => void;
}

export function ToolSuggestions({
  prompt,
  toolContext,
  onApplySuggestion,
  onDismiss,
}: ToolSuggestionsProps) {
  const [suggestion, setSuggestion] = useState<MCPEnhancementSuggestion | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (prompt && prompt.length > 10 && toolContext.availableTools.length > 0) {
      const enhancement = enhancePromptWithTools(prompt, toolContext);
      if (enhancement.toolsUsed.length > 0) {
        setSuggestion(enhancement);
      } else {
        setSuggestion(null);
      }
    } else {
      setSuggestion(null);
    }
  }, [prompt, toolContext]);

  if (!suggestion || suggestion.toolsUsed.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">
                  Tool Enhancement Available
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {suggestion.reasoning}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {suggestion.toolsUsed.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onDismiss}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Improvements List */}
          {expanded && (
            <div className="space-y-2">
              <div className="text-xs font-medium">Improvements:</div>
              <div className="space-y-1">
                {suggestion.improvements.map((improvement, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground pl-4">
                    • {improvement}
                  </div>
                ))}
              </div>

              {/* Enhanced Prompt Preview */}
              <div className="mt-3">
                <div className="text-xs font-medium mb-1">Enhanced Prompt:</div>
                <div className="p-2 bg-muted/30 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                  {suggestion.enhancedPrompt}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                onApplySuggestion && onApplySuggestion(suggestion.enhancedPrompt)
              }
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Apply Enhancement
            </Button>
            {!expanded && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(true)}
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Show Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
