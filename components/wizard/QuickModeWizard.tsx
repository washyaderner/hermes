"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { QuickModeData, RoleType, ToneStyle, OutputFormatType, WizardStep } from "@/types";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

interface QuickModeWizardProps {
  onBack: () => void;
  onGenerate: (data: QuickModeData) => void;
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
];

const TONES: { value: ToneStyle; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Formal and business-appropriate" },
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "authoritative", label: "Authoritative", description: "Expert and confident" },
  { value: "empathetic", label: "Empathetic", description: "Understanding and supportive" },
  { value: "creative", label: "Creative", description: "Imaginative and original" },
];

const FORMATS: { value: OutputFormatType; label: string }[] = [
  { value: "markdown", label: "Markdown" },
  { value: "blog-post", label: "Blog Post" },
  { value: "twitter", label: "Twitter Post" },
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "research-paper", label: "Research Paper" },
  { value: "conversational", label: "Conversational" },
  { value: "spartan", label: "Spartan (Concise)" },
];

export function QuickModeWizard({ onBack, onGenerate }: QuickModeWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState<QuickModeData>({
    initialPrompt: "",
    role: undefined,
    tone: undefined,
    format: undefined,
  });

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    } else {
      onGenerate(data);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    } else {
      onBack();
    }
  };

  const canProceed = step === 1 ? data.initialPrompt.trim().length > 0 : true;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-surface">
      <div className="max-w-3xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 3</span>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Mode Selection
            </Button>
          </div>
          <div className="w-full bg-accent rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "What would you like to create?"}
              {step === 2 && "Add some personality (optional)"}
              {step === 3 && "Choose your format"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Initial Prompt */}
            {step === 1 && (
              <div className="space-y-4">
                <Textarea
                  value={data.initialPrompt}
                  onChange={(e) => setData({ ...data, initialPrompt: e.target.value })}
                  placeholder="Describe what you want to create...

Example:
'Write a blog post about the benefits of exercise'
'Explain quantum computing to a 10-year-old'
'Create a marketing email for our new product launch'"
                  rows={8}
                  className="text-lg"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey && canProceed) {
                      handleNext();
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Tip: Be specific about what you want. Press Ctrl+Enter to continue.
                </p>
              </div>
            )}

            {/* Step 2: Role & Tone */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Role (Optional)
                  </label>
                  <Select
                    value={data.role || ""}
                    onChange={(e) => setData({ ...data, role: e.target.value as RoleType })}
                  >
                    <option value="">No specific role</option>
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This helps frame the AI's perspective
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Tone (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TONES.map((tone) => (
                      <Card
                        key={tone.value}
                        className={`cursor-pointer transition-all ${
                          data.tone === tone.value
                            ? "border-primary border-2 bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setData({ ...data, tone: tone.value })}
                      >
                        <CardContent className="p-3">
                          <div className="font-medium text-sm">{tone.label}</div>
                          <div className="text-xs text-muted-foreground">{tone.description}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Format */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="text-sm font-medium mb-2 block">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {FORMATS.map((format) => (
                    <Card
                      key={format.value}
                      className={`cursor-pointer transition-all ${
                        data.format === format.value
                          ? "border-primary border-2 bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setData({ ...data, format: format.value })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="font-medium">{format.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  The output will be optimized for your selected format
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step === 1 ? "Back" : "Previous"}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex-1"
              >
                {step === 3 ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Prompt
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
