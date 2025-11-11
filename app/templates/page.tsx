"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHermesStore } from "@/lib/store";
import { SavedTemplate } from "@/types";

export default function TemplatesPage() {
  const router = useRouter();
  const { savedTemplates, loadSavedTemplatesFromStorage, deleteSavedTemplate, loadTemplateIntoDashboard } = useHermesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("hermes_auth");
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Load templates from localStorage
    loadSavedTemplatesFromStorage();
  }, [router, loadSavedTemplatesFromStorage]);

  const filterTemplatesByCategory = (templates: SavedTemplate[], category: string | null) => {
    if (!category) return templates;
    return templates.filter((template) => template.category === category);
  };

  const searchTemplates = (templates: SavedTemplate[], query: string) => {
    if (!query.trim()) return templates;
    const lowerQuery = query.toLowerCase();
    return templates.filter((template) =>
      template.templateName.toLowerCase().includes(lowerQuery) ||
      template.promptText.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredTemplates = searchTemplates(
    filterTemplatesByCategory(savedTemplates, selectedCategoryFilter),
    searchQuery
  );

  const categoriesWithCounts = Array.from(
    new Set(savedTemplates.map((t) => t.category))
  ).map((category) => ({
    name: category,
    count: savedTemplates.filter((t) => t.category === category).length,
  }));

  const handleLoadTemplateIntoDashboard = (template: SavedTemplate) => {
    loadTemplateIntoDashboard(template);
    router.push("/dashboard");
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (confirm(`Delete template "${templateName}"?`)) {
      deleteSavedTemplate(templateId);
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
              <span className="text-2xl">📋</span>
              Prompt Templates
              <span className="text-sm font-normal text-muted-foreground">
                ({savedTemplates.length} saved)
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Your saved prompt templates. Click to load into dashboard.
            </p>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-3 mb-6">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedCategoryFilter === null ? "default" : "outline"}
                  onClick={() => setSelectedCategoryFilter(null)}
                >
                  All Categories
                </Button>
                {categoriesWithCounts.map((category) => (
                  <Button
                    key={category.name}
                    size="sm"
                    variant={selectedCategoryFilter === category.name ? "default" : "outline"}
                    onClick={() => setSelectedCategoryFilter(category.name)}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {savedTemplates.length === 0 ? "No Templates Yet" : "No Results Found"}
                </h3>
                <p className="text-muted-foreground">
                  {savedTemplates.length === 0
                    ? "Save prompts as templates to reuse them later"
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.templateId}
                    className="border-border hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => handleLoadTemplateIntoDashboard(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {template.templateName}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {template.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {template.platform.icon} {template.platform.name}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.templateId, template.templateName);
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          🗑️
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {template.promptText}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Created {new Date(template.createdAt).toLocaleDateString()}
                      </p>
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
