"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MobileNavigationDrawer } from "@/components/mobile/MobileNavigationDrawer";
import { PWAInstallBanner } from "@/components/mobile/PWAInstallBanner";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
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
  const [activeMode, setActiveMode] = useState<"single" | "batch" | "tree">("single");
  const [isContextSidebarOpen, setIsContextSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<"input" | "output">("input");
  const [patternEnhancedPrompt, setPatternEnhancedPrompt] = useState<string>("");
  const { isMobile, isTablet, deviceType } = useDeviceDetection();
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

  // Use lazy loading hook for platforms
  const { platformsData, isLoadingPlatforms, platformLoadError } = useLazyPlatforms();
  const [error, setError] = useState<string>("");

  // Check authentication and register service worker
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("hermes_auth");
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Register service worker for offline capability
    registerServiceWorker();
  }, [router]);

  // Load datasets and patterns from localStorage
  useEffect(() => {
    loadDatasetsFromStorage();
    loadSuccessfulPatternsFromStorage();
    loadPromptHistoryFromStorage();

    // Load contexts from localStorage
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

  // Handle enhance
  const handleEnhance = async () => {
    if (!currentPrompt) {
      setError("Please enter a prompt first");
      return;
    }

    if (!selectedPlatform) {
      setError("Please select a platform");
      return;
    }

    setError("");
    setIsEnhancing(true);

    try {
      // Merge active contexts for prompt enhancement
      const contextText = activeContexts.length > 0 ? mergeContexts(activeContexts) : undefined;

      const response = await fetch("/api/enhance", {
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

      const data = await response.json();

      if (data.success) {
        // Store successful prompt patterns for each variation
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

        // Save to history
        const historyItem: PromptHistoryItem = {
          promptId: generateId(),
          originalText: currentPrompt,
          enhancedVersions: data.enhancedPrompts,
          platform: selectedPlatform,
          timestamp: new Date(),
          wasSuccessful: false,
        };
        addPromptHistoryItem(historyItem);

        // Calculate average output quality
        const avgQuality =
          data.enhancedPrompts.reduce(
            (sum: number, p: any) => sum + p.qualityScore,
            0
          ) / data.enhancedPrompts.length;

        // Calculate token optimization
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

  const handleLogout = () => {
    localStorage.removeItem("hermes_auth");
    localStorage.removeItem("hermes_user");
    router.push("/auth/login");
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
    // Optionally update the current prompt with pattern-enhanced version
    // Or show it in a preview
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface">
      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Top Navigation */}
      <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for Mobile */}
            {(isMobile || isTablet) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <span className="text-2xl">☰</span>
              </Button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Hermes
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Prompt Optimization Platform
              </p>
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
              📜 History
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
              📋 Templates
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/workflows")}>
              🔗 Workflows
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsContextSidebarOpen(!isContextSidebarOpen)}
              title="Context Manager"
              className={isContextSidebarOpen ? "bg-primary/10" : ""}
            >
              🧠 Context {activeContexts.length > 0 && `(${activeContexts.length})`}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/analytics")}>
              📊 Analytics
            </Button>
            <Button variant="ghost" size="sm" onClick={handleQuickExport} title="Export backup">
              💾 Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              🚪 Logout
            </Button>
          </div>
          {/* Mobile Quick Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsContextSidebarOpen(!isContextSidebarOpen)}
              title="Context Manager"
            >
              🧠
            </Button>
            <Button variant="ghost" size="sm" onClick={handleQuickExport} title="Export">
              💾
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mode Tabs */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
          <Button
            variant={activeMode === "single" ? "default" : "outline"}
            onClick={() => setActiveMode("single")}
            className="flex-1 touch-manipulation"
          >
            <span className="hidden sm:inline">✨ Single Mode</span>
            <span className="sm:hidden">✨ Single</span>
          </Button>
          <Button
            variant={activeMode === "batch" ? "default" : "outline"}
            onClick={() => setActiveMode("batch")}
            className="flex-1 touch-manipulation"
          >
            <span className="hidden sm:inline">📦 Batch Mode</span>
            <span className="sm:hidden">📦 Batch</span>
          </Button>
          <Button
            variant={activeMode === "tree" ? "default" : "outline"}
            onClick={() => setActiveMode("tree")}
            className="flex-1 touch-manipulation"
          >
            <span className="hidden sm:inline">🌳 Decision Tree</span>
            <span className="sm:hidden">🌳 Tree</span>
          </Button>
        </div>

        {activeMode === "batch" ? (
          <BatchMode platforms={platformsData} />
        ) : activeMode === "tree" ? (
          <DecisionTreeMode
            initialPrompt={currentPrompt}
            onPromptChange={(prompt) => {
              // Update the current prompt in the store
              const event = { target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>;
              const textarea = document.querySelector('textarea[placeholder*="Enter your prompt"]') as HTMLTextAreaElement;
              if (textarea) {
                textarea.value = prompt;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
            onClose={() => setActiveMode("single")}
          />
        ) : (
          <>
        {/* Quality Metrics Bar */}
        <Card className="mb-4 sm:mb-6 border-primary/20">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <QualityMeter
                  score={qualityScores.input}
                  label="Input"
                  size={isMobile ? "sm" : "md"}
                />
                <div className="text-2xl sm:text-4xl text-muted-foreground">→</div>
                <QualityMeter
                  score={qualityScores.output}
                  label="Output"
                  size={isMobile ? "sm" : "md"}
                />
                {qualityScores.tokenOptimization > 0 && (
                  <>
                    <div className="text-2xl sm:text-4xl text-muted-foreground">•</div>
                    <QualityMeter
                      score={qualityScores.tokenOptimization}
                      label="Saved"
                      size={isMobile ? "sm" : "md"}
                    />
                  </>
                )}
              </div>
              <div className="flex-1 w-full sm:max-w-md">
                <TokenCounter
                  text={currentPrompt}
                  maxTokens={selectedPlatform?.maxTokens}
                  model="gpt-4"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Mobile Panel Switcher */}
        {(isMobile || isTablet) && (
          <div className="mb-4 flex gap-2 lg:hidden">
            <Button
              variant={activeMobilePanel === "input" ? "default" : "outline"}
              onClick={() => setActiveMobilePanel("input")}
              className="flex-1 touch-manipulation"
            >
              📝 Input & Settings
            </Button>
            <Button
              variant={activeMobilePanel === "output" ? "default" : "outline"}
              onClick={() => setActiveMobilePanel("output")}
              className="flex-1 touch-manipulation"
            >
              ✨ Results
            </Button>
          </div>
        )}

        {/* Main Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Side - Settings (Hidden on mobile when output panel active) */}
          <div className={`lg:col-span-1 space-y-4 sm:space-y-6 ${
            (isMobile || isTablet) && activeMobilePanel === "output" ? "hidden lg:block" : ""
          }`}>
            <PlatformSelector platforms={platformsData} />
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
            <ControlPanel />
            <Button
              onClick={handleEnhance}
              disabled={!currentPrompt || !selectedPlatform || isEnhancing}
              className="w-full h-12 text-lg touch-manipulation"
              variant="accent"
            >
              {isEnhancing ? "✨ Optimizing..." : "✨ Optimize Prompt"}
            </Button>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                {error}
              </div>
            )}
          </div>

          {/* Middle - Input Area (Hidden on mobile when output panel active) */}
          <div className={`lg:col-span-1 ${
            (isMobile || isTablet) && activeMobilePanel === "output" ? "hidden lg:block" : ""
          }`}>
            <InputArea />
          </div>

          {/* Right Side - Output (Hidden on mobile when input panel active) */}
          <div className={`lg:col-span-1 ${
            (isMobile || isTablet) && activeMobilePanel === "input" ? "hidden lg:block" : ""
          }`}>
            <div className="lg:sticky lg:top-24">
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
