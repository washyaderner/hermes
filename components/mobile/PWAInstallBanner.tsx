"use client";

import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, promptInstall, dismissPrompt } = useInstallPrompt();

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 border-primary/30 bg-surface/95 backdrop-blur-sm shadow-xl animate-slide-up">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚡</div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Install Hermes</h3>
            <p className="text-sm text-gray-400 mb-3">
              Get faster access and work offline. Install as an app on your device.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={promptInstall}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                📱 Install
              </Button>
              <Button
                onClick={dismissPrompt}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Maybe Later
              </Button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </Card>
  );
}
