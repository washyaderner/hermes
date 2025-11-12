import { generateId } from "@/lib/utils";

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  timestamp: Date;
  commitMessage: string;
  author: string;
  parentId: string | null;
  branchName: string;
  tags: string[];
  isCheckpoint: boolean;
}

export interface PromptBranch {
  name: string;
  headVersionId: string;
  createdAt: Date;
  description: string;
}

export interface VersionDiff {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

export class PromptVersionManager {
  private versions: Map<string, PromptVersion>;
  private branches: Map<string, PromptBranch>;
  private currentBranch: string;
  private maxVersionsPerPrompt: number;

  constructor(maxVersionsPerPrompt: number = 50) {
    this.versions = new Map();
    this.branches = new Map();
    this.currentBranch = 'main';
    this.maxVersionsPerPrompt = maxVersionsPerPrompt;
    
    // Initialize main branch
    this.branches.set('main', {
      name: 'main',
      headVersionId: '',
      createdAt: new Date(),
      description: 'Main branch',
    });
  }

  /**
   * Create a new version of a prompt
   */
  createVersion(
    promptId: string,
    content: string,
    commitMessage: string,
    author: string = 'User',
    isCheckpoint: boolean = false
  ): PromptVersion {
    const parentId = this.getHeadVersion(promptId, this.currentBranch)?.id || null;
    
    const version: PromptVersion = {
      id: generateId(),
      promptId,
      content,
      timestamp: new Date(),
      commitMessage,
      author,
      parentId,
      branchName: this.currentBranch,
      tags: [],
      isCheckpoint,
    };

    this.versions.set(version.id, version);
    
    // Update branch head
    const branch = this.branches.get(this.currentBranch);
    if (branch) {
      branch.headVersionId = version.id;
    }

    // Cleanup old versions
    this.cleanupOldVersions(promptId);

    return version;
  }

  /**
   * Get all versions for a prompt
   */
  getVersionHistory(promptId: string, branchName?: string): PromptVersion[] {
    const versions = Array.from(this.versions.values())
      .filter(v => v.promptId === promptId)
      .filter(v => !branchName || v.branchName === branchName)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return versions;
  }

  /**
   * Get the head (latest) version of a prompt on a branch
   */
  getHeadVersion(promptId: string, branchName: string = 'main'): PromptVersion | null {
    const branch = this.branches.get(branchName);
    if (!branch || !branch.headVersionId) {
      return null;
    }

    const version = this.versions.get(branch.headVersionId);
    if (version && version.promptId === promptId) {
      return version;
    }

    // Fallback: find latest version on this branch
    const versions = this.getVersionHistory(promptId, branchName);
    return versions[0] || null;
  }

  /**
   * Restore a specific version
   */
  restoreVersion(versionId: string): PromptVersion | null {
    const version = this.versions.get(versionId);
    if (!version) {
      return null;
    }

    // Create a new version with the restored content
    return this.createVersion(
      version.promptId,
      version.content,
      `Restored from version ${versionId.slice(0, 8)}`,
      version.author,
      false
    );
  }

  /**
   * Create a diff between two versions
   */
  createDiff(versionId1: string, versionId2: string): VersionDiff[] {
    const v1 = this.versions.get(versionId1);
    const v2 = this.versions.get(versionId2);

    if (!v1 || !v2) {
      return [];
    }

    return this.computeDiff(v1.content, v2.content);
  }

  /**
   * Compute character-level diff
   */
  private computeDiff(text1: string, text2: string): VersionDiff[] {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const diffs: VersionDiff[] = [];

    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined) {
        diffs.push({ type: 'added', content: line2, lineNumber: i + 1 });
      } else if (line2 === undefined) {
        diffs.push({ type: 'removed', content: line1, lineNumber: i + 1 });
      } else if (line1 === line2) {
        diffs.push({ type: 'unchanged', content: line1, lineNumber: i + 1 });
      } else {
        diffs.push({ type: 'removed', content: line1, lineNumber: i + 1 });
        diffs.push({ type: 'added', content: line2, lineNumber: i + 1 });
      }
    }

    return diffs;
  }

  /**
   * Create a new branch
   */
  createBranch(
    branchName: string,
    fromVersionId: string | null = null,
    description: string = ''
  ): PromptBranch | null {
    if (this.branches.has(branchName)) {
      return null; // Branch already exists
    }

    const branch: PromptBranch = {
      name: branchName,
      headVersionId: fromVersionId || '',
      createdAt: new Date(),
      description,
    };

    this.branches.set(branchName, branch);
    return branch;
  }

  /**
   * Switch to a different branch
   */
  checkoutBranch(branchName: string): boolean {
    if (!this.branches.has(branchName)) {
      return false;
    }

    this.currentBranch = branchName;
    return true;
  }

  /**
   * Merge one branch into another
   */
  mergeBranch(
    sourceBranch: string,
    targetBranch: string,
    promptId: string,
    resolveConflict?: (sourceContent: string, targetContent: string) => string
  ): PromptVersion | null {
    const source = this.branches.get(sourceBranch);
    const target = this.branches.get(targetBranch);

    if (!source || !target) {
      return null;
    }

    const sourceVersion = this.versions.get(source.headVersionId);
    const targetVersion = this.versions.get(target.headVersionId);

    if (!sourceVersion || !targetVersion) {
      return null;
    }

    // Simple merge: use resolver or take source content
    const mergedContent = resolveConflict
      ? resolveConflict(sourceVersion.content, targetVersion.content)
      : sourceVersion.content;

    // Switch to target branch and create merge version
    this.checkoutBranch(targetBranch);
    return this.createVersion(
      promptId,
      mergedContent,
      `Merge ${sourceBranch} into ${targetBranch}`,
      'System',
      true
    );
  }

  /**
   * Tag a version
   */
  tagVersion(versionId: string, tag: string): boolean {
    const version = this.versions.get(versionId);
    if (!version) {
      return false;
    }

    if (!version.tags.includes(tag)) {
      version.tags.push(tag);
    }

    return true;
  }

  /**
   * Get all branches
   */
  getAllBranches(): PromptBranch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Cleanup old versions (keep max N versions per prompt)
   */
  private cleanupOldVersions(promptId: string): void {
    const versions = this.getVersionHistory(promptId);
    
    if (versions.length > this.maxVersionsPerPrompt) {
      // Keep checkpoints and tagged versions
      const toRemove = versions
        .filter(v => !v.isCheckpoint && v.tags.length === 0)
        .slice(this.maxVersionsPerPrompt);

      toRemove.forEach(v => this.versions.delete(v.id));
    }
  }

  /**
   * Export version history as JSON
   */
  exportHistory(promptId: string): string {
    const versions = this.getVersionHistory(promptId);
    const branches = this.getAllBranches();

    return JSON.stringify({
      promptId,
      versions,
      branches,
      currentBranch: this.currentBranch,
    }, null, 2);
  }

  /**
   * Import version history from JSON
   */
  importHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      data.versions.forEach((v: PromptVersion) => {
        this.versions.set(v.id, v);
      });

      data.branches.forEach((b: PromptBranch) => {
        this.branches.set(b.name, b);
      });

      this.currentBranch = data.currentBranch || 'main';

      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }
}
