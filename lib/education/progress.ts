import { SkillProgress, LearningProgress, LessonCategory } from "@/types";
import { generateId } from "@/lib/utils";

/**
 * Learning Progress Tracking
 *
 * Tracks user's learning journey and skill acquisition
 */

const STORAGE_KEY = "hermes_learning_progress";

// ============================================================================
// Skill Definitions
// ============================================================================

export const ALL_SKILLS: Omit<SkillProgress, "isLearned" | "learnedAt" | "practiceCount">[] = [
  // Token Optimization Skills
  {
    skillId: "skill-token-basics",
    skillName: "Token Basics",
    category: "token-optimization",
    description: "Understand what tokens are and how they're counted",
    relatedLessons: ["token-opt-101"],
  },
  {
    skillId: "skill-token-reduction",
    skillName: "Token Reduction",
    category: "token-optimization",
    description: "Reduce token usage without losing clarity",
    relatedLessons: ["token-opt-101"],
  },
  {
    skillId: "skill-token-advanced",
    skillName: "Advanced Token Techniques",
    category: "token-optimization",
    description: "Master context references and compression",
    relatedLessons: ["token-opt-advanced"],
  },

  // Platform Skills
  {
    skillId: "skill-claude-optimization",
    skillName: "Claude Optimization",
    category: "platform-differences",
    description: "Optimize prompts for Claude using XML tags",
    relatedLessons: ["platform-diff-basics"],
  },
  {
    skillId: "skill-chatgpt-optimization",
    skillName: "ChatGPT Optimization",
    category: "platform-differences",
    description: "Use JSON mode and system prompts effectively",
    relatedLessons: ["platform-diff-basics"],
  },
  {
    skillId: "skill-cross-platform",
    skillName: "Cross-Platform Strategy",
    category: "platform-differences",
    description: "Adapt prompts for different platforms",
    relatedLessons: ["platform-diff-basics"],
  },

  // Few-Shot Skills
  {
    skillId: "skill-few-shot-basics",
    skillName: "Few-Shot Basics",
    category: "few-shot-learning",
    description: "Use examples effectively in prompts",
    relatedLessons: ["few-shot-when"],
  },
  {
    skillId: "skill-example-selection",
    skillName: "Example Selection",
    category: "few-shot-learning",
    description: "Choose diverse, high-quality examples",
    relatedLessons: ["few-shot-when"],
  },
  {
    skillId: "skill-chain-of-thought",
    skillName: "Chain-of-Thought",
    category: "few-shot-learning",
    description: "Show reasoning steps in examples",
    relatedLessons: ["few-shot-advanced"],
  },

  // Security Skills
  {
    skillId: "skill-injection-awareness",
    skillName: "Injection Awareness",
    category: "prompt-injection",
    description: "Recognize prompt injection vulnerabilities",
    relatedLessons: ["prompt-injection-basics"],
  },
  {
    skillId: "skill-input-validation",
    skillName: "Input Validation",
    category: "prompt-injection",
    description: "Validate and sanitize user inputs",
    relatedLessons: ["prompt-injection-basics"],
  },
  {
    skillId: "skill-delimiter-usage",
    skillName: "Delimiter Usage",
    category: "prompt-injection",
    description: "Use delimiters to separate instructions from data",
    relatedLessons: ["prompt-injection-basics"],
  },

  // Context Management Skills
  {
    skillId: "skill-context-compression",
    skillName: "Context Compression",
    category: "context-management",
    description: "Compress context without losing information",
    relatedLessons: [],
  },
  {
    skillId: "skill-context-organization",
    skillName: "Context Organization",
    category: "context-management",
    description: "Structure context for optimal understanding",
    relatedLessons: [],
  },

  // Quality Skills
  {
    skillId: "skill-specificity",
    skillName: "Specificity",
    category: "quality-metrics",
    description: "Write specific, clear prompts",
    relatedLessons: [],
  },
  {
    skillId: "skill-constraint-setting",
    skillName: "Constraint Setting",
    category: "quality-metrics",
    description: "Set appropriate boundaries and limits",
    relatedLessons: [],
  },

  // Advanced Skills
  {
    skillId: "skill-system-prompts",
    skillName: "System Prompts",
    category: "advanced-patterns",
    description: "Craft effective system-level instructions",
    relatedLessons: [],
  },
  {
    skillId: "skill-multi-turn",
    skillName: "Multi-Turn Conversations",
    category: "advanced-patterns",
    description: "Maintain context across multiple exchanges",
    relatedLessons: [],
  },
  {
    skillId: "skill-role-play",
    skillName: "Role-Playing",
    category: "advanced-patterns",
    description: "Use persona-based prompting effectively",
    relatedLessons: [],
  },

  // Debugging Skills
  {
    skillId: "skill-error-analysis",
    skillName: "Error Analysis",
    category: "debugging",
    description: "Diagnose why prompts aren't working",
    relatedLessons: [],
  },
  {
    skillId: "skill-iteration",
    skillName: "Iterative Refinement",
    category: "debugging",
    description: "Improve prompts through testing and iteration",
    relatedLessons: [],
  },
  {
    skillId: "skill-edge-case-testing",
    skillName: "Edge Case Testing",
    category: "debugging",
    description: "Test prompts with unusual inputs",
    relatedLessons: [],
  },
];

// ============================================================================
// Progress Management
// ============================================================================

/**
 * Initialize learning progress for a user
 */
export function initializeLearningProgress(userId: string): LearningProgress {
  const skills: SkillProgress[] = ALL_SKILLS.map((skill) => ({
    ...skill,
    isLearned: false,
    learnedAt: undefined,
    practiceCount: 0,
  }));

  return {
    userId,
    skillsLearned: skills,
    lessonsCompleted: [],
    totalPracticePrompts: 0,
    currentStreak: 0,
    lastActivityDate: new Date(),
    achievements: [],
  };
}

/**
 * Load learning progress from localStorage
 */
export function loadLearningProgress(userId: string): LearningProgress {
  if (typeof window === "undefined") {
    return initializeLearningProgress(userId);
  }

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!stored) {
      return initializeLearningProgress(userId);
    }

    const progress = JSON.parse(stored);
    return {
      ...progress,
      lastActivityDate: new Date(progress.lastActivityDate),
      skillsLearned: progress.skillsLearned.map((skill: any) => ({
        ...skill,
        learnedAt: skill.learnedAt ? new Date(skill.learnedAt) : undefined,
      })),
      achievements: progress.achievements.map((achievement: any) => ({
        ...achievement,
        unlockedAt: new Date(achievement.unlockedAt),
      })),
    };
  } catch (error) {
    console.error("Failed to load learning progress:", error);
    return initializeLearningProgress(userId);
  }
}

/**
 * Save learning progress to localStorage
 */
export function saveLearningProgress(progress: LearningProgress): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = {
      ...progress,
      lastActivityDate: progress.lastActivityDate.toISOString(),
      skillsLearned: progress.skillsLearned.map((skill) => ({
        ...skill,
        learnedAt: skill.learnedAt?.toISOString(),
      })),
      achievements: progress.achievements.map((achievement) => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt.toISOString(),
      })),
    };
    localStorage.setItem(`${STORAGE_KEY}_${progress.userId}`, JSON.stringify(serialized));
  } catch (error) {
    console.error("Failed to save learning progress:", error);
  }
}

/**
 * Mark a skill as learned
 */
export function markSkillLearned(
  progress: LearningProgress,
  skillId: string
): LearningProgress {
  const updatedSkills = progress.skillsLearned.map((skill) => {
    if (skill.skillId === skillId && !skill.isLearned) {
      return {
        ...skill,
        isLearned: true,
        learnedAt: new Date(),
      };
    }
    return skill;
  });

  const updatedProgress = {
    ...progress,
    skillsLearned: updatedSkills,
    lastActivityDate: new Date(),
  };

  // Check for achievements
  checkAndUnlockAchievements(updatedProgress);

  saveLearningProgress(updatedProgress);
  return updatedProgress;
}

/**
 * Mark a lesson as completed
 */
export function markLessonCompleted(
  progress: LearningProgress,
  lessonId: string
): LearningProgress {
  if (progress.lessonsCompleted.includes(lessonId)) {
    return progress;
  }

  const updatedProgress = {
    ...progress,
    lessonsCompleted: [...progress.lessonsCompleted, lessonId],
    lastActivityDate: new Date(),
  };

  checkAndUnlockAchievements(updatedProgress);
  saveLearningProgress(updatedProgress);
  return updatedProgress;
}

/**
 * Increment practice count for a skill
 */
export function incrementPracticeCount(
  progress: LearningProgress,
  skillId: string
): LearningProgress {
  const updatedSkills = progress.skillsLearned.map((skill) => {
    if (skill.skillId === skillId) {
      return {
        ...skill,
        practiceCount: skill.practiceCount + 1,
      };
    }
    return skill;
  });

  const updatedProgress = {
    ...progress,
    skillsLearned: updatedSkills,
    totalPracticePrompts: progress.totalPracticePrompts + 1,
    lastActivityDate: new Date(),
  };

  // Update streak
  updatedProgress.currentStreak = calculateStreak(updatedProgress);

  saveLearningProgress(updatedProgress);
  return updatedProgress;
}

/**
 * Calculate current streak
 */
function calculateStreak(progress: LearningProgress): number {
  const today = new Date();
  const lastActivity = progress.lastActivityDate;

  const daysDiff = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    return progress.currentStreak;
  } else if (daysDiff === 1) {
    return progress.currentStreak + 1;
  } else {
    return 1; // Reset streak
  }
}

/**
 * Check and unlock achievements
 */
function checkAndUnlockAchievements(progress: LearningProgress): void {
  const learnedCount = progress.skillsLearned.filter((s) => s.isLearned).length;
  const lessonsCount = progress.lessonsCompleted.length;

  const achievements = [
    {
      id: "first-skill",
      title: "First Steps",
      description: "Learned your first skill",
      condition: learnedCount >= 1,
    },
    {
      id: "five-skills",
      title: "Getting Started",
      description: "Learned 5 skills",
      condition: learnedCount >= 5,
    },
    {
      id: "ten-skills",
      title: "Intermediate",
      description: "Learned 10 skills",
      condition: learnedCount >= 10,
    },
    {
      id: "all-skills",
      title: "Master Prompter",
      description: "Learned all skills",
      condition: learnedCount >= ALL_SKILLS.length,
    },
    {
      id: "first-lesson",
      title: "Eager Learner",
      description: "Completed your first lesson",
      condition: lessonsCount >= 1,
    },
    {
      id: "three-lessons",
      title: "Dedicated Student",
      description: "Completed 3 lessons",
      condition: lessonsCount >= 3,
    },
    {
      id: "streak-7",
      title: "Week Warrior",
      description: "7-day practice streak",
      condition: progress.currentStreak >= 7,
    },
    {
      id: "practice-100",
      title: "Century",
      description: "Practiced with 100 prompts",
      condition: progress.totalPracticePrompts >= 100,
    },
  ];

  achievements.forEach((achievement) => {
    const alreadyUnlocked = progress.achievements.some(
      (a) => a.achievementId === achievement.id
    );

    if (achievement.condition && !alreadyUnlocked) {
      progress.achievements.push({
        achievementId: achievement.id,
        title: achievement.title,
        description: achievement.description,
        unlockedAt: new Date(),
      });
    }
  });
}

/**
 * Get progress statistics
 */
export function getProgressStats(progress: LearningProgress) {
  const totalSkills = ALL_SKILLS.length;
  const learnedSkills = progress.skillsLearned.filter((s) => s.isLearned).length;
  const percentage = Math.round((learnedSkills / totalSkills) * 100);

  const skillsByCategory: Record<LessonCategory, { total: number; learned: number }> = {
    "token-optimization": { total: 0, learned: 0 },
    "platform-differences": { total: 0, learned: 0 },
    "few-shot-learning": { total: 0, learned: 0 },
    "prompt-injection": { total: 0, learned: 0 },
    "context-management": { total: 0, learned: 0 },
    "quality-metrics": { total: 0, learned: 0 },
    "advanced-patterns": { total: 0, learned: 0 },
    debugging: { total: 0, learned: 0 },
  };

  progress.skillsLearned.forEach((skill) => {
    skillsByCategory[skill.category].total++;
    if (skill.isLearned) {
      skillsByCategory[skill.category].learned++;
    }
  });

  return {
    totalSkills,
    learnedSkills,
    percentage,
    lessonsCompleted: progress.lessonsCompleted.length,
    practicePrompts: progress.totalPracticePrompts,
    currentStreak: progress.currentStreak,
    achievements: progress.achievements.length,
    skillsByCategory,
  };
}
