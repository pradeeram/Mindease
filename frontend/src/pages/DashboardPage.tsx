import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { speechService } from '../services/speech';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/MotionWrapper';
import {
  Sparkles,
  Smile,
  BookOpen,
  Wind,
  Flame,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { entries, stats, openQuickLog } = useMood();
  const [aiName, setAiName] = useState<string>(speechService.getActiveAiName());

  useEffect(() => {
    setAiName(speechService.getActiveAiName());
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayLogged = entries.some(e => {
    const today = new Date().toDateString();
    return new Date(e.loggedAt).toDateString() === today;
  });

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Welcoming Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-bone-white border border-charcoal-soft/10 p-7 sm:p-9 rounded-2xl shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-blue">
              {getGreeting()}, {user?.name.split(' ')[0] || 'Friend'}
            </span>
            <span className="text-sm">🌿</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-deep tracking-tight">
            How is your mental room feeling today?
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            {todayLogged
              ? `You have completed today's check-in! Your active reflection streak is ${stats?.streakDays || 1} days.`
              : 'Taking a 60-second pause to notice your thoughts and bodily sensations creates emotional space.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!todayLogged ? (
            <Button
              variant="sage"
              size="lg"
              onClick={openQuickLog}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Daily Check-in
            </Button>
          ) : (
            <div className="flex items-center space-x-2 bg-sage-light px-4 py-2.5 rounded-xl border border-sage-accent/30 text-xs font-semibold text-slate-deep">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Checked in today</span>
            </div>
          )}

          <Link to="/chat">
            <Button variant="primary" size="lg" leftIcon={<Sparkles className="w-4 h-4 text-sage-muted" />}>
              {aiName} Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak Metric */}
        <Card padding="lg" className="flex items-center space-x-4 bg-bone-white border border-charcoal-soft/10 shadow-sm">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center p-3">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
              Reflection Streak
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-deep">
              {stats?.streakDays ?? 0} <span className="text-xs font-sans font-normal text-on-surface-variant">days</span>
            </div>
          </div>
        </Card>

        {/* 30-day Average Mood */}
        <Card padding="lg" className="flex items-center space-x-4 bg-bone-white border border-charcoal-soft/10 shadow-sm">
          <div className="w-13 h-13 rounded-2xl bg-sage-light text-slate-deep border border-sage-accent/30 flex items-center justify-center p-3">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
              30-Day Average
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-deep">
              {stats?.averageMood ? `${stats.averageMood} / 10` : '—'}
            </div>
          </div>
        </Card>

        {/* Total Reflections */}
        <Card padding="lg" className="flex items-center space-x-4 bg-bone-white border border-charcoal-soft/10 shadow-sm">
          <div className="w-13 h-13 rounded-2xl bg-clinical-blue-light text-clinical-blue border border-clinical-blue/20 flex items-center justify-center p-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
              Logs & Reframes
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-deep">
              {stats?.totalEntries ?? 0} <span className="text-xs font-sans font-normal text-on-surface-variant">entries</span>
            </div>
          </div>
        </Card>

        {/* Somatic Reset Shortcut */}
        <Card padding="lg" className="flex items-center space-x-4 bg-gradient-to-r from-surface-container to-surface border border-charcoal-soft/10 shadow-sm">
          <div className="w-13 h-13 rounded-2xl bg-slate-deep text-bone-white flex items-center justify-center p-3">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
              Breathing Guide
            </div>
            <Link to="/resources" className="text-xs sm:text-sm font-bold text-clinical-blue hover:underline flex items-center mt-1">
              4-7-8 Pacer <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. Core Workspace Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Mindful Prompt + Recent Entries */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mindful Prompt of the Day */}
          <Card padding="lg" className="bg-gradient-to-tr from-bone-white via-surface to-sage-light/20 border border-charcoal-soft/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="blue">Daily CBT Thought Reframer</Badge>
              <span className="text-xs text-on-surface-variant flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-deep">
              "What is one assumption you made today that you have not tested against real facts?"
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              In CBT, we often mistake emotional predictions for objective certainty. Take 2 minutes to write it in your Thought Diary and challenge automatic cognitive distortions.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/journal">
                <Button size="md" variant="primary" rightIcon={<BookOpen className="w-3.5 h-3.5" />}>
                  Open Thought Diary
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="md" variant="ghost">
                  Discuss with {aiName}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Mood Check-in History */}
          <Card padding="lg" className="space-y-6 bg-bone-white border border-charcoal-soft/10 shadow-sm">
            <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-4">
              <h3 className="text-lg font-serif font-bold text-slate-deep">
                Recent Mood Reflections
              </h3>
              <Link to="/mood" className="text-xs font-semibold text-clinical-blue hover:underline flex items-center">
                View Timeline <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant text-xs space-y-3">
                <p>No mood logs recorded yet. Start tracking your patterns today.</p>
                <Button variant="sage" size="sm" onClick={openQuickLog}>
                  Log Your First Mood
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.slice(0, 4).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface/70 border border-charcoal-soft/10 hover:bg-surface-container/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-full bg-bone-white border border-charcoal-soft/15 flex items-center justify-center font-serif font-bold text-xs text-slate-deep shadow-xs">
                        {entry.score}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-deep">
                          {entry.primaryEmotion}
                        </div>
                        <div className="text-[11px] text-on-surface-variant">
                          {new Date(entry.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {entry.sleepHours ? ` · ${entry.sleepHours}h sleep` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {entry.factors.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-[10px] bg-surface-container px-2.5 py-1 rounded-lg text-on-surface-variant font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: AI Quick Companion & Somatic Grounding */}
        <div className="space-y-8">
          {/* AI Assistant Box */}
          <Card padding="lg" className="bg-slate-deep text-bone-white shadow-md space-y-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-sage-accent/20 border border-sage-accent/40 flex items-center justify-center text-sage-muted">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold tracking-wide">{aiName} AI Studio</h4>
                  <p className="text-[10px] text-sage-muted">Mindful CBT Companion</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <p className="text-xs text-bone-white/85 leading-relaxed">
              "How are you treating yourself today? If your thoughts feel heavy, we can explore evidence-based reframing together."
            </p>

            <div className="space-y-2 pt-1">
              <Link to="/chat" className="block">
                <Button variant="sage" size="md" className="w-full justify-center">
                  Start Conversation
                </Button>
              </Link>
              <Link to="/settings#customization" className="block text-center text-[11px] text-sage-muted hover:underline pt-1">
                Customize AI Name & Voice Tone
              </Link>
            </div>
          </Card>

          {/* Quick Grounding Box */}
          <Card padding="lg" className="space-y-4 bg-surface-container/50 border border-charcoal-soft/10 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-deep">
                Immediate Grounding
              </h4>
              <Badge variant="blue">4-7-8 Pacer</Badge>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Inhale for 4s, hold gently for 7s, and release smoothly for 8s to soothe your autonomic nervous system.
            </p>
            <Link to="/resources" className="block pt-1">
              <Button variant="secondary" size="md" className="w-full justify-center" leftIcon={<Wind className="w-4 h-4 text-sage-accent" />}>
                Launch Breathing Guide
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};
