"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PromptVersion } from '@/lib/version-control/PromptVersionManager';
import { formatDate } from '@/lib/utils';

interface VersionHistoryTimelineProps {
  versions: PromptVersion[];
  onSelectVersion?: (version: PromptVersion) => void;
  onRestoreVersion?: (versionId: string) => void;
  selectedVersionId?: string;
}

export function VersionHistoryTimeline({
  versions,
  onSelectVersion,
  onRestoreVersion,
  selectedVersionId,
}: VersionHistoryTimelineProps) {
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No version history yet. Start editing to create versions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedVersions = versions.reduce((acc, version) => {
    const date = new Date(version.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(version);
    return acc;
  }, {} as Record<string, PromptVersion[]>);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Version History</CardTitle>
        <p className="text-sm text-gray-400">{versions.length} versions</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedVersions).map(([date, dateVersions]) => (
            <div key={date}>
              <div className="text-sm font-bold text-gray-400 mb-3">{date}</div>
              <div className="space-y-2 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary/20">
                {dateVersions.map((version, index) => {
                  const isSelected = version.id === selectedVersionId;
                  const isExpanded = version.id === expandedVersionId;

                  return (
                    <div
                      key={version.id}
                      className={`relative pl-10 ${
                        isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''
                      }`}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                          version.isCheckpoint
                            ? 'bg-accent border-accent'
                            : 'bg-primary border-primary'
                        } ${isSelected ? 'scale-125' : ''}`}
                      />

                      {/* Version card */}
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-surface/50'
                        }`}
                        onClick={() => {
                          onSelectVersion?.(version);
                          setExpandedVersionId(isExpanded ? null : version.id);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {version.isCheckpoint && (
                                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                                  Checkpoint
                                </span>
                              )}
                              {version.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              <span className="text-xs text-gray-500">
                                {version.branchName}
                              </span>
                            </div>

                            <p className="font-medium text-white truncate">
                              {version.commitMessage}
                            </p>

                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span>{version.author}</span>
                              <span>•</span>
                              <span>{formatDate(new Date(version.timestamp))}</span>
                              <span>•</span>
                              <span>{version.id.slice(0, 8)}</span>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 p-3 bg-[#0a0014] rounded border border-border">
                                <p className="text-sm text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                  {version.content.slice(0, 300)}
                                  {version.content.length > 300 && '...'}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            {onRestoreVersion && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRestoreVersion(version.id);
                                }}
                                className="text-xs"
                              >
                                🔄 Restore
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
