"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { animation, shadows, focusStates } from '@/lib/design-tokens';

interface GodModeProps {
  onBack: () => void;
  onGenerate: (data: any) => void;
}

export function GodMode({ onBack, onGenerate }: GodModeProps) {
  const [prompt, setPrompt] = useState('');
  const [role, setRole] = useState('');
  const [desires, setDesires] = useState('');
  const [constraints, setConstraints] = useState('');
  const [format, setFormat] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleGenerate = () => {
    onGenerate({ prompt, role, desires, constraints, format });
  };

  // Helper text for each field
  const helperText: Record<string, string> = {
    prompt: "💡 Tip: Be specific about what you want to achieve. This is your foundation.",
    role: "💡 Tip: Choosing a specific role helps set the expertise level and perspective.",
    desires: "💡 Tip: Provide examples of ideal outputs to guide the AI's response style.",
    constraints: "💡 Tip: Be explicit about what to avoid, like length limits or sensitive topics.",
    format: "💡 Tip: Output format helps structure the response for your specific use case.",
  };

  // Check if field is complete
  const isFieldComplete = (field: string) => {
    switch (field) {
      case 'role':
        return role !== '';
      case 'desires':
        return desires.trim() !== '';
      case 'constraints':
        return constraints.trim() !== '';
      case 'format':
        return format !== '';
      default:
        return false;
    }
  };

  // Prompt engineering flow steps
  const flowSteps = [
    { id: 'prompt', label: 'Base Prompt', field: 'prompt', complete: prompt.trim() !== '' },
    { id: 'role', label: 'Role', field: 'role', complete: isFieldComplete('role') },
    { id: 'desires', label: 'Examples', field: 'desires', complete: isFieldComplete('desires') },
    { id: 'constraints', label: 'Constraints', field: 'constraints', complete: isFieldComplete('constraints') },
    { id: 'format', label: 'Format', field: 'format', complete: isFieldComplete('format') },
  ];

  return (
    <motion.div
      className="h-screen bg-black overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center gap-2"
          >
            ← Back to mode selection
          </button>
          <h1 className="text-2xl font-bold text-slate-100">God Mode</h1>
          <div className="w-32" />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 px-8 py-6 overflow-auto">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Left Column - Single Large Prompt Card */}
            <motion.div
              className="bg-slate-900/50 border border-slate-800 rounded-sm p-6 flex flex-col relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              whileHover={{
                boxShadow: shadows.cardHoverStrong,
                borderColor: focusStates.border.hover,
              }}
              transition={{ duration: animation.duration.normal, ease: animation.easing.smooth }}
            >
              <label className="block text-sm font-medium text-slate-300 mb-4">Original Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setFocusedField('prompt')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your original prompt here..."
                className="flex-1 bg-black border-slate-700 text-slate-100 resize-none transition-all duration-300 focus:border-slate-400 focus:outline-none focus:ring-0"
              />

              {/* Helper text for prompt */}
              <AnimatePresence>
                {focusedField === 'prompt' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: animation.duration.fast }}
                    className="text-xs text-slate-500 mt-3"
                  >
                    {helperText.prompt}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Column - Flow Diagram + Configuration Options */}
            <div className="flex flex-col space-y-4 overflow-y-auto pr-2 pb-4">
              {/* Prompt Engineering Flow Diagram */}
              <motion.div
                className="bg-slate-900/50 border border-slate-800 rounded-sm p-5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animation.duration.normal }}
              >
                <h3 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                  Prompt Engineering Flow
                </h3>
                <div className="flex items-center justify-between">
                  {flowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      {/* Step indicator */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                            step.complete
                              ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                              : focusedField === step.field
                              ? 'bg-slate-700 text-slate-200 border-2 border-slate-500'
                              : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
                          }`}
                          animate={{
                            scale: focusedField === step.field ? 1.1 : 1,
                          }}
                        >
                          {step.complete ? '✓' : index + 1}
                        </motion.div>
                        <span className={`text-[10px] mt-1 transition-colors ${
                          focusedField === step.field ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {/* Arrow connector */}
                      {index < flowSteps.length - 1 && (
                        <div className={`w-6 h-0.5 mx-1 transition-colors ${
                          step.complete ? 'bg-green-500/30' : 'bg-slate-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Role */}
              <motion.div
                className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 relative transition-all duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: focusedField && focusedField !== 'role' ? focusStates.opacity.unfocused : focusStates.opacity.focused,
                  x: 0,
                }}
                whileHover={{
                  boxShadow: shadows.cardHover,
                  borderColor: focusStates.border.hover,
                }}
                transition={{ duration: animation.duration.normal, ease: animation.easing.smooth, delay: 0.1 }}
              >
                {/* Completion checkmark */}
                <AnimatePresence>
                  {isFieldComplete('role') && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute top-4 right-4 text-green-400 text-sm"
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="block text-sm font-medium text-slate-300 mb-3">Role</label>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-black border-slate-700 text-slate-100 transition-all duration-300 focus:border-slate-400 focus:outline-none focus:ring-0"
                >
                  <option value="">Select role...</option>
                  <option value="expert">Expert advisor</option>
                  <option value="teacher">Teacher</option>
                  <option value="developer">Senior developer</option>
                  <option value="writer">Professional writer</option>
                  <option value="analyst">Data analyst</option>
                </Select>

                {/* Helper text */}
                <AnimatePresence>
                  {focusedField === 'role' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: animation.duration.fast }}
                      className="text-xs text-slate-500 mt-2"
                    >
                      {helperText.role}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Desires */}
              <motion.div
                className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 relative transition-all duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: focusedField && focusedField !== 'desires' ? focusStates.opacity.unfocused : focusStates.opacity.focused,
                  x: 0,
                }}
                whileHover={{
                  boxShadow: shadows.cardHover,
                  borderColor: focusStates.border.hover,
                }}
                transition={{ duration: animation.duration.normal, ease: animation.easing.smooth, delay: 0.2 }}
              >
                {/* Completion checkmark */}
                <AnimatePresence>
                  {isFieldComplete('desires') && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute top-4 right-4 text-green-400 text-sm"
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="block text-sm font-medium text-slate-300 mb-3">Desires</label>
                <Textarea
                  value={desires}
                  onChange={(e) => setDesires(e.target.value)}
                  onFocus={() => setFocusedField('desires')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ideal output examples..."
                  className="h-24 bg-black border-slate-700 text-slate-100 resize-none transition-all duration-300 focus:border-slate-400 focus:outline-none focus:ring-0"
                />

                {/* Helper text */}
                <AnimatePresence>
                  {focusedField === 'desires' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: animation.duration.fast }}
                      className="text-xs text-slate-500 mt-2"
                    >
                      {helperText.desires}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Constraints */}
              <motion.div
                className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 relative transition-all duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: focusedField && focusedField !== 'constraints' ? focusStates.opacity.unfocused : focusStates.opacity.focused,
                  x: 0,
                }}
                whileHover={{
                  boxShadow: shadows.cardHover,
                  borderColor: focusStates.border.hover,
                }}
                transition={{ duration: animation.duration.normal, ease: animation.easing.smooth, delay: 0.3 }}
              >
                {/* Completion checkmark */}
                <AnimatePresence>
                  {isFieldComplete('constraints') && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute top-4 right-4 text-green-400 text-sm"
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="block text-sm font-medium text-slate-300 mb-3">Constraints</label>
                <Textarea
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  onFocus={() => setFocusedField('constraints')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="What NOT to do..."
                  className="h-24 bg-black border-slate-700 text-slate-100 resize-none transition-all duration-300 focus:border-slate-400 focus:outline-none focus:ring-0"
                />

                {/* Helper text */}
                <AnimatePresence>
                  {focusedField === 'constraints' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: animation.duration.fast }}
                      className="text-xs text-slate-500 mt-2"
                    >
                      {helperText.constraints}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Output Format */}
              <motion.div
                className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 relative transition-all duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: focusedField && focusedField !== 'format' ? focusStates.opacity.unfocused : focusStates.opacity.focused,
                  x: 0,
                }}
                whileHover={{
                  boxShadow: shadows.cardHover,
                  borderColor: focusStates.border.hover,
                }}
                transition={{ duration: animation.duration.normal, ease: animation.easing.smooth, delay: 0.4 }}
              >
                {/* Completion checkmark */}
                <AnimatePresence>
                  {isFieldComplete('format') && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute top-4 right-4 text-green-400 text-sm"
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="block text-sm font-medium text-slate-300 mb-3">Output Format</label>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  onFocus={() => setFocusedField('format')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-black border-slate-700 text-slate-100 transition-all duration-300 focus:border-slate-400 focus:outline-none focus:ring-0"
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

                {/* Helper text */}
                <AnimatePresence>
                  {focusedField === 'format' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: animation.duration.fast }}
                      className="text-xs text-slate-500 mt-2"
                    >
                      {helperText.format}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Generate Button - Now inline with cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animation.duration.normal, delay: 0.5 }}
              >
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="w-full h-16 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-100 text-lg font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
