"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StreamingOutputProps {
  text: string;
  isStreaming: boolean;
  onCancel?: () => void;
  provider?: string;
  speed?: number; // tokens per second
}

export function StreamingOutput({ 
  text, 
  isStreaming, 
  onCancel,
  provider = 'AI',
  speed = 0 
}: StreamingOutputProps) {
  const [displayText, setDisplayText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (isStreaming) {
      setDisplayText(text);
    } else {
      setDisplayText(text);
    }
  }, [text, isStreaming]);

  // Blinking cursor
  useEffect(() => {
    if (!isStreaming) {
      setCursorVisible(false);
      return;
    }

    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  if (!text && !isStreaming) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              {isStreaming ? `Streaming from ${provider}...` : `Response from ${provider}`}
            </span>
            {speed > 0 && (
              <span className="text-xs text-green-400">
                {speed.toFixed(1)} tokens/sec
              </span>
            )}
          </div>
          {isStreaming && onCancel && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              ⏹ Cancel
            </Button>
          )}
        </div>

        <div className="relative bg-[#0a0014] rounded-lg p-4 border border-border min-h-[100px]">
          <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
            {displayText}
            {isStreaming && cursorVisible && (
              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
            )}
          </pre>

          {isStreaming && (
            <div className="absolute bottom-2 right-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
