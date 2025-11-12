"use client";

import { useState } from "react";
import { WizardMode, WizardStep, QuickModeData, GodModeData, ReasoningTreeNode } from "@/types";
import { ModeSelector } from "./ModeSelector";
import { QuickModeWizard } from "./QuickModeWizard";
import { GodModeWizard } from "./GodModeWizard";
import { ReasoningTreeViz } from "./ReasoningTreeViz";
import { generateFromQuickMode, generateFromGodMode } from "@/lib/wizard/prompt-generator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface WizardInterfaceProps {
  onComplete: (generatedPrompt: string) => void;
  onClose: () => void;
}

export function WizardInterface({ onComplete, onClose }: WizardInterfaceProps) {
  const [mode, setMode] = useState<WizardMode | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>("initial");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [reasoningTree, setReasoningTree] = useState<ReasoningTreeNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle mode selection
  const handleModeSelect = (selectedMode: WizardMode) => {
    setMode(selectedMode);
    setCurrentStep("initial");
  };

  // Handle back to mode selection
  const handleBackToModes = () => {
    setMode(null);
    setCurrentStep("initial");
    setGeneratedPrompt("");
    setReasoningTree(null);
  };

  // Handle Quick Mode generation
  const handleQuickModeGenerate = async (data: QuickModeData) => {
    setIsGenerating(true);
    setCurrentStep("generation");

    // Simulate processing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { prompt, reasoningTree: tree } = generateFromQuickMode(data);

    setReasoningTree(tree);
    setGeneratedPrompt(prompt);

    // Simulate progressive reasoning
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setCurrentStep("complete");
    setIsGenerating(false);
  };

  // Handle God Mode generation
  const handleGodModeGenerate = async (data: GodModeData) => {
    setIsGenerating(true);
    setCurrentStep("generation");

    // Simulate processing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { prompt, reasoningTree: tree } = generateFromGodMode(data);

    setReasoningTree(tree);
    setGeneratedPrompt(prompt);

    // Simulate progressive reasoning
    await new Promise((resolve) => setTimeout(resolve, 4000));

    setCurrentStep("complete");
    setIsGenerating(false);
  };

  // Handle using the generated prompt
  const handleUsePrompt = () => {
    onComplete(generatedPrompt);
    onClose();
  };

  // Render mode selection screen
  if (!mode) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <ModeSelector onSelectMode={handleModeSelect} />
      </div>
    );
  }

  // Render generation/complete screen
  if (currentStep === "generation" || currentStep === "complete") {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Button variant="outline" onClick={handleBackToModes}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mode Selection
          </Button>
        </div>

        <ReasoningTreeViz tree={reasoningTree} finalPrompt={generatedPrompt} />

        {currentStep === "complete" && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button variant="outline" onClick={handleBackToModes}>
              Start Over
            </Button>
            <Button onClick={handleUsePrompt} size="lg" className="min-w-[200px]">
              Use This Prompt
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render Quick Mode wizard
  if (mode === "quick") {
    return (
      <div className="relative">
        <QuickModeWizard onBack={handleBackToModes} onGenerate={handleQuickModeGenerate} />
      </div>
    );
  }

  // Render God Mode wizard
  if (mode === "god") {
    return (
      <div className="relative">
        <GodModeWizard onBack={handleBackToModes} onGenerate={handleGodModeGenerate} />
      </div>
    );
  }

  return null;
}
