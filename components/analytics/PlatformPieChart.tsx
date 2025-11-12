"use client";

import { PlatformUsageStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PlatformPieChartProps {
  platformStats: PlatformUsageStats[];
}

export function PlatformPieChart({ platformStats }: PlatformPieChartProps) {
  if (platformStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const size = 240;
  const radius = 100;
  const centerX = size / 2;
  const centerY = size / 2;

  // Sort by usage count descending
  const sortedStats = [...platformStats].sort((a, b) => b.usageCount - a.usageCount);

  // Color palette
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
  ];

  // Calculate pie slices
  let currentAngle = -90; // Start at top
  const slices = sortedStats.map((stat, index) => {
    const percentage = stat.percentage;
    const sliceAngle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Calculate arc path
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    // Calculate label position
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelRad);
    const labelY = centerY + labelRadius * Math.sin(labelRad);

    currentAngle = endAngle;

    return {
      pathData,
      color: colors[index % colors.length],
      stat,
      labelX,
      labelY,
      percentage,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Distribution</CardTitle>
        <CardDescription>Usage breakdown by platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Pie chart */}
          <svg width={size} height={size} className="flex-shrink-0">
            {slices.map((slice, index) => (
              <g key={index}>
                <path
                  d={slice.pathData}
                  fill={slice.color}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                >
                  <title>
                    {slice.stat.platformName}: {slice.percentage.toFixed(1)}% ({slice.stat.usageCount}{" "}
                    prompts)
                  </title>
                </path>
                {/* Percentage label on slice */}
                {slice.percentage > 5 && (
                  <text
                    x={slice.labelX}
                    y={slice.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-semibold fill-white"
                    style={{ pointerEvents: "none" }}
                  >
                    {slice.percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{slice.stat.platformName}</div>
                  <div className="text-sm text-muted-foreground">
                    {slice.stat.usageCount} prompts • {slice.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(slice.stat.successRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">success</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
