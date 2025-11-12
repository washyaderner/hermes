"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useHermesStore } from "@/lib/store";
import { Dataset } from "@/types";
import { generateId } from "@/lib/utils";
import { countTokens } from "@/lib/prompt-engine/analyzer";

export function DatasetManager() {
  const { datasets, addDataset, removeDataset, setSelectedDataset, selectedDataset } =
    useHermesStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddDataset = () => {
    if (!name.trim() || !content.trim()) {
      alert("Please provide both a name and content for the dataset");
      return;
    }

    const dataset: Dataset = {
      id: generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      content: content.trim(),
      createdAt: new Date(),
      tokenCount: countTokens(content),
    };

    addDataset(dataset);
    setName("");
    setDescription("");
    setContent("");
    setShowForm(false);
  };

  const handleSelectDataset = (dataset: Dataset) => {
    if (selectedDataset?.id === dataset.id) {
      setSelectedDataset(null);
    } else {
      setSelectedDataset(dataset);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-accent">🗄️</span>
            RAG Datasets
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ New Dataset"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 bg-surface/50 rounded-md border border-border">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Dataset Name
              </label>
              <Input
                placeholder="e.g., Alex Hormozi Transcripts"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief description of the dataset"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Content
              </label>
              <Textarea
                placeholder="Paste your content here (transcripts, docs, examples, etc.)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] font-mono text-xs"
              />
              {content && (
                <div className="text-xs text-muted-foreground mt-1">
                  ~{countTokens(content)} tokens
                </div>
              )}
            </div>

            <Button onClick={handleAddDataset} className="w-full">
              Save Dataset
            </Button>
          </div>
        )}

        {datasets.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <div className="text-4xl mb-2">📚</div>
            <p>No datasets yet.</p>
            <p className="text-xs mt-1">
              Add content to provide context for prompt optimization
            </p>
          </div>
        )}

        {datasets.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-2">
              {datasets.length} dataset{datasets.length !== 1 ? "s" : ""} available
            </div>
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className={`p-3 rounded-md border transition-all cursor-pointer ${
                  selectedDataset?.id === dataset.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface/50 hover:border-primary/50"
                }`}
                onClick={() => handleSelectDataset(dataset)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground text-sm">
                        {dataset.name}
                      </h4>
                      {selectedDataset?.id === dataset.id && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    {dataset.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {dataset.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{dataset.tokenCount.toLocaleString()} tokens</span>
                      <span>•</span>
                      <span>
                        Added {new Date(dataset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Delete dataset "${dataset.name}"? This cannot be undone.`
                        )
                      ) {
                        removeDataset(dataset.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedDataset && (
          <div className="p-3 bg-accent/10 rounded-md border border-accent/20 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-accent">💡</span>
              <div>
                <p className="text-foreground font-medium">
                  Active Dataset: {selectedDataset.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This dataset will be used as context when optimizing prompts.
                  Click to deselect.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
