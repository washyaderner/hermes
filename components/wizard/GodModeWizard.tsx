"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GodModeData, RoleType, OutputFormatType } from "@/types";
import { ArrowLeft, Sparkles, Plus, X } from "lucide-react";
import { generateId } from "@/lib/utils";

interface GodModeWizardProps {
  onBack: () => void;
  onGenerate: (data: GodModeData) => void;
}

const ROLES: { value: RoleType; label: string }[] = [
  { value: "writing-assistant", label: "Writing Assistant" },
  { value: "senior-developer", label: "Senior Developer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "marketing-expert", label: "Marketing Expert" },
  { value: "teacher", label: "Teacher" },
  { value: "researcher", label: "Researcher" },
  { value: "legal-advisor", label: "Legal Advisor" },
  { value: "consultant", label: "Consultant" },
  { value: "designer", label: "Designer" },
  { value: "custom", label: "Custom Role" },
];

const FORMATS: { value: OutputFormatType; label: string }[] = [
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "javascript", label: "JavaScript" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "blog-post", label: "Blog Post" },
  { value: "research-paper", label: "Research Paper" },
  { value: "conversational", label: "Conversational" },
  { value: "spartan", label: "Spartan" },
  { value: "custom", label: "Custom Format" },
];

export function GodModeWizard({ onBack, onGenerate }: GodModeWizardProps) {
  const [data, setData] = useState<GodModeData>({
    identity: {
      role: "writing-assistant",
      customRole: "",
      additionalRoles: [],
      expertise: [],
    },
    task: {
      mainTask: "",
      context: "",
      background: "",
      specificRequirements: [],
    },
    examples: [],
    constraints: {
      mustNotDo: [],
      negativeExamples: [],
      limitations: [],
    },
    outputConfig: {
      format: "markdown",
      customFormat: "",
      lengthMin: undefined,
      lengthMax: undefined,
      styleModifiers: [],
      structureRequirements: [],
    },
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newConstraint, setNewConstraint] = useState("");
  const [newModifier, setNewModifier] = useState("");

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setData({
        ...data,
        task: {
          ...data.task,
          specificRequirements: [...data.task.specificRequirements, newRequirement.trim()],
        },
      });
      setNewRequirement("");
    }
  };

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setData({
        ...data,
        constraints: {
          ...data.constraints,
          mustNotDo: [...data.constraints.mustNotDo, newConstraint.trim()],
        },
      });
      setNewConstraint("");
    }
  };

  const addModifier = () => {
    if (newModifier.trim()) {
      setData({
        ...data,
        outputConfig: {
          ...data.outputConfig,
          styleModifiers: [...data.outputConfig.styleModifiers, newModifier.trim()],
        },
      });
      setNewModifier("");
    }
  };

  const canGenerate = data.task.mainTask.trim().length > 0;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-surface overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-accent">⚡</span>
              God Mode
            </h1>
            <p className="text-muted-foreground">Complete control over every aspect</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Identity Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Identity Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Primary Role</label>
                  <Select
                    value={data.identity.role}
                    onChange={(e) =>
                      setData({
                        ...data,
                        identity: { ...data.identity, role: e.target.value as RoleType },
                      })
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {data.identity.role === "custom" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Custom Role</label>
                    <Input
                      value={data.identity.customRole}
                      onChange={(e) =>
                        setData({
                          ...data,
                          identity: { ...data.identity, customRole: e.target.value },
                        })
                      }
                      placeholder="e.g., Quantum Computing Expert"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task Definition */}
            <Card>
              <CardHeader>
                <CardTitle>Task Definition *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Main Task</label>
                  <Textarea
                    value={data.task.mainTask}
                    onChange={(e) =>
                      setData({
                        ...data,
                        task: { ...data.task, mainTask: e.target.value },
                      })
                    }
                    placeholder="Describe the primary task..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Context</label>
                  <Textarea
                    value={data.task.context}
                    onChange={(e) =>
                      setData({
                        ...data,
                        task: { ...data.task, context: e.target.value },
                      })
                    }
                    placeholder="Provide relevant context..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Specific Requirements
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a requirement..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                    />
                    <Button size="sm" onClick={addRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {data.task.specificRequirements.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {data.task.specificRequirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-accent/30 rounded text-sm"
                        >
                          <span>• {req}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setData({
                                ...data,
                                task: {
                                  ...data.task,
                                  specificRequirements: data.task.specificRequirements.filter(
                                    (_, i) => i !== idx
                                  ),
                                },
                              })
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Constraints */}
            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">What NOT to Do</label>
                  <div className="flex gap-2">
                    <Input
                      value={newConstraint}
                      onChange={(e) => setNewConstraint(e.target.value)}
                      placeholder="Add a constraint..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConstraint())}
                    />
                    <Button size="sm" onClick={addConstraint}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {data.constraints.mustNotDo.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {data.constraints.mustNotDo.map((constraint, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-red-500/10 rounded text-sm"
                        >
                          <span>⛔ {constraint}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setData({
                                ...data,
                                constraints: {
                                  ...data.constraints,
                                  mustNotDo: data.constraints.mustNotDo.filter((_, i) => i !== idx),
                                },
                              })
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Output Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Output Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Format</label>
                  <Select
                    value={data.outputConfig.format}
                    onChange={(e) =>
                      setData({
                        ...data,
                        outputConfig: {
                          ...data.outputConfig,
                          format: e.target.value as OutputFormatType,
                        },
                      })
                    }
                  >
                    {FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Length</label>
                    <Input
                      type="number"
                      value={data.outputConfig.lengthMin || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          outputConfig: {
                            ...data.outputConfig,
                            lengthMin: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="Words"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Length</label>
                    <Input
                      type="number"
                      value={data.outputConfig.lengthMax || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          outputConfig: {
                            ...data.outputConfig,
                            lengthMax: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="Words"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Style Modifiers</label>
                  <div className="flex gap-2">
                    <Input
                      value={newModifier}
                      onChange={(e) => setNewModifier(e.target.value)}
                      placeholder="e.g., formal, concise..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addModifier())}
                    />
                    <Button size="sm" onClick={addModifier}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {data.outputConfig.styleModifiers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.outputConfig.styleModifiers.map((modifier, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-sm"
                        >
                          <span>{modifier}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0"
                            onClick={() =>
                              setData({
                                ...data,
                                outputConfig: {
                                  ...data.outputConfig,
                                  styleModifiers: data.outputConfig.styleModifiers.filter(
                                    (_, i) => i !== idx
                                  ),
                                },
                              })
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => onGenerate(data)}
            disabled={!canGenerate}
            size="lg"
            className="min-w-[200px]"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}
