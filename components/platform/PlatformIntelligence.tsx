"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Platform } from "@/types";
import { routePlatform, getCompatibilityWarning } from "@/lib/platform-intelligence/router";
import { compareCosts, formatCost } from "@/lib/platform-intelligence/cost-optimizer";
import { getPlatformOptimization } from "@/lib/platform-intelligence/optimizations";
import { getPlatformCapability } from "@/lib/platform-intelligence/capabilities";

interface PlatformIntelligenceProps {
  currentPrompt: string;
  selectedPlatform: Platform | null;
  availablePlatforms: Platform[];
  onPlatformSelect: (platform: Platform) => void;
}

export function PlatformIntelligence({
  currentPrompt,
  selectedPlatform,
  availablePlatforms,
  onPlatformSelect,
}: PlatformIntelligenceProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showCostComparison, setShowCostComparison] = useState(false);
  const [showOptimizations, setShowOptimizations] = useState(false);

  // Only show if there's a prompt
  if (!currentPrompt || currentPrompt.length < 10) {
    return null;
  }

  // Get routing analysis
  const routing = routePlatform(currentPrompt, availablePlatforms);
  const tokenCount = currentPrompt.split(/\s+/).length * 1.3; // Rough estimate

  // Get compatibility warning for selected platform
  const compatibilityWarning = selectedPlatform
    ? getCompatibilityWarning(currentPrompt, selectedPlatform.id)
    : null;

  // Get cost comparison
  const costComparison = compareCosts(availablePlatforms, tokenCount);

  // Get optimization tips for selected platform
  const optimization = selectedPlatform
    ? getPlatformOptimization(selectedPlatform.id)
    : null;

  // Get capability info for selected platform
  const capability = selectedPlatform
    ? getPlatformCapability(selectedPlatform.id)
    : null;

  // Top recommendations
  const topRecommendations = routing.recommendations.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Compatibility Warning */}
      {compatibilityWarning && (
        <Card className="bg-yellow-500/10 border-yellow-500/30 p-3">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            {compatibilityWarning}
          </p>
        </Card>
      )}

      {/* Quick Stats Bar */}
      {selectedPlatform && capability && (
        <Card className="p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-4">
              <div>
                <span className="text-muted-foreground">Est. Cost: </span>
                <span className="font-semibold">
                  {formatCost(costComparison.comparisons.find(c => c.platform.id === selectedPlatform.id)?.estimatedCost || 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Speed: </span>
                <span className="font-semibold">~{capability.avgResponseTime}s</span>
              </div>
              <div>
                <span className="text-muted-foreground">Context: </span>
                <span className="font-semibold">{(capability.maxContextWindow / 1000).toFixed(0)}k tokens</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Platform Recommendations */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h3 className="font-semibold text-sm">Smart Recommendations</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            {showRecommendations ? "Hide" : "Show"}
          </Button>
        </div>

        {!showRecommendations && (
          <div className="text-xs text-muted-foreground">
            Best match: <span className="font-semibold text-foreground">{routing.bestMatch.name}</span>
            {routing.bestMatch.id !== selectedPlatform?.id && (
              <Button
                variant="link"
                size="sm"
                className="ml-2 h-auto p-0 text-xs"
                onClick={() => onPlatformSelect(routing.bestMatch)}
              >
                Switch →
              </Button>
            )}
          </div>
        )}

        {showRecommendations && (
          <div className="space-y-2">
            {topRecommendations.map((rec, index) => (
              <Card
                key={rec.platform.id}
                className={`p-3 cursor-pointer transition-colors ${
                  rec.platform.id === selectedPlatform?.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onPlatformSelect(rec.platform)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && <span className="text-sm">🥇</span>}
                      {index === 1 && <span className="text-sm">🥈</span>}
                      {index === 2 && <span className="text-sm">🥉</span>}
                      <span className="font-semibold text-sm">{rec.platform.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">
                        {rec.score}/100
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {rec.reasoning.slice(0, 2).map((reason, i) => (
                        <div key={i}>• {reason}</div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {rec.strengths.slice(0, 3).map((strength) => (
                        <span
                          key={strength}
                          className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold">{formatCost(rec.costEstimate)}</div>
                    <div className="text-muted-foreground">~{rec.estimatedResponseTime}s</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Cost Comparison */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <h3 className="font-semibold text-sm">Cost Optimizer</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCostComparison(!showCostComparison)}
          >
            {showCostComparison ? "Hide" : "Show"}
          </Button>
        </div>

        {!showCostComparison && (
          <div className="text-xs text-muted-foreground">
            Cheapest: <span className="font-semibold text-foreground">{costComparison.cheapestOption.platform.name}</span> at{" "}
            <span className="font-semibold text-green-600">{formatCost(costComparison.cheapestOption.estimatedCost)}</span>
            {costComparison.cheapestOption.platform.id !== selectedPlatform?.id &&
              costComparison.totalSavings > 0.001 && (
                <span className="ml-2 text-green-600">
                  (save {formatCost(costComparison.totalSavings)})
                </span>
              )}
          </div>
        )}

        {showCostComparison && (
          <div className="space-y-3">
            <div className="space-y-1">
              {costComparison.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  • {rec}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {costComparison.comparisons.slice(0, 5).map((comp) => (
                <div
                  key={comp.platform.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className={comp.platform.id === selectedPlatform?.id ? "font-semibold" : ""}>
                    {comp.platform.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCost(comp.estimatedCost)}</span>
                    {comp.savings > 0.001 && (
                      <span className="text-green-600">
                        -{formatCost(comp.savings)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Platform Optimizations */}
      {selectedPlatform && optimization && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h3 className="font-semibold text-sm">Optimization Tips</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOptimizations(!showOptimizations)}
            >
              {showOptimizations ? "Hide" : "Show"}
            </Button>
          </div>

          {!showOptimizations && (
            <div className="text-xs text-muted-foreground">
              {optimization.bestPractices.length} tips for {selectedPlatform.name}
            </div>
          )}

          {showOptimizations && (
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold mb-2 text-green-600">✓ Best Practices</h4>
                <div className="space-y-1">
                  {optimization.bestPractices.map((practice, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {practice}
                    </div>
                  ))}
                </div>
              </div>

              {optimization.avoidPatterns.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2 text-red-600">✗ Avoid</h4>
                  <div className="space-y-1">
                    {optimization.avoidPatterns.map((pattern, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {pattern}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {optimization.optimizationRules.examplePromptStructure && (
                <div>
                  <h4 className="text-xs font-semibold mb-2">Example Structure</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {optimization.optimizationRules.examplePromptStructure}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
