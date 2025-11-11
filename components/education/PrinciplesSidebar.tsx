"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALL_PRINCIPLES, PRINCIPLES_BY_IMPORTANCE } from "@/lib/education/principles";
import { PromptEngineeringPrinciple } from "@/types";
import { ChevronDown, ChevronRight, BookOpen, AlertCircle, Info, Lightbulb } from "lucide-react";

interface PrinciplesSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function PrinciplesSidebar({ isOpen, onClose }: PrinciplesSidebarProps) {
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);
  const [filterImportance, setFilterImportance] = useState<"all" | "critical" | "important" | "helpful">("all");

  const filteredPrinciples = filterImportance === "all"
    ? ALL_PRINCIPLES
    : PRINCIPLES_BY_IMPORTANCE[filterImportance];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "text-red-500";
      case "important":
        return "text-orange-500";
      case "helpful":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "critical":
        return <AlertCircle className="h-4 w-4" />;
      case "important":
        return <Info className="h-4 w-4" />;
      case "helpful":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-border bg-background overflow-y-auto h-full">
      <CardHeader className="sticky top-0 bg-background z-10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Prompt Engineering Principles</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            variant={filterImportance === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterImportance("all")}
          >
            All ({ALL_PRINCIPLES.length})
          </Button>
          <Button
            variant={filterImportance === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterImportance("critical")}
            className="text-red-500"
          >
            Critical
          </Button>
          <Button
            variant={filterImportance === "important" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterImportance("important")}
          >
            Important
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {filteredPrinciples.map((principle) => {
          const isExpanded = expandedPrinciple === principle.principleId;

          return (
            <Card key={principle.principleId} className="border-l-4 border-l-primary/30">
              <CardContent className="p-4">
                {/* Header */}
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedPrinciple(isExpanded ? null : principle.principleId)
                  }
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={getImportanceColor(principle.importance)}>
                        {getImportanceIcon(principle.importance)}
                      </span>
                      <h4 className="font-semibold text-sm">{principle.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {principle.shortDescription}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">{principle.fullDescription}</div>

                    {/* Examples */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase text-muted-foreground">
                        Examples
                      </div>
                      {principle.examples.map((example, index) => (
                        <div key={index} className="space-y-2">
                          {/* Bad Example */}
                          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                            <div className="text-xs font-semibold text-red-500 mb-1">
                              ❌ Bad:
                            </div>
                            <div className="text-xs font-mono">{example.bad}</div>
                          </div>

                          {/* Good Example */}
                          <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                            <div className="text-xs font-semibold text-green-500 mb-1">
                              ✅ Good:
                            </div>
                            <div className="text-xs font-mono whitespace-pre-wrap">
                              {example.good}
                            </div>
                          </div>

                          {/* Explanation */}
                          <div className="text-xs text-muted-foreground italic">
                            {example.explanation}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Category Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {principle.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getImportanceColor(principle.importance)}`}
                      >
                        {principle.importance}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </div>
  );
}
