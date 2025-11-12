"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VersionDiff } from '@/lib/version-control/PromptVersionManager';

interface PromptDiffViewerProps {
  diffs: VersionDiff[];
  onAccept?: () => void;
  onReject?: () => void;
}

export function PromptDiffViewer({ diffs, onAccept, onReject }: PromptDiffViewerProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>('inline');

  const renderInlineDiff = () => {
    return (
      <div className="space-y-1 font-mono text-sm">
        {diffs.map((diff, index) => {
          const bgColor = 
            diff.type === 'added' ? 'bg-green-500/10 border-l-2 border-green-500' :
            diff.type === 'removed' ? 'bg-red-500/10 border-l-2 border-red-500' :
            'bg-surface';
          
          const textColor =
            diff.type === 'added' ? 'text-green-400' :
            diff.type === 'removed' ? 'text-red-400' :
            'text-gray-300';

          const symbol =
            diff.type === 'added' ? '+ ' :
            diff.type === 'removed' ? '- ' :
            '  ';

          return (
            <div
              key={index}
              className={`${bgColor} ${textColor} px-4 py-1 flex items-start gap-2`}
            >
              <span className="text-gray-500 w-8 text-right select-none">
                {diff.lineNumber}
              </span>
              <span className="font-bold w-4">{symbol}</span>
              <span className="flex-1 whitespace-pre-wrap break-all">{diff.content}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSideBySideDiff = () => {
    const oldContent: string[] = [];
    const newContent: string[] = [];

    diffs.forEach(diff => {
      if (diff.type === 'removed') {
        oldContent.push(diff.content);
      } else if (diff.type === 'added') {
        newContent.push(diff.content);
      } else {
        oldContent.push(diff.content);
        newContent.push(diff.content);
      }
    });

    return (
      <div className="grid grid-cols-2 gap-4 font-mono text-sm">
        <div className="border-r border-border">
          <div className="bg-red-500/10 text-red-400 px-4 py-2 font-bold border-b border-border">
            Original
          </div>
          <div className="space-y-1">
            {oldContent.map((line, index) => (
              <div key={index} className="px-4 py-1 bg-red-500/5">
                <span className="text-gray-500 w-8 inline-block text-right">{index + 1}</span>
                <span className="ml-2">{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-green-500/10 text-green-400 px-4 py-2 font-bold border-b border-border">
            Modified
          </div>
          <div className="space-y-1">
            {newContent.map((line, index) => (
              <div key={index} className="px-4 py-1 bg-green-500/5">
                <span className="text-gray-500 w-8 inline-block text-right">{index + 1}</span>
                <span className="ml-2">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const stats = {
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    unchanged: diffs.filter(d => d.type === 'unchanged').length,
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prompt Diff</CardTitle>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-400">+{stats.added} additions</span>
              <span className="text-red-400">-{stats.removed} deletions</span>
              <span className="text-gray-400">{stats.unchanged} unchanged</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'inline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('inline')}
            >
              Inline
            </Button>
            <Button
              variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('side-by-side')}
            >
              Side by Side
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="max-h-[500px] overflow-y-auto rounded-md border border-border bg-[#0a0014]">
          {viewMode === 'inline' ? renderInlineDiff() : renderSideBySideDiff()}
        </div>

        {(onAccept || onReject) && (
          <div className="flex gap-2 mt-4">
            {onAccept && (
              <Button onClick={onAccept} variant="accent" className="flex-1">
                ✓ Accept Changes
              </Button>
            )}
            {onReject && (
              <Button onClick={onReject} variant="outline" className="flex-1">
                ✗ Reject Changes
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
