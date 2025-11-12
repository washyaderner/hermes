"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHermesStore } from "@/lib/store";
import { useState, useRef } from "react";

export function ImportExportControls() {
  const { exportAllDataToJson, importDataFromJson } = useHermesStore();
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importFileContent, setImportFileContent] = useState("");
  const [importPreviewData, setImportPreviewData] = useState<any>(null);
  const [mergeMode, setMergeMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
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

    alert("Backup exported successfully!");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsedData = JSON.parse(content);
        setImportFileContent(content);
        setImportPreviewData(parsedData);
        setShowImportPreview(true);
      } catch (error) {
        alert("Invalid JSON file. Please select a valid Hermes backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const result = importDataFromJson(importFileContent, mergeMode);
    
    if (result.success) {
      alert(`${result.message}\n\nItems imported: ${result.itemsImported}`);
      setShowImportPreview(false);
      setImportFileContent("");
      setImportPreviewData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      alert(`Import failed: ${result.message}`);
    }
  };

  const handleCancelImport = () => {
    setShowImportPreview(false);
    setImportFileContent("");
    setImportPreviewData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-accent">💾</span>
          Backup & Restore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Protect your knowledge investment by backing up all your data including templates, 
            datasets, history, and learning patterns.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleExportData} className="flex-1">
            📥 Export All Data
          </Button>
          <div className="flex-1">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>
        </div>

        {showImportPreview && importPreviewData && (
          <div className="space-y-3 p-4 bg-surface/50 rounded-md border border-border">
            <h4 className="font-medium text-foreground">Import Preview</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backup Version:</span>
                <span className="font-medium text-foreground">{importPreviewData.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exported:</span>
                <span className="font-medium text-foreground">
                  {new Date(importPreviewData.exportedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Datasets:</span>
                <span className="font-medium text-foreground">{importPreviewData.datasets?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Templates:</span>
                <span className="font-medium text-foreground">{importPreviewData.savedTemplates?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">History Items:</span>
                <span className="font-medium text-foreground">{importPreviewData.promptHistoryItems?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Patterns:</span>
                <span className="font-medium text-foreground">
                  {importPreviewData.successfulPromptPatterns?.length || 0}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={mergeMode}
                  onChange={() => setMergeMode(true)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-foreground">
                  Merge with existing data (recommended)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!mergeMode}
                  onChange={() => setMergeMode(false)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-foreground">
                  Replace all existing data
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleConfirmImport} className="flex-1">
                Confirm Import
              </Button>
              <Button onClick={handleCancelImport} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
