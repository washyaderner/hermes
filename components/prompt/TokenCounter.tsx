"use client";

import { countTokens } from "@/lib/prompt-engine/analyzer";
import { calculateCost } from "@/lib/utils";

interface TokenCounterProps {
  text: string;
  maxTokens?: number;
  model?: string;
}

export function TokenCounter({ text, maxTokens, model = "gpt-4" }: TokenCounterProps) {
  const tokens = countTokens(text);
  const percentage = maxTokens ? (tokens / maxTokens) * 100 : 0;
  const cost = calculateCost(tokens, model);

  const getStatusColor = () => {
    if (!maxTokens) return "text-muted-foreground";
    if (percentage > 90) return "text-red-500";
    if (percentage > 70) return "text-accent";
    return "text-primary";
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-surface/50 rounded-md border border-border">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔢</span>
        <div>
          <div className={`text-lg font-bold ${getStatusColor()}`}>
            {tokens.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">tokens</div>
        </div>
      </div>

      {maxTokens && (
        <>
          <div className="h-8 w-px bg-border" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Usage</span>
              <span className={`text-xs font-medium ${getStatusColor()}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  percentage > 90
                    ? "bg-red-500"
                    : percentage > 70
                    ? "bg-accent"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {maxTokens.toLocaleString()} max
            </div>
          </div>
        </>
      )}

      <div className="h-8 w-px bg-border" />
      <div>
        <div className="text-lg font-bold text-accent">{cost}</div>
        <div className="text-xs text-muted-foreground">est. cost</div>
      </div>
    </div>
  );
}
