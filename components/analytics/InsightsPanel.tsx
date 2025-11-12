"use client";

import { AnalyticsInsight } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InsightsPanelProps {
  insights: AnalyticsInsight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No insights available yet. Start creating prompts!</p>
        </CardContent>
      </Card>
    );
  }

  // Group insights by category
  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) {
      acc[insight.category] = [];
    }
    acc[insight.category].push(insight);
    return acc;
  }, {} as Record<string, AnalyticsInsight[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "performance":
        return "hsl(var(--success))";
      case "usage":
        return "hsl(var(--primary))";
      case "quality":
        return "hsl(var(--warning))";
      case "efficiency":
        return "hsl(var(--chart-2))";
      default:
        return "hsl(var(--muted))";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case "stable":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Key Insights</h2>
        <Badge variant="outline">{insights.length} insights</Badge>
      </div>

      {/* Featured insights grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {insights.slice(0, 6).map((insight) => (
          <Card
            key={insight.insightId}
            className="border-l-4 transition-all hover:shadow-md"
            style={{ borderLeftColor: getCategoryColor(insight.category) }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div className="text-3xl">{insight.icon}</div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(insight.trend)}
                  <Badge variant="secondary" className="text-xs">
                    {insight.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>

              <div className="mt-4">
                <div
                  className="text-3xl font-bold"
                  style={{ color: getCategoryColor(insight.category) }}
                >
                  {insight.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categorized insights */}
      {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{category} Insights</CardTitle>
              <Badge
                variant="outline"
                style={{ borderColor: getCategoryColor(category), color: getCategoryColor(category) }}
              >
                {categoryInsights.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryInsights.map((insight) => (
                <div
                  key={insight.insightId}
                  className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      {getTrendIcon(insight.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <div
                    className="text-xl font-bold flex-shrink-0"
                    style={{ color: getCategoryColor(category) }}
                  >
                    {insight.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
