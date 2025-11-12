"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RealTimeTip } from "@/types";
import { analyzePromptForTips } from "@/lib/education/real-time-tips";
import { getLessonById } from "@/lib/education/lessons";
import { Lightbulb, X, AlertTriangle, Info, BookOpen } from "lucide-react";

interface RealTimeTipsProps {
  prompt: string;
  tipFrequency: "high" | "medium" | "low";
  onDismiss?: (tipId: string) => void;
  onLearnMore?: (lessonId: string) => void;
}

export function RealTimeTips({
  prompt,
  tipFrequency,
  onDismiss,
  onLearnMore,
}: RealTimeTipsProps) {
  const [tips, setTips] = useState<RealTimeTip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  const [lastAnalysisTime, setLastAnalysisTime] = useState(Date.now());

  // Analyze prompt for tips (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt && prompt.trim().length > 10) {
        const trigger = Date.now() - lastAnalysisTime > 5000 ? "pause" : "typing";
        const foundTips = analyzePromptForTips(prompt, trigger, tipFrequency);

        // Filter out dismissed tips
        const visibleTips = foundTips.filter((tip) => !dismissedTips.has(tip.tipId));
        setTips(visibleTips);
        setLastAnalysisTime(Date.now());
      } else {
        setTips([]);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [prompt, tipFrequency, dismissedTips, lastAnalysisTime]);

  const handleDismiss = (tipId: string) => {
    setDismissedTips(new Set(Array.from(dismissedTips).concat(tipId)));
    if (onDismiss) onDismiss(tipId);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Info className="h-4 w-4 text-orange-500" />;
      case "low":
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500/30 bg-red-500/5";
      case "medium":
        return "border-orange-500/30 bg-orange-500/5";
      case "low":
        return "border-blue-500/30 bg-blue-500/5";
      default:
        return "";
    }
  };

  if (tips.length === 0) return null;

  return (
    <div className="space-y-2">
      {tips.map((tip) => (
        <Card key={tip.tipId} className={`border-l-4 ${getPriorityColor(tip.priority)}`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                {getPriorityIcon(tip.priority)}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-1">{tip.message}</div>
                  {tip.suggestion && (
                    <div className="text-xs text-muted-foreground italic mb-2">
                      💡 {tip.suggestion}
                    </div>
                  )}
                  {tip.learnMore && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => onLearnMore && onLearnMore(tip.learnMore!)}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Learn more
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleDismiss(tip.tipId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
