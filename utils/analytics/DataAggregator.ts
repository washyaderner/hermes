import { PromptHistoryItem, Platform } from '@/types';

export interface AggregatedMetrics {
  totalPrompts: number;
  averageQuality: number;
  totalTokensUsed: number;
  totalCostEstimate: number;
  topPlatforms: { platform: string; count: number }[];
  qualityTrend: { date: string; quality: number }[];
  platformUsage: { platform: string; hour: number; count: number }[];
  costByPlatform: { platform: string; cost: number }[];
  successRate: number;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  quality: number;
  tokenCount: number;
  cost: number;
}

export class DataAggregator {
  /**
   * Aggregate analytics metrics from prompt history
   */
  static aggregateMetrics(history: PromptHistoryItem[]): AggregatedMetrics {
    if (history.length === 0) {
      return {
        totalPrompts: 0,
        averageQuality: 0,
        totalTokensUsed: 0,
        totalCostEstimate: 0,
        topPlatforms: [],
        qualityTrend: [],
        platformUsage: [],
        costByPlatform: [],
        successRate: 0,
      };
    }

    const totalPrompts = history.length;
    
    // Calculate average quality
    const totalQuality = history.reduce((sum, item) => {
      const avgQuality = item.enhancedVersions.reduce((s, v) => s + v.qualityScore, 0) / item.enhancedVersions.length;
      return sum + avgQuality;
    }, 0);
    const averageQuality = totalQuality / totalPrompts;

    // Calculate total tokens and cost
    let totalTokensUsed = 0;
    let totalCostEstimate = 0;
    history.forEach(item => {
      item.enhancedVersions.forEach(v => {
        totalTokensUsed += v.tokenCount;
        totalCostEstimate += (v.tokenCount / 1000000) * this.getCostPerMillion(item.platform.id);
      });
    });

    // Top platforms
    const platformCounts = new Map<string, number>();
    history.forEach(item => {
      const count = platformCounts.get(item.platform.name) || 0;
      platformCounts.set(item.platform.name, count + 1);
    });
    const topPlatforms = Array.from(platformCounts.entries())
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Quality trend (last 30 days)
    const qualityByDate = new Map<string, { sum: number; count: number }>();
    history.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      const avgQuality = item.enhancedVersions.reduce((s, v) => s + v.qualityScore, 0) / item.enhancedVersions.length;
      
      const existing = qualityByDate.get(date) || { sum: 0, count: 0 };
      qualityByDate.set(date, {
        sum: existing.sum + avgQuality,
        count: existing.count + 1,
      });
    });
    const qualityTrend = Array.from(qualityByDate.entries())
      .map(([date, { sum, count }]) => ({ date, quality: sum / count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    // Platform usage heatmap (by hour of day)
    const platformUsageMap = new Map<string, number>();
    history.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      const key = `${item.platform.name}-${hour}`;
      platformUsageMap.set(key, (platformUsageMap.get(key) || 0) + 1);
    });
    const platformUsage = Array.from(platformUsageMap.entries())
      .map(([key, count]) => {
        const [platform, hour] = key.split('-');
        return { platform, hour: parseInt(hour), count };
      });

    // Cost by platform
    const costByPlatformMap = new Map<string, number>();
    history.forEach(item => {
      item.enhancedVersions.forEach(v => {
        const cost = (v.tokenCount / 1000000) * this.getCostPerMillion(item.platform.id);
        const existing = costByPlatformMap.get(item.platform.name) || 0;
        costByPlatformMap.set(item.platform.name, existing + cost);
      });
    });
    const costByPlatform = Array.from(costByPlatformMap.entries())
      .map(([platform, cost]) => ({ platform, cost }))
      .sort((a, b) => b.cost - a.cost);

    // Success rate
    const successfulPrompts = history.filter(item => item.wasSuccessful).length;
    const successRate = (successfulPrompts / totalPrompts) * 100;

    return {
      totalPrompts,
      averageQuality,
      totalTokensUsed,
      totalCostEstimate,
      topPlatforms,
      qualityTrend,
      platformUsage,
      costByPlatform,
      successRate,
    };
  }

  /**
   * Get time series data for quality tracking
   */
  static getTimeSeriesData(history: PromptHistoryItem[]): TimeSeriesDataPoint[] {
    return history.map(item => {
      const avgQuality = item.enhancedVersions.reduce((s, v) => s + v.qualityScore, 0) / item.enhancedVersions.length;
      const totalTokens = item.enhancedVersions.reduce((s, v) => s + v.tokenCount, 0);
      const cost = totalTokens / 1000000 * this.getCostPerMillion(item.platform.id);

      return {
        timestamp: new Date(item.timestamp),
        quality: avgQuality,
        tokenCount: totalTokens,
        cost,
      };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get cost per million tokens for a platform
   */
  private static getCostPerMillion(platformId: string): number {
    const costs: Record<string, number> = {
      'gpt-4': 30,
      'gpt-3.5': 0.5,
      'claude': 15,
      'gemini': 2.5,
      'default': 5,
    };

    return costs[platformId] || costs.default;
  }

  /**
   * Export data as CSV
   */
  static exportToCSV(history: PromptHistoryItem[]): string {
    const headers = ['Date', 'Platform', 'Quality Score', 'Tokens', 'Cost', 'Success'];
    const rows = history.map(item => {
      const avgQuality = item.enhancedVersions.reduce((s, v) => s + v.qualityScore, 0) / item.enhancedVersions.length;
      const totalTokens = item.enhancedVersions.reduce((s, v) => s + v.tokenCount, 0);
      const cost = totalTokens / 1000000 * this.getCostPerMillion(item.platform.id);

      return [
        new Date(item.timestamp).toISOString(),
        item.platform.name,
        avgQuality.toFixed(2),
        totalTokens,
        cost.toFixed(4),
        item.wasSuccessful ? 'Yes' : 'No',
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Calculate rolling average for smoothing
   */
  static calculateRollingAverage(data: number[], windowSize: number = 7): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const window = data.slice(start, end);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(avg);
    }

    return result;
  }
}
