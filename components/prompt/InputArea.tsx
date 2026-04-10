"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useHermesStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";

export function InputArea() {
  const { currentPrompt, setCurrentPrompt } = useHermesStore();
  const [localValue, setLocalValue] = useState(currentPrompt);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isExternalUpdate = useRef(false);

  // Sync from store -> local when store changes externally (e.g., wizard, template load)
  useEffect(() => {
    if (currentPrompt !== localValue) {
      isExternalUpdate.current = true;
      setLocalValue(currentPrompt);
    }
  }, [currentPrompt]);

  const handleChange = (value: string) => {
    setLocalValue(value);
    isExternalUpdate.current = false;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPrompt(value);
    }, 300);
  };

  return (
    <Card className="h-full flex flex-col border-primary/20">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Input Prompt
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your prompt or use a wizard to build one
        </p>
      </div>
      <div className="flex-1 p-4">
        <Textarea
          placeholder="Type your prompt here, or use Quick/God Mode to build one...

Examples:
  Write a blog post about remote work productivity
  Build a REST API for user authentication
  Analyze the competitive landscape for AI dev tools"
          className="h-full min-h-[300px] resize-none text-base leading-relaxed"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <div className="p-4 border-t border-border bg-surface/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Real-time analysis as you type</span>
          <span>{localValue.length} characters</span>
        </div>
      </div>
    </Card>
  );
}
