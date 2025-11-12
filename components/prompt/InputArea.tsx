"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHermesStore } from "@/lib/store";
import { useVersionControlStore } from "@/stores/versionControlStore";
import { debounce, generateId } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

export function InputArea() {
  const { currentPrompt, setCurrentPrompt } = useHermesStore();
  const { createVersion, autoSaveEnabled, lastAutoSave } = useVersionControlStore();
  const [promptId] = useState(() => generateId());
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>(currentPrompt);

  const handleChange = useCallback(
    debounce((value: string) => {
      setCurrentPrompt(value);
      lastContentRef.current = value;
    }, 300),
    []
  );

  // Auto-save every 30 seconds
  useEffect(() => {
    if (autoSaveEnabled && currentPrompt.length > 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        if (lastContentRef.current !== currentPrompt || !lastAutoSave) {
          createVersion(promptId, currentPrompt, 'Auto-save', false);
          lastContentRef.current = currentPrompt;
        }
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentPrompt, autoSaveEnabled, createVersion, promptId, lastAutoSave]);

  const handleManualCheckpoint = () => {
    const message = prompt('Enter a commit message for this checkpoint:');
    if (message && message.trim()) {
      createVersion(promptId, currentPrompt, message.trim(), true);
      alert('✓ Checkpoint saved!');
    }
  };

  const handleUndo = () => {
    // This would integrate with version control to restore previous version
    alert('Undo functionality - would restore previous version');
  };

  return (
    <Card className="h-full flex flex-col border-primary/20">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="text-accent">📝</span>
              Input Prompt
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your prompt below for analysis and optimization
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualCheckpoint}
              title="Save checkpoint"
            >
              💾
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              ↩️
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowVersionPanel(!showVersionPanel)}
              title="Version history"
            >
              🕐
            </Button>
          </div>
        </div>
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
          <div className="flex items-center gap-3">
            <span>Start typing to see real-time analysis</span>
            {autoSaveEnabled && lastAutoSave && (
              <span className="text-green-400">
                ✓ Auto-saved {new Date(lastAutoSave).toLocaleTimeString()}
              </span>
            )}
          </div>
          <span>{currentPrompt.length} characters</span>
        </div>
      </div>
    </Card>
  );
}
