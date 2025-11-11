import {
  AnalyticsMetrics,
  PlatformUsageStats,
  DailyMetrics,
  AnalyticsInsight,
  AnalyticsReport,
  HistoryItem,
  PromptHistoryItem,
  Platform,
  EnhancedPrompt,
} from "@/types";
import { generateId } from "@/lib/utils";
import { loadPatternApplications } from "@/lib/patterns/learning";

/**
 * Calculate comprehensive analytics from historical data
 */
export function calculateAnalytics(
  historyItems: HistoryItem[],
  promptHistoryItems: PromptHistoryItem[],
  platforms: Platform[]
): AnalyticsMetrics {
  const totalPrompts = promptHistoryItems.length;
  const totalEnhancements = historyItems.length;

  // Calculate average quality improvement
  const qualityImprovements = historyItems.map((item) => item.qualityScore);
  const avgQualityImprovement =
    qualityImprovements.length > 0
      ? qualityImprovements.reduce((sum, score) => sum + score, 0) / qualityImprovements.length
      : 0;

  // Calculate token metrics
  const totalTokensProcessed = promptHistoryItems.reduce((sum, item) => {
    return sum + item.enhancedVersions.reduce((vSum, v) => vSum + v.tokenCount, 0);
  }, 0);

  const avgTokensPerPrompt =
    promptHistoryItems.length > 0 ? totalTokensProcessed / promptHistoryItems.length : 0;

  // Estimate time saved (assuming 3 minutes per manual optimization)
  const timeSaved = totalEnhancements * 3.2;

  // Calculate success rate (prompts that were marked as favorite or copied)
  const successfulPrompts = historyItems.filter((item) => item.isFavorite).length;
  const successRate = totalPrompts > 0 ? successfulPrompts / totalPrompts : 0;

  // Find most used platform
  const platformCounts: Record<string, number> = {};
  historyItems.forEach((item) => {
    platformCounts[item.platform.id] = (platformCounts[item.platform.id] || 0) + 1;
  });

  const mostUsedPlatformId = Object.entries(platformCounts).reduce(
    (max, [id, count]) => (count > max.count ? { id, count } : max),
    { id: "", count: 0 }
  ).id;

  const mostUsedPlatform =
    platforms.find((p) => p.id === mostUsedPlatformId) || null;

  // Find most successful pattern
  const patternApplications = loadPatternApplications();
  const patternSuccess: Record<string, number> = {};

  patternApplications.forEach((app) => {
    if (app.wasSuccessful) {
      patternSuccess[app.pattern.patternName] =
        (patternSuccess[app.pattern.patternName] || 0) + 1;
    }
  });

  const mostSuccessfulPattern =
    Object.entries(patternSuccess).reduce(
      (max, [name, count]) => (count > max.count ? { name, count } : max),
      { name: "", count: 0 }
    ).name || null;

  return {
    totalPrompts,
    totalEnhancements,
    avgQualityImprovement,
    totalTokensProcessed,
    avgTokensPerPrompt,
    timeSaved,
    successRate,
    mostUsedPlatform,
    mostSuccessfulPattern,
  };
}

/**
 * Calculate platform usage statistics
 */
export function calculatePlatformStats(
  historyItems: HistoryItem[]
): PlatformUsageStats[] {
  const platformData: Record<
    string,
    {
      platform: Platform;
      count: number;
      totalQuality: number;
      totalTokens: number;
      successCount: number;
    }
  > = {};

  historyItems.forEach((item) => {
    const id = item.platform.id;

    if (!platformData[id]) {
      platformData[id] = {
        platform: item.platform,
        count: 0,
        totalQuality: 0,
        totalTokens: 0,
        successCount: 0,
      };
    }

    platformData[id].count += 1;
    platformData[id].totalQuality += item.qualityScore;
    if (item.isFavorite) {
      platformData[id].successCount += 1;
    }
  });

  const totalUsage = historyItems.length;

  return Object.values(platformData).map((data) => ({
    platformId: data.platform.id,
    platformName: data.platform.name,
    usageCount: data.count,
    successRate: data.count > 0 ? data.successCount / data.count : 0,
    avgQualityScore: data.count > 0 ? data.totalQuality / data.count : 0,
    totalTokens: data.totalTokens,
    percentage: totalUsage > 0 ? (data.count / totalUsage) * 100 : 0,
  }));
}

/**
 * Calculate daily metrics for time series
 */
export function calculateDailyMetrics(
  historyItems: HistoryItem[],
  days: number = 30
): DailyMetrics[] {
  const now = new Date();
  const dailyData: Record<string, DailyMetrics> = {};

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    dailyData[dateKey] = {
      date,
      promptCount: 0,
      avgQualityImprovement: 0,
      tokensUsed: 0,
      successCount: 0,
    };
  }

  // Aggregate data by day
  const qualityByDay: Record<string, number[]> = {};

  historyItems.forEach((item) => {
    const dateKey = item.timestamp.toISOString().split("T")[0];

    if (dailyData[dateKey]) {
      dailyData[dateKey].promptCount += 1;
      if (item.isFavorite) {
        dailyData[dateKey].successCount += 1;
      }

      if (!qualityByDay[dateKey]) {
        qualityByDay[dateKey] = [];
      }
      qualityByDay[dateKey].push(item.qualityScore);
    }
  });

  // Calculate averages
  Object.keys(dailyData).forEach((dateKey) => {
    if (qualityByDay[dateKey] && qualityByDay[dateKey].length > 0) {
      dailyData[dateKey].avgQualityImprovement =
        qualityByDay[dateKey].reduce((sum, score) => sum + score, 0) /
        qualityByDay[dateKey].length;
    }
  });

  return Object.values(dailyData).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Generate analytics insights
 */
export function generateInsights(
  metrics: AnalyticsMetrics,
  platformStats: PlatformUsageStats[],
  dailyMetrics: DailyMetrics[]
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  // Quality improvement insight
  insights.push({
    insightId: generateId(),
    title: "Quality Improvement",
    description: `Your prompts improved an average of ${metrics.avgQualityImprovement.toFixed(1)}% with Hermes`,
    value: `${metrics.avgQualityImprovement.toFixed(1)}%`,
    trend: metrics.avgQualityImprovement > 50 ? "up" : metrics.avgQualityImprovement > 30 ? "stable" : "down",
    icon: "📈",
    category: "quality",
  });

  // Time saved insight
  insights.push({
    insightId: generateId(),
    title: "Time Saved",
    description: `You save approximately ${(metrics.timeSaved / 60).toFixed(1)} hours with automated optimization`,
    value: `${(metrics.timeSaved / 60).toFixed(1)} hrs`,
    trend: "up",
    icon: "⏱️",
    category: "efficiency",
  });

  // Most used platform
  if (metrics.mostUsedPlatform) {
    const platformStat = platformStats.find(
      (s) => s.platformId === metrics.mostUsedPlatform!.id
    );
    insights.push({
      insightId: generateId(),
      title: "Favorite Platform",
      description: `${metrics.mostUsedPlatform.name} is your go-to platform (${platformStat?.percentage.toFixed(0)}% of usage)`,
      value: metrics.mostUsedPlatform.name,
      trend: "stable",
      icon: "🎯",
      category: "usage",
    });
  }

  // Most successful pattern
  if (metrics.mostSuccessfulPattern) {
    insights.push({
      insightId: generateId(),
      title: "Best Pattern",
      description: `${metrics.mostSuccessfulPattern} works best for your use cases`,
      value: metrics.mostSuccessfulPattern,
      trend: "up",
      icon: "🌟",
      category: "performance",
    });
  }

  // Success rate
  insights.push({
    insightId: generateId(),
    title: "Success Rate",
    description: `${(metrics.successRate * 100).toFixed(0)}% of your enhanced prompts were marked as successful`,
    value: `${(metrics.successRate * 100).toFixed(0)}%`,
    trend: metrics.successRate > 0.7 ? "up" : metrics.successRate > 0.5 ? "stable" : "down",
    icon: "✅",
    category: "performance",
  });

  // Token efficiency
  insights.push({
    insightId: generateId(),
    title: "Avg Tokens Per Prompt",
    description: `Your prompts average ${Math.round(metrics.avgTokensPerPrompt)} tokens each`,
    value: Math.round(metrics.avgTokensPerPrompt),
    trend: "stable",
    icon: "🔢",
    category: "efficiency",
  });

  // Recent activity trend
  if (dailyMetrics.length > 7) {
    const lastWeek = dailyMetrics.slice(-7);
    const prevWeek = dailyMetrics.slice(-14, -7);

    const lastWeekCount = lastWeek.reduce((sum, day) => sum + day.promptCount, 0);
    const prevWeekCount = prevWeek.reduce((sum, day) => sum + day.promptCount, 0);

    const trend =
      lastWeekCount > prevWeekCount ? "up" : lastWeekCount === prevWeekCount ? "stable" : "down";

    insights.push({
      insightId: generateId(),
      title: "Weekly Activity",
      description: `You created ${lastWeekCount} prompts this week`,
      value: lastWeekCount,
      trend,
      icon: "📊",
      category: "usage",
    });
  }

  return insights;
}

/**
 * Generate complete analytics report
 */
export function generateAnalyticsReport(
  historyItems: HistoryItem[],
  promptHistoryItems: PromptHistoryItem[],
  platforms: Platform[],
  periodDays: number = 30
): AnalyticsReport {
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - periodDays);

  // Filter data to period
  const periodHistory = historyItems.filter(
    (item) => item.timestamp >= periodStart && item.timestamp <= periodEnd
  );

  const periodPromptHistory = promptHistoryItems.filter(
    (item) => item.timestamp >= periodStart && item.timestamp <= periodEnd
  );

  // Calculate metrics
  const metrics = calculateAnalytics(periodHistory, periodPromptHistory, platforms);
  const platformStats = calculatePlatformStats(periodHistory);
  const dailyMetrics = calculateDailyMetrics(periodHistory, periodDays);
  const insights = generateInsights(metrics, platformStats, dailyMetrics);

  // Get top prompts (highest quality scores)
  const topPrompts = periodPromptHistory
    .flatMap((ph) => ph.enhancedVersions)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 5);

  return {
    reportId: generateId(),
    generatedAt: new Date(),
    periodStart,
    periodEnd,
    metrics,
    platformStats,
    dailyMetrics,
    insights,
    topPrompts,
  };
}

/**
 * Export analytics report as JSON
 */
export function exportAnalyticsReportJSON(report: AnalyticsReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Format metrics for display
 */
export function formatMetric(value: number, type: "percent" | "count" | "decimal" | "time"): string {
  switch (type) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "count":
      return Math.round(value).toLocaleString();
    case "decimal":
      return value.toFixed(2);
    case "time":
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    default:
      return value.toString();
  }
}
