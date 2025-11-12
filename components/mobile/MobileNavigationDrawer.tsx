"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigationDrawer({ isOpen, onClose }: MobileNavigationDrawerProps) {
  const pathname = usePathname();
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe left to close (diff > 50)
    if (diff > 50) {
      onClose();
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const navigationItems = [
    { href: '/dashboard', label: '🏠 Dashboard', icon: '🏠' },
    { href: '/history', label: '📜 History', icon: '📜' },
    { href: '/templates', label: '📋 Templates', icon: '📋' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#1a0f2e] border-r border-purple-500/20 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <h2 className="text-xl font-bold text-white">Hermes</h2>
              <p className="text-xs text-gray-400">Prompt Optimizer</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-gray-300 hover:bg-purple-600/10 hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-purple-500/20">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-purple-500/20 hover:bg-purple-600/10"
              onClick={() => {
                localStorage.removeItem('session');
                window.location.href = '/auth/login';
              }}
            >
              <span className="text-xl">🚪</span>
              <span>Sign Out</span>
            </Button>
            <p className="text-xs text-center text-gray-500">
              Version 0.1.0 • PWA Ready
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
