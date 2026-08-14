import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useMood } from '../../context/MoodContext';
import { Sparkles, Moon, Activity, Zap } from 'lucide-react';

const EMOTIONS = [
  { name: 'Joy', icon: '✨', color: 'border-amber-400 bg-amber-50 text-amber-900' },
  { name: 'Calm', icon: '🌿', color: 'border-sage-accent bg-sage-light text-slate-deep' },
  { name: 'Contentment', icon: '☕', color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
  { name: 'Gratitude', icon: '🙏', color: 'border-teal-400 bg-teal-50 text-teal-900' },
  { name: 'Neutral', icon: '⚖️', color: 'border-gray-300 bg-gray-50 text-gray-800' },
  { name: 'Anxiety', icon: '⚡', color: 'border-indigo-400 bg-indigo-50 text-indigo-900' },
  { name: 'Overwhelm', icon: '🌊', color: 'border-blue-400 bg-blue-50 text-blue-900' },
  { name: 'Sadness', icon: '🌧️', color: 'border-cyan-400 bg-cyan-50 text-cyan-900' },
  { name: 'Anger', icon: '🔥', color: 'border-rose-400 bg-rose-50 text-rose-900' },
  { name: 'Fatigue', icon: '🌙', color: 'border-purple-400 bg-purple-50 text-purple-900' },
];

const FACTORS = [
  'Sleep', 'Work', 'Exercise', 'Nutrition', 'Social', 'Family',
  'Screen Time', 'Nature', 'Meditation', 'Hobbies', 'Commute', 'Weather'
];

export const MoodCheckInModal: React.FC = () => {
  const { isQuickLogOpen, closeQuickLog, logMood } = useMood();
  const [score, setScore] = useState<number>(7);
  const [primaryEmotion, setPrimaryEmotion] = useState<string>('Calm');
  const [selectedFactors, setSelectedFactors] = useState<string[]>(['Sleep', 'Work']);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleFactor = (f: string) => {
    setSelectedFactors(prev =>
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logMood({
        score,
        primaryEmotion,
        secondaryEmotions: [],
        intensity: score * 10,
        factors: selectedFactors,
        sleepHours,
        anxietyLevel,
        energyLevel,
        notes,
      });

      // Confetti burst for mindful self-care
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8AA399', '#DDE5B6', '#4A6274', '#2C3E50']
      });

      closeQuickLog();
      setNotes('');
    } catch (err) {
      console.error('Error logging mood:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isQuickLogOpen}
      onClose={closeQuickLog}
      maxWidth="2xl"
      title="Daily Mindful Check-in"
      description="Tune in to your emotional and physical state without judgment."
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* 1. Overall Score Slider */}
        <div className="bg-surface-container/60 p-4 rounded-lg border border-charcoal-soft/10">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-deep">
              How are you feeling overall right now?
            </label>
            <span className="text-xl font-serif font-bold text-clinical-blue px-2.5 py-0.5 bg-bone-white border border-clinical-blue/20 rounded">
              {score} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-deep"
          />
          <div className="flex justify-between text-xs text-on-surface-variant mt-1">
            <span>1 (Very Difficult)</span>
            <span>5 (Balanced)</span>
            <span>10 (Flourishing)</span>
          </div>
        </div>

        {/* 2. Primary Emotion Picker */}
        <div>
          <label className="block text-sm font-semibold text-slate-deep mb-2">
            Primary Emotion
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {EMOTIONS.map((emo) => {
              const isSelected = primaryEmotion === emo.name;
              return (
                <button
                  type="button"
                  key={emo.name}
                  onClick={() => setPrimaryEmotion(emo.name)}
                  className={`flex items-center space-x-1.5 p-2 rounded border text-xs font-medium transition-all ${
                    isSelected
                      ? `${emo.color} font-bold ring-2 ring-slate-deep/30`
                      : 'border-charcoal-soft/10 hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <span className="text-base">{emo.icon}</span>
                  <span className="truncate">{emo.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Physical & Mental Metrics (Sleep, Anxiety, Energy) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-container/30 p-3 rounded-lg border border-charcoal-soft/5">
          <div>
            <label className="flex items-center text-xs font-semibold text-slate-deep mb-1">
              <Moon className="w-3.5 h-3.5 mr-1 text-clinical-blue" />
              Sleep ({sleepHours} hrs)
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded cursor-pointer accent-clinical-blue"
            />
          </div>

          <div>
            <label className="flex items-center text-xs font-semibold text-slate-deep mb-1">
              <Activity className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Anxiety ({anxietyLevel}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={anxietyLevel}
              onChange={(e) => setAnxietyLevel(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded cursor-pointer accent-rose-600"
            />
          </div>

          <div>
            <label className="flex items-center text-xs font-semibold text-slate-deep mb-1">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Energy ({energyLevel}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded cursor-pointer accent-amber-600"
            />
          </div>
        </div>

        {/* 4. Contributing Factors */}
        <div>
          <label className="block text-sm font-semibold text-slate-deep mb-2">
            What's influencing your mood today?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FACTORS.map((factor) => {
              const isSelected = selectedFactors.includes(factor);
              return (
                <button
                  type="button"
                  key={factor}
                  onClick={() => toggleFactor(factor)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                    isSelected
                      ? 'bg-slate-deep text-bone-white border-slate-deep'
                      : 'bg-surface text-on-surface border-charcoal-soft/15 hover:bg-surface-container'
                  }`}
                >
                  {factor}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Reflective Note (Encrypted at rest) */}
        <div>
          <label className="block text-sm font-semibold text-slate-deep mb-1">
            Brief Note (Private & Encrypted at rest)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="What thoughts, gratitude, or events are on your mind?"
            className="w-full px-3 py-2 text-sm bg-bone-white border border-charcoal-soft/15 rounded focus:outline-none focus:ring-2 focus:ring-clinical-blue focus:bg-sage-light/30"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-charcoal-soft/10">
          <Button type="button" variant="ghost" onClick={closeQuickLog}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4 text-sage-muted" />}
          >
            Complete Check-in
          </Button>
        </div>
      </form>
    </Modal>
  );
};
