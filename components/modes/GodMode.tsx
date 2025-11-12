"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface GodModeProps {
  onBack: () => void;
  onGenerate: (data: any) => void;
}

export function GodMode({ onBack, onGenerate }: GodModeProps) {
  const [identity, setIdentity] = useState('');
  const [task, setTask] = useState('');
  const [examples, setExamples] = useState('');
  const [constraints, setConstraints] = useState('');
  const [format, setFormat] = useState('');

  const handleGenerate = () => {
    onGenerate({ identity, task, examples, constraints, format });
  };

  return (
    <motion.div
      className="min-h-screen bg-black p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center gap-2"
          >
            ← Back to mode selection
          </button>
          <h1 className="text-2xl font-bold text-slate-100">God Mode</h1>
        </div>

        {/* Main Form */}
        <div className="space-y-6">
          {/* Identity Configuration */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Identity Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">You are a...</label>
                <Select
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full bg-slate-900 border-slate-700 text-slate-100"
                >
                  <option value="">Select or type custom role...</option>
                  <option value="expert">Expert advisor in {'{domain}'}</option>
                  <option value="teacher">Patient teacher</option>
                  <option value="developer">Senior software developer</option>
                  <option value="writer">Professional writer</option>
                  <option value="analyst">Data analyst</option>
                  <option value="custom">Custom role...</option>
                </Select>
              </div>
              {identity === 'custom' && (
                <Input
                  placeholder="Describe your custom role..."
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              )}
            </div>
          </div>

          {/* Task Definition */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Task Definition</h3>
            <Textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Your task is to..."
              className="min-h-[120px] bg-slate-900 border-slate-700 text-slate-100"
            />
          </div>

          {/* Examples Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Ideal Output Examples</h3>
            <p className="text-sm text-slate-400 mb-4">Provide examples of desired output</p>
            <Textarea
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Example 1: ..."
              className="min-h-[100px] bg-slate-900 border-slate-700 text-slate-100"
            />
          </div>

          {/* Constraints */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Constraints</h3>
            <p className="text-sm text-slate-400 mb-4">What NOT to do</p>
            <Textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Don't use jargon, avoid lengthy explanations..."
              className="min-h-[100px] bg-slate-900 border-slate-700 text-slate-100"
            />
          </div>

          {/* Output Structure */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Output Structure</h3>
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

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!task.trim()}
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
