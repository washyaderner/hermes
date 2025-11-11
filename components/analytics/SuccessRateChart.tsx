"use client";

import { PlatformUsageStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SuccessRateChartProps {
  platformStats: PlatformUsageStats[];
}

export function SuccessRateChart({ platformStats }: SuccessRateChartProps) {
  if (platformStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Success Rate by Platform</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartHeight = 300;
  const chartWidth = 600;
  const padding = { top: 20, right: 40, bottom: 80, left: 60 };

  // Sort by success rate descending
  const sortedStats = [...platformStats]
    .filter((stat) => stat.usageCount > 0)
    .sort((a, b) => b.successRate - a.successRate);

  const barWidth = (chartWidth - padding.left - padding.right) / sortedStats.length - 10;
  const maxRate = Math.max(...sortedStats.map((s) => s.successRate), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Success Rate by Platform</CardTitle>
        <CardDescription>Percentage of favorited prompts per platform</CardDescription>
      </CardHeader>
      <CardContent>
        <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y =
              chartHeight - padding.bottom - fraction * (chartHeight - padding.top - padding.bottom);
            return (
              <g key={fraction}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-muted-foreground"
                >
                  {Math.round(fraction * maxRate * 100)}%
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {sortedStats.map((stat, index) => {
            const x = padding.left + index * (barWidth + 10);
            const barHeight =
              (stat.successRate / maxRate) * (chartHeight - padding.top - padding.bottom);
            const y = chartHeight - padding.bottom - barHeight;

            // Color based on success rate
            let barColor = "hsl(var(--destructive))";
            if (stat.successRate > 0.7) barColor = "hsl(var(--success))";
            else if (stat.successRate > 0.5) barColor = "hsl(var(--warning))";

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  rx="4"
                >
                  <title>
                    {stat.platformName}: {(stat.successRate * 100).toFixed(1)}% success rate
                  </title>
                </rect>

                {/* Value label on top of bar */}
                {barHeight > 20 && (
                  <text
                    x={x + barWidth / 2}
                    y={y + 15}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-white"
                  >
                    {(stat.successRate * 100).toFixed(0)}%
                  </text>
                )}

                {/* Platform name label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 15}
                  textAnchor="end"
                  transform={`rotate(-45 ${x + barWidth / 2} ${chartHeight - padding.bottom + 15})`}
                  className="text-xs fill-muted-foreground"
                >
                  {stat.platformName}
                </text>

                {/* Usage count below platform name */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 30}
                  textAnchor="end"
                  transform={`rotate(-45 ${x + barWidth / 2} ${chartHeight - padding.bottom + 30})`}
                  className="text-xs fill-muted-foreground"
                >
                  ({stat.usageCount} uses)
                </text>
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={-chartHeight / 2}
            y={20}
            textAnchor="middle"
            transform={`rotate(-90 20 ${chartHeight / 2})`}
            className="text-sm fill-muted-foreground font-medium"
          >
            Success Rate
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--success))" }} />
            <span className="text-sm text-muted-foreground">&gt;70% Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--warning))" }} />
            <span className="text-sm text-muted-foreground">50-70% Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--destructive))" }} />
            <span className="text-sm text-muted-foreground">&lt;50% Success</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
