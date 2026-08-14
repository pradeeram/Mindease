import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, MessageSquare, BookOpen, Heart, ArrowLeft, Wind } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Optional mini calming breath pacer
  useEffect(() => {
    if (!isBreathingActive) return;

    let timer: NodeJS.Timeout;
    if (breathingPhase === 'Inhale') {
      if (seconds > 1) {
        timer = setTimeout(() => setSeconds(s => s - 1), 1000);
      } else {
        setBreathingPhase('Hold');
        setSeconds(7);
      }
    } else if (breathingPhase === 'Hold') {
      if (seconds > 1) {
        timer = setTimeout(() => setSeconds(s => s - 1), 1000);
      } else {
        setBreathingPhase('Exhale');
        setSeconds(8);
      }
    } else if (breathingPhase === 'Exhale') {
      if (seconds > 1) {
        timer = setTimeout(() => setSeconds(s => s - 1), 1000);
      } else {
        setBreathingPhase('Inhale');
        setSeconds(4);
      }
    }

    return () => clearTimeout(timer);
  }, [isBreathingActive, breathingPhase, seconds]);

  return (
    <div className="min-h-[85vh] bg-surface flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-on-surface">
      <div className="w-full max-w-2xl bg-white border border-sand rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-slate-deep/5 text-center flex flex-col items-center animate-fade-in">
        {/* Serene Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sage-muted/50 rounded-full flex items-center justify-center text-slate-deep mb-6 shadow-inner">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-slate-deep/80 stroke-[1.5] animate-pulse" />
        </div>

        {/* 404 Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-muted/70 text-slate-deep rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
          404 • Path Not Found
        </div>

        {/* Editorial Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-deep tracking-tight mb-3">
          This Path Appears Quiet
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-deep/70 max-w-md mx-auto leading-relaxed mb-8 font-sans">
          The page or reflection you are looking for isn&apos;t here. Let&apos;s guide you back to familiar, supportive ground.
        </p>

        {/* Interactive Grounding Micro-Tool Card */}
        <div className="w-full bg-surface-variant/30 border border-sand rounded-2xl p-4 sm:p-5 mb-8 text-left transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-slate-deep" />
              <span className="text-xs font-serif font-bold text-slate-deep">Feeling disconnected? Take a gentle grounding breath</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="text-xs font-semibold text-slate-deep hover:text-slate-deep/70 underline underline-offset-2"
            >
              {isBreathingActive ? 'Pause Exercise' : 'Start 1-Min Breath'}
            </button>
          </div>

          {isBreathingActive ? (
            <div className="flex items-center justify-center gap-4 py-3">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-all duration-1000 ${
                  breathingPhase === 'Inhale'
                    ? 'bg-sage-accent scale-110'
                    : breathingPhase === 'Hold'
                    ? 'bg-slate-deep scale-110'
                    : 'bg-clinical-blue scale-90'
                }`}
              >
                {seconds}s
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-slate-deep">{breathingPhase}</p>
                <p className="text-xs text-slate-deep/60">
                  {breathingPhase === 'Inhale'
                    ? 'Breathe in softly through the nose'
                    : breathingPhase === 'Hold'
                    ? 'Hold gently and stay relaxed'
                    : 'Slowly release through the mouth'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-deep/60 leading-relaxed">
              Use this peaceful pause to reset before navigating back to your dashboard or CBT journal.
            </p>
          )}
        </div>

        {/* Quick Navigation Destination Grid */}
        <div className="w-full mb-8">
          <p className="text-xs font-serif font-bold text-slate-deep/60 uppercase tracking-wider mb-3 text-left">
            Choose where you&apos;d like to go:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-3 bg-white border border-sand rounded-xl hover:border-slate-deep/40 hover:bg-sage-muted/20 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-sage-muted/60 flex items-center justify-center text-slate-deep group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-deep">My Dashboard</p>
                <p className="text-[11px] text-slate-deep/60">View mood trends & daily tasks</p>
              </div>
            </Link>

            <Link
              to="/chat"
              className="flex items-center gap-3 p-3 bg-white border border-sand rounded-xl hover:border-slate-deep/40 hover:bg-sage-muted/20 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-clinical-blue/15 flex items-center justify-center text-clinical-blue group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-deep">USHA AI Studio</p>
                <p className="text-[11px] text-slate-deep/60">Voice & text reflections</p>
              </div>
            </Link>

            <Link
              to="/journal"
              className="flex items-center gap-3 p-3 bg-white border border-sand rounded-xl hover:border-slate-deep/40 hover:bg-sage-muted/20 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-sage-accent/20 flex items-center justify-center text-slate-deep group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-deep">CBT Thought Diary</p>
                <p className="text-[11px] text-slate-deep/60">Cognitive reframing tools</p>
              </div>
            </Link>

            <Link
              to="/resources"
              className="flex items-center gap-3 p-3 bg-white border border-sand rounded-xl hover:border-slate-deep/40 hover:bg-sage-muted/20 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-deep">Crisis & Hotlines</p>
                <p className="text-[11px] text-slate-deep/60">24/7 Lifeline support directory</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sand/60">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-deep/70 hover:text-slate-deep transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go back to previous page
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-deep/70 hover:text-slate-deep transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
