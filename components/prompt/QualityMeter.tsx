"use client";

interface QualityMeterProps {
  score: number; // 0-100
  label: string;
  size?: "sm" | "md" | "lg";
}

export function QualityMeter({ score, label, size = "md" }: QualityMeterProps) {
  const sizes = {
    sm: { width: 80, height: 80, strokeWidth: 6, fontSize: "text-lg" },
    md: { width: 120, height: 120, strokeWidth: 8, fontSize: "text-2xl" },
    lg: { width: 160, height: 160, strokeWidth: 10, fontSize: "text-3xl" },
  };

  const config = sizes[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "#64748b"; // slate-500
    if (score >= 60) return "#f97316"; // accent - orange
    if (score >= 40) return "#fbbf24"; // yellow
    return "#ef4444"; // red
  };

  const color = getColor(score);
  const center = config.width / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg width={config.width} height={config.height} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-surface"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color }}
            >
              {Math.round(score)}
            </div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>
      <div className="text-sm font-medium text-foreground text-center">
        {label}
      </div>
    </div>
  );
}
