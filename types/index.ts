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

export interface Template {
  id: string;
  name: string;
  category: string;
  promptTemplate: string;
  platform?: Platform;
  isPublic: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  content: string;
  description?: string;
  createdAt: Date;
  tokenCount: number;
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
}
