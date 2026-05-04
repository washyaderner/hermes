"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuickMode } from "@/components/modes/QuickMode";
import { GodMode } from "@/components/modes/GodMode";
import { InputArea } from "@/components/prompt/InputArea";
import { PlatformSelector } from "@/components/prompt/PlatformSelector";
import { OutputCards } from "@/components/prompt/OutputCards";
import { QualityMeter } from "@/components/prompt/QualityMeter";
import { TokenCounter } from "@/components/prompt/TokenCounter";
import { ControlPanel } from "@/components/prompt/ControlPanel";
import { DatasetManager } from "@/components/prompt/DatasetManager";
import { ImportExportControls } from "@/components/settings/ImportExportControls";
import { useHermesStore, createPromptHash } from "@/lib/store";
import { analyzePrompt } from "@/lib/prompt-engine/analyzer";
import { assembleFromQuickMode, assembleFromGodMode } from "@/lib/prompt-engine/enhancer";
import { Platform, SuccessfulPromptPattern, Tone, PromptHistoryItem } from "@/types";
import { generateId } from "@/lib/utils";
import { useLazyPlatforms } from "@/lib/hooks/useLazyPlatforms";
import { registerServiceWorker } from "@/lib/service-worker/register";
import { BatchMode } from "@/components/batch/BatchMode";
import { ContextSidebar } from "@/components/context/ContextSidebar";
import { mergeContexts } from "@/lib/context/compression";
import { PlatformIntelligence } from "@/components/platform/PlatformIntelligence";
import { PatternLibrary } from "@/components/patterns/PatternLibrary";
import { DecisionTreeMode } from "@/components/decision-tree/DecisionTreeMode";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeMode, setActiveMode] = useState<"single" | "batch" | "tree">("single");
  const [selectedWizardMode, setSelectedWizardMode] = useState<'quick' | 'god' | null>(null);
  const [isContextSidebarOpen, setIsContextSidebarOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [patternEnhancedPrompt, setPatternEnhancedPrompt] = useState<string>("");
  const {
    currentPrompt,
    selectedPlatform,
    setSelectedPlatform,
    enhancedPrompts,
    setEnhancedPrompts,
    qualityScores,
    setQualityScores,
    isAnalyzing,
    isEnhancing,
    setIsAnalyzing,
    setIsEnhancing,
    settings,
    selectedDataset,
    loadDatasetsFromStorage,
    loadSuccessfulPatternsFromStorage,
    successfulPromptPatterns,
    addSuccessfulPromptPattern,
    getUserPreferenceWeighting,
    addPromptHistoryItem,
    loadPromptHistoryFromStorage,
    exportAllDataToJson,
    activeContexts,
    loadContextsFromStorage,
  } = useHermesStore();

  const { platformsData, isLoadingPlatforms, platformLoadError } = useLazyPlatforms();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (!data.authenticated) {
          router.push("/auth/login");
          return;
        }

        setAuthChecked(true);
        registerServiceWorker();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    loadDatasetsFromStorage();
    loadSuccessfulPatternsFromStorage();
    loadPromptHistoryFromStorage();
    loadContextsFromStorage();
  }, [loadDatasetsFromStorage, loadSuccessfulPatternsFromStorage, loadPromptHistoryFromStorage, loadContextsFromStorage]);

  // Analyze prompt in real-time
  useEffect(() => {
    if (currentPrompt.length > 0) {
      setIsAnalyzing(true);
      const analysis = analyzePrompt(currentPrompt);
      setQualityScores({
        input: analysis.qualityScore,
        output: 0,
        tokenOptimization: 0,
      });
      setIsAnalyzing(false);
    } else {
      setQualityScores({ input: 0, output: 0, tokenOptimization: 0 });
    }
  }, [currentPrompt]);

  const handleEnhance = async () => {
    if (!currentPrompt) {
      setError("Enter a prompt first");
      return;
    }

    if (!selectedPlatform) {
      setError("Select a platform");
      return;
    }

    setError("");
    setIsEnhancing(true);

    try {
      const contextText = activeContexts.length > 0 ? mergeContexts(activeContexts) : undefined;
      const isDevelopment = process.env.NODE_ENV === "development";

      let response: Response;
      if (isDevelopment) {
        response = await fetch("/api/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: currentPrompt,
            platformId: selectedPlatform.id,
            tone: settings.tone,
            fewShotCount: settings.fewShotEnabled ? settings.fewShotCount : 0,
            systemMessage: settings.systemMessageEnabled
              ? settings.customSystemMessage
              : undefined,
            variationCount: 3,
            datasetContent: selectedDataset?.content,
            contextText,
          }),
        });
      } else {
        const { fetchWithCsrf } = await import("@/lib/utils/csrf-client");
        response = await fetchWithCsrf("/api/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: currentPrompt,
            platformId: selectedPlatform.id,
            tone: settings.tone,
            fewShotCount: settings.fewShotEnabled ? settings.fewShotCount : 0,
            systemMessage: settings.systemMessageEnabled
              ? settings.customSystemMessage
              : undefined,
            variationCount: 3,
            datasetContent: selectedDataset?.content,
            contextText,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        data.enhancedPrompts.forEach((enhancedPrompt: any) => {
          const { id, original, enhanced, platform, patternMetadata } = enhancedPrompt;

          const successfulPattern: SuccessfulPromptPattern = {
            id,
            promptHash: createPromptHash(original),
            originalPrompt: original,
            enhancedPrompt: enhanced,
            platformId: platform.id,
            enhancementType: patternMetadata.enhancementType,
            tone: patternMetadata.tone as Tone,
            fewShotCount: patternMetadata.fewShotCount,
            wasMarkedSuccessful: false,
            wasCopied: false,
            useCount: 0,
            successWeight: 0,
          };

          addSuccessfulPromptPattern(successfulPattern);
        });

        setEnhancedPrompts(data.enhancedPrompts);

        const historyItem: PromptHistoryItem = {
          promptId: generateId(),
          originalText: currentPrompt,
          enhancedVersions: data.enhancedPrompts,
          platform: selectedPlatform,
          timestamp: new Date(),
          wasSuccessful: false,
        };
        addPromptHistoryItem(historyItem);

        const avgQuality =
          data.enhancedPrompts.reduce(
            (sum: number, p: any) => sum + p.qualityScore,
            0
          ) / data.enhancedPrompts.length;

        const originalTokens = data.originalAnalysis.tokenCount;
        const avgEnhancedTokens =
          data.enhancedPrompts.reduce(
            (sum: number, p: any) => sum + p.tokenCount,
            0
          ) / data.enhancedPrompts.length;
        const optimization =
          ((originalTokens - avgEnhancedTokens) / originalTokens) * 100;

        setQualityScores({
          input: data.originalAnalysis.qualityScore,
          output: avgQuality,
          tokenOptimization: Math.max(0, optimization),
        });
      } else {
        setError(data.error || "Failed to enhance prompt");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Enhancement error:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleQuickExport = () => {
    const jsonData = exportAllDataToJson();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = `hermes-backup-${timestamp}.json`;

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyPattern = (enhancedPrompt: string, patterns: any[]) => {
    setPatternEnhancedPrompt(enhancedPrompt);
  };

  const handleModeSelection = (mode: 'quick' | 'god') => {
    setSelectedWizardMode(mode);
  };

  const handleModeBack = () => {
    setSelectedWizardMode(null);
  };

  const handleQuickGenerate = (data: any) => {
    const assembled = assembleFromQuickMode(data);
    useHermesStore.getState().setCurrentPrompt(assembled);
    setSelectedWizardMode(null);
  };

  const handleGodGenerate = (data: any) => {
    const assembled = assembleFromGodMode(data);
    useHermesStore.getState().setCurrentPrompt(assembled);
    setSelectedWizardMode(null);
  };

  // Keyboard shortcut: Cmd+Enter to enhance
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (currentPrompt && selectedPlatform && !isEnhancing) {
          handleEnhance();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentPrompt, selectedPlatform, isEnhancing]);

  if (selectedWizardMode === 'quick') {
    return <QuickMode onBack={handleModeBack} onGenerate={handleQuickGenerate} />;
  }

  if (selectedWizardMode === 'god') {
    return <GodMode onBack={handleModeBack} onGenerate={handleGodGenerate} />;
  }

  if (!mounted || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Top Navigation */}
      <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-xl font-bold text-foreground cursor-pointer"
              onClick={() => router.push("/")}
            >
              Hermes
            </h1>
            <span className="text-xs text-muted-foreground">Prompt Engineering</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
              History
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
              Templates
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/workflows")}>
              Workflows
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsContextSidebarOpen(!isContextSidebarOpen)}
              className={isContextSidebarOpen ? "bg-primary/10" : ""}
            >
              Context {activeContexts.length > 0 && `(${activeContexts.length})`}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/analytics")}>
              Analytics
            </Button>
            <Button variant="ghost" size="sm" onClick={handleQuickExport} title="Export backup">
              Export
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Mode Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeMode === "single" ? "default" : "outline"}
            onClick={() => setActiveMode("single")}
            size="sm"
          >
            Single
          </Button>
          <Button
            variant={activeMode === "batch" ? "default" : "outline"}
            onClick={() => setActiveMode("batch")}
            size="sm"
          >
            Batch
          </Button>
          <Button
            variant={activeMode === "tree" ? "default" : "outline"}
            onClick={() => setActiveMode("tree")}
            size="sm"
          >
            Decision Tree
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => handleModeSelection('quick')}>
            Quick Wizard
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleModeSelection('god')}>
            God Mode
          </Button>
        </div>

        {activeMode === "batch" ? (
          <BatchMode platforms={platformsData} />
        ) : activeMode === "tree" ? (
          <DecisionTreeMode
            initialPrompt={currentPrompt}
            onPromptChange={(prompt) => {
              useHermesStore.getState().setCurrentPrompt(prompt);
            }}
            onClose={() => setActiveMode("single")}
          />
        ) : (
          <>
            {/* Quality Metrics Strip */}
            <div className="mb-6 flex items-center gap-6 p-4 bg-surface/30 rounded-lg border border-border">
              <QualityMeter score={qualityScores.input} label="Input" size="sm" />
              <span className="text-muted-foreground">{"->"}</span>
              <QualityMeter score={qualityScores.output} label="Output" size="sm" />
              {qualityScores.tokenOptimization > 0 && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <QualityMeter score={qualityScores.tokenOptimization} label="Saved" size="sm" />
                </>
              )}
              <div className="flex-1" />
              <TokenCounter
                text={currentPrompt}
                maxTokens={selectedPlatform?.maxTokens}
                model="gpt-4"
              />
            </div>

            {/* Two-Column Layout: Input | Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Input + Controls */}
              <div className="space-y-4">
                {/* Platform + Enhance in one row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <PlatformSelector platforms={platformsData} />
                  </div>
                  <Button
                    onClick={handleEnhance}
                    disabled={!currentPrompt || !selectedPlatform || isEnhancing}
                    className="h-10 px-6 whitespace-nowrap"
                    variant="accent"
                  >
                    {isEnhancing ? "Optimizing..." : "Enhance"}
                  </Button>
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                    {error}
                  </div>
                )}

                {/* Prompt Input */}
                <InputArea />

                {/* Keyboard hint */}
                <div className="text-xs text-muted-foreground text-right">
                  {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "Cmd" : "Ctrl"}+Enter to enhance
                </div>

                {/* Advanced Controls - Collapsible */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full text-left text-sm text-muted-foreground hover:text-foreground py-2 flex items-center gap-2 transition-colors"
                >
                  <span className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>
                    &#9654;
                  </span>
                  Advanced Settings
                </button>

                {showAdvanced && (
                  <div className="space-y-4 border border-border rounded-lg p-4 bg-surface/20">
                    <ControlPanel />
                    <PlatformIntelligence
                      currentPrompt={currentPrompt}
                      selectedPlatform={selectedPlatform}
                      availablePlatforms={platformsData}
                      onPlatformSelect={setSelectedPlatform}
                    />
                    <PatternLibrary
                      currentPrompt={currentPrompt}
                      detectedIntent={qualityScores.input > 0 ? analyzePrompt(currentPrompt).intent : "unknown"}
                      onApplyPattern={handleApplyPattern}
                    />
                    <DatasetManager />
                    <ImportExportControls />
                  </div>
                )}
              </div>

              {/* Right: Output */}
              <div>
                <div className="sticky top-24">
                  <OutputCards prompts={enhancedPrompts} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Context Sidebar */}
      <ContextSidebar
        isOpen={isContextSidebarOpen}
        onClose={() => setIsContextSidebarOpen(false)}
      />
    </div>
  );
}
