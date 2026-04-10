"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeSelection } from "@/components/modes/ModeSelection";
import { QuickMode } from "@/components/modes/QuickMode";
import { GodMode } from "@/components/modes/GodMode";
import { Button } from "@/components/ui/button";
import { useHermesStore } from "@/lib/store";
import { assembleFromQuickMode, assembleFromGodMode } from "@/lib/prompt-engine/enhancer";

export default function Home() {
  const router = useRouter();
  const { setCurrentPrompt } = useHermesStore();
  const [selectedMode, setSelectedMode] = useState<'quick' | 'god' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModeSelection = (mode: 'quick' | 'god') => {
    setSelectedMode(mode);
  };

  const handleModeBack = () => {
    setSelectedMode(null);
  };

  const handleQuickGenerate = (data: any) => {
    const assembled = assembleFromQuickMode(data);
    setCurrentPrompt(assembled);
    router.push("/dashboard");
  };

  const handleGodGenerate = (data: any) => {
    const assembled = assembleFromGodMode(data);
    setCurrentPrompt(assembled);
    router.push("/dashboard");
  };

  if (selectedMode === null) {
    return (
      <div className="relative min-h-screen" suppressHydrationWarning>
        {mounted && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground text-xs bg-black/50 backdrop-blur-sm"
            >
              Advanced Dashboard
            </Button>
          </div>
        )}
        <ModeSelection onSelectMode={handleModeSelection} />
      </div>
    );
  }

  if (selectedMode === 'quick') {
    return <QuickMode onBack={handleModeBack} onGenerate={handleQuickGenerate} />;
  }

  if (selectedMode === 'god') {
    return <GodMode onBack={handleModeBack} onGenerate={handleGodGenerate} />;
  }

  return null;
}
