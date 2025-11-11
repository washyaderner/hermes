import { create } from "zustand";
import { HermesStore, UserSettings, QualityScores, Dataset, SuccessfulPromptPattern, Tone, PromptHistoryItem, SavedTemplate, ExportDataStructure, Context } from "@/types";

const defaultSettings: UserSettings = {
  temperature: 0.7,
  maxTokens: 2000,
  tone: "professional",
  outputFormats: ["markdown"],
  fewShotEnabled: false,
  fewShotCount: 0,
  systemMessageEnabled: false,
  customSystemMessage: "",
  // Educational Mode defaults
  learningModeEnabled: false,
  showTooltips: true,
  showWhyBadges: true,
  showPrinciplesSidebar: true,
  showRealTimeTips: true,
  tipFrequency: "medium",
  // Security Layer defaults
  securityScanningEnabled: true,
  autoSanitize: true,
  securityBlockLevel: "high",
  showSecurityWarnings: true,
  securityStrictMode: false,
};

const defaultQualityScores: QualityScores = {
  input: 0,
  output: 0,
  tokenOptimization: 0,
};

// Helper functions for localStorage
const DATASETS_STORAGE_KEY = "hermes_datasets";
const SUCCESSFUL_PATTERNS_STORAGE_KEY = "hermes_successful_patterns";
const PROMPT_HISTORY_STORAGE_KEY = "hermes_prompt_history";
const SAVED_TEMPLATES_STORAGE_KEY = "hermes_saved_templates";
const CONTEXTS_STORAGE_KEY = "hermes_contexts";

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

const savePromptHistoryToStorage = (items: PromptHistoryItem[]) => {
  try {
    localStorage.setItem(PROMPT_HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save prompt history to localStorage:", error);
  }
};

const loadPromptHistoryFromStorageSync = (): PromptHistoryItem[] => {
  try {
    const stored = localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        enhancedVersions: item.enhancedVersions.map((ev: any) => ({
          ...ev,
          createdAt: new Date(ev.createdAt),
        })),
      }));
    }
  } catch (error) {
    console.error("Failed to load prompt history from localStorage:", error);
  }
  return [];
};

const saveSavedTemplatesToStorage = (templates: SavedTemplate[]) => {
  try {
    localStorage.setItem(SAVED_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Failed to save templates to localStorage:", error);
  }
};

const loadSavedTemplatesFromStorageSync = (): SavedTemplate[] => {
  try {
    const stored = localStorage.getItem(SAVED_TEMPLATES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
      }));
    }
  } catch (error) {
    console.error("Failed to load templates from localStorage:", error);
  }
  return [];
};

const saveContextsToStorage = (contexts: Context[]) => {
  try {
    localStorage.setItem(CONTEXTS_STORAGE_KEY, JSON.stringify(contexts));
  } catch (error) {
    console.error("Failed to save contexts to localStorage:", error);
  }
};

const loadContextsFromStorageSync = (): Context[] => {
  try {
    const stored = localStorage.getItem(CONTEXTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((context: any) => ({
        ...context,
        createdAt: new Date(context.createdAt),
        lastUsedAt: new Date(context.lastUsedAt),
      }));
    }
  } catch (error) {
    console.error("Failed to load contexts from localStorage:", error);
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
  promptHistoryItems: [],
  savedTemplates: [],
  contexts: [],
  activeContexts: [],
  projectContext: null,
  sessionContext: null,

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

  addPromptHistoryItem: (item: PromptHistoryItem) =>
    set((state) => {
      const newHistory = [item, ...state.promptHistoryItems].slice(0, 20); // Keep last 20
      savePromptHistoryToStorage(newHistory);
      return { promptHistoryItems: newHistory };
    }),

  loadPromptHistoryFromStorage: () => {
    const items = loadPromptHistoryFromStorageSync();
    set({ promptHistoryItems: items });
  },

  deletePromptHistoryItem: (promptId: string) =>
    set((state) => {
      const newHistory = state.promptHistoryItems.filter((item) => item.promptId !== promptId);
      savePromptHistoryToStorage(newHistory);
      return { promptHistoryItems: newHistory };
    }),

  addSavedTemplate: (template: SavedTemplate) =>
    set((state) => {
      const newTemplates = [template, ...state.savedTemplates];
      saveSavedTemplatesToStorage(newTemplates);
      return { savedTemplates: newTemplates };
    }),

  loadSavedTemplatesFromStorage: () => {
    const templates = loadSavedTemplatesFromStorageSync();
    set({ savedTemplates: templates });
  },

  deleteSavedTemplate: (templateId: string) =>
    set((state) => {
      const newTemplates = state.savedTemplates.filter((t) => t.templateId !== templateId);
      saveSavedTemplatesToStorage(newTemplates);
      return { savedTemplates: newTemplates };
    }),

  loadTemplateIntoDashboard: (template: SavedTemplate) => {
    set({
      currentPrompt: template.promptText,
      selectedPlatform: template.platform,
      settings: template.settings,
    });
  },

  exportAllDataToJson: () => {
    const state = get();
    const exportDataStructure: ExportDataStructure = {
      version: "1.0.0",
      exportedAt: new Date(),
      datasets: state.datasets,
      savedTemplates: state.savedTemplates,
      promptHistoryItems: state.promptHistoryItems,
      successfulPromptPatterns: state.successfulPromptPatterns,
      settings: state.settings,
    };
    return JSON.stringify(exportDataStructure, null, 2);
  },

  importDataFromJson: (jsonData: string, mergeMode: boolean) => {
    try {
      const parsedData = JSON.parse(jsonData);

      // Validate backup integrity in parallel
      const validationChecks = [
        typeof parsedData.version === "string",
        Array.isArray(parsedData.datasets),
        Array.isArray(parsedData.savedTemplates),
        Array.isArray(parsedData.promptHistoryItems),
        Array.isArray(parsedData.successfulPromptPatterns),
        typeof parsedData.settings === "object",
      ];

      const validateBackupIntegrity = validationChecks.every((check) => check === true);

      if (!validateBackupIntegrity) {
        return {
          success: false,
          message: "Invalid backup file format",
          itemsImported: 0,
        };
      }

      // Convert date strings back to Date objects
      const importedData: ExportDataStructure = {
        ...parsedData,
        exportedAt: new Date(parsedData.exportedAt),
        datasets: parsedData.datasets.map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt),
        })),
        savedTemplates: parsedData.savedTemplates.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        })),
        promptHistoryItems: parsedData.promptHistoryItems.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
          enhancedVersions: h.enhancedVersions.map((ev: any) => ({
            ...ev,
            createdAt: new Date(ev.createdAt),
          })),
        })),
        successfulPromptPatterns: parsedData.successfulPromptPatterns.map((p: any) => ({
          ...p,
          copiedAt: p.copiedAt ? new Date(p.copiedAt) : undefined,
          markedSuccessfulAt: p.markedSuccessfulAt ? new Date(p.markedSuccessfulAt) : undefined,
        })),
      };

      let itemsImported = 0;

      if (mergeMode) {
        // Merge imported data with existing data
        set((state) => {
          const mergedDatasets = [...state.datasets];
          importedData.datasets.forEach((dataset) => {
            if (!mergedDatasets.find((d) => d.id === dataset.id)) {
              mergedDatasets.push(dataset);
              itemsImported++;
            }
          });

          const mergedTemplates = [...state.savedTemplates];
          importedData.savedTemplates.forEach((template) => {
            if (!mergedTemplates.find((t) => t.templateId === template.templateId)) {
              mergedTemplates.push(template);
              itemsImported++;
            }
          });

          const mergedHistory = [...state.promptHistoryItems];
          importedData.promptHistoryItems.forEach((item) => {
            if (!mergedHistory.find((h) => h.promptId === item.promptId)) {
              mergedHistory.push(item);
              itemsImported++;
            }
          });

          const mergedPatterns = [...state.successfulPromptPatterns];
          importedData.successfulPromptPatterns.forEach((pattern) => {
            if (!mergedPatterns.find((p) => p.id === pattern.id)) {
              mergedPatterns.push(pattern);
              itemsImported++;
            }
          });

          // Save to localStorage
          saveDatasetsToStorage(mergedDatasets);
          saveSavedTemplatesToStorage(mergedTemplates);
          savePromptHistoryToStorage(mergedHistory.slice(0, 20));
          saveSuccessfulPatternsToStorage(mergedPatterns);

          return {
            datasets: mergedDatasets,
            savedTemplates: mergedTemplates,
            promptHistoryItems: mergedHistory.slice(0, 20),
            successfulPromptPatterns: mergedPatterns,
            settings: { ...state.settings, ...importedData.settings },
          };
        });
      } else {
        // Replace all data with imported data
        itemsImported =
          importedData.datasets.length +
          importedData.savedTemplates.length +
          importedData.promptHistoryItems.length +
          importedData.successfulPromptPatterns.length;

        saveDatasetsToStorage(importedData.datasets);
        saveSavedTemplatesToStorage(importedData.savedTemplates);
        savePromptHistoryToStorage(importedData.promptHistoryItems.slice(0, 20));
        saveSuccessfulPatternsToStorage(importedData.successfulPromptPatterns);

        set({
          datasets: importedData.datasets,
          savedTemplates: importedData.savedTemplates,
          promptHistoryItems: importedData.promptHistoryItems.slice(0, 20),
          successfulPromptPatterns: importedData.successfulPromptPatterns,
          settings: importedData.settings,
        });
      }

      return {
        success: true,
        message: mergeMode ? "Data merged successfully" : "Data restored successfully",
        itemsImported,
      };
    } catch (error) {
      console.error("Error importing data:", error);
      return {
        success: false,
        message: "Failed to parse backup file",
        itemsImported: 0,
      };
    }
  },

  addContext: (context: Context) =>
    set((state) => {
      const newContexts = [...state.contexts, context];
      saveContextsToStorage(newContexts);
      return { contexts: newContexts };
    }),

  removeContext: (contextId: string) =>
    set((state) => {
      const newContexts = state.contexts.filter((c) => c.contextId !== contextId);
      saveContextsToStorage(newContexts);
      return { contexts: newContexts };
    }),

  updateContext: (contextId: string, updates: Partial<Context>) =>
    set((state) => {
      const newContexts = state.contexts.map((c) =>
        c.contextId === contextId ? { ...c, ...updates } : c
      );
      saveContextsToStorage(newContexts);
      return { contexts: newContexts };
    }),

  setActiveContexts: (contextIds: string[]) =>
    set((state) => {
      const activeContexts = state.contexts.filter((c) => contextIds.includes(c.contextId));
      return { activeContexts };
    }),

  setProjectContext: (context: Context | null) =>
    set({ projectContext: context }),

  setSessionContext: (context: Context | null) =>
    set({ sessionContext: context }),

  loadContextsFromStorage: () => {
    const contexts = loadContextsFromStorageSync();
    const projectContext = contexts.find((c) => c.contextType === "project") || null;
    const sessionContext = contexts.find((c) => c.contextType === "session") || null;
    set({ contexts, projectContext, sessionContext });
  },

  clearSessionContext: () =>
    set((state) => {
      const newContexts = state.contexts.filter((c) => c.contextType !== "session");
      saveContextsToStorage(newContexts);
      return {
        contexts: newContexts,
        sessionContext: null,
        activeContexts: state.activeContexts.filter((c) => c.contextType !== "session"),
      };
    }),
}));
