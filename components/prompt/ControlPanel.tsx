"use client";

import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHermesStore } from "@/lib/store";
import { useState } from "react";

export function ControlPanel() {
  const { settings, updateSettings } = useHermesStore();
  const [showSystemMessage, setShowSystemMessage] = useState(false);

  return (
    <Card className="border-primary/20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-accent">⚙️</span>
          Control Panel
        </h3>

        {/* Temperature */}
        <div>
          <Slider
            label="Temperature"
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(e) =>
              updateSettings({ temperature: parseFloat(e.target.value) })
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            Higher values = more creative, Lower values = more focused
          </p>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Max Tokens
          </label>
          <Select
            value={settings.maxTokens}
            onChange={(e) =>
              updateSettings({ maxTokens: parseInt(e.target.value) })
            }
          >
            <option value={500}>500</option>
            <option value={1000}>1,000</option>
            <option value={2000}>2,000</option>
            <option value={4000}>4,000</option>
            <option value={8000}>8,000</option>
            <option value={16000}>16,000</option>
          </Select>
        </div>

        {/* Tone */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Tone
          </label>
          <Select
            value={settings.tone}
            onChange={(e) =>
              updateSettings({ tone: e.target.value as any })
            }
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="academic">Academic</option>
            <option value="spartan">Spartan (Concise)</option>
            <option value="laconic">Laconic (Brief)</option>
            <option value="sarcastic">Sarcastic</option>
          </Select>
        </div>

        {/* Output Format */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Output Format
          </label>
          <div className="space-y-2">
            {["markdown", "json", "csv", "bullets", "plain"].map((format) => (
              <label
                key={format}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={settings.outputFormats.includes(format as any)}
                  onChange={(e) => {
                    const formats = e.target.checked
                      ? [...settings.outputFormats, format as any]
                      : settings.outputFormats.filter((f) => f !== format);
                    updateSettings({ outputFormats: formats });
                  }}
                  className="w-4 h-4 rounded border-border bg-surface accent-primary"
                />
                <span className="capitalize text-foreground">{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Few-Shot Examples */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.fewShotEnabled}
              onChange={(e) =>
                updateSettings({ fewShotEnabled: e.target.checked })
              }
              className="w-4 h-4 rounded border-border bg-surface accent-primary"
            />
            <span className="font-medium text-foreground">
              Enable Few-Shot Examples
            </span>
          </label>
          {settings.fewShotEnabled && (
            <Select
              value={settings.fewShotCount}
              onChange={(e) =>
                updateSettings({ fewShotCount: parseInt(e.target.value) })
              }
            >
              <option value={1}>1 example</option>
              <option value={2}>2 examples</option>
              <option value={3}>3 examples</option>
              <option value={4}>4 examples</option>
              <option value={5}>5 examples</option>
            </Select>
          )}
        </div>

        {/* System Message */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.systemMessageEnabled}
              onChange={(e) => {
                updateSettings({ systemMessageEnabled: e.target.checked });
                setShowSystemMessage(e.target.checked);
              }}
              className="w-4 h-4 rounded border-border bg-surface accent-primary"
            />
            <span className="font-medium text-foreground">
              Custom System Message
            </span>
          </label>
          {settings.systemMessageEnabled && (
            <Textarea
              placeholder="Enter custom system message..."
              value={settings.customSystemMessage}
              onChange={(e) =>
                updateSettings({ customSystemMessage: e.target.value })
              }
              className="min-h-[80px]"
            />
          )}
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            updateSettings({
              temperature: 0.7,
              maxTokens: 2000,
              tone: "professional",
              outputFormats: ["markdown"],
              fewShotEnabled: false,
              fewShotCount: 0,
              systemMessageEnabled: false,
              customSystemMessage: "",
            });
            setShowSystemMessage(false);
          }}
        >
          Reset to Defaults
        </Button>
      </div>
    </Card>
  );
}
