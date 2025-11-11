import { create } from "zustand";
import { HermesStore, UserSettings, QualityScores, Dataset, SuccessfulPromptPattern, Tone } from "@/types";

const defaultSettings: UserSettings = {
  temperature: 0.7,
  maxTokens: 2000,
  tone: "professional",
  outputFormats: ["markdown"],
  fewShotEnabled: false,
  fewShotCount: 0,
  systemMessageEnabled: false,
  customSystemMessage: "",
};

const defaultQualityScores: QualityScores = {
  input: 0,
  output: 0,
  tokenOptimization: 0,
};

// Helper functions for localStorage
const DATASETS_STORAGE_KEY = "hermes_datasets";
const SUCCESSFUL_PATTERNS_STORAGE_KEY = "hermes_successful_patterns";

const saveDatasetsToStorage = (datasets: Dataset[]) => {
  try {
    localStorage.setItem(DATASETS_STORAGE_KEY, JSON.stringify(datasets));
  } catch (error) {
    console.error("Failed to save datasets to localStorage:", error);
  }
};

const loadDatasetsFromStorageSync = (): Dataset[] => {
  try {
    const stored = localStorage.getItem(DATASETS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      }));
    }
  } catch (error) {
    console.error("Failed to load datasets from localStorage:", error);
  }
  return [];
};

const saveSuccessfulPatternsToStorage = (patterns: SuccessfulPromptPattern[]) => {
  try {
    localStorage.setItem(SUCCESSFUL_PATTERNS_STORAGE_KEY, JSON.stringify(patterns));
  } catch (error) {
    console.error("Failed to save successful patterns to localStorage:", error);
  }
};

const loadSuccessfulPatternsFromStorageSync = (): SuccessfulPromptPattern[] => {
  try {
    const stored = localStorage.getItem(SUCCESSFUL_PATTERNS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((p: any) => ({
        ...p,
        copiedAt: p.copiedAt ? new Date(p.copiedAt) : undefined,
        markedSuccessfulAt: p.markedSuccessfulAt ? new Date(p.markedSuccessfulAt) : undefined,
      }));
    }
  } catch (error) {
    console.error("Failed to load successful patterns from localStorage:", error);
  }
  return [];
};

// Helper to create a hash for prompt comparison
export const createPromptHash = (prompt: string): string => {
  // Simple hash function for prompt matching
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

export const useHermesStore = create<HermesStore>((set, get) => ({
  currentPrompt: "",
  selectedPlatform: null,
  enhancedPrompts: [],
  promptHistory: [],
  settings: defaultSettings,
  qualityScores: defaultQualityScores,
  isAnalyzing: false,
  isEnhancing: false,
  datasets: [],
  selectedDataset: null,
  successfulPromptPatterns: [],

  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  setEnhancedPrompts: (prompts) => set({ enhancedPrompts: prompts }),

  addToHistory: (item) =>
    set((state) => ({
      promptHistory: [item, ...state.promptHistory].slice(0, 50), // Keep last 50
    })),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  setQualityScores: (scores) => set({ qualityScores: scores }),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setIsEnhancing: (isEnhancing) => set({ isEnhancing }),

  toggleFavorite: (id) =>
    set((state) => ({
      promptHistory: state.promptHistory.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ),
    })),

  addDataset: (dataset) =>
    set((state) => {
      const newDatasets = [...state.datasets, dataset];
      saveDatasetsToStorage(newDatasets);
      return { datasets: newDatasets };
    }),

  removeDataset: (id) =>
    set((state) => {
      const newDatasets = state.datasets.filter((d) => d.id !== id);
      saveDatasetsToStorage(newDatasets);
      return {
        datasets: newDatasets,
        selectedDataset: state.selectedDataset?.id === id ? null : state.selectedDataset,
      };
    }),

  setSelectedDataset: (dataset) => set({ selectedDataset: dataset }),

  loadDatasetsFromStorage: () => {
    const datasets = loadDatasetsFromStorageSync();
    set({ datasets });
  },

  addSuccessfulPromptPattern: (pattern: SuccessfulPromptPattern) =>
    set((state) => {
      const newPatterns = [...state.successfulPromptPatterns, pattern];
      saveSuccessfulPatternsToStorage(newPatterns);
      return { successfulPromptPatterns: newPatterns };
    }),

  trackPromptSuccess: (promptId: string, action: "copied" | "marked_successful") => {
    set((state) => {
      const patterns = [...state.successfulPromptPatterns];
      const existingPatternIndex = patterns.findIndex((p) => p.id === promptId);

      if (existingPatternIndex >= 0) {
        // Update existing pattern
        const pattern = patterns[existingPatternIndex];
        if (action === "copied") {
          pattern.wasCopied = true;
          pattern.copiedAt = new Date();
          pattern.useCount += 1;
          pattern.successWeight = Math.min(1, pattern.successWeight + 0.1);
        } else if (action === "marked_successful") {
          pattern.wasMarkedSuccessful = true;
          pattern.markedSuccessfulAt = new Date();
          pattern.successWeight = Math.min(1, pattern.successWeight + 0.3);
        }
        patterns[existingPatternIndex] = pattern;
      }

      saveSuccessfulPatternsToStorage(patterns);
      return { successfulPromptPatterns: patterns };
    });
  },

  loadSuccessfulPatternsFromStorage: () => {
    const patterns = loadSuccessfulPatternsFromStorageSync();
    set({ successfulPromptPatterns: patterns });
  },

  getSuccessfulPatternCount: () => {
    const state = get();
    return state.successfulPromptPatterns.filter(
      (p) => p.wasMarkedSuccessful || p.wasCopied
    ).length;
  },

  getUserPreferenceWeighting: (platformId: string, tone: Tone) => {
    const state = get();
    const relevantPatterns = state.successfulPromptPatterns.filter(
      (p) =>
        p.platformId === platformId &&
        p.tone === tone &&
        (p.wasMarkedSuccessful || p.wasCopied)
    );

    if (relevantPatterns.length === 0) return 0;

    // Calculate average success weight
    const totalWeight = relevantPatterns.reduce(
      (sum, p) => sum + p.successWeight,
      0
    );
    return totalWeight / relevantPatterns.length;
  },
}));
