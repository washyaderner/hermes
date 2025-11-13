"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { animation, shadows, focusStates } from '@/lib/design-tokens';

interface GodModeProps {
  onBack: () => void;
  onGenerate: (data: any) => void;
}

type Step = 'prompt' | 'role' | 'desires' | 'constraints' | 'format' | 'review';

const steps: Step[] = ['prompt', 'role', 'desires', 'constraints', 'format', 'review'];

export function GodMode({ onBack, onGenerate }: GodModeProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [role, setRole] = useState('');
  const [desires, setDesires] = useState('');
  const [constraints, setConstraints] = useState('');
  const [format, setFormat] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const currentStep = steps[currentStepIndex];

  // Auto-focus on step change
  useEffect(() => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      } else if (selectRef.current) {
        selectRef.current.focus();
      }
    }, 300);
  }, [currentStepIndex]);

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 'prompt' && !prompt.trim()) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Final step - generate
      onGenerate({ prompt, role, desires, constraints, format });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      onBack();
    }
  };

  // Check if step is complete
  const isStepComplete = (step: Step) => {
    switch (step) {
      case 'prompt':
        return prompt.trim() !== '';
      case 'role':
        return role !== '';
      case 'desires':
        return desires.trim() !== '';
      case 'constraints':
        return constraints.trim() !== '';
      case 'format':
        return format !== '';
      case 'review':
        return prompt.trim() !== '';
      default:
        return false;
    }
  };

  // Flow steps for progress bar
  const flowSteps = [
    { id: 'prompt', label: 'Base Prompt', complete: isStepComplete('prompt') },
    { id: 'role', label: 'Role', complete: isStepComplete('role') },
    { id: 'desires', label: 'Examples', complete: isStepComplete('desires') },
    { id: 'constraints', label: 'Constraints', complete: isStepComplete('constraints') },
    { id: 'format', label: 'Format', complete: isStepComplete('format') },
  ];

  return (
    <motion.div
      className="h-screen bg-black overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header with Progress Bar */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          {/* Title and Back Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center gap-2"
            >
              ← {currentStepIndex === 0 ? 'Back to mode selection' : 'Previous'}
            </button>
            <h1 className="text-2xl font-bold text-slate-100">God Mode</h1>
            <div className="w-32 text-right text-xs text-slate-500">
              {currentStepIndex + 1} / {steps.length}
            </div>
          </div>

          {/* Progress Flow */}
          <div className="flex items-center justify-between">
            {flowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      step.complete
                        ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                        : index === currentStepIndex
                        ? 'bg-slate-700 text-slate-200 border-2 border-slate-400'
                        : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
                    }`}
                    animate={{
                      scale: index === currentStepIndex ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.complete ? '✓' : index + 1}
                  </motion.div>
                  <span className={`text-[10px] mt-1 transition-colors ${
                    index === currentStepIndex ? 'text-slate-300 font-medium' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {/* Arrow connector */}
                {index < flowSteps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors ${
                    step.complete ? 'bg-green-500/30' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Single Step View */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-auto">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step: Base Prompt */}
            {currentStep === 'prompt' && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-2">
                    What's your original prompt?
                  </h2>
                  <p className="text-slate-400">
                    Start with your base prompt. We'll help you enhance it step by step.
                  </p>
                </div>

                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your prompt here..."
                  className="min-h-[300px] text-lg bg-slate-900/50 border-slate-800 text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-0 transition-all duration-300"
                />

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>💡 Be specific about what you want to achieve</span>
                  <span>Press Enter to continue →</span>
                </div>
              </motion.div>
            )}

            {/* Step: Role */}
            {currentStep === 'role' && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-2">
                    Choose a role
                  </h2>
                  <p className="text-slate-400">
                    What perspective should the AI take? This helps set the expertise level.
                  </p>
                </div>

                <Select
                  ref={selectRef}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-14 text-lg bg-slate-900/50 border-slate-800 text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-0"
                >
                  <option value="">Select a role...</option>
                  <option value="expert">Expert advisor</option>
                  <option value="teacher">Teacher</option>
                  <option value="developer">Senior developer</option>
                  <option value="writer">Professional writer</option>
                  <option value="analyst">Data analyst</option>
                </Select>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>💡 Optional - skip if not needed</span>
                  <span>Press Enter to continue →</span>
                </div>
              </motion.div>
            )}

            {/* Step: Desires/Examples */}
            {currentStep === 'desires' && (
              <motion.div
                key="desires"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-2">
                    Provide examples
                  </h2>
                  <p className="text-slate-400">
                    Show examples of ideal outputs to guide the AI's response style.
                  </p>
                </div>

                <Textarea
                  ref={textareaRef}
                  value={desires}
                  onChange={(e) => setDesires(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe or paste ideal output examples..."
                  className="min-h-[200px] text-lg bg-slate-900/50 border-slate-800 text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-0 transition-all duration-300"
                />

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>💡 Optional - helps guide tone and style</span>
                  <span>Press Enter to continue →</span>
                </div>
              </motion.div>
            )}

            {/* Step: Constraints */}
            {currentStep === 'constraints' && (
              <motion.div
                key="constraints"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-2">
                    Set constraints
                  </h2>
                  <p className="text-slate-400">
                    What should the AI avoid? Length limits, topics to skip, etc.
                  </p>
                </div>

                <Textarea
                  ref={textareaRef}
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What NOT to do..."
                  className="min-h-[200px] text-lg bg-slate-900/50 border-slate-800 text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-0 transition-all duration-300"
                />

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>💡 Optional - be explicit about what to avoid</span>
                  <span>Press Enter to continue →</span>
                </div>
              </motion.div>
            )}

            {/* Step: Output Format */}
            {currentStep === 'format' && (
              <motion.div
                key="format"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-2">
                    Choose output format
                  </h2>
                  <p className="text-slate-400">
                    How should the response be structured?
                  </p>
                </div>

                <Select
                  ref={selectRef}
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-14 text-lg bg-slate-900/50 border-slate-800 text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-0"
                >
                  <option value="">Select format...</option>
                  <option value="xml">XML</option>
                  <option value="markdown">Markdown</option>
                  <option value="javascript">JavaScript/JSON</option>
                  <option value="twitter">Twitter Post</option>
                  <option value="linkedin">LinkedIn Post</option>
                  <option value="blog">Blog Post</option>
                  <option value="research">Research Paper</option>
                  <option value="conversational">Conversational</option>
                  <option value="minimalist">Spartan/Minimalist</option>
                </Select>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>💡 Optional - structures the response</span>
                  <span>Press Enter to continue →</span>
                </div>
              </motion.div>
            )}

            {/* Step: Review & Generate */}
            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-2">
                    Ready to generate
                  </h2>
                  <p className="text-slate-400">
                    Review your configuration and generate your enhanced prompt.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-6 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">BASE PROMPT</div>
                    <div className="text-slate-200">{prompt}</div>
                  </div>
                  {role && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">ROLE</div>
                      <div className="text-slate-300 capitalize">{role}</div>
                    </div>
                  )}
                  {desires && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">EXAMPLES</div>
                      <div className="text-slate-300">{desires}</div>
                    </div>
                  )}
                  {constraints && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">CONSTRAINTS</div>
                      <div className="text-slate-300">{constraints}</div>
                    </div>
                  )}
                  {format && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">FORMAT</div>
                      <div className="text-slate-300 capitalize">{format}</div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full h-16 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-100 text-lg font-semibold shadow-lg transition-all duration-300"
                  size="lg"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Advanced Prompt
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
