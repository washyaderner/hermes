"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardMode } from "@/types";
import { Zap, Settings2, ArrowRight } from "lucide-react";

interface ModeSelectorProps {
  onSelectMode: (mode: WizardMode) => void;
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-surface">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Prompt Wizard
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your crafting style
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Mode Card */}
          <Card
            className="group relative overflow-hidden border-2 hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105"
            onClick={() => onSelectMode("quick")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardContent className="p-8 relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-2xl font-bold mb-3">Quick Mode</h2>
              <p className="text-muted-foreground mb-6">
                Fast, guided prompt creation. Perfect for getting started quickly with
                smart defaults and step-by-step guidance.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>3-step process</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Smart suggestions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Best for beginners</span>
                </div>
              </div>

              <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Start Quick Mode
              </Button>
            </CardContent>
          </Card>

          {/* God Mode Card */}
          <Card
            className="group relative overflow-hidden border-2 hover:border-accent transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105"
            onClick={() => onSelectMode("god")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardContent className="p-8 relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Settings2 className="h-8 w-8 text-accent" />
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-2xl font-bold mb-3">God Mode</h2>
              <p className="text-muted-foreground mb-6">
                Full control over every aspect. Advanced controls for power users who
                want complete customization and precision.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>Complete customization</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>Advanced controls</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>Best for experts</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent"
              >
                Enter God Mode
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Not sure which to choose?{" "}
            <span className="font-semibold">Quick Mode</span> is perfect for most needs,
            while <span className="font-semibold">God Mode</span> gives you maximum control.
          </p>
        </div>
      </div>
    </div>
  );
}
