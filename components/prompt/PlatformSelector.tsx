"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/ui/select";
import { useHermesStore } from "@/lib/store";
import { Platform } from "@/types";
import { getAllCategories } from "@/lib/prompt-engine/platforms";

interface PlatformSelectorProps {
  platforms: Platform[];
}

export function PlatformSelector({ platforms }: PlatformSelectorProps) {
  const { selectedPlatform, setSelectedPlatform } = useHermesStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const categories = getAllCategories();

  const filteredPlatforms =
    selectedCategory === "all"
      ? platforms
      : platforms.filter((p) => p.category === selectedCategory);

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const platform = platforms.find((p) => p.id === e.target.value);
    setSelectedPlatform(platform || null);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Category
        </label>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full"
        >
          <option value="all">All Platforms ({platforms.length})</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category} (
              {platforms.filter((p) => p.category === category).length})
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Target Platform
        </label>
        <Select
          value={selectedPlatform?.id || ""}
          onChange={handlePlatformChange}
          className="w-full"
        >
          <option value="" disabled>
            Select a platform...
          </option>
          {filteredPlatforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.icon} {platform.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedPlatform && (
        <div className="mt-4 p-3 bg-surface/50 rounded-md border border-border">
          <div className="flex items-start gap-2">
            <span className="text-2xl">{selectedPlatform.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground">
                {selectedPlatform.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPlatform.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                  {selectedPlatform.apiFormat.toUpperCase()}
                </span>
                <span className="px-2 py-1 bg-accent/10 text-accent rounded">
                  {selectedPlatform.maxTokens.toLocaleString()} tokens
                </span>
                <span className="px-2 py-1 bg-surface text-muted-foreground rounded">
                  {selectedPlatform.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
