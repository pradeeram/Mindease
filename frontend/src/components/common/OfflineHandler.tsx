import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, PhoneCall } from 'lucide-react';

export const OfflineHandler: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => setShowReconnectedBanner(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnectedBanner) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 shadow-md animate-fade-in">
        <Wifi className="w-3.5 h-3.5" />
        <span>Connection Restored — MindEase is back online and synchronized.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-slate-900/95 text-slate-100 text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-md border-b border-slate-700/50 animate-fade-in">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Working Offline:</strong> Offline somatic breathing, grounding tools, and local diaries remain available.
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-slate-400">Emergency lifeline:</span>
        <a href="tel:988" className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold underline">
          <PhoneCall className="w-3 h-3" />
          Call 988 (Works without WiFi)
        </a>
      </div>
    </div>
  );
};
