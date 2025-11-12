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
  contexts: Context[];
  activeContexts: Context[]; // Currently active contexts that will be included in prompts
  projectContext: Context | null; // Persistent project context
  sessionContext: Context | null; // Current session context

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
  addContext: (context: Context) => void;
  removeContext: (contextId: string) => void;
  updateContext: (contextId: string, updates: Partial<Context>) => void;
  setActiveContexts: (contextIds: string[]) => void;
  setProjectContext: (context: Context | null) => void;
  setSessionContext: (context: Context | null) => void;
  loadContextsFromStorage: () => void;
  clearSessionContext: () => void;
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

// Workflow and Prompt Chaining Types

export type WorkflowStepType = "prompt" | "transform" | "condition";

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  stepType: WorkflowStepType;
  platform: Platform;
  promptTemplate: string;
  useOutputFromStep?: number; // Reference to previous step (1-based)
  transformationType?: "summarize" | "expand" | "rephrase" | "extract" | "none";
  conditionCheck?: string;
  description: string;
}

export interface Workflow {
  id: string;
  workflowName: string;
  workflowDescription: string;
  category: string;
  steps: WorkflowStep[];
  isBuiltIn: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  useCount: number;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  startedAt: Date;
  completedAt?: Date;
  currentStepNumber: number;
  stepResults: WorkflowStepResult[];
  status: "running" | "completed" | "failed" | "paused";
  errorMessage?: string;
}

export interface WorkflowStepResult {
  stepId: string;
  stepNumber: number;
  inputPrompt: string;
  outputResult: string;
  platform: Platform;
  tokenCount: number;
  executedAt: Date;
  executionTimeMs: number;
}

export interface WorkflowTemplate {
  templateId: string;
  templateName: string;
  templateDescription: string;
  category: string;
  steps: Omit<WorkflowStep, "id">[];
  icon: string;
  useCases: string[];
}

// Batch Processing Types

export type BatchProcessingMode = "single-platform" | "rotate-platforms";

export interface BatchPromptItem {
  id: string;
  originalPrompt: string;
  variables?: Record<string, string>;
  rowNumber: number;
}

export interface BatchProcessingResult {
  id: string;
  originalPrompt: string;
  enhancedPrompt: string;
  platform: Platform;
  qualityScore: number;
  tokenCount: number;
  processedAt: Date;
  processingTimeMs: number;
  rowNumber: number;
  variables?: Record<string, string>;
}

export interface BatchJob {
  jobId: string;
  jobName: string;
  totalPrompts: number;
  processedCount: number;
  failedCount: number;
  mode: BatchProcessingMode;
  platforms: Platform[];
  currentPlatformIndex: number;
  status: "queued" | "processing" | "paused" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  results: BatchProcessingResult[];
  errors: Array<{
    promptId: string;
    rowNumber: number;
    error: string;
  }>;
}

export interface BatchTemplate {
  templateId: string;
  templateName: string;
  templateDescription: string;
  category: string;
  icon: string;
  basePromptTemplate: string;
  requiredVariables: string[];
  exampleCsv: string;
  useCases: string[];
}

// Context Management Types

export type ContextType = "project" | "session" | "preset";

export type ContextTemplateType = "codebase" | "brand-voice" | "academic" | "custom";

export interface ContextField {
  fieldId: string;
  fieldName: string;
  fieldValue: string;
  isRequired: boolean;
  placeholder: string;
  tokenWeight: number; // How important this field is for context (0-1)
}

export interface ContextTemplate {
  templateId: string;
  templateName: string;
  templateType: ContextTemplateType;
  description: string;
  icon: string;
  fields: ContextField[];
  compressedFormat: string; // Template for token-efficient formatting
  exampleContext: string;
  applicableIntents: Intent[]; // When to suggest this template
}

export interface Context {
  contextId: string;
  contextType: ContextType;
  templateId: string;
  templateName: string;
  fields: Record<string, string>; // fieldId -> value
  compressedText: string; // Token-optimized version
  rawText: string; // Full version
  tokenCount: number;
  createdAt: Date;
  lastUsedAt: Date;
  useCount: number;
  isPersistent: boolean; // Project context persists, session doesn't
}

export interface ContextDetection {
  detectedIntent: Intent;
  suggestedTemplates: ContextTemplate[];
  detectedKeywords: string[];
  confidence: number; // 0-1
  reasoning: string;
  missingContextFields: string[];
}

export interface ContextPreset {
  presetId: string;
  presetName: string;
  description: string;
  icon: string;
  contextTemplate: ContextTemplate;
  prefilledValues: Record<string, string>;
  quickApply: boolean;
}

// Platform Intelligence Types

export type PlatformFeature =
  | "xml-tags"
  | "json-mode"
  | "function-calling"
  | "thinking-tags"
  | "code-execution"
  | "image-generation"
  | "vision"
  | "web-search"
  | "file-uploads"
  | "streaming"
  | "system-prompts"
  | "temperature-control";

export type PlatformStrength =
  | "creative-writing"
  | "code-generation"
  | "data-analysis"
  | "image-generation"
  | "conversation"
  | "reasoning"
  | "speed"
  | "cost-efficiency";

export interface PlatformCapability {
  platformId: string;
  supportedFeatures: PlatformFeature[];
  strengths: PlatformStrength[];
  limitations: string[];
  maxContextWindow: number;
  costPer1kTokens: number; // in USD
  avgResponseTime: number; // in seconds
  reliabilityScore: number; // 0-100
}

export interface PlatformOptimization {
  platformId: string;
  platformName: string;
  optimizationRules: {
    useXmlTags?: boolean;
    useJsonMode?: boolean;
    useThinkingTags?: boolean;
    includeSystemPrompt?: boolean;
    preferredTone?: Tone[];
    maxPromptLength?: number;
    specialFormatting?: string;
    examplePromptStructure?: string;
  };
  bestPractices: string[];
  avoidPatterns: string[];
}

export interface PlatformRecommendation {
  platform: Platform;
  score: number; // 0-100
  reasoning: string[];
  costEstimate: number;
  estimatedResponseTime: number;
  strengths: string[];
  warnings: string[];
  isRecommended: boolean;
}

export interface RoutingAnalysis {
  originalPrompt: string;
  detectedIntent: Intent;
  recommendations: PlatformRecommendation[];
  bestMatch: Platform;
  cheapestOption: Platform;
  fastestOption: Platform;
  analysisConfidence: number; // 0-1
}
