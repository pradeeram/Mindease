import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CrisisHotline, GroundingTechnique, SafetyPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageTransition, FadeIn, BreathingOrb } from '../components/motion/MotionWrapper';
import {
  ShieldAlert,
  Phone,
  MessageSquare,
  Wind,
  Eye,
  HeartHandshake,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Globe,
  Sparkles
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [hotlines, setHotlines] = useState<CrisisHotline[]>([]);
  const [activeTab, setActiveTab] = useState<'HOTLINES' | 'BREATHING' | 'GROUNDING' | 'SAFETY_PLAN'>('HOTLINES');

  // Breathing Pacer State (4-7-8)
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE' | 'REST'>('INHALE');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // 5-4-3-2-1 Sensory State
  const [currentSenseStep, setCurrentSenseStep] = useState<number>(0);

  // Safety Plan State
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>({
    warningSigns: ['Tightness in chest', 'Difficulty falling asleep'],
    copingStrategies: ['4-7-8 Breathing Pacer', 'Listening to acoustic music'],
    distractionPlaces: ['Botanical garden', 'Local library'],
    supportiveContacts: [{ name: 'Close Friend / Partner', phone: '555-0100', relationship: 'Friend' }],
    professionalResources: [{ agency: '988 Suicide & Crisis Lifeline', phone: '988', contact: '24/7 Call/Text' }],
    safeEnvironmentSteps: ['Keep bedroom screen-free past 10 PM'],
  });
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [planSavedNotice, setPlanSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/resources/hotlines');
        if (res.data?.data?.hotlines) {
          setHotlines(res.data.data.hotlines);
        }

        if (user) {
          const planRes = await api.get('/resources/safety-plan');
          if (planRes.data?.data?.plan && planRes.data.data.plan.warningSigns.length > 0) {
            setSafetyPlan(planRes.data.data.plan);
          }
        }
      } catch (err) {
        console.error('Error loading resources:', err);
      }
    }
    loadData();
  }, [user]);

  // 4-7-8 Breathing Timer Loop
  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'INHALE') {
              setBreathPhase('HOLD');
              return 7;
            } else if (breathPhase === 'HOLD') {
              setBreathPhase('EXHALE');
              return 8;
            } else if (breathPhase === 'EXHALE') {
              setCompletedCycles(c => c + 1);
              setBreathPhase('INHALE');
              return 4;
            }
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase]);

  const handleToggleBreathing = () => {
    if (isBreathingActive) {
      setIsBreathingActive(false);
      setBreathPhase('INHALE');
      setSecondsLeft(4);
    } else {
      setIsBreathingActive(true);
      setBreathPhase('INHALE');
      setSecondsLeft(4);
      setCompletedCycles(0);
    }
  };

  const handleSaveSafetyPlan = async () => {
    if (!user) return;
    setIsSavingPlan(true);
    try {
      await api.put('/resources/safety-plan', safetyPlan);
      setPlanSavedNotice(true);
      setTimeout(() => setPlanSavedNotice(false), 3000);
    } catch (err) {
      console.error('Error saving safety plan:', err);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const SENSORY_STEPS = [
    { count: 5, prompt: 'Acknowledge 5 things you can SEE around you.', examples: 'A plant, a pattern on the wall, your shoes, a light reflection, a cup.' },
    { count: 4, prompt: 'Acknowledge 4 things you can physically TOUCH or feel.', examples: 'The surface of your desk, texture of your sleeves, feet flat on the floor, your own hand.' },
    { count: 3, prompt: 'Acknowledge 3 distinct sounds you can HEAR.', examples: 'Clock ticking, traffic outside, hum of a fan, birds singing, your own breath.' },
    { count: 2, prompt: 'Acknowledge 2 things you can SMELL right now.', examples: 'Fresh air, coffee aroma, scent of soap, or simply breathing in through your nose.' },
    { count: 1, prompt: 'Acknowledge 1 thing you can TASTE.', examples: 'A sip of water, a mint, or acknowledging the natural taste in your mouth.' },
  ];

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-charcoal-soft/10 pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-error" />
          <Badge variant="error">24/7 Crisis & Grounding Suite</Badge>
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-deep">
          Immediate Support, Somatic Reset & Safety Tools
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
          Access free 24/7 confidential helplines, regulate your nervous system with interactive breathing pacers, or maintain a personalized crisis safety plan.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-charcoal-soft/10 pb-3">
        <button
          onClick={() => setActiveTab('HOTLINES')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-bold transition-all ${
            activeTab === 'HOTLINES'
              ? 'bg-slate-deep text-bone-white shadow-sm'
              : 'bg-bone-white text-on-surface-variant hover:bg-surface-container border border-charcoal-soft/10'
          }`}
        >
          <Phone className="w-4 h-4 text-error" />
          <span>24/7 Crisis Hotlines</span>
        </button>

        <button
          onClick={() => setActiveTab('BREATHING')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-bold transition-all ${
            activeTab === 'BREATHING'
              ? 'bg-slate-deep text-bone-white shadow-sm'
              : 'bg-bone-white text-on-surface-variant hover:bg-surface-container border border-charcoal-soft/10'
          }`}
        >
          <Wind className="w-4 h-4 text-sage-accent" />
          <span>4-7-8 Breathing Pacer</span>
        </button>

        <button
          onClick={() => setActiveTab('GROUNDING')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-bold transition-all ${
            activeTab === 'GROUNDING'
              ? 'bg-slate-deep text-bone-white shadow-sm'
              : 'bg-bone-white text-on-surface-variant hover:bg-surface-container border border-charcoal-soft/10'
          }`}
        >
          <Eye className="w-4 h-4 text-clinical-blue" />
          <span>5-4-3-2-1 Sensory Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('SAFETY_PLAN')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-bold transition-all ${
            activeTab === 'SAFETY_PLAN'
              ? 'bg-slate-deep text-bone-white shadow-sm'
              : 'bg-bone-white text-on-surface-variant hover:bg-surface-container border border-charcoal-soft/10'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-slate-deep" />
          <span>Personal Safety Plan</span>
        </button>
      </div>

      {/* TAB 1: Crisis Hotlines */}
      {activeTab === 'HOTLINES' && (
        <FadeIn className="space-y-6">
          <div className="bg-error-container/30 border-l-4 border-error p-4 rounded-r-lg">
            <h3 className="text-sm font-bold text-slate-deep">You Are Never Alone</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              If you are in immediate physical danger, call your local emergency services (such as <strong>911</strong> in the US or <strong>112</strong> in Europe) or go to the nearest emergency room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotlines.map((hl) => (
              <Card key={hl.id} padding="lg" className="space-y-3 hover:border-error/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-blue">
                      {hl.country}
                    </span>
                    <h4 className="text-base font-serif font-bold text-slate-deep mt-0.5">
                      {hl.name}
                    </h4>
                  </div>
                  <Badge variant="error">{hl.number}</Badge>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {hl.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-charcoal-soft/10">
                  <div className="flex flex-wrap gap-1">
                    {hl.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">
                        {t}
                      </span>
                    ))}
                  </div>

                  {hl.number.startsWith('Text') ? (
                    <a
                      href="sms:741741?&body=HOME"
                      className="inline-flex items-center text-xs font-bold text-clinical-blue hover:underline"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Send SMS
                    </a>
                  ) : hl.number !== 'Visit Website' ? (
                    <a
                      href={`tel:${hl.number.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center text-xs font-bold text-slate-deep hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" /> Call Now
                    </a>
                  ) : (
                    <a
                      href={hl.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-clinical-blue hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 mr-1" /> Directory Website
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </FadeIn>
      )}

      {/* TAB 2: 4-7-8 Breathing Pacer */}
      {activeTab === 'BREATHING' && (
        <FadeIn className="max-w-2xl mx-auto text-center space-y-6">
          <Card padding="xl" className="space-y-4">
            <Badge variant="sage">Somatic Parasympathetic Guide</Badge>
            <h3 className="text-2xl font-serif font-bold text-slate-deep">
              4-7-8 Relaxing Breath Pacer
            </h3>
            <p className="text-xs text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              Dr. Andrew Weil's clinically validated breathing pattern: Inhale for 4s, hold gently for 7s, and exhale smoothly for 8s to calm acute adrenaline spikes.
            </p>

            {/* Animated Breathing Orb */}
            <BreathingOrb phase={breathPhase} secondsLeft={secondsLeft} />

            <div className="text-xs font-semibold text-slate-deep">
              Completed Cycles: <span className="font-bold text-clinical-blue">{completedCycles}</span> / 4 recommended
            </div>

            <div className="pt-2">
              <Button
                variant={isBreathingActive ? 'secondary' : 'primary'}
                size="lg"
                onClick={handleToggleBreathing}
                leftIcon={<Wind className="w-4 h-4 text-sage-accent" />}
              >
                {isBreathingActive ? 'Pause Exercise' : 'Start 4-7-8 Breathing'}
              </Button>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* TAB 3: 5-4-3-2-1 Sensory Grounding */}
      {activeTab === 'GROUNDING' && (
        <FadeIn className="max-w-2xl mx-auto space-y-6">
          <Card padding="lg" className="space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-deep">
                  5-4-3-2-1 Sensory Grounding Guide
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Step {currentSenseStep + 1} of 5 — Pull focus from panic back into safe physical presence.
                </p>
              </div>
              <Badge variant="blue">{SENSORY_STEPS[currentSenseStep].count} Senses</Badge>
            </div>

            <div className="p-6 bg-sage-light/40 border border-sage-accent/30 rounded-xl space-y-3">
              <h4 className="text-base font-serif font-bold text-slate-deep">
                {SENSORY_STEPS[currentSenseStep].prompt}
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <strong>Examples:</strong> {SENSORY_STEPS[currentSenseStep].examples}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentSenseStep === 0}
                onClick={() => setCurrentSenseStep(prev => Math.max(0, prev - 1))}
              >
                Previous Step
              </Button>

              <div className="flex space-x-1.5">
                {SENSORY_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentSenseStep ? 'bg-slate-deep' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {currentSenseStep < SENSORY_STEPS.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentSenseStep(prev => Math.min(SENSORY_STEPS.length - 1, prev + 1))}
                >
                  Next Sense
                </Button>
              ) : (
                <Button
                  variant="sage"
                  size="sm"
                  onClick={() => setCurrentSenseStep(0)}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-slate-deep" />}
                >
                  Finish Grounding
                </Button>
              )}
            </div>
          </Card>
        </FadeIn>
      )}

      {/* TAB 4: Personal Safety Plan */}
      {activeTab === 'SAFETY_PLAN' && (
        <FadeIn className="max-w-3xl mx-auto space-y-6">
          <Card padding="lg" className="space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-deep">
                  My Personal Safety & Coping Plan
                </h3>
                <p className="text-xs text-on-surface-variant">
                  A structured action plan created during calm moments to navigate future emotional storms.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSafetyPlan}
                isLoading={isSavingPlan}
                leftIcon={<Save className="w-4 h-4 text-sage-muted" />}
              >
                Save Safety Plan
              </Button>
            </div>

            {planSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Safety Plan successfully updated in your encrypted account.
              </div>
            )}

            {/* 1. Warning Signs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-deep">
                1. My Personal Warning Signs (Thoughts, behaviors, physical sensations)
              </label>
              <textarea
                rows={2}
                value={safetyPlan.warningSigns.join('\n')}
                onChange={(e) => setSafetyPlan({ ...safetyPlan, warningSigns: e.target.value.split('\n').filter(Boolean) })}
                placeholder="One per line (e.g. Tight chest, racing thoughts, wanting to isolate)"
                className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
              />
            </div>

            {/* 2. Coping Mechanisms */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-deep">
                2. Internal Coping Strategies (Things I can do without contacting anyone)
              </label>
              <textarea
                rows={2}
                value={safetyPlan.copingStrategies.join('\n')}
                onChange={(e) => setSafetyPlan({ ...safetyPlan, copingStrategies: e.target.value.split('\n').filter(Boolean) })}
                placeholder="One per line (e.g. 4-7-8 Breathing, listening to playlist, splashing cold water)"
                className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
              />
            </div>

            {/* 3. Supportive Contacts */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-deep">
                3. People & Social Settings That Provide Distraction or Support
              </label>
              <textarea
                rows={2}
                value={safetyPlan.distractionPlaces.join('\n')}
                onChange={(e) => setSafetyPlan({ ...safetyPlan, distractionPlaces: e.target.value.split('\n').filter(Boolean) })}
                placeholder="One per line (e.g. Going to local coffee shop, visiting public library)"
                className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
              />
            </div>

            {/* 4. Safe Environment Steps */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-deep">
                4. Steps to Make My Physical Environment Safe
              </label>
              <textarea
                rows={2}
                value={safetyPlan.safeEnvironmentSteps.join('\n')}
                onChange={(e) => setSafetyPlan({ ...safetyPlan, safeEnvironmentSteps: e.target.value.split('\n').filter(Boolean) })}
                placeholder="One per line (e.g. Setting phone to Do Not Disturb, stepping away from laptop)"
                className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
              />
            </div>
          </Card>
        </FadeIn>
      )}
    </PageTransition>
  );
};
