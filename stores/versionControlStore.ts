import { create } from 'zustand';
import { PromptVersionManager, PromptVersion, PromptBranch } from '@/lib/version-control/PromptVersionManager';

interface VersionControlState {
  versionManager: PromptVersionManager;
  currentPromptId: string | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  lastAutoSave: Date | null;

  // Actions
  setCurrentPromptId: (promptId: string) => void;
  createVersion: (promptId: string, content: string, commitMessage: string, isCheckpoint?: boolean) => PromptVersion;
  getVersionHistory: (promptId: string) => PromptVersion[];
  restoreVersion: (versionId: string) => PromptVersion | null;
  createBranch: (branchName: string, description?: string) => PromptBranch | null;
  checkoutBranch: (branchName: string) => boolean;
  mergeBranch: (sourceBranch: string, targetBranch: string, promptId: string) => PromptVersion | null;
  tagVersion: (versionId: string, tag: string) => boolean;
  getAllBranches: () => PromptBranch[];
  setAutoSaveEnabled: (enabled: boolean) => void;
  exportHistory: (promptId: string) => string;
  importHistory: (jsonData: string) => boolean;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

export const useVersionControlStore = create<VersionControlState>((set, get) => ({
  versionManager: new PromptVersionManager(50),
  currentPromptId: null,
  autoSaveEnabled: true,
  autoSaveInterval: 30000, // 30 seconds
  lastAutoSave: null,

  setCurrentPromptId: (promptId: string) => {
    set({ currentPromptId: promptId });
  },

  createVersion: (promptId: string, content: string, commitMessage: string, isCheckpoint = false) => {
    const { versionManager } = get();
    const version = versionManager.createVersion(promptId, content, commitMessage, 'User', isCheckpoint);
    
    set({ lastAutoSave: new Date() });
    get().saveToLocalStorage();
    
    return version;
  },

  getVersionHistory: (promptId: string) => {
    const { versionManager } = get();
    return versionManager.getVersionHistory(promptId);
  },

  restoreVersion: (versionId: string) => {
    const { versionManager } = get();
    const version = versionManager.restoreVersion(versionId);
    
    if (version) {
      get().saveToLocalStorage();
    }
    
    return version;
  },

  createBranch: (branchName: string, description = '') => {
    const { versionManager, currentPromptId } = get();
    
    if (!currentPromptId) {
      return null;
    }

    const headVersion = versionManager.getHeadVersion(currentPromptId);
    const branch = versionManager.createBranch(branchName, headVersion?.id || null, description);
    
    if (branch) {
      get().saveToLocalStorage();
    }
    
    return branch;
  },

  checkoutBranch: (branchName: string) => {
    const { versionManager } = get();
    const success = versionManager.checkoutBranch(branchName);
    
    if (success) {
      get().saveToLocalStorage();
    }
    
    return success;
  },

  mergeBranch: (sourceBranch: string, targetBranch: string, promptId: string) => {
    const { versionManager } = get();
    const version = versionManager.mergeBranch(sourceBranch, targetBranch, promptId);
    
    if (version) {
      get().saveToLocalStorage();
    }
    
    return version;
  },

  tagVersion: (versionId: string, tag: string) => {
    const { versionManager } = get();
    const success = versionManager.tagVersion(versionId, tag);
    
    if (success) {
      get().saveToLocalStorage();
    }
    
    return success;
  },

  getAllBranches: () => {
    const { versionManager } = get();
    return versionManager.getAllBranches();
  },

  setAutoSaveEnabled: (enabled: boolean) => {
    set({ autoSaveEnabled: enabled });
    get().saveToLocalStorage();
  },

  exportHistory: (promptId: string) => {
    const { versionManager } = get();
    return versionManager.exportHistory(promptId);
  },

  importHistory: (jsonData: string) => {
    const { versionManager } = get();
    const success = versionManager.importHistory(jsonData);
    
    if (success) {
      set({ versionManager: new PromptVersionManager(50) });
      get().loadFromLocalStorage();
    }
    
    return success;
  },

  saveToLocalStorage: () => {
    const { currentPromptId, autoSaveEnabled, versionManager } = get();
    
    if (currentPromptId) {
      const historyJson = versionManager.exportHistory(currentPromptId);
      localStorage.setItem(`hermes_version_history_${currentPromptId}`, historyJson);
    }

    localStorage.setItem('hermes_version_control_settings', JSON.stringify({
      autoSaveEnabled,
      lastAutoSave: new Date().toISOString(),
    }));
  },

  loadFromLocalStorage: () => {
    try {
      const settings = localStorage.getItem('hermes_version_control_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        set({
          autoSaveEnabled: parsed.autoSaveEnabled,
          lastAutoSave: parsed.lastAutoSave ? new Date(parsed.lastAutoSave) : null,
        });
      }
    } catch (error) {
      console.error('Failed to load version control settings:', error);
    }
  },
}));
