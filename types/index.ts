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
  // Educational Mode
  learningModeEnabled: boolean;
  showTooltips: boolean;
  showWhyBadges: boolean;
  showPrinciplesSidebar: boolean;
  showRealTimeTips: boolean;
  tipFrequency: "high" | "medium" | "low";
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

// Prompt Pattern Library Types

export type PromptPatternType =
  | "chain-of-thought"
  | "few-shot"
  | "tree-of-thoughts"
  | "react"
  | "constitutional-ai"
  | "zero-shot-cot"
  | "self-consistency"
  | "persona"
  | "instruction-following";

export interface PromptPattern {
  patternId: string;
  patternName: string;
  patternType: PromptPatternType;
  description: string;
  icon: string;
  category: "reasoning" | "examples" | "structure" | "safety" | "persona";
  difficulty: "beginner" | "intermediate" | "advanced";
  applicableIntents: Intent[];
  template: string; // Template with placeholders like {task}, {examples}, {context}
  exampleUsage: string;
  effectivenessScore: number; // 0-100, based on historical data
  benefits: string[];
  bestPractices: string[];
  compatiblePatterns: string[]; // IDs of patterns that work well together
}

export interface PatternApplication {
  pattern: PromptPattern;
  appliedAt: Date;
  appliedPrompt: string;
  resultQuality: number; // User feedback or automatic quality score
  wasSuccessful: boolean;
  platformId: string;
}

export interface PatternCombination {
  combinationId: string;
  combinationName: string;
  patterns: PromptPattern[];
  combinationTemplate: string; // How to combine the patterns
  effectivenessScore: number;
  useCount: number;
  successRate: number;
  applicableIntents: Intent[];
  description: string;
}

export interface PatternBlock {
  blockId: string;
  blockType: PromptPatternType;
  content: string;
  order: number;
  isEnabled: boolean;
}

export interface VisualPatternBuilder {
  builderId: string;
  builderName: string;
  blocks: PatternBlock[];
  compiledPrompt: string;
  createdAt: Date;
  lastModified: Date;
}

// Collaboration & Sharing Types

export interface ShareableLink {
  linkId: string;
  shortCode: string; // 8-character unique code
  promptId: string;
  originalPrompt: string;
  enhancedPrompt: string;
  platform: Platform;
  qualityScore: number;
  improvements: string[];
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  viewCount: number;
  isPublic: boolean;
  allowCopy: boolean;
}

export interface PromptCollection {
  collectionId: string;
  collectionName: string;
  description: string;
  icon: string;
  prompts: EnhancedPrompt[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  exportFormat: "json" | "markdown" | "csv";
}

export interface PromptVersion {
  versionId: string;
  promptId: string;
  versionNumber: number;
  content: string;
  changes: VersionChange[];
  createdAt: Date;
  createdBy: string;
  notes: string;
}

export interface VersionChange {
  changeId: string;
  changeType: "addition" | "deletion" | "modification";
  oldText?: string;
  newText?: string;
  position: number;
  reason: string;
}

export interface PromptComment {
  commentId: string;
  promptId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  editedAt?: Date;
  isResolved: boolean;
  replies: PromptComment[];
}

export interface PromptNote {
  noteId: string;
  promptId: string;
  content: string;
  color: "yellow" | "blue" | "green" | "red" | "purple";
  position?: { start: number; end: number }; // Highlight position in prompt
  createdAt: Date;
  lastModified: Date;
}

// Analytics Types

export interface AnalyticsMetrics {
  totalPrompts: number;
  totalEnhancements: number;
  avgQualityImprovement: number; // Percentage improvement
  totalTokensProcessed: number;
  avgTokensPerPrompt: number;
  timeSaved: number; // Minutes saved
  successRate: number; // 0-1
  mostUsedPlatform: Platform | null;
  mostSuccessfulPattern: string | null;
}

export interface PlatformUsageStats {
  platformId: string;
  platformName: string;
  usageCount: number;
  successRate: number;
  avgQualityScore: number;
  totalTokens: number;
  percentage: number; // Percentage of total usage
}

export interface DailyMetrics {
  date: Date;
  promptCount: number;
  avgQualityImprovement: number;
  tokensUsed: number;
  successCount: number;
}

export interface TimeSeriesData {
  label: string;
  value: number;
  date: Date;
}

export interface AnalyticsInsight {
  insightId: string;
  title: string;
  description: string;
  value: string | number;
  trend: "up" | "down" | "stable";
  icon: string;
  category: "performance" | "usage" | "quality" | "efficiency";
}

export interface AnalyticsReport {
  reportId: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  metrics: AnalyticsMetrics;
  platformStats: PlatformUsageStats[];
  dailyMetrics: DailyMetrics[];
  insights: AnalyticsInsight[];
  topPrompts: EnhancedPrompt[];
}

// ============================================================================
// Decision Tree Enhancement Mode
// ============================================================================

export type DecisionTreePathType =
  | "creative"
  | "technical"
  | "simple"
  | "clarity"
  | "brevity"
  | "detail"
  | "expert"
  | "beginner"
  | "general";

export type DecisionTreeStrategy =
  | "style" // Make it more creative/technical/simple
  | "optimization" // Optimize for clarity/brevity/detail
  | "audience"; // Target audience: expert/beginner/general

export interface DecisionTreePathTemplate {
  templateId: string;
  templateName: string;
  strategy: DecisionTreeStrategy;
  pathType: DecisionTreePathType;
  description: string;
  instructions: string;
  systemPrompt: string;
  examples: string[];
}

export interface DecisionTreeNode {
  nodeId: string;
  level: number; // 0 = root, 1 = first branch, 2 = second branch
  parentNodeId: string | null;
  promptText: string;
  pathTemplate: DecisionTreePathTemplate | null;
  explanation: string;
  qualityScore: number;
  children: DecisionTreeNode[];
  isSelected: boolean;
  generatedAt: Date;
}

export interface DecisionTreePath {
  pathId: string;
  nodes: DecisionTreeNode[];
  strategy: DecisionTreeStrategy;
  pathTypes: DecisionTreePathType[];
  finalPrompt: string;
  totalQualityImprovement: number;
  isSaved: boolean;
  createdAt: Date;
}

export interface SavedDecisionTreeRoute {
  routeId: string;
  routeName: string;
  description: string;
  strategy: DecisionTreeStrategy;
  pathTypes: DecisionTreePathType[];
  templates: DecisionTreePathTemplate[];
  usageCount: number;
  avgQualityImprovement: number;
  createdAt: Date;
  lastUsed: Date;
}

export interface DecisionTreeState {
  isEnabled: boolean;
  currentTree: DecisionTreeNode | null;
  selectedPath: DecisionTreeNode[];
  availableTemplates: DecisionTreePathTemplate[];
  savedRoutes: SavedDecisionTreeRoute[];
}

// ============================================================================
// Educational Mode
// ============================================================================

export type LessonCategory =
  | "token-optimization"
  | "platform-differences"
  | "few-shot-learning"
  | "prompt-injection"
  | "context-management"
  | "quality-metrics"
  | "advanced-patterns"
  | "debugging";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface MiniLesson {
  lessonId: string;
  title: string;
  category: LessonCategory;
  skillLevel: SkillLevel;
  description: string;
  content: string; // Markdown content
  keyTakeaways: string[];
  practicePrompt?: string;
  estimatedMinutes: number;
  prerequisites: string[]; // lessonIds
  relatedLessons: string[]; // lessonIds
}

export interface PromptEngineeringPrinciple {
  principleId: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  examples: {
    bad: string;
    good: string;
    explanation: string;
  }[];
  category: LessonCategory;
  importance: "critical" | "important" | "helpful";
}

export interface EnhancementExplanation {
  explanationId: string;
  changeType: "structure" | "clarity" | "specificity" | "context" | "formatting" | "optimization";
  before: string;
  after: string;
  reason: string;
  principle: string; // principleId
  impact: "high" | "medium" | "low";
  learnMore?: string; // lessonId
}

export interface RealTimeTip {
  tipId: string;
  trigger: "typing" | "pause" | "long-prompt" | "unclear" | "missing-context";
  condition: (prompt: string) => boolean;
  message: string;
  suggestion?: string;
  learnMore?: string; // lessonId
  priority: "high" | "medium" | "low";
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  category: LessonCategory;
  description: string;
  isLearned: boolean;
  learnedAt?: Date;
  practiceCount: number;
  relatedLessons: string[]; // lessonIds
}

export interface LearningProgress {
  userId: string;
  skillsLearned: SkillProgress[];
  lessonsCompleted: string[]; // lessonIds
  totalPracticePrompts: number;
  currentStreak: number; // days
  lastActivityDate: Date;
  achievements: {
    achievementId: string;
    title: string;
    description: string;
    unlockedAt: Date;
  }[];
}

export interface EducationalModeSettings {
  isEnabled: boolean;
  showTooltips: boolean;
  showWhyBadges: boolean;
  showPrinciplesSidebar: boolean;
  showRealTimeTips: boolean;
  autoPlayLessons: boolean;
  tipFrequency: "high" | "medium" | "low";
}

// ============================================================================
// Wizard Interface
// ============================================================================

export type WizardMode = "quick" | "god";

export type WizardStep = "initial" | "enhancements" | "generation" | "complete";

export type RoleType =
  | "writing-assistant"
  | "legal-advisor"
  | "senior-developer"
  | "data-analyst"
  | "marketing-expert"
  | "teacher"
  | "researcher"
  | "consultant"
  | "designer"
  | "custom";

export type ToneStyle =
  | "professional"
  | "casual"
  | "friendly"
  | "authoritative"
  | "empathetic"
  | "humorous"
  | "academic"
  | "creative"
  | "direct"
  | "diplomatic";

export type OutputFormatType =
  | "xml"
  | "markdown"
  | "javascript"
  | "twitter"
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "twitter-thread"
  | "blog-post"
  | "research-paper"
  | "conversational"
  | "spartan"
  | "laconic"
  | "minimalist"
  | "custom";

export interface WizardIdentity {
  role: RoleType;
  customRole?: string;
  additionalRoles: string[];
  expertise: string[];
}

export interface WizardTask {
  mainTask: string;
  context: string;
  background: string;
  specificRequirements: string[];
}

export interface WizardExample {
  exampleId: string;
  input: string;
  output: string;
  explanation?: string;
}

export interface WizardConstraints {
  mustNotDo: string[];
  negativeExamples: string[];
  limitations: string[];
}

export interface WizardOutputConfig {
  format: OutputFormatType;
  customFormat?: string;
  lengthMin?: number;
  lengthMax?: number;
  styleModifiers: string[];
  structureRequirements: string[];
}

export interface QuickModeData {
  initialPrompt: string;
  role?: RoleType;
  customRole?: string;
  tone?: ToneStyle;
  format?: OutputFormatType;
}

export interface GodModeData {
  identity: WizardIdentity;
  task: WizardTask;
  examples: WizardExample[];
  constraints: WizardConstraints;
  outputConfig: WizardOutputConfig;
}

export interface ReasoningTreeNode {
  nodeId: string;
  step: string;
  description: string;
  decision?: string;
  children: ReasoningTreeNode[];
  isActive: boolean;
  isComplete: boolean;
}

export interface WizardState {
  mode: WizardMode | null;
  currentStep: WizardStep;
  quickModeData: QuickModeData;
  godModeData: GodModeData;
  generatedPrompt: string;
  reasoningTree: ReasoningTreeNode | null;
  isGenerating: boolean;
}

export interface WizardTemplate {
  templateId: string;
  templateName: string;
  description: string;
  mode: WizardMode;
  data: QuickModeData | GodModeData;
  createdAt: Date;
  usageCount: number;
}
