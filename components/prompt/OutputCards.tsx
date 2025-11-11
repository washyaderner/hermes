"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QualityMeter } from "./QualityMeter";
import { copyToClipboard } from "@/lib/utils";
import { useState } from "react";
import { EnhancedPrompt } from "@/types";
import { useHermesStore } from "@/lib/store";

interface OutputCardsProps {
  prompts: EnhancedPrompt[];
}

export function OutputCards({ prompts }: OutputCardsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markedSuccessfulIds, setMarkedSuccessfulIds] = useState<Set<string>>(new Set());
  const { trackPromptSuccess, getUserPreferenceWeighting, settings } = useHermesStore();

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      // Track that this prompt was copied (success signal)
      trackPromptSuccess(id, "copied");
    }
  };

  const handleMarkSuccessful = (id: string) => {
    trackPromptSuccess(id, "marked_successful");
    setMarkedSuccessfulIds((prev) => new Set(prev).add(id));
  };

  if (prompts.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center border-primary/20">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Enhanced Prompts Yet
          </h3>
          <p className="text-muted-foreground max-w-md">
            Enter a prompt and select a platform to see optimized variations appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt, index) => (
        <Card
          key={prompt.id}
          className="border-primary/20 hover:border-primary/40 transition-all"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-accent">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                  Variation {index + 1}
                  {prompt.qualityScore >= 80 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      Best
                    </span>
                  )}
                  {getUserPreferenceWeighting(prompt.platform.id, settings.tone) > 0.5 && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded flex items-center gap-1">
                      ⭐ Based on your preferences
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <QualityMeter
                    score={prompt.qualityScore}
                    label="Quality"
                    size="sm"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Tokens:</span>
                      <span className="font-medium text-foreground">
                        {prompt.tokenCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Platform:</span>
                      <span className="font-medium text-foreground">
                        {prompt.platform.icon} {prompt.platform.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Improvements */}
            {prompt.improvements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">
                  ✨ Improvements:
                </h4>
                <ul className="space-y-1">
                  {prompt.improvements.map((improvement, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enhanced prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  Enhanced Prompt:
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setExpandedId(expandedId === prompt.id ? null : prompt.id)
                  }
                >
                  {expandedId === prompt.id ? "Show less" : "Show more"}
                </Button>
              </div>
              <div
                className={`bg-background p-3 rounded-md border border-border text-sm text-foreground whitespace-pre-wrap ${
                  expandedId === prompt.id ? "" : "max-h-32 overflow-hidden"
                }`}
              >
                {prompt.enhanced}
              </div>
              {expandedId !== prompt.id && (
                <div className="text-xs text-muted-foreground text-center">
                  Click &quot;Show more&quot; to see full prompt
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleCopy(prompt.enhanced, prompt.id)}
                >
                  {copiedId === prompt.id ? "✓ Copied!" : "📋 Copy"}
                </Button>
                <Button
                  size="sm"
                  variant={markedSuccessfulIds.has(prompt.id) ? "accent" : "outline"}
                  className="flex-1"
                  onClick={() => handleMarkSuccessful(prompt.id)}
                  disabled={markedSuccessfulIds.has(prompt.id)}
                >
                  {markedSuccessfulIds.has(prompt.id) ? "✓ Marked!" : "⭐ Mark Successful"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
