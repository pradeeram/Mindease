import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem, HoverCard } from '../components/motion/MotionWrapper';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Activity,
  BookOpen,
  Smile,
  CheckCircle2,
  ArrowRight,
  Lock,
  Wind,
  Phone,
  Compass,
  MessageSquare
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <PageTransition className="space-y-24 py-6 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 text-center">
        <FadeIn delay={0.1} direction="up">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sage-light border border-sage-accent/30 text-slate-deep text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-sage-accent" />
            <span>Clinical Empathy & Evidence-Based CBT Framework</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-slate-deep tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Structured Relief from Overthinking, Grounded in Science.
          </h1>
        </FadeIn>

        <FadeIn delay={0.3} direction="up">
          <p className="mt-6 text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto font-sans leading-relaxed">
            MindEase bridges clinical psychological rigor with tranquil design. Challenge automatic negative thoughts, track emotional patterns, and speak freely with <strong>USHA</strong>—your AI companion.
          </p>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Begin Your Journey — Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-on-surface-variant">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" /> No credit card required</span>
            <span className="flex items-center"><Lock className="w-4 h-4 text-clinical-blue mr-1.5" /> AES-256 encrypted at rest</span>
            <span className="flex items-center"><ShieldCheck className="w-4 h-4 text-slate-deep mr-1.5" /> TOTP Two-Factor Auth</span>
          </div>
        </FadeIn>

        {/* Hero Interactive Preview Card */}
        <FadeIn delay={0.5} direction="up" className="mt-14 max-w-4xl mx-auto">
          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-charcoal-soft/10 to-transparent shadow-2xl border border-charcoal-soft/10">
            <div className="bg-bone-white rounded-xl p-6 sm:p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daily Check-in column */}
              <div className="space-y-3 p-4 bg-surface-container/50 rounded-lg border border-charcoal-soft/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-deep">Daily Emotion Wheel</span>
                  <Badge variant="sage">7.8 / 10</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-deep">Calm & Present</div>
                    <div className="text-[11px] text-on-surface-variant">Sleep: 8.0 hrs · Anxiety: 2/10</div>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sage-accent h-full w-[78%]" />
                </div>
              </div>

              {/* CBT Thought Record column */}
              <div className="space-y-2.5 p-4 bg-surface-container/50 rounded-lg border border-charcoal-soft/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-deep">CBT Restructuring</span>
                  <Badge variant="blue">Reframe</Badge>
                </div>
                <p className="text-xs text-on-surface line-clamp-2 italic">
                  "If I make one slip-up, the presentation is a failure..."
                </p>
                <div className="text-xs text-clinical-blue font-medium bg-bone-white p-2 rounded border border-clinical-blue/20">
                  Reframed: <em>"One pause is human; leadership values the metrics."</em>
                </div>
              </div>

              {/* USHA AI Reflection column */}
              <div className="space-y-3 p-4 bg-slate-deep text-bone-white rounded-lg shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs text-sage-muted font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>USHA Companion</span>
                  </div>
                  <p className="text-xs text-bone-white/90 mt-2 leading-relaxed">
                    "Take a slow breath. Notice how the word 'should' is creating urgency. You've got this."
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-sage-muted">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Voice & Text Ready</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 2. The Science of Relief (CBT Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="blue" className="mb-3">The Science of Relief</Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-deep">
            How Cognitive Behavioral Therapy Rewires Thought Patterns
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant mt-3">
            MindEase is built upon evidence-based psychological frameworks proven to reduce anxiety, break rumination loops, and build emotional resilience.
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StaggerItem>
            <Card padding="lg" className="h-full space-y-4 hover:border-clinical-blue transition-colors">
              <div className="w-12 h-12 rounded-lg bg-clinical-blue-light text-clinical-blue flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-deep">
                1. Identify Distortions
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Spot automatic negative thought traps such as Catastrophizing, All-or-Nothing thinking, and Mind Reading before they escalate into spiral cycles.
              </p>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card padding="lg" className="h-full space-y-4 hover:border-sage-accent transition-colors">
              <div className="w-12 h-12 rounded-lg bg-sage-light text-slate-deep flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-deep">
                2. Examine & Reframe
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Follow our 5-step guided worksheet to test thoughts against empirical evidence and construct balanced, self-compassionate alternative viewpoints.
              </p>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card padding="lg" className="h-full space-y-4 hover:border-slate-deep transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface-container text-slate-deep flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-deep">
                3. Track & Ground
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Correlate mood shifts with sleep, work, and exercise over 30-day horizons while regulating the autonomic nervous system via 4-7-8 breathing pacers.
              </p>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* 3. Features & Tools Deep Dive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="sage">Feature Suite</Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-deep leading-tight">
              An Integrated Platform for Daily Emotional Clarity
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Every tool in MindEase is designed with clinical empathy. No cluttered notifications, no gamified stress—just calm, intentional space to reflect and heal.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-sage-light text-slate-deep rounded mt-0.5">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-deep">Granular Emotion Wheels & Factors</h4>
                  <p className="text-xs text-on-surface-variant">Track 10+ emotional nuances, sleep hours, anxiety, and energy level correlations.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-clinical-blue-light text-clinical-blue rounded mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-deep">USHA AI Companion (Voice & Text)</h4>
                  <p className="text-xs text-on-surface-variant">Empathetic CBT conversational agent with Web Speech STT/TTS and built-in 988 crisis safety guardrails.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-surface-container text-slate-deep rounded mt-0.5">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-deep">Somatic Grounding & Crisis Support</h4>
                  <p className="text-xs text-on-surface-variant">Interactive 4-7-8 Breathing Pacer, 5-4-3-2-1 Sensory Guide, and 24/7 Global Hotlines.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/register">
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore All Tools
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-bone-white border border-charcoal-soft/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-4">
              <div>
                <h4 className="font-serif font-bold text-slate-deep text-lg">Weekly Mood & Distortion Analytics</h4>
                <p className="text-xs text-on-surface-variant">Demonstration Insights</p>
              </div>
              <Badge variant="blue">+3.2 Relief Score</Badge>
            </div>

            {/* Micro visual chart mock */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="flex items-end justify-between h-28 gap-2 pt-4">
                {[45, 55, 60, 50, 75, 85, 80].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-slate-deep/80 rounded-t transition-all hover:bg-clinical-blue"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-on-surface-variant">{val / 10}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container/60 p-4 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-deep font-semibold">Top Distortion Identified:</span>
              <Badge variant="slate">Catastrophizing (4 entries)</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Enterprise Security & Privacy Assurance */}
      <section className="bg-slate-deep text-bone-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto my-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="sage">Privacy by Design</Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-bone-white">
            Your Mental Health Data Belongs to You Alone.
          </h2>
          <p className="text-sm sm:text-base text-bone-white/80 leading-relaxed max-w-2xl mx-auto">
            Mental health records are sensitive. MindEase implements end-to-end security, TOTP Multi-Factor Authentication, AES-256 data-at-rest encryption, and full GDPR compliance with one-click data export and Right-to-be-Forgotten account purges.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left pt-8">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
              <Lock className="w-5 h-5 text-sage-muted" />
              <h4 className="font-semibold text-sm text-bone-white">AES-256 Encryption</h4>
              <p className="text-xs text-bone-white/70">All thought logs, notes, and chat transcripts are encrypted before hitting the database.</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
              <ShieldCheck className="w-5 h-5 text-sage-muted" />
              <h4 className="font-semibold text-sm text-bone-white">TOTP Two-Factor Auth</h4>
              <p className="text-xs text-bone-white/70">Secure your account with Google Authenticator, Microsoft Authenticator, or Authy.</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
              <Compass className="w-5 h-5 text-sage-muted" />
              <h4 className="font-semibold text-sm text-bone-white">GDPR & HIPAA Mindful</h4>
              <p className="text-xs text-bone-white/70">Instant JSON/CSV export and instant permanent account deletion anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="text-center max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-deep">
          Start Your Journey to Mental Clarity Today.
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant">
          Join thousands finding structured, evidence-based calm with MindEase.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Free Account
            </Button>
          </Link>
          <Link to="/resources">
            <Button size="lg" variant="ghost">
              View Crisis Resources
            </Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  );
};
