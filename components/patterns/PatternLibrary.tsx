"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptPattern, Intent, PatternBlock } from "@/types";
import { promptPatterns, getPatternsByIntent } from "@/lib/patterns/library";
import {
  combinePatterns,
  calculateCombinationScore,
  suggestPatternsForIntent,
  patternCombinations,
} from "@/lib/patterns/mixer";
import { getPatternStats, getPatternRecommendations } from "@/lib/patterns/learning";
import { generateId } from "@/lib/utils";

interface PatternLibraryProps {
  currentPrompt: string;
  detectedIntent: Intent;
  onApplyPattern: (enhancedPrompt: string, patterns: PromptPattern[]) => void;
}

export function PatternLibrary({
  currentPrompt,
  detectedIntent,
  onApplyPattern,
}: PatternLibraryProps) {
  const [selectedPatterns, setSelectedPatterns] = useState<PromptPattern[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderBlocks, setBuilderBlocks] = useState<PatternBlock[]>([]);
  const [view, setView] = useState<"library" | "combinations" | "builder">("library");

  // Get suggested patterns for current intent
  const suggestedPatterns = suggestPatternsForIntent(detectedIntent);

  // Get pattern recommendations based on history
  const recommendations = getPatternRecommendations();

  // Calculate combination score
  const combinationScore = calculateCombinationScore(selectedPatterns);

  // Toggle pattern selection
  const togglePattern = (pattern: PromptPattern) => {
    if (selectedPatterns.find((p) => p.patternId === pattern.patternId)) {
      setSelectedPatterns(selectedPatterns.filter((p) => p.patternId !== pattern.patternId));
    } else {
      setSelectedPatterns([...selectedPatterns, pattern]);
    }
  };

  // Apply selected patterns
  const handleApply = () => {
    if (selectedPatterns.length === 0) return;

    const enhanced = combinePatterns(currentPrompt, selectedPatterns);
    onApplyPattern(enhanced, selectedPatterns);
  };

  // Add block to visual builder
  const addBlock = (patternType: string) => {
    const pattern = promptPatterns.find((p) => p.patternType === patternType);
    if (!pattern) return;

    const newBlock: PatternBlock = {
      blockId: generateId(),
      blockType: pattern.patternType,
      content: pattern.template,
      order: builderBlocks.length,
      isEnabled: true,
    };

    setBuilderBlocks([...builderBlocks, newBlock]);
  };

  // Remove block from builder
  const removeBlock = (blockId: string) => {
    setBuilderBlocks(builderBlocks.filter((b) => b.blockId !== blockId));
  };

  // Toggle block enabled state
  const toggleBlock = (blockId: string) => {
    setBuilderBlocks(
      builderBlocks.map((b) => (b.blockId === blockId ? { ...b, isEnabled: !b.isEnabled } : b))
    );
  };

  // Compile builder blocks into prompt
  const compileBuilderPrompt = () => {
    const enabledBlocks = builderBlocks.filter((b) => b.isEnabled).sort((a, b) => a.order - b.order);

    if (enabledBlocks.length === 0) return currentPrompt;

    const patterns = enabledBlocks
      .map((block) => promptPatterns.find((p) => p.patternType === block.blockType))
      .filter(Boolean) as PromptPattern[];

    return combinePatterns(currentPrompt, patterns);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎨</span>
          <h3 className="font-semibold">Pattern Library</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "library" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("library")}
          >
            Library
          </Button>
          <Button
            variant={view === "combinations" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("combinations")}
          >
            Combos
          </Button>
          <Button
            variant={view === "builder" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("builder")}
          >
            Builder
          </Button>
        </div>
      </div>

      {/* Library View */}
      {view === "library" && (
        <div className="space-y-4">
          {/* Suggested Patterns */}
          {suggestedPatterns.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">💡 Suggested for {detectedIntent}</h4>
              <div className="space-y-2">
                {suggestedPatterns.slice(0, 3).map((pattern) => {
                  const stats = getPatternStats(pattern.patternId);
                  const isSelected = selectedPatterns.some((p) => p.patternId === pattern.patternId);

                  return (
                    <Card
                      key={pattern.patternId}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                      }`}
                      onClick={() => togglePattern(pattern)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{pattern.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{pattern.patternName}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                              {pattern.effectivenessScore}%
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                pattern.difficulty === "beginner"
                                  ? "bg-green-500/20 text-green-600"
                                  : pattern.difficulty === "intermediate"
                                  ? "bg-yellow-500/20 text-yellow-600"
                                  : "bg-red-500/20 text-red-600"
                              }`}
                            >
                              {pattern.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{pattern.description}</p>
                          {stats.totalUses > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Used {stats.totalUses} times • {(stats.successRate * 100).toFixed(0)}%
                              success rate
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Patterns by Category */}
          <div>
            <h4 className="text-sm font-semibold mb-2">📚 All Patterns</h4>
            <div className="space-y-3">
              {["reasoning", "examples", "structure", "safety", "persona"].map((category) => {
                const categoryPatterns = promptPatterns.filter((p) => p.category === category);
                if (categoryPatterns.length === 0) return null;

                return (
                  <div key={category}>
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1 capitalize">
                      {category}
                    </h5>
                    <div className="space-y-1">
                      {categoryPatterns.map((pattern) => {
                        const isSelected = selectedPatterns.some(
                          (p) => p.patternId === pattern.patternId
                        );

                        return (
                          <div
                            key={pattern.patternId}
                            onClick={() => togglePattern(pattern)}
                            className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-primary/10 border border-primary"
                                : "bg-muted/30 hover:bg-muted/50"
                            }`}
                          >
                            <span className="mr-2">{pattern.icon}</span>
                            {pattern.patternName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Patterns Summary */}
          {selectedPatterns.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">
                  Selected: {selectedPatterns.length} pattern(s)
                </span>
                <span className="text-sm font-semibold">
                  Score: <span className="text-primary">{combinationScore}/100</span>
                </span>
              </div>
              <Button onClick={handleApply} className="w-full" size="sm">
                Apply Patterns to Prompt
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Combinations View */}
      {view === "combinations" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">
            Pre-tested pattern combinations for maximum effectiveness
          </p>
          {patternCombinations.map((combo) => (
            <Card key={combo.combinationId} className="p-3 hover:bg-muted/30 cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{combo.combinationName}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">
                      {combo.effectivenessScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{combo.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {combo.patterns.map((pattern) => (
                      <span
                        key={pattern.patternId}
                        className="text-xs px-2 py-0.5 rounded bg-muted"
                      >
                        {pattern.icon} {pattern.patternName}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPatterns(combo.patterns);
                    setView("library");
                  }}
                >
                  Use
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Visual Builder View */}
      {view === "builder" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Drag pattern blocks to build your custom prompt structure
          </p>

          {/* Pattern Block Palette */}
          <div>
            <h4 className="text-xs font-semibold mb-2">Add Pattern Block:</h4>
            <div className="flex flex-wrap gap-2">
              {promptPatterns.slice(0, 6).map((pattern) => (
                <Button
                  key={pattern.patternId}
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(pattern.patternType)}
                  className="text-xs"
                >
                  {pattern.icon} {pattern.patternName}
                </Button>
              ))}
            </div>
          </div>

          {/* Builder Blocks */}
          {builderBlocks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold">Your Pattern Stack:</h4>
              {builderBlocks.map((block, index) => {
                const pattern = promptPatterns.find((p) => p.patternType === block.blockType);
                if (!pattern) return null;

                return (
                  <Card
                    key={block.blockId}
                    className={`p-3 ${!block.isEnabled ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{index + 1}.</span>
                        <span>{pattern.icon}</span>
                        <span className="text-sm font-semibold">{pattern.patternName}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBlock(block.blockId)}
                          className="h-6 px-2 text-xs"
                        >
                          {block.isEnabled ? "✓" : "○"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlock(block.blockId)}
                          className="h-6 px-2 text-xs text-red-500"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Compile Button */}
          {builderBlocks.length > 0 && (
            <Button
              onClick={() => {
                const compiled = compileBuilderPrompt();
                const patterns = builderBlocks
                  .filter((b) => b.isEnabled)
                  .map((b) => promptPatterns.find((p) => p.patternType === b.blockType))
                  .filter(Boolean) as PromptPattern[];
                onApplyPattern(compiled, patterns);
              }}
              className="w-full"
              size="sm"
            >
              Compile & Apply
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
