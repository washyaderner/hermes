"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

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

  const handleGenerate = () => {
    onGenerate({ prompt, role, desires, constraints, format });
  };

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
      <div className="flex-1 overflow-hidden px-8 py-6">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Left Column - Original Prompt */}
            <div className="flex flex-col">
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex flex-col h-full">
                <label className="block text-sm font-medium text-slate-300 mb-3">Original Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your original prompt here..."
                  className="flex-1 bg-slate-900 border-slate-700 text-slate-100 resize-none"
                />
              </div>
            </div>

            {/* Right Column - Configuration Options */}
            <div className="flex flex-col space-y-4 overflow-y-auto">
              {/* Role */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">Role</label>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border-slate-700 text-slate-100"
                >
                  <option value="">Select role...</option>
                  <option value="expert">Expert advisor</option>
                  <option value="teacher">Teacher</option>
                  <option value="developer">Senior developer</option>
                  <option value="writer">Professional writer</option>
                  <option value="analyst">Data analyst</option>
                </Select>
              </div>

              {/* Desires */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">Desires</label>
                <Textarea
                  value={desires}
                  onChange={(e) => setDesires(e.target.value)}
                  placeholder="Ideal output examples..."
                  className="h-24 bg-slate-900 border-slate-700 text-slate-100 resize-none"
                />
              </div>

              {/* Constraints */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">Constraints</label>
                <Textarea
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="What NOT to do..."
                  className="h-24 bg-slate-900 border-slate-700 text-slate-100 resize-none"
                />
              </div>

              {/* Output Format */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">Output Format</label>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-900 border-slate-700 text-slate-100"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Generate Button */}
      <div className="flex-shrink-0 px-8 py-6 border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
            size="lg"
          >
            ⚙️ Generate Advanced Prompt
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
