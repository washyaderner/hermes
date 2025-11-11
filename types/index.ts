// Core types for the Hermes application

export type Intent =
  | "creative"
  | "code"
  | "analysis"
  | "conversation"
  | "data_processing"
  | "instruction"
  | "unknown";

export type Domain =
  | "technical"
  | "business"
  | "academic"
  | "creative"
  | "general";

export type Tone =
  | "professional"
  | "casual"
  | "academic"
  | "spartan"
  | "laconic"
  | "sarcastic";

export type OutputFormat =
  | "markdown"
  | "json"
  | "csv"
  | "bullets"
  | "plain";

export interface Platform {
  id: string;
  name: string;
  icon: string;
  category: string;
  apiFormat: "json" | "xml" | "text";
  maxTokens: number;
  specialRequirements?: string[];
  systemPromptTemplate?: string;
  userPromptTemplate?: string;
  description: string;
}

export interface PromptAnalysis {
  intent: Intent;
  domain: Domain;
  complexity: number; // 1-10
  missingComponents: string[];
  conflicts: string[];
  painPoint: string;
  tokenCount: number;
  qualityScore: number; // 0-100
}

export interface EnhancedPrompt {
  id: string;
  original: string;
  enhanced: string;
  platform: Platform;
  qualityScore: number;
  improvements: string[];
  tokenCount: number;
  createdAt: Date;
}

export interface UserSettings {
  temperature: number;
  maxTokens: number;
  tone: Tone;
  outputFormats: OutputFormat[];
  fewShotEnabled: boolean;
  fewShotCount: number;
  systemMessageEnabled: boolean;
  customSystemMessage: string;
}

export interface QualityScores {
  input: number;
  output: number;
  tokenOptimization: number;
}

export interface HistoryItem {
  id: string;
  original: string;
  enhanced: string;
  platform: Platform;
  qualityScore: number;
  timestamp: Date;
  isFavorite: boolean;
}

export interface PromptHistoryItem {
  promptId: string;
  originalText: string;
  enhancedVersions: EnhancedPrompt[];
  platform: Platform;
  timestamp: Date;
  wasSuccessful: boolean;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  promptTemplate: string;
  platform?: Platform;
  isPublic: boolean;
}

export interface SavedTemplate {
  templateId: string;
  templateName: string;
  promptText: string;
  platform: Platform;
  settings: UserSettings;
  category: string;
  createdAt: Date;
}

export interface Dataset {
  id: string;
  name: string;
  content: string;
  description?: string;
  createdAt: Date;
  tokenCount: number;
}

export interface SuccessfulPromptPattern {
  id: string;
  promptHash: string;
  originalPrompt: string;
  enhancedPrompt: string;
  platformId: string;
  enhancementType: string; // e.g., "conservative", "balanced", "aggressive"
  tone: Tone;
  fewShotCount: number;
  wasMarkedSuccessful: boolean;
  wasCopied: boolean;
  copiedAt?: Date;
  markedSuccessfulAt?: Date;
  useCount: number;
  successWeight: number; // 0-1, higher means more successful
}

// Zustand store interface
export interface HermesStore {
  currentPrompt: string;
  selectedPlatform: Platform | null;
  enhancedPrompts: EnhancedPrompt[];
  promptHistory: HistoryItem[];
  settings: UserSettings;
  qualityScores: QualityScores;
  isAnalyzing: boolean;
  isEnhancing: boolean;
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  successfulPromptPatterns: SuccessfulPromptPattern[];
  promptHistoryItems: PromptHistoryItem[];
  savedTemplates: SavedTemplate[];

  // Actions
  setCurrentPrompt: (prompt: string) => void;
  setSelectedPlatform: (platform: Platform | null) => void;
  setEnhancedPrompts: (prompts: EnhancedPrompt[]) => void;
  addToHistory: (item: HistoryItem) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setQualityScores: (scores: QualityScores) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsEnhancing: (isEnhancing: boolean) => void;
  toggleFavorite: (id: string) => void;
  addDataset: (dataset: Dataset) => void;
  removeDataset: (id: string) => void;
  setSelectedDataset: (dataset: Dataset | null) => void;
  loadDatasetsFromStorage: () => void;
  addSuccessfulPromptPattern: (pattern: SuccessfulPromptPattern) => void;
  trackPromptSuccess: (
    promptId: string,
    action: "copied" | "marked_successful"
  ) => void;
  loadSuccessfulPatternsFromStorage: () => void;
  getSuccessfulPatternCount: () => number;
  getUserPreferenceWeighting: (
    platformId: string,
    tone: Tone
  ) => number;
  addPromptHistoryItem: (item: PromptHistoryItem) => void;
  loadPromptHistoryFromStorage: () => void;
  deletePromptHistoryItem: (promptId: string) => void;
  addSavedTemplate: (template: SavedTemplate) => void;
  loadSavedTemplatesFromStorage: () => void;
  deleteSavedTemplate: (templateId: string) => void;
  loadTemplateIntoDashboard: (template: SavedTemplate) => void;
  exportAllDataToJson: () => string;
  importDataFromJson: (jsonData: string, mergeMode: boolean) => { success: boolean; message: string; itemsImported: number };
}

export interface ExportDataStructure {
  version: string;
  exportedAt: Date;
  datasets: Dataset[];
  savedTemplates: SavedTemplate[];
  promptHistoryItems: PromptHistoryItem[];
  successfulPromptPatterns: SuccessfulPromptPattern[];
  settings: UserSettings;
}
