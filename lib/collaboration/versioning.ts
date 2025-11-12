import { PromptVersion, VersionChange } from "@/types";
import { generateId } from "@/lib/utils";

const VERSIONS_KEY = "hermes_prompt_versions";

/**
 * Simple diff algorithm to find differences between two texts
 */
export function calculateDiff(oldText: string, newText: string): VersionChange[] {
  const changes: VersionChange[] = [];

  // Split into words for word-level diff
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);

  // Simple LCS-based diff
  const lcs = longestCommonSubsequence(oldWords, newWords);

  let oldIndex = 0;
  let newIndex = 0;
  let position = 0;

  while (oldIndex < oldWords.length || newIndex < newWords.length) {
    // Check if current words match (part of LCS)
    if (
      oldIndex < oldWords.length &&
      newIndex < newWords.length &&
      oldWords[oldIndex] === newWords[newIndex]
    ) {
      // Words match, move forward
      oldIndex++;
      newIndex++;
      position++;
    } else if (oldIndex < oldWords.length && !lcs.includes(oldWords[oldIndex])) {
      // Word was deleted
      changes.push({
        changeId: generateId(),
        changeType: "deletion",
        oldText: oldWords[oldIndex],
        position,
        reason: "Removed unnecessary word",
      });
      oldIndex++;
    } else if (newIndex < newWords.length && !lcs.includes(newWords[newIndex])) {
      // Word was added
      changes.push({
        changeId: generateId(),
        changeType: "addition",
        newText: newWords[newIndex],
        position,
        reason: "Added for clarity",
      });
      newIndex++;
      position++;
    } else if (oldIndex < oldWords.length && newIndex < newWords.length) {
      // Word was modified
      changes.push({
        changeId: generateId(),
        changeType: "modification",
        oldText: oldWords[oldIndex],
        newText: newWords[newIndex],
        position,
        reason: "Improved wording",
      });
      oldIndex++;
      newIndex++;
      position++;
    }
  }

  return changes;
}

/**
 * Longest Common Subsequence for diff algorithm
 */
function longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;

  // Create DP table
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

/**
 * Create a new version with changes
 */
export function createVersion(
  promptId: string,
  content: string,
  previousContent: string,
  createdBy: string,
  notes: string = ""
): PromptVersion {
  const versions = loadVersions(promptId);
  const versionNumber = versions.length + 1;

  const changes = calculateDiff(previousContent, content);

  const version: PromptVersion = {
    versionId: generateId(),
    promptId,
    versionNumber,
    content,
    changes,
    createdAt: new Date(),
    createdBy,
    notes,
  };

  saveVersion(version);
  return version;
}

/**
 * Save version to localStorage
 */
export function saveVersion(version: PromptVersion): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(VERSIONS_KEY);
    const versions: PromptVersion[] = stored ? JSON.parse(stored) : [];

    versions.push({
      ...version,
      createdAt: version.createdAt.toISOString() as any,
    });

    // Keep last 100 versions per prompt
    const promptVersions = versions.filter((v) => v.promptId === version.promptId);
    if (promptVersions.length > 100) {
      const toKeep = promptVersions.slice(-100).map((v) => v.versionId);
      const filtered = versions.filter(
        (v) => v.promptId !== version.promptId || toKeep.includes(v.versionId)
      );
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(filtered));
    } else {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
    }
  } catch (error) {
    console.error("Failed to save version:", error);
  }
}

/**
 * Load all versions for a prompt
 */
export function loadVersions(promptId: string): PromptVersion[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(VERSIONS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed
      .filter((v: any) => v.promptId === promptId)
      .map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
      }))
      .sort((a: any, b: any) => a.versionNumber - b.versionNumber);
  } catch (error) {
    console.error("Failed to load versions:", error);
    return [];
  }
}

/**
 * Get version by ID
 */
export function getVersionById(versionId: string): PromptVersion | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(VERSIONS_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const version = parsed.find((v: any) => v.versionId === versionId);

    if (!version) return null;

    return {
      ...version,
      createdAt: new Date(version.createdAt),
    };
  } catch (error) {
    console.error("Failed to get version:", error);
    return null;
  }
}

/**
 * Compare two versions
 */
export function compareVersions(
  version1: PromptVersion,
  version2: PromptVersion
): VersionChange[] {
  return calculateDiff(version1.content, version2.content);
}

/**
 * Generate diff summary
 */
export function generateDiffSummary(changes: VersionChange[]): {
  additions: number;
  deletions: number;
  modifications: number;
  totalChanges: number;
} {
  const additions = changes.filter((c) => c.changeType === "addition").length;
  const deletions = changes.filter((c) => c.changeType === "deletion").length;
  const modifications = changes.filter((c) => c.changeType === "modification").length;

  return {
    additions,
    deletions,
    modifications,
    totalChanges: changes.length,
  };
}

/**
 * Apply highlighting to text based on changes
 */
export interface HighlightedSegment {
  text: string;
  type: "unchanged" | "addition" | "deletion" | "modification";
}

export function applyHighlighting(text: string, changes: VersionChange[]): HighlightedSegment[] {
  const words = text.split(/\s+/);
  const segments: HighlightedSegment[] = [];

  let currentPosition = 0;

  words.forEach((word, index) => {
    const change = changes.find((c) => c.position === index);

    if (change) {
      if (change.changeType === "addition") {
        segments.push({ text: word, type: "addition" });
      } else if (change.changeType === "modification") {
        segments.push({ text: word, type: "modification" });
      } else {
        segments.push({ text: word, type: "unchanged" });
      }
    } else {
      segments.push({ text: word, type: "unchanged" });
    }
  });

  return segments;
}
