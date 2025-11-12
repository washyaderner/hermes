"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';

interface HeatmapData {
  platform: string;
  hour: number;
  count: number;
}

interface PlatformUsageHeatmapProps {
  data: HeatmapData[];
  onPlatformClick?: (platform: string) => void;
}

export function PlatformUsageHeatmap({ data, onPlatformClick }: PlatformUsageHeatmapProps) {
  const { platforms, heatmapMatrix, maxCount } = useMemo(() => {
    const platformSet = new Set(data.map(d => d.platform));
    const platforms = Array.from(platformSet).sort();
    
    const matrix: number[][] = Array(platforms.length).fill(0).map(() => Array(24).fill(0));
    
    data.forEach(d => {
      const platformIndex = platforms.indexOf(d.platform);
      if (platformIndex >= 0) {
        matrix[platformIndex][d.hour] = d.count;
      }
    });

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return { platforms, heatmapMatrix: matrix, maxCount };
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-surface/30';
    
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  const getSuccessRate = (platform: string) => {
    const platformData = data.filter(d => d.platform === platform);
    const totalCount = platformData.reduce((sum, d) => sum + d.count, 0);
    // Mock success rate - in real app would come from data
    return Math.floor(60 + Math.random() * 35);
  };

  if (platforms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Usage Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No usage data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Platform Usage by Time of Day</CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Heatmap shows usage patterns across {platforms.length} platforms
        </p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-32 flex-shrink-0"></div>
            <div className="flex flex-1 justify-between text-xs text-gray-400">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="w-8 text-center">
                  {i % 3 === 0 ? `${i}h` : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {platforms.map((platform, platformIndex) => (
              <div key={platform} className="flex items-center">
                {/* Platform name */}
                <div 
                  className="w-32 flex-shrink-0 text-sm text-gray-300 truncate cursor-pointer hover:text-white pr-2"
                  onClick={() => onPlatformClick?.(platform)}
                  title={platform}
                >
                  {platform}
                </div>

                {/* Hour cells */}
                <div className="flex flex-1 gap-1">
                  {heatmapMatrix[platformIndex].map((count, hour) => (
                    <div
                      key={hour}
                      className={`w-8 h-8 rounded ${getColor(count)} border border-border/50 cursor-pointer transition-all hover:scale-110 hover:z-10 relative group`}
                      title={`${platform} at ${hour}:00 - ${count} uses`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-surface/95 border border-primary/20 rounded text-xs whitespace-nowrap z-20">
                        {count} uses at {hour}:00
                      </div>
                    </div>
                  ))}
                </div>

                {/* Success rate */}
                <div className="w-16 text-right text-xs text-gray-400 ml-2">
                  {getSuccessRate(platform)}%
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Usage:</span>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded bg-surface/30 border border-border"></div>
                <span>Low</span>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded bg-primary/20 border border-border"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded bg-primary/40 border border-border"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded bg-primary/60 border border-border"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded bg-primary border border-border"></div>
                <span>High</span>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              Peak usage: {maxCount} prompts/hour
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
