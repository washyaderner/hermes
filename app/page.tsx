"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeSelection } from "@/components/modes/ModeSelection";
import { QuickMode } from "@/components/modes/QuickMode";
import { GodMode } from "@/components/modes/GodMode";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'quick' | 'god' | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModeSelection = (mode: 'quick' | 'god') => {
    setSelectedMode(mode);
  };

  const handleModeBack = () => {
    setSelectedMode(null);
  };

  const handleGenerate = (data: any) => {
    // After generation, navigate to dashboard with the generated prompt
    // You can pass data via query params or state if needed
    router.push("/dashboard");
  };

  // Show mode selection as the main landing page
  if (selectedMode === null) {
    return (
      <div className="relative min-h-screen" suppressHydrationWarning>
        {/* Small link to access dashboard - tucked away in top corner */}
        {mounted && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground text-xs bg-black/50 backdrop-blur-sm"
            >
              Advanced Dashboard →
            </Button>
          </div>
        )}
        <ModeSelection onSelectMode={handleModeSelection} />
      </div>
    );
  }

  // Show Quick Mode wizard
  if (selectedMode === 'quick') {
    return <QuickMode onBack={handleModeBack} onGenerate={handleGenerate} />;
  }

  // Show God Mode wizard
  if (selectedMode === 'god') {
    return <GodMode onBack={handleModeBack} onGenerate={handleGenerate} />;
  }

  return null;
}
