"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHermesStore } from "@/lib/store";
import { PromptHistoryItem } from "@/types";

export default function HistoryPage() {
  const router = useRouter();
  const { promptHistoryItems, loadPromptHistoryFromStorage, deletePromptHistoryItem, setCurrentPrompt, setSelectedPlatform } = useHermesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("hermes_auth");
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Load history from localStorage
    loadPromptHistoryFromStorage();
  }, [router, loadPromptHistoryFromStorage]);

  const filterHistoryByPlatform = (items: PromptHistoryItem[], platformId: string | null) => {
    if (!platformId) return items;
    return items.filter((item) => item.platform.id === platformId);
  };

  const searchHistoryItems = (items: PromptHistoryItem[], query: string) => {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      item.originalText.toLowerCase().includes(lowerQuery) ||
      item.platform.name.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredItems = searchHistoryItems(
    filterHistoryByPlatform(promptHistoryItems, selectedPlatformFilter),
    searchQuery
  );

  const uniquePlatforms = Array.from(
    new Set(promptHistoryItems.map((item) => item.platform.id))
  ).map((id) => promptHistoryItems.find((item) => item.platform.id === id)!.platform);

  const handleLoadPromptBackToDashboard = (item: PromptHistoryItem) => {
    setCurrentPrompt(item.originalText);
    setSelectedPlatform(item.platform);
    router.push("/dashboard");
  };

  const handleDeleteHistoryItem = (promptId: string) => {
    if (confirm("Delete this history item?")) {
      deletePromptHistoryItem(promptId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface">
      <nav className="border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-xl">
              ⚡
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hermes
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              Prompt History
              <span className="text-sm font-normal text-muted-foreground">
                ({promptHistoryItems.length}/20)
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Last 20 prompts optimized. Click to load back into dashboard.
            </p>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-3 mb-6">
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedPlatformFilter === null ? "default" : "outline"}
                  onClick={() => setSelectedPlatformFilter(null)}
                >
                  All Platforms
                </Button>
                {uniquePlatforms.map((platform) => (
                  <Button
                    key={platform.id}
                    size="sm"
                    variant={selectedPlatformFilter === platform.id ? "default" : "outline"}
                    onClick={() => setSelectedPlatformFilter(platform.id)}
                  >
                    {platform.icon} {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* History List */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {promptHistoryItems.length === 0 ? "No History Yet" : "No Results Found"}
                </h3>
                <p className="text-muted-foreground">
                  {promptHistoryItems.length === 0
                    ? "Start optimizing prompts to build your history"
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <Card
                    key={item.promptId}
                    className="border-border hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => handleLoadPromptBackToDashboard(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {item.platform.icon} {item.platform.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                            {item.wasSuccessful && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                ⭐ Successful
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.originalText}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.enhancedVersions.length} variations generated
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistoryItem(item.promptId);
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          🗑️
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
