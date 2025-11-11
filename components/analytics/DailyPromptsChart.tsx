"use client";

import { DailyMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DailyPromptsChartProps {
  dailyMetrics: DailyMetrics[];
}

export function DailyPromptsChart({ dailyMetrics }: DailyPromptsChartProps) {
  if (dailyMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Prompt Activity</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxPrompts = Math.max(...dailyMetrics.map((d) => d.promptCount), 1);
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  // Calculate positions for line chart
  const points = dailyMetrics.map((metric, index) => {
    const x = padding + (index / (dailyMetrics.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (metric.promptCount / maxPrompts) * (chartHeight - padding * 2);
    return { x, y, metric };
  });

  // Create path string for line
  const linePath = points
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  // Create area path for gradient fill
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${chartHeight - padding}` +
    ` L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Prompt Activity</CardTitle>
        <CardDescription>Number of prompts created per day</CardDescription>
      </CardHeader>
      <CardContent>
        <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
          {/* Gradient for area fill */}
          <defs>
            <linearGradient id="promptGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = chartHeight - padding - fraction * (chartHeight - padding * 2);
            return (
              <g key={fraction}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-muted-foreground"
                >
                  {Math.round(fraction * maxPrompts)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#promptGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="hsl(var(--primary))"
                className="cursor-pointer hover:r-6 transition-all"
              />
              <title>
                {point.metric.date.toLocaleDateString()}: {point.metric.promptCount} prompts
              </title>
            </g>
          ))}

          {/* X-axis labels (show every 5th day) */}
          {points.map((point, index) => {
            if (index % 5 === 0 || index === points.length - 1) {
              return (
                <text
                  key={index}
                  x={point.x}
                  y={chartHeight - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {point.metric.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">
              {dailyMetrics.reduce((sum, d) => sum + d.promptCount, 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Peak Day</div>
            <div className="text-2xl font-bold">{maxPrompts}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Avg/Day</div>
            <div className="text-2xl font-bold">
              {(
                dailyMetrics.reduce((sum, d) => sum + d.promptCount, 0) / dailyMetrics.length
              ).toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
