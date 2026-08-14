import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle, ShieldCheck, HeartHandshake, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // In production, send to privacy-compliant error logging
    console.error('MindEase App Error Boundary caught exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleGoDashboard = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-on-surface selection:bg-sage-muted selection:text-slate-deep">
          <div className="w-full max-w-xl bg-white border border-sand rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-deep/5 text-center flex flex-col items-center animate-fade-in">
            {/* Gentle Icon Backdrop */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sage-muted/60 rounded-full flex items-center justify-center text-slate-deep mb-6 shadow-inner">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-slate-deep/80 stroke-[1.5]" />
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Application Error • 500
            </div>

            {/* Editorial Heading */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-deep leading-tight mb-3">
              A Gentle Pause & Recalibration
            </h1>

            {/* Reassuring Subtitle */}
            <p className="text-sm sm:text-base text-slate-deep/70 max-w-md mx-auto leading-relaxed mb-6 font-sans">
              An unexpected issue interrupted your experience. Your personal thought diaries, mood logs, and clinical records remain safely encrypted and secure.
            </p>

            {/* Privacy & Safe Assurance Card */}
            <div className="w-full bg-surface-variant/40 border border-sand/70 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
              <ShieldCheck className="w-5 h-5 text-slate-deep shrink-0" />
              <p className="text-xs text-slate-deep/80 leading-snug">
                Data Integrity Protected: No private reflections or clinical inputs were lost or exposed.
              </p>
            </div>

            {/* Action Buttons (Mobile: full width vertical stack, Desktop: horizontal) */}
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-deep text-white text-sm font-semibold rounded-xl hover:bg-slate-deep/90 active:scale-[0.98] transition-all shadow-md shadow-slate-deep/15"
              >
                <RefreshCw className="w-4 h-4 animate-spin-once" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-sand text-slate-deep text-sm font-semibold rounded-xl hover:bg-sage-muted/30 active:scale-[0.98] transition-all"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </button>
            </div>

            {/* Collapsible Technical Details (Helpful for developer & debugging) */}
            <div className="w-full border-t border-sand/60 pt-4">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="text-xs text-slate-deep/60 hover:text-slate-deep inline-flex items-center gap-1 font-medium transition-colors"
              >
                {this.state.showDetails ? (
                  <>
                    Hide diagnostic details <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Show diagnostic details <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3.5 bg-slate-900 text-slate-100 rounded-xl text-left font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                  <p className="font-semibold text-rose-300 mb-1">
                    {this.state.error?.name}: {this.state.error?.message}
                  </p>
                  {this.state.error?.stack && (
                    <pre className="text-[11px] opacity-80 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Emergency Hotlines Fallback Banner */}
            <div className="w-full mt-6 pt-4 border-t border-sand/60 flex items-center justify-between text-left text-xs text-slate-deep/70">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Need immediate emotional support?</span>
              </div>
              <a
                href="tel:988"
                className="font-bold text-rose-700 hover:text-rose-800 underline underline-offset-2"
              >
                Call / Text 988 (24/7 Free)
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
