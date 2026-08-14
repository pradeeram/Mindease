import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferencesSaved: boolean;
}

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('mindease_cookie_consent');
    if (!saved) {
      // Delay showing slightly so it does not interfere with initial page render
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setAnalyticsEnabled(Boolean(parsed.analytics));
      } catch (_) {}
    }
  }, []);

  const saveConsent = (analytics: boolean) => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics,
      preferencesSaved: true,
    };
    localStorage.setItem('mindease_cookie_consent', JSON.stringify(prefs));
    setAnalyticsEnabled(analytics);
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <Card padding="md" className="shadow-2xl border-2 border-charcoal-soft/15 bg-bone-white/95 backdrop-blur-md">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sage-light text-slate-deep flex items-center justify-center">
                <Cookie className="w-4 h-4 text-slate-deep" />
              </div>
              <h4 className="text-sm font-serif font-bold text-slate-deep">
                Cookie & Privacy Preferences
              </h4>
            </div>
            <button
              onClick={() => saveConsent(false)}
              className="text-on-surface-variant hover:text-slate-deep p-1 text-xs"
              title="Close and keep essential only"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            MindEase uses strictly necessary cookies to ensure secure authentication and encryption. Optional performance cookies are disabled by default. Read our{' '}
            <Link to="/privacy" className="text-clinical-blue underline">
              Privacy Notice
            </Link>.
          </p>

          {showPreferences && (
            <div className="space-y-2.5 p-3 bg-surface rounded-lg border border-charcoal-soft/10 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-deep block">Essential Cookies</span>
                  <span className="text-[10px] text-on-surface-variant">Authentication tokens & CSRF protection</span>
                </div>
                <span className="px-2 py-0.5 bg-sage-light text-slate-deep rounded text-[10px] font-bold">
                  Always Active
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-charcoal-soft/10">
                <div>
                  <span className="font-bold text-slate-deep block">Analytics & Performance</span>
                  <span className="text-[10px] text-on-surface-variant">Aggregated error & performance metrics</span>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="w-4 h-4 text-slate-deep rounded border-charcoal-soft/30 focus:ring-slate-deep"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-[11px] font-semibold text-clinical-blue hover:underline flex items-center space-x-1"
            >
              <Settings className="w-3 h-3 mr-1" />
              <span>{showPreferences ? 'Hide Options' : 'Customize Options'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => saveConsent(false)}
              >
                Essential Only
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => saveConsent(showPreferences ? analyticsEnabled : true)}
              >
                {showPreferences ? 'Save Choices' : 'Accept All'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
