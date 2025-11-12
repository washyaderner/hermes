import { PatternApplication, PromptPattern, Intent } from "@/types";

const PATTERN_APPLICATIONS_KEY = "hermes_pattern_applications";

/**
 * Save pattern application to localStorage
 */
export function savePatternApplication(application: PatternApplication): void {
  try {
    const stored = localStorage.getItem(PATTERN_APPLICATIONS_KEY);
    const applications: PatternApplication[] = stored ? JSON.parse(stored) : [];

    // Add new application
    applications.push({
      ...application,
      appliedAt: new Date(application.appliedAt),
    });

    // Keep last 100 applications
    const trimmed = applications.slice(-100);

    localStorage.setItem(PATTERN_APPLICATIONS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save pattern application:", error);
  }
}

/**
 * Load pattern applications from localStorage
 */
export function loadPatternApplications(): PatternApplication[] {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(PATTERN_APPLICATIONS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((app: any) => ({
      ...app,
      appliedAt: new Date(app.appliedAt),
    }));
  } catch (error) {
    console.error("Failed to load pattern applications:", error);
    return [];
  }
}

/**
 * Get pattern effectiveness score based on historical data
 */
export function getPatternEffectiveness(patternId: string): number {
  const applications = loadPatternApplications();
  const patternApps = applications.filter((app) => app.pattern.patternId === patternId);

  if (patternApps.length === 0) return 0;

  // Calculate average quality score
  const avgQuality =
    patternApps.reduce((sum, app) => sum + app.resultQuality, 0) / patternApps.length;

  // Calculate success rate
  const successRate =
    patternApps.filter((app) => app.wasSuccessful).length / patternApps.length;

  // Combined score (70% quality, 30% success rate)
  return avgQuality * 0.7 + successRate * 100 * 0.3;
}

/**
 * Get patterns ranked by effectiveness for user
 */
export function getRankedPatterns(patterns: PromptPattern[]): PromptPattern[] {
  return [...patterns].sort((a, b) => {
    const scoreA = getPatternEffectiveness(a.patternId) || a.effectivenessScore;
    const scoreB = getPatternEffectiveness(b.patternId) || b.effectivenessScore;
    return scoreB - scoreA;
  });
}

/**
 * Get best patterns for a specific intent based on user history
 */
export function getPersonalizedPatternsForIntent(intent: Intent): PromptPattern[] {
  const applications = loadPatternApplications();

  // Group by pattern ID
  const patternStats: Record<
    string,
    {
      pattern: PromptPattern;
      totalQuality: number;
      successCount: number;
      totalCount: number;
    }
  > = {};

  applications.forEach((app) => {
    const patternId = app.pattern.patternId;

    if (!patternStats[patternId]) {
      patternStats[patternId] = {
        pattern: app.pattern,
        totalQuality: 0,
        successCount: 0,
        totalCount: 0,
      };
    }

    patternStats[patternId].totalQuality += app.resultQuality;
    patternStats[patternId].totalCount += 1;
    if (app.wasSuccessful) {
      patternStats[patternId].successCount += 1;
    }
  });

  // Calculate scores and filter by intent
  const rankedPatterns = Object.values(patternStats)
    .filter((stats) => stats.pattern.applicableIntents.includes(intent))
    .map((stats) => {
      const avgQuality = stats.totalQuality / stats.totalCount;
      const successRate = stats.successCount / stats.totalCount;
      const personalizedScore = avgQuality * 0.7 + successRate * 100 * 0.3;

      return {
        pattern: stats.pattern,
        score: personalizedScore,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.pattern);

  return rankedPatterns;
}

/**
 * Get pattern usage statistics
 */
export function getPatternStats(patternId: string): {
  totalUses: number;
  successRate: number;
  avgQuality: number;
  recentTrend: "improving" | "stable" | "declining";
} {
  const applications = loadPatternApplications();
  const patternApps = applications.filter((app) => app.pattern.patternId === patternId);

  if (patternApps.length === 0) {
    return {
      totalUses: 0,
      successRate: 0,
      avgQuality: 0,
      recentTrend: "stable",
    };
  }

  const totalUses = patternApps.length;
  const successRate = patternApps.filter((app) => app.wasSuccessful).length / totalUses;
  const avgQuality =
    patternApps.reduce((sum, app) => sum + app.resultQuality, 0) / totalUses;

  // Calculate trend (compare last 5 vs previous 5)
  let recentTrend: "improving" | "stable" | "declining" = "stable";

  if (patternApps.length >= 10) {
    const recent = patternApps.slice(-5);
    const previous = patternApps.slice(-10, -5);

    const recentAvg = recent.reduce((sum, app) => sum + app.resultQuality, 0) / 5;
    const previousAvg = previous.reduce((sum, app) => sum + app.resultQuality, 0) / 5;

    const diff = recentAvg - previousAvg;

    if (diff > 5) recentTrend = "improving";
    else if (diff < -5) recentTrend = "declining";
  }

  return {
    totalUses,
    successRate,
    avgQuality,
    recentTrend,
  };
}

/**
 * Get recommendations based on user's pattern history
 */
export function getPatternRecommendations(): {
  mostSuccessful: PromptPattern[];
  leastUsed: PromptPattern[];
  trending: PromptPattern[];
} {
  const applications = loadPatternApplications();

  // Group by pattern
  const patternData: Record<
    string,
    {
      pattern: PromptPattern;
      uses: number;
      avgQuality: number;
      recentUses: number;
    }
  > = {};

  const recentThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000; // Last 7 days

  applications.forEach((app) => {
    const id = app.pattern.patternId;

    if (!patternData[id]) {
      patternData[id] = {
        pattern: app.pattern,
        uses: 0,
        avgQuality: 0,
        recentUses: 0,
      };
    }

    patternData[id].uses += 1;
    patternData[id].avgQuality += app.resultQuality;

    if (app.appliedAt.getTime() > recentThreshold) {
      patternData[id].recentUses += 1;
    }
  });

  // Calculate averages
  Object.values(patternData).forEach((data) => {
    if (data.uses > 0) {
      data.avgQuality = data.avgQuality / data.uses;
    }
  });

  // Get most successful (high quality, high use)
  const mostSuccessful = Object.values(patternData)
    .filter((data) => data.uses >= 3)
    .sort((a, b) => b.avgQuality - a.avgQuality)
    .slice(0, 3)
    .map((data) => data.pattern);

  // Get least used (but applicable)
  const allPatternIds = new Set(Object.keys(patternData));
  const leastUsed: PromptPattern[] = [];

  // This would need access to all patterns, simplified here
  // In real implementation, compare against full pattern library

  // Get trending (recent spike in usage)
  const trending = Object.values(patternData)
    .filter((data) => data.recentUses > data.uses * 0.5) // More than half uses are recent
    .sort((a, b) => b.recentUses - a.recentUses)
    .slice(0, 3)
    .map((data) => data.pattern);

  return {
    mostSuccessful,
    leastUsed,
    trending,
  };
}

/**
 * A/B test pattern combinations
 */
export function abTestPatterns(
  patternA: PromptPattern,
  patternB: PromptPattern
): {
  winner: PromptPattern;
  confidence: number;
  recommendation: string;
} {
  const statsA = getPatternStats(patternA.patternId);
  const statsB = getPatternStats(patternB.patternId);

  // Need at least 5 uses each for meaningful comparison
  if (statsA.totalUses < 5 || statsB.totalUses < 5) {
    return {
      winner: statsA.avgQuality > statsB.avgQuality ? patternA : patternB,
      confidence: 0.5,
      recommendation: "Insufficient data for confident A/B testing. Need at least 5 uses each.",
    };
  }

  // Compare average quality
  const qualityDiff = Math.abs(statsA.avgQuality - statsB.avgQuality);
  const winner = statsA.avgQuality > statsB.avgQuality ? patternA : patternB;

  // Calculate confidence based on sample size and difference
  const minSampleSize = Math.min(statsA.totalUses, statsB.totalUses);
  const confidence = Math.min(
    0.95,
    (qualityDiff / 100) * 0.5 + (minSampleSize / 20) * 0.5
  );

  let recommendation = "";
  if (confidence > 0.8) {
    recommendation = `${winner.patternName} is significantly better with ${confidence.toFixed(0)}% confidence`;
  } else if (confidence > 0.6) {
    recommendation = `${winner.patternName} appears better but more data needed for high confidence`;
  } else {
    recommendation = "No clear winner yet. Both patterns perform similarly. Collect more data.";
  }

  return {
    winner,
    confidence,
    recommendation,
  };
}
