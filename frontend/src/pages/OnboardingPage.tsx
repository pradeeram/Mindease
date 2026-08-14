import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition, FadeIn } from '../components/motion/MotionWrapper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, CheckCircle2, ArrowRight, ShieldAlert, Heart, Compass } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'anxiety',
    question: 'How often have you felt overwhelmed, restless, or on edge over the past 2 weeks?',
    options: [
      { label: 'Not at all', score: 90 },
      { label: 'Several days', score: 70 },
      { label: 'More than half the days', score: 50 },
      { label: 'Nearly every day', score: 30 },
    ]
  },
  {
    id: 'rumination',
    question: 'When a stressful situation occurs, how often do you find yourself trapped in overthinking loops?',
    options: [
      { label: 'Rarely — I reframe quickly', score: 90 },
      { label: 'Sometimes — takes a few hours', score: 70 },
      { label: 'Often — lingers for days', score: 50 },
      { label: 'Constantly — affects my sleep & focus', score: 30 },
    ]
  },
  {
    id: 'sleep',
    question: 'How would you describe your current sleep quality and morning energy?',
    options: [
      { label: 'Deep, restful, wake up refreshed', score: 90 },
      { label: 'Good, occasional restless night', score: 70 },
      { label: 'Fragmented, difficult falling asleep', score: 50 },
      { label: 'Severe insomnia or racing thoughts at night', score: 30 },
    ]
  },
  {
    id: 'self_criticism',
    question: 'How does your internal voice speak to you when you make a mistake?',
    options: [
      { label: 'With kindness and self-compassion', score: 90 },
      { label: 'Fair and constructive', score: 70 },
      { label: 'Harsh, prone to self-doubt', score: 50 },
      { label: 'Extremely critical, feel like a failure', score: 30 },
    ]
  }
];

const GOALS = [
  'Break loops of catastrophic overthinking',
  'Build a daily CBT thought journaling habit',
  'Improve sleep by calming nighttime anxiety',
  'Practice 4-7-8 breathing & somatic grounding',
  'Gain insights into my emotional triggers'
];

export const OnboardingPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedGoals, setSelectedGoals] = useState<string[]>([GOALS[0], GOALS[1]]);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectAnswer = (qId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const scores = Object.values(answers);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 65;

      const res = await api.post('/users/onboarding', {
        baselineScore: avgScore,
        primaryGoals: selectedGoals,
        consentsAccepted: agreedToDisclaimer,
      });

      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
      }

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8AA399', '#4A6274', '#DDE5B6', '#2C3E50']
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition className="max-w-3xl mx-auto px-4 py-8 sm:py-14">
      {/* Progress header */}
      <div className="mb-8 text-center space-y-2">
        <Badge variant="sage">Step {step} of 3</Badge>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-deep">
          {step === 1 && 'Personalized Clinical Baseline Quiz'}
          {step === 2 && 'Set Your Wellness & CBT Goals'}
          {step === 3 && 'Ethical & Safety Agreement'}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          {step === 1 && 'Help USHA calibrate your starting emotional resilience metrics.'}
          {step === 2 && 'Select the primary areas you would like to focus on.'}
          {step === 3 && 'Important clinical boundaries and privacy protection.'}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-slate-deep h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card padding="lg" className="shadow-lg">
        {/* STEP 1: Baseline Questions */}
        {step === 1 && (
          <FadeIn className="space-y-6">
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-3 pb-4 border-b border-charcoal-soft/10 last:border-b-0">
                <h3 className="text-sm font-semibold text-slate-deep">
                  {idx + 1}. {q.question}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.score;
                    return (
                      <button
                        type="button"
                        key={opt.label}
                        onClick={() => handleSelectAnswer(q.id, opt.score)}
                        className={`p-3 rounded text-left text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-slate-deep text-bone-white border-slate-deep shadow-sm'
                            : 'bg-surface text-on-surface border-charcoal-soft/15 hover:bg-surface-container'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={Object.keys(answers).length < 2}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Goals
              </Button>
            </div>
          </FadeIn>
        )}

        {/* STEP 2: Goal Selection */}
        {step === 2 && (
          <FadeIn className="space-y-6">
            <div className="space-y-2.5">
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-3.5 rounded text-left text-sm font-medium border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-sage-light border-sage-accent text-slate-deep font-semibold'
                        : 'bg-surface text-on-surface border-charcoal-soft/15 hover:bg-surface-container'
                    }`}
                  >
                    <span>{goal}</span>
                    <CheckCircle2 className={`w-5 h-5 ${isSelected ? 'text-slate-deep' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={selectedGoals.length === 0}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Agreement
              </Button>
            </div>
          </FadeIn>
        )}

        {/* STEP 3: Disclaimer & Safety Confirmation */}
        {step === 3 && (
          <FadeIn className="space-y-6">
            <div className="bg-surface-container/60 p-4 rounded-lg space-y-3 text-xs leading-relaxed text-on-surface-variant">
              <div className="flex items-center space-x-2 text-slate-deep font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-clinical-blue" />
                <span>Clinical Scope & Emergency Disclosure</span>
              </div>
              <p>
                1. <strong>MindEase and USHA are wellness tools:</strong> They assist in self-reflection and CBT exercises. They do not replace a licensed medical professional, clinical psychologist, or psychiatrist.
              </p>
              <p>
                2. <strong>Crisis Safety:</strong> If at any point you experience acute crisis or thoughts of self-harm, USHA will immediately display 24/7 crisis hotlines (such as 988).
              </p>
              <p>
                3. <strong>Encrypted Storage:</strong> Your private thought records and chat history are encrypted using AES-256 at rest. You have the right to download or permanently delete your data at any time.
              </p>
            </div>

            <label className="flex items-start space-x-3 p-3 bg-bone-white border border-charcoal-soft/15 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToDisclaimer}
                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-slate-deep rounded border-gray-300 focus:ring-slate-deep"
              />
              <span className="text-xs text-on-surface">
                I understand that MindEase is an evidence-based wellness tool and agree to the Terms of Service & Privacy Policy.
              </span>
            </label>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                isLoading={isSubmitting}
                disabled={!agreedToDisclaimer}
                leftIcon={<Sparkles className="w-4 h-4 text-sage-muted" />}
              >
                Complete & Enter MindEase
              </Button>
            </div>
          </FadeIn>
        )}
      </Card>
    </PageTransition>
  );
};
