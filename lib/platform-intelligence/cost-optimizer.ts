import { Platform } from "@/types";
import { getPlatformCapability } from "./capabilities";

export interface CostComparison {
  platform: Platform;
  estimatedCost: number;
  tokensUsed: number;
  costEfficiencyScore: number; // Quality vs cost ratio
  savings: number; // Compared to most expensive
  recommendation: string;
}

export interface CostOptimizationResult {
  comparisons: CostComparison[];
  cheapestOption: CostComparison;
  bestValue: CostComparison; // Best quality/cost ratio
  totalSavings: number;
  recommendations: string[];
}

/**
 * Calculate estimated cost for a platform
 */
export function estimateCost(
  platformId: string,
  tokenCount: number
): number {
  const capability = getPlatformCapability(platformId);
  if (!capability) return 0;

  return (tokenCount / 1000) * capability.costPer1kTokens;
}

/**
 * Compare costs across multiple platforms
 */
export function compareCosts(
  platforms: Platform[],
  tokenCount: number
): CostOptimizationResult {
  const comparisons: CostComparison[] = platforms
    .map((platform) => {
      const capability = getPlatformCapability(platform.id);
      if (!capability) return null;

      const estimatedCost = estimateCost(platform.id, tokenCount);

      // Calculate cost efficiency (reliability / cost)
      // Higher is better
      const costEfficiencyScore =
        capability.costPer1kTokens > 0
          ? capability.reliabilityScore / (capability.costPer1kTokens * 1000)
          : capability.reliabilityScore;

      return {
        platform,
        estimatedCost,
        tokensUsed: tokenCount,
        costEfficiencyScore,
        savings: 0, // Will be calculated later
        recommendation: "",
      };
    })
    .filter(Boolean) as CostComparison[];

  // Sort by cost
  comparisons.sort((a, b) => a.estimatedCost - b.estimatedCost);

  // Calculate savings compared to most expensive
  const mostExpensive = comparisons[comparisons.length - 1];
  comparisons.forEach((comp) => {
    comp.savings = mostExpensive.estimatedCost - comp.estimatedCost;
  });

  // Find cheapest
  const cheapestOption = comparisons[0];

  // Find best value (best cost efficiency score)
  const bestValue = comparisons.reduce((prev, curr) =>
    curr.costEfficiencyScore > prev.costEfficiencyScore ? curr : prev
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (cheapestOption.estimatedCost === 0) {
    recommendations.push(
      `${cheapestOption.platform.name} is free to use`
    );
  } else {
    recommendations.push(
      `${cheapestOption.platform.name} is the most cost-effective at $${cheapestOption.estimatedCost.toFixed(4)}`
    );
  }

  if (bestValue.platform.id !== cheapestOption.platform.id) {
    recommendations.push(
      `${bestValue.platform.name} offers the best quality/cost ratio`
    );
  }

  if (mostExpensive.estimatedCost - cheapestOption.estimatedCost > 0.01) {
    const savingsPercent =
      ((mostExpensive.estimatedCost - cheapestOption.estimatedCost) /
        mostExpensive.estimatedCost) *
      100;
    recommendations.push(
      `You could save ${savingsPercent.toFixed(0)}% by choosing ${cheapestOption.platform.name} over ${mostExpensive.platform.name}`
    );
  }

  // Add specific recommendations for cost-saving
  const midTierOptions = comparisons.filter(
    (c) => c.costEfficiencyScore > bestValue.costEfficiencyScore * 0.8
  );
  if (midTierOptions.length > 1) {
    recommendations.push(
      `Consider ${midTierOptions.map(c => c.platform.name).join(", ")} for good balance of cost and quality`
    );
  }

  const totalSavings = mostExpensive.estimatedCost - cheapestOption.estimatedCost;

  return {
    comparisons,
    cheapestOption,
    bestValue,
    totalSavings,
    recommendations,
  };
}

/**
 * Suggest cost-saving alternatives
 */
export function suggestCostSavingAlternative(
  currentPlatformId: string,
  tokenCount: number,
  platforms: Platform[]
): { alternative: Platform; savings: number } | null {
  const currentCost = estimateCost(currentPlatformId, tokenCount);
  const currentCapability = getPlatformCapability(currentPlatformId);

  if (!currentCapability) return null;

  // Find platforms with similar strengths but lower cost
  const alternatives = platforms
    .filter((p) => p.id !== currentPlatformId)
    .map((platform) => {
      const capability = getPlatformCapability(platform.id);
      if (!capability) return null;

      const cost = estimateCost(platform.id, tokenCount);
      const savings = currentCost - cost;

      // Check if has similar strengths
      const sharedStrengths = currentCapability.strengths.filter((s) =>
        capability.strengths.includes(s)
      );

      // Only suggest if cheaper and has at least one shared strength
      if (savings > 0 && sharedStrengths.length > 0) {
        return { platform, savings, sharedStrengths: sharedStrengths.length };
      }

      return null;
    })
    .filter(Boolean) as Array<{
    platform: Platform;
    savings: number;
    sharedStrengths: number;
  }>;

  // Sort by savings, then by shared strengths
  alternatives.sort((a, b) => {
    if (Math.abs(a.savings - b.savings) < 0.001) {
      return b.sharedStrengths - a.sharedStrengths;
    }
    return b.savings - a.savings;
  });

  if (alternatives.length === 0) return null;

  return {
    alternative: alternatives[0].platform,
    savings: alternatives[0].savings,
  };
}

/**
 * Estimate monthly costs based on usage
 */
export function estimateMonthlyCost(
  platformId: string,
  dailyPrompts: number,
  avgTokensPerPrompt: number
): {
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
} {
  const costPerPrompt = estimateCost(platformId, avgTokensPerPrompt);

  const dailyCost = costPerPrompt * dailyPrompts;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  return {
    dailyCost,
    monthlyCost,
    yearlyCost,
  };
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost === 0) return "Free";
  if (cost < 0.001) return "< $0.001";
  if (cost < 1) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}
