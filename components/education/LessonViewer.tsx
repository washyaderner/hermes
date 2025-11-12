"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiniLesson, SkillLevel } from "@/types";
import { ALL_LESSONS, LESSONS_BY_CATEGORY } from "@/lib/education/lessons";
import { BookOpen, Clock, CheckCircle2, PlayCircle, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface LessonViewerProps {
  selectedLessonId?: string;
  onComplete?: (lessonId: string) => void;
  onClose?: () => void;
}

export function LessonViewer({ selectedLessonId, onComplete, onClose }: LessonViewerProps) {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(
    selectedLessonId || null
  );
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const currentLesson = currentLessonId
    ? ALL_LESSONS.find((l) => l.lessonId === currentLessonId)
    : null;

  const handleComplete = () => {
    if (currentLesson) {
      setCompletedLessons(new Set(Array.from(completedLessons).concat(currentLesson.lessonId)));
      if (onComplete) onComplete(currentLesson.lessonId);
    }
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case "beginner":
        return "text-green-500";
      case "intermediate":
        return "text-orange-500";
      case "advanced":
        return "text-red-500";
      default:
        return "";
    }
  };

  // Lesson List View
  if (!currentLesson) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Mini-Lessons
          </CardTitle>
          <CardDescription>
            Quick lessons to master prompt engineering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(LESSONS_BY_CATEGORY) as Array<keyof typeof LESSONS_BY_CATEGORY>).map(
            (category) => {
              const lessons = LESSONS_BY_CATEGORY[category];
              if (lessons.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold mb-2 capitalize">
                    {category.replace(/-/g, " ")}
                  </h3>
                  <div className="space-y-2">
                    {lessons.map((lesson) => {
                      const isCompleted = completedLessons.has(lesson.lessonId);

                      return (
                        <Card
                          key={lesson.lessonId}
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setCurrentLessonId(lesson.lessonId)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4 text-primary" />
                                  )}
                                  <h4 className="font-semibold text-sm">{lesson.title}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {lesson.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getSkillLevelColor(
                                      lesson.skillLevel
                                    )}`}
                                  >
                                    {lesson.skillLevel}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {lesson.estimatedMinutes} min
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </CardContent>
      </Card>
    );
  }

  // Lesson Detail View
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentLessonId(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {completedLessons.has(currentLesson.lessonId) && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <CardTitle>{currentLesson.title}</CardTitle>
        <CardDescription>{currentLesson.description}</CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="outline"
            className={getSkillLevelColor(currentLesson.skillLevel)}
          >
            {currentLesson.skillLevel}
          </Badge>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {currentLesson.estimatedMinutes} min
          </Badge>
          <Badge variant="outline">{currentLesson.category}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lesson Content */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
        </div>

        {/* Key Takeaways */}
        <div className="bg-accent/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">🎯 Key Takeaways</h3>
          <ul className="text-sm space-y-1">
            {currentLesson.keyTakeaways.map((takeaway, index) => (
              <li key={index}>• {takeaway}</li>
            ))}
          </ul>
        </div>

        {/* Practice Prompt */}
        {currentLesson.practicePrompt && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">✍️ Practice Exercise</h3>
            <p className="text-sm">{currentLesson.practicePrompt}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleComplete} className="flex-1">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Related Lessons */}
        {currentLesson.relatedLessons.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Related Lessons</h3>
            <div className="flex gap-2 flex-wrap">
              {currentLesson.relatedLessons.map((relatedId) => {
                const related = ALL_LESSONS.find((l) => l.lessonId === relatedId);
                if (!related) return null;

                return (
                  <Button
                    key={relatedId}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentLessonId(relatedId)}
                  >
                    {related.title}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
