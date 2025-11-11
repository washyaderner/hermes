import { create } from "zustand";
import { HermesStore, UserSettings, QualityScores } from "@/types";

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

export const useHermesStore = create<HermesStore>((set) => ({
  currentPrompt: "",
  selectedPlatform: null,
  enhancedPrompts: [],
  promptHistory: [],
  settings: defaultSettings,
  qualityScores: defaultQualityScores,
  isAnalyzing: false,
  isEnhancing: false,

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
}));
