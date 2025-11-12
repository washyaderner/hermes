"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useVersionControlStore } from '@/stores/versionControlStore';
import { VersionHistoryTimeline } from './VersionHistoryTimeline';
import { PromptDiffViewer } from './PromptDiffViewer';
import { PromptVersion } from '@/lib/version-control/PromptVersionManager';

interface VersionControlPanelProps {
  promptId: string;
  currentContent: string;
  onContentChange?: (content: string) => void;
}

export function VersionControlPanel({
  promptId,
  currentContent,
  onContentChange,
}: VersionControlPanelProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<PromptVersion | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'branches' | 'compare'>('history');

  const {
    setCurrentPromptId,
    createVersion,
    getVersionHistory,
    restoreVersion,
    createBranch,
    checkoutBranch,
    getAllBranches,
    tagVersion,
    versionManager,
    exportHistory,
  } = useVersionControlStore();

  useState(() => {
    setCurrentPromptId(promptId);
  });

  const versions = getVersionHistory(promptId);
  const branches = getAllBranches();

  const handleCreateCheckpoint = () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message');
      return;
    }

    createVersion(promptId, currentContent, commitMessage, true);
    setCommitMessage('');
    alert('✓ Checkpoint created');
  };

  const handleRestoreVersion = (versionId: string) => {
    if (confirm('Are you sure you want to restore this version?')) {
      const restored = restoreVersion(versionId);
      if (restored && onContentChange) {
        onContentChange(restored.content);
      }
    }
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) {
      alert('Please enter a branch name');
      return;
    }

    const branch = createBranch(newBranchName);
    if (branch) {
      setNewBranchName('');
      alert(`✓ Branch '${branch.name}' created`);
    } else {
      alert('❌ Failed to create branch (may already exist)');
    }
  };

  const handleCheckoutBranch = (branchName: string) => {
    const success = checkoutBranch(branchName);
    if (success) {
      alert(`✓ Switched to branch '${branchName}'`);
    }
  };

  const handleTagVersion = () => {
    if (!selectedVersion || !newTagName.trim()) {
      alert('Please select a version and enter a tag name');
      return;
    }

    const success = tagVersion(selectedVersion.id, newTagName);
    if (success) {
      setNewTagName('');
      alert(`✓ Tagged version as '${newTagName}'`);
    }
  };

  const handleCompareVersions = () => {
    if (!selectedVersion || !compareVersion) {
      alert('Please select two versions to compare');
      return;
    }

    setActiveTab('compare');
  };

  const handleExport = () => {
    const json = exportHistory(promptId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hermes-version-history-${promptId.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const diffs = selectedVersion && compareVersion
    ? versionManager.createDiff(compareVersion.id, selectedVersion.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Version Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Checkpoint */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Create Checkpoint
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCheckpoint();
                  }
                }}
              />
              <Button onClick={handleCreateCheckpoint} variant="accent">
                💾 Save
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-surface rounded-lg border border-border">
              <div className="text-2xl font-bold text-primary">{versions.length}</div>
              <div className="text-xs text-gray-400">Versions</div>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-border">
              <div className="text-2xl font-bold text-accent">{branches.length}</div>
              <div className="text-xs text-gray-400">Branches</div>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-border">
              <div className="text-2xl font-bold text-green-400">
                {versions.filter(v => v.isCheckpoint).length}
              </div>
              <div className="text-xs text-gray-400">Checkpoints</div>
            </div>
          </div>

          <Button onClick={handleExport} variant="outline" className="w-full">
            📦 Export History
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
          className="flex-1"
        >
          📜 History
        </Button>
        <Button
          variant={activeTab === 'branches' ? 'default' : 'outline'}
          onClick={() => setActiveTab('branches')}
          className="flex-1"
        >
          🌳 Branches
        </Button>
        <Button
          variant={activeTab === 'compare' ? 'default' : 'outline'}
          onClick={() => setActiveTab('compare')}
          className="flex-1"
          disabled={!selectedVersion || !compareVersion}
        >
          🔍 Compare
        </Button>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <VersionHistoryTimeline
            versions={versions}
            selectedVersionId={selectedVersion?.id}
            onSelectVersion={setSelectedVersion}
            onRestoreVersion={handleRestoreVersion}
          />

          {selectedVersion && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Version Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                  <Button onClick={handleTagVersion} variant="outline">
                    🏷️ Tag
                  </Button>
                </div>

                <Button
                  onClick={() => setCompareVersion(selectedVersion)}
                  variant="outline"
                  className="w-full"
                  disabled={!compareVersion && versions.length < 2}
                >
                  {compareVersion
                    ? `Compare with ${compareVersion.id.slice(0, 8)}`
                    : 'Set as Compare Base'}
                </Button>

                {compareVersion && (
                  <Button
                    onClick={handleCompareVersions}
                    variant="accent"
                    className="w-full"
                  >
                    🔍 View Diff
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Branches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New branch name..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
              />
              <Button onClick={handleCreateBranch} variant="accent">
                🌱 Create
              </Button>
            </div>

            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border"
                >
                  <div>
                    <div className="font-medium text-white">{branch.name}</div>
                    <div className="text-xs text-gray-400">{branch.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCheckoutBranch(branch.name)}
                  >
                    Checkout
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compare Tab */}
      {activeTab === 'compare' && selectedVersion && compareVersion && (
        <PromptDiffViewer diffs={diffs} />
      )}
    </div>
  );
}
