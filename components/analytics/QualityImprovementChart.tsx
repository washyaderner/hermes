"use client";

import { DailyMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface QualityImprovementChartProps {
  dailyMetrics: DailyMetrics[];
}

export function QualityImprovementChart({ dailyMetrics }: QualityImprovementChartProps) {
  if (dailyMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quality Improvement Trend</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  // Filter out days with no data
  const metricsWithData = dailyMetrics.filter((m) => m.avgQualityImprovement > 0);

  if (metricsWithData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quality Improvement Trend</CardTitle>
          <CardDescription>No quality data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxQuality = Math.max(...metricsWithData.map((d) => d.avgQualityImprovement), 1);
  const minQuality = Math.min(...metricsWithData.map((d) => d.avgQualityImprovement), 0);

  // Calculate positions for line chart
  const points = metricsWithData.map((metric, index) => {
    const x = padding + (index / (metricsWithData.length - 1)) * (chartWidth - padding * 2);
    const normalizedValue = (metric.avgQualityImprovement - minQuality) / (maxQuality - minQuality);
    const y = chartHeight - padding - normalizedValue * (chartHeight - padding * 2);
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

  // Calculate trend
  const firstHalf = metricsWithData.slice(0, Math.floor(metricsWithData.length / 2));
  const secondHalf = metricsWithData.slice(Math.floor(metricsWithData.length / 2));
  const firstHalfAvg =
    firstHalf.reduce((sum, d) => sum + d.avgQualityImprovement, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, d) => sum + d.avgQualityImprovement, 0) / secondHalf.length;
  const trend = secondHalfAvg > firstHalfAvg ? "improving" : "stable";

  const avgQuality =
    metricsWithData.reduce((sum, d) => sum + d.avgQualityImprovement, 0) / metricsWithData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Improvement Trend</CardTitle>
        <CardDescription>Average quality score improvement per day</CardDescription>
      </CardHeader>
      <CardContent>
        <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
          {/* Gradient for area fill */}
          <defs>
            <linearGradient id="qualityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = chartHeight - padding - fraction * (chartHeight - padding * 2);
            const value = minQuality + fraction * (maxQuality - minQuality);
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
                  {value.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#qualityGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--warning))"
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
                fill="hsl(var(--warning))"
                className="cursor-pointer hover:r-6 transition-all"
              />
              <title>
                {point.metric.date.toLocaleDateString()}: {point.metric.avgQualityImprovement.toFixed(1)}{" "}
                quality score
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
            <div className="text-sm text-muted-foreground">Average Quality</div>
            <div className="text-2xl font-bold">{avgQuality.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Peak Quality</div>
            <div className="text-2xl font-bold">{maxQuality.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Trend</div>
            <div className="text-2xl font-bold capitalize">{trend}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
