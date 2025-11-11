import { create } from "zustand";
import { HermesStore, UserSettings, QualityScores, Dataset } from "@/types";

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
}));
