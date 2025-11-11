"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Platform, BatchJob, BatchPromptItem } from "@/types";
import { BatchProcessor } from "@/lib/batch/processor";
import { batchTemplates, parseCsvToBatchItems, validateCsvHeaders } from "@/lib/batch/templates";
import { generateId } from "@/lib/utils";

interface BatchModeProps {
  platforms: Platform[];
}

export function BatchMode({ platforms }: BatchModeProps) {
  const [csvInput, setCsvInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [processingMode, setProcessingMode] = useState<"single-platform" | "rotate-platforms">("single-platform");
  const [currentJob, setCurrentJob] = useState<BatchJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPromptRow, setCurrentPromptRow] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processorRef = useRef<BatchProcessor>(new BatchProcessor());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvInput(text);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = batchTemplates.find((t) => t.templateId === templateId);
    if (template) {
      setCsvInput(template.exampleCsv);
    }
  };

  const handleStartBatch = async () => {
    if (!csvInput.trim()) {
      alert("Please provide CSV input");
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform");
      return;
    }

    // Validate CSV if template is selected
    if (selectedTemplate) {
      const validation = validateCsvHeaders(csvInput, selectedTemplate);
      if (!validation.valid) {
        alert(`CSV validation failed: ${validation.message}`);
        return;
      }
    }

    try {
      // Parse CSV
      const parsedItems = parseCsvToBatchItems(csvInput, selectedTemplate || undefined);

      if (parsedItems.length === 0) {
        alert("No valid prompts found in CSV");
        return;
      }

      if (parsedItems.length > 50) {
        alert("Maximum 50 prompts allowed per batch. Please reduce your input.");
        return;
      }

      // Convert to BatchPromptItem format
      const batchItems: BatchPromptItem[] = parsedItems.map((item) => ({
        id: generateId(),
        originalPrompt: item.prompt,
        variables: item.variables,
        rowNumber: item.rowNumber,
      }));

      // Create batch job
      const job = processorRef.current.createBatchJob(
        `Batch Job ${new Date().toLocaleString()}`,
        batchItems,
        selectedPlatforms,
        processingMode
      );

      setCurrentJob(job);
      setIsProcessing(true);
      setShowResults(false);

      // Start processing
      await processorRef.current.startProcessing(
        (updatedJob, currentPrompt) => {
          setCurrentJob({ ...updatedJob });
          setCurrentPromptRow(currentPrompt.rowNumber);
        },
        (finalJob) => {
          setCurrentJob({ ...finalJob });
          setIsProcessing(false);
          setShowResults(true);
        }
      );
    } catch (error) {
      console.error("Batch processing error:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsProcessing(false);
    }
  };

  const handlePause = () => {
    processorRef.current.pause();
    setIsProcessing(false);
  };

  const handleResume = async () => {
    setIsProcessing(true);
    await processorRef.current.resume(
      (updatedJob, currentPrompt) => {
        setCurrentJob({ ...updatedJob });
        setCurrentPromptRow(currentPrompt.rowNumber);
      },
      (finalJob) => {
        setCurrentJob({ ...finalJob });
        setIsProcessing(false);
        setShowResults(true);
      }
    );
  };

  const handleExportCSV = () => {
    if (!currentJob) return;

    const csvContent = processorRef.current.exportToCSV(currentJob);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `batch-results-${currentJob.jobId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!currentJob) return;

    const jsonContent = processorRef.current.exportToJSON(currentJob);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `batch-results-${currentJob.jobId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const progress = currentJob ? (currentJob.processedCount / currentJob.totalPrompts) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Batch Templates */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-accent">📋</span>
            Batch Templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a template to get started with example CSV format
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {batchTemplates.map((template) => (
              <Card
                key={template.templateId}
                className={`cursor-pointer border transition-all hover:border-primary/50 ${
                  selectedTemplate === template.templateId
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleLoadTemplate(template.templateId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{template.templateName}</h3>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.templateDescription}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CSV Input */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-accent">📄</span>
            CSV Input
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file or paste CSV data (max 50 prompts)
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              📁 Upload CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              onClick={() => setCsvInput("")}
              disabled={isProcessing}
            >
              🗑️ Clear
            </Button>
          </div>
          <Textarea
            placeholder="Paste CSV data here...&#10;&#10;Example:&#10;name,company,topic&#10;John Smith,Acme Corp,product launch&#10;Jane Doe,TechStart,partnership"
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            disabled={isProcessing}
          />
          <div className="text-xs text-muted-foreground">
            {csvInput.split('\n').filter(line => line.trim()).length - 1} prompts detected
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-accent">🎯</span>
            Platform Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Processing Mode:</label>
            <div className="flex gap-2">
              <Button
                variant={processingMode === "single-platform" ? "default" : "outline"}
                size="sm"
                onClick={() => setProcessingMode("single-platform")}
                disabled={isProcessing}
              >
                Single Platform
              </Button>
              <Button
                variant={processingMode === "rotate-platforms" ? "default" : "outline"}
                size="sm"
                onClick={() => setProcessingMode("rotate-platforms")}
                disabled={isProcessing}
              >
                Rotate Platforms
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Platform{processingMode === "rotate-platforms" ? "s" : ""}:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {platforms.slice(0, 12).map((platform) => (
                <Button
                  key={platform.id}
                  variant={
                    selectedPlatforms.some((p) => p.id === platform.id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    if (processingMode === "single-platform") {
                      setSelectedPlatforms([platform]);
                    } else {
                      if (selectedPlatforms.some((p) => p.id === platform.id)) {
                        setSelectedPlatforms(selectedPlatforms.filter((p) => p.id !== platform.id));
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, platform]);
                      }
                    }
                  }}
                  disabled={isProcessing}
                  className="justify-start"
                >
                  {platform.icon} {platform.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {!currentJob || currentJob.status === "completed" ? (
              <Button
                onClick={handleStartBatch}
                disabled={isProcessing || !csvInput || selectedPlatforms.length === 0}
                className="flex-1"
                size="lg"
              >
                🚀 Start Batch Processing
              </Button>
            ) : (
              <>
                {isProcessing ? (
                  <Button onClick={handlePause} variant="outline" className="flex-1" size="lg">
                    ⏸️ Pause
                  </Button>
                ) : (
                  <Button onClick={handleResume} className="flex-1" size="lg">
                    ▶️ Resume
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {currentJob && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-accent">📊</span>
                Processing Progress
              </span>
              <span className="text-sm font-normal">
                {currentJob.processedCount} / {currentJob.totalPrompts}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-4 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isProcessing && (
                <div className="text-xs text-muted-foreground">
                  Currently processing row {currentPromptRow}...
                </div>
              )}
            </div>

            {currentJob.status === "completed" && (
              <div className="flex gap-2 pt-2">
                <Button onClick={handleExportCSV} variant="outline" className="flex-1">
                  📄 Export CSV
                </Button>
                <Button onClick={handleExportJSON} variant="outline" className="flex-1">
                  📋 Export JSON
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && currentJob && currentJob.results.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-accent">✅</span>
              Results ({currentJob.results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentJob.results.slice(0, 10).map((result, index) => (
                <Card key={result.id} className="border-border">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium">
                        Row {result.rowNumber} • {result.platform.icon} {result.platform.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Quality: {result.qualityScore}% • {result.tokenCount} tokens
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {result.enhancedPrompt}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {currentJob.results.length > 10 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... and {currentJob.results.length - 10} more results
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
