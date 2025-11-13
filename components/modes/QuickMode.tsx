"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { borderRadius } from '@/lib/design-tokens';

interface QuickModeProps {
  onBack: () => void;
  onGenerate: (data: any) => void;
}

export function QuickMode({ onBack, onGenerate }: QuickModeProps) {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [role, setRole] = useState('');
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const handleGenerate = () => {
    onGenerate({ prompt, role, tone, format });
  };

  return (
    <motion.div
      className="min-h-screen bg-black flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-3xl">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-8 text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center gap-2"
        >
          ← {step === 1 ? 'Back to mode selection' : 'Previous step'}
        </button>

        {/* Progress bar */}
        <div className="mb-12 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 ${borderRadius.input} ${
                s <= step ? 'bg-slate-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Prompt Input */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-slate-100 mb-2">
                What do you want to create?
              </h2>
              <p className="text-slate-400 mb-8">Enter your initial prompt or idea</p>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your prompt here..."
                className={`min-h-[200px] text-lg bg-slate-900 border-slate-800 text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-300 ${borderRadius.input}`}
                autoFocus
              />

              <Button
                onClick={handleNext}
                disabled={!prompt.trim()}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
                size="lg"
              >
                Continue →
              </Button>
            </motion.div>
          )}

          {/* Step 2: Enhancements */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-bold text-slate-100 mb-2">
                Optional enhancements
              </h2>
              <p className="text-slate-400 mb-8">Skip or customize these settings</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 mb-2">Role (optional)</label>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900 border-slate-800 text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors duration-300"
                  >
                    <option value="">Select a role...</option>
                    <option value="expert">Expert advisor</option>
                    <option value="teacher">Teacher</option>
                    <option value="developer">Senior developer</option>
                    <option value="writer">Professional writer</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Tone (optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Professional', 'Casual', 'Technical'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t.toLowerCase())}
                        className={`p-3 ${borderRadius.card.compact} border text-sm transition-all duration-200 ${
                          tone === t.toLowerCase()
                            ? 'bg-slate-700 border-slate-600 text-slate-100'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100"
                  size="lg"
                >
                  Continue →
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  className="border-slate-800 text-slate-400 hover:bg-slate-900"
                >
                  Skip
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generate */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-slate-100 mb-2">
                Ready to generate
              </h2>
              <p className="text-slate-400 mb-8">Review and generate your optimized prompt</p>

              <div className={`bg-slate-900 border border-slate-800 ${borderRadius.card.default} p-6 space-y-4`}>
                <div>
                  <div className="text-xs text-slate-500 mb-1">YOUR PROMPT</div>
                  <div className="text-slate-200">{prompt}</div>
                </div>
                {role && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">ROLE</div>
                    <div className="text-slate-300">{role}</div>
                  </div>
                )}
                {tone && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">TONE</div>
                    <div className="text-slate-300 capitalize">{tone}</div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
                size="lg"
              >
                ✨ Generate Prompt
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
