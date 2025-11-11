"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useHermesStore } from "@/lib/store";
import { debounce } from "@/lib/utils";
import { useCallback } from "react";

export function InputArea() {
  const { currentPrompt, setCurrentPrompt } = useHermesStore();

  const handleChange = useCallback(
    debounce((value: string) => {
      setCurrentPrompt(value);
    }, 300),
    []
  );

  return (
    <Card className="h-full flex flex-col border-primary/20">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-accent">📝</span>
          Input Prompt
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your prompt below for analysis and optimization
        </p>
      </div>
      <div className="flex-1 p-4">
        <Textarea
          placeholder="Enter your prompt here...

Example:
Create a detailed image of a futuristic city at sunset with flying cars and neon signs."
          className="h-full min-h-[300px] resize-none text-base leading-relaxed"
          defaultValue={currentPrompt}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <div className="p-4 border-t border-border bg-surface/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Start typing to see real-time analysis</span>
          <span>{currentPrompt.length} characters</span>
        </div>
      </div>
    </Card>
  );
}
