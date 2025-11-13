"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ModeSelectionProps {
  onSelectMode: (mode: 'quick' | 'god') => void;
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const [hoveredMode, setHoveredMode] = useState<'quick' | 'god' | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only enabling animations after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Quick Mode */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-black cursor-pointer group"
          style={{ minHeight: '70vh' }}
          whileHover={mounted ? { scale: 1.02, borderColor: '#475569' } : undefined}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setHoveredMode('quick')}
          onMouseLeave={() => setHoveredMode(null)}
          onClick={() => onSelectMode('quick')}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12">
            {/* Icon */}
            <motion.div
              className="mb-8"
              animate={mounted ? { scale: hoveredMode === 'quick' ? 1.1 : 1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="w-20 h-20 md:w-24 md:h-24 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </motion.div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
              Quick Mode
            </h2>

            {/* Description */}
            <p className="text-slate-400 text-center text-lg md:text-xl max-w-md leading-relaxed">
              Guided step-by-step flow to build your perfect prompt in seconds
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>Simple 3-step process</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>Smart defaults & suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>Perfect for beginners</span>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              className="mt-12 px-8 py-3 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium"
              whileHover={mounted ? { backgroundColor: '#334155' } : undefined}
            >
              Start Quick Mode →
            </motion.div>
          </div>
        </motion.div>

        {/* God Mode */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-black cursor-pointer group"
          style={{ minHeight: '70vh' }}
          whileHover={mounted ? { scale: 1.02, borderColor: '#475569' } : undefined}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setHoveredMode('god')}
          onMouseLeave={() => setHoveredMode(null)}
          onClick={() => onSelectMode('god')}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12">
            {/* Icon */}
            <motion.div
              className="mb-8"
              animate={mounted ? { scale: hoveredMode === 'god' ? 1.1 : 1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="w-20 h-20 md:w-24 md:h-24 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </motion.div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
              God Mode
            </h2>

            {/* Description */}
            <p className="text-slate-400 text-center text-lg md:text-xl max-w-md leading-relaxed">
              Full control panel with advanced prompt engineering capabilities
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>Complete customization</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>Advanced constraints & examples</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>For power users</span>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              className="mt-12 px-8 py-3 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium"
              whileHover={mounted ? { backgroundColor: '#334155' } : undefined}
            >
              Enter God Mode →
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
