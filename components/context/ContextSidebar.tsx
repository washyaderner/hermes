"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Context, ContextTemplate, ContextType } from "@/types";
import { contextTemplates } from "@/lib/context/templates";
import { detectContextNeeds } from "@/lib/context/detector";
import { compressContext, buildRawContext, estimateContextTokens } from "@/lib/context/compression";
import { useHermesStore } from "@/lib/store";
import { generateId } from "@/lib/utils";

interface ContextSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContextSidebar({ isOpen, onClose }: ContextSidebarProps) {
  const {
    currentPrompt,
    contexts,
    activeContexts,
    projectContext,
    sessionContext,
    addContext,
    setProjectContext,
    setSessionContext,
    setActiveContexts,
    removeContext,
  } = useHermesStore();

  const [selectedTab, setSelectedTab] = useState<ContextType>("project");
  const [selectedTemplate, setSelectedTemplate] = useState<ContextTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-detect context needs
  useEffect(() => {
    if (currentPrompt && currentPrompt.length > 20) {
      const detection = detectContextNeeds(currentPrompt);
      if (detection.confidence > 0.3 && detection.suggestedTemplates.length > 0) {
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [currentPrompt]);

  const handleTemplateSelect = (template: ContextTemplate) => {
    setSelectedTemplate(template);
    // Pre-fill from existing context if available
    const existingContext = selectedTab === "project" ? projectContext : sessionContext;
    if (existingContext && existingContext.templateId === template.templateId) {
      setFormValues(existingContext.fields);
    } else {
      setFormValues({});
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveContext = () => {
    if (!selectedTemplate) return;

    const rawText = buildRawContext({ fields: formValues } as any, selectedTemplate);
    const compressedText = compressContext({ fields: formValues } as any, selectedTemplate);
    const tokenCount = estimateContextTokens(compressedText);

    const newContext: Context = {
      contextId: generateId(),
      contextType: selectedTab,
      templateId: selectedTemplate.templateId,
      templateName: selectedTemplate.templateName,
      fields: formValues,
      compressedText,
      rawText,
      tokenCount,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      useCount: 0,
      isPersistent: selectedTab === "project",
    };

    if (selectedTab === "project") {
      setProjectContext(newContext);
    } else if (selectedTab === "session") {
      setSessionContext(newContext);
    }

    addContext(newContext);
    setActiveContexts([...activeContexts.map(c => c.contextId), newContext.contextId]);

    // Reset form
    setSelectedTemplate(null);
    setFormValues({});
  };

  const handleRemoveContext = (contextId: string) => {
    removeContext(contextId);
    setActiveContexts(activeContexts.filter(c => c.contextId !== contextId).map(c => c.contextId));

    // Clear project/session if removed
    if (projectContext?.contextId === contextId) {
      setProjectContext(null);
    }
    if (sessionContext?.contextId === contextId) {
      setSessionContext(null);
    }
  };

  const handleApplySuggestion = (template: ContextTemplate) => {
    setSelectedTemplate(template);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  const detection = detectContextNeeds(currentPrompt);

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-surface border-l border-border shadow-2xl z-40 overflow-y-auto">
      <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Context Manager</h2>
          <p className="text-xs text-muted-foreground">Add context to improve prompts</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Auto-detection suggestions */}
        {showSuggestions && detection.suggestedTemplates.length > 0 && (
          <Card className="bg-accent/10 border-accent/30 p-4">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Context Suggestion</h3>
                <p className="text-xs text-muted-foreground mt-1">{detection.reasoning}</p>
              </div>
            </div>
            <div className="space-y-2">
              {detection.suggestedTemplates.map(template => (
                <Button
                  key={template.templateId}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplySuggestion(template)}
                  className="w-full justify-start"
                >
                  <span className="mr-2">{template.icon}</span>
                  {template.templateName}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Active Contexts */}
        {activeContexts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              ✅ Active Contexts ({activeContexts.length})
            </h3>
            <div className="space-y-2">
              {activeContexts.map(context => (
                <Card key={context.contextId} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{context.templateName}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {context.contextType}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {context.compressedText}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{context.tokenCount} tokens
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveContext(context.contextId)}
                      className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Context Type Tabs */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Add New Context</h3>
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedTab === "project" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("project")}
              className="flex-1"
            >
              📦 Project
            </Button>
            <Button
              variant={selectedTab === "session" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("session")}
              className="flex-1"
            >
              🎯 Session
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Choose Template</h3>
            <div className="space-y-2">
              {contextTemplates.map(template => (
                <Button
                  key={template.templateId}
                  variant="outline"
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full justify-start h-auto p-3"
                >
                  <div className="flex items-start gap-3 text-left">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{template.templateName}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Context Form */}
        {selectedTemplate && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span>{selectedTemplate.icon}</span>
                {selectedTemplate.templateName}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                Change
              </Button>
            </div>

            <div className="space-y-3">
              {selectedTemplate.fields.map(field => (
                <div key={field.fieldId}>
                  <label className="text-xs font-medium flex items-center gap-1 mb-1">
                    {field.fieldName}
                    {field.isRequired && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formValues[field.fieldId] || ""}
                    onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveContext}
              className="w-full mt-4"
              disabled={!Object.values(formValues).some(v => v.trim())}
            >
              💾 Save {selectedTab === "project" ? "Project" : "Session"} Context
            </Button>
          </div>
        )}

        {/* Example */}
        {selectedTemplate && (
          <Card className="p-3 bg-muted/30">
            <h4 className="text-xs font-semibold mb-2">Example:</h4>
            <p className="text-xs font-mono text-muted-foreground">
              {selectedTemplate.exampleContext}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
