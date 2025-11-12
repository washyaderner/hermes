"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningProgress, LessonCategory } from "@/types";
import {
  loadLearningProgress,
  getProgressStats,
  ALL_SKILLS,
} from "@/lib/education/progress";
import {
  Trophy,
  Target,
  Flame,
  BookOpen,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface ProgressTrackerProps {
  userId: string;
  compact?: boolean;
}

export function ProgressTracker({ userId, compact = false }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<LessonCategory | null>(null);

  useEffect(() => {
    const loadedProgress = loadLearningProgress(userId);
    setProgress(loadedProgress);
  }, [userId]);

  if (!progress) {
    return <div className="text-sm text-muted-foreground">Loading progress...</div>;
  }

  const stats = getProgressStats(progress);

  const categoryIcons: Record<LessonCategory, string> = {
    "token-optimization": "⚡",
    "platform-differences": "🌐",
    "few-shot-learning": "🎯",
    "prompt-injection": "🛡️",
    "context-management": "📋",
    "quality-metrics": "⭐",
    "advanced-patterns": "🚀",
    debugging: "🐛",
  };

  const categoryNames: Record<LessonCategory, string> = {
    "token-optimization": "Token Optimization",
    "platform-differences": "Platform Differences",
    "few-shot-learning": "Few-Shot Learning",
    "prompt-injection": "Security & Injection",
    "context-management": "Context Management",
    "quality-metrics": "Quality Metrics",
    "advanced-patterns": "Advanced Patterns",
    debugging: "Debugging",
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">Skills Learned</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {stats.learnedSkills}/{stats.totalSkills}
              </span>
              <Badge variant="secondary">{stats.percentage}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">
              {stats.learnedSkills} / {stats.totalSkills}
            </span>
          </div>
          <div className="w-full bg-accent rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3 transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.percentage}% complete
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-accent/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Lessons</span>
            </div>
            <div className="text-2xl font-bold">{stats.lessonsCompleted}</div>
          </div>

          <div className="bg-accent/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium">Practice</span>
            </div>
            <div className="text-2xl font-bold">{stats.practicePrompts}</div>
          </div>

          <div className="bg-accent/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium">Streak</span>
            </div>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>

          <div className="bg-accent/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium">Achievements</span>
            </div>
            <div className="text-2xl font-bold">{stats.achievements}</div>
          </div>
        </div>

        {/* Skills by Category */}
        <div>
          <div className="text-sm font-semibold mb-3">Skills by Category</div>
          <div className="space-y-2">
            {(Object.keys(stats.skillsByCategory) as LessonCategory[]).map((category) => {
              const categoryStats = stats.skillsByCategory[category];
              if (categoryStats.total === 0) return null;

              const percentage =
                categoryStats.total > 0
                  ? Math.round((categoryStats.learned / categoryStats.total) * 100)
                  : 0;
              const isExpanded = expandedCategory === category;

              return (
                <div key={category}>
                  <div
                    className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category)
                    }
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="text-lg">{categoryIcons[category]}</span>
                      <span className="text-sm font-medium">
                        {categoryNames[category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {categoryStats.learned}/{categoryStats.total}
                      </span>
                      <Badge variant={percentage === 100 ? "default" : "secondary"}>
                        {percentage}%
                      </Badge>
                    </div>
                  </div>

                  {/* Expanded: Show individual skills */}
                  {isExpanded && (
                    <div className="ml-8 mt-2 space-y-1">
                      {progress.skillsLearned
                        .filter((skill) => skill.category === category)
                        .map((skill) => (
                          <div
                            key={skill.skillId}
                            className="flex items-center justify-between p-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {skill.isLearned ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-muted-foreground">○</span>
                              )}
                              <span
                                className={
                                  skill.isLearned ? "" : "text-muted-foreground"
                                }
                              >
                                {skill.skillName}
                              </span>
                            </div>
                            {skill.practiceCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {skill.practiceCount}x practiced
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        {progress.achievements.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">Recent Achievements</div>
            <div className="space-y-2">
              {progress.achievements.slice(-3).reverse().map((achievement) => (
                <div
                  key={achievement.achievementId}
                  className="flex items-start gap-3 p-2 bg-accent/30 rounded"
                >
                  <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
