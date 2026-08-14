import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { JournalEntry } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '../components/motion/MotionWrapper';
import {
  BookOpen,
  Plus,
  Sparkles,
  HelpCircle,
  Star,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
  Brain
} from 'lucide-react';

const COGNITIVE_DISTORTIONS = [
  { name: 'All-or-Nothing Thinking', description: 'Viewing situations in black-and-white extremes. If it is not perfect, it is considered a total failure.' },
  { name: 'Catastrophizing', description: 'Expecting the worst possible outcome without examining realistic probabilities.' },
  { name: 'Overgeneralization', description: 'Taking a single negative event as a never-ending pattern of defeat (e.g., "I always mess this up").' },
  { name: 'Mental Filter', description: 'Dwelling exclusively on the negatives while filtering out all positive aspects.' },
  { name: 'Disqualifying the Positive', description: 'Insisting that positive accomplishments or compliments "do not count."' },
  { name: 'Mind Reading', description: 'Assuming you know what other people are thinking, typically believing they look down on you.' },
  { name: 'Fortune Telling', description: 'Predicting that things will turn out badly as if it is an established fact.' },
  { name: 'Emotional Reasoning', description: 'Assuming that negative emotions reflect objective truth ("I feel stupid, therefore I must be stupid").' },
  { name: 'Should Statements', description: 'Criticizing yourself or others with rigid rules like "I should have", "I must", or "I ought to".' },
  { name: 'Labeling', description: 'Assigning a harsh, global label to yourself instead of describing the specific behavior ("I am a loser").' },
  { name: 'Personalization', description: 'Blaming yourself for events that are outside your full responsibility or control.' },
];

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDistortionFilter, setSelectedDistortionFilter] = useState<string>('ALL');

  // New Entry Form State
  const [title, setTitle] = useState<string>('');
  const [situation, setSituation] = useState<string>('');
  const [automaticThought, setAutomaticThought] = useState<string>('');
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [cognitiveReframing, setCognitiveReframing] = useState<string>('');
  const [moodBefore, setMoodBefore] = useState<number>(3);
  const [moodAfter, setMoodAfter] = useState<number>(7);
  const [outcomeNote, setOutcomeNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/journal');
      if (res.data?.data?.entries) {
        setEntries(res.data.data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const toggleDistortion = (distortionName: string) => {
    setSelectedDistortions(prev =>
      prev.includes(distortionName)
        ? prev.filter(d => d !== distortionName)
        : [...prev, distortionName]
    );
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !situation || !automaticThought || !cognitiveReframing) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/journal', {
        title,
        situation,
        automaticThought,
        distortionTags: selectedDistortions,
        cognitiveReframing,
        moodBefore,
        moodAfter,
        outcomeNote,
      });

      if (res.data?.data?.entry) {
        setEntries(prev => [res.data.data.entry, ...prev]);
        setIsEditorOpen(false);
        resetForm();

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8AA399', '#4A6274', '#DDE5B6', '#2C3E50']
        });
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSituation('');
    setAutomaticThought('');
    setSelectedDistortions([]);
    setCognitiveReframing('');
    setMoodBefore(3);
    setMoodAfter(7);
    setOutcomeNote('');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/journal/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting journal entry:', err);
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = !searchTerm ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.automaticThought.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.cognitiveReframing.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistortion = selectedDistortionFilter === 'ALL' || e.distortionTags.includes(selectedDistortionFilter);
    return matchesSearch && matchesDistortion;
  });

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-soft/10 pb-6">
        <div>
          <Badge variant="blue" className="mb-2">Cognitive Restructuring</Badge>
          <h1 className="text-3xl font-serif font-bold text-slate-deep">
            CBT Thought Diary & Reframing
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Challenge automatic cognitive distortions and reconstruct balanced, evidence-based perspectives.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsGlossaryOpen(true)}
            leftIcon={<HelpCircle className="w-4 h-4 text-clinical-blue" />}
          >
            Distortion Guide
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsEditorOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Thought Record
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bone-white p-3.5 rounded-lg border border-charcoal-soft/10">
        <div className="flex items-center space-x-2 w-full sm:w-80 bg-surface px-3 py-1.5 rounded border border-charcoal-soft/15">
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search situations, thoughts, reframings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-on-surface-variant flex items-center font-medium whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Distortion:
          </span>
          <select
            value={selectedDistortionFilter}
            onChange={(e) => setSelectedDistortionFilter(e.target.value)}
            className="text-xs bg-surface border border-charcoal-soft/15 rounded px-2.5 py-1.5 text-slate-deep focus:outline-none"
          >
            <option value="ALL">All Distortions</option>
            {COGNITIVE_DISTORTIONS.map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card padding="lg" className="text-center py-16 space-y-4">
            <BookOpen className="w-12 h-12 text-on-surface-variant mx-auto opacity-40" />
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-deep">No Thought Records Yet</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                When you notice an anxious or frustrating thought, record it in your Thought Diary to test its evidence.
              </p>
            </div>
            <Button variant="sage" size="md" onClick={() => setIsEditorOpen(true)}>
              Record Your First Thought
            </Button>
          </Card>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntries.map((entry) => (
              <StaggerItem key={entry.id}>
                <Card padding="lg" className="h-full flex flex-col justify-between space-y-4 hover:border-clinical-blue/40 transition-all">
                  <div className="space-y-3">
                    {/* Header: Title & Mood shift */}
                    <div className="flex items-start justify-between gap-2 border-b border-charcoal-soft/10 pb-3">
                      <div>
                        <h3 className="text-base font-serif font-bold text-slate-deep">
                          {entry.title}
                        </h3>
                        <span className="text-[11px] text-on-surface-variant">
                          {new Date(entry.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Mood shift pill */}
                      <div className="flex items-center space-x-1.5 bg-surface-container px-2.5 py-1 rounded text-xs font-bold text-slate-deep">
                        <span className="text-red-700">{entry.moodBefore}/10</span>
                        <ArrowRight className="w-3 h-3 text-on-surface-variant" />
                        <span className="text-emerald-700">{entry.moodAfter}/10</span>
                      </div>
                    </div>

                    {/* Situation */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block">
                        Triggering Situation
                      </span>
                      <p className="text-xs text-on-surface mt-0.5 leading-relaxed">
                        {entry.situation}
                      </p>
                    </div>

                    {/* Automatic Negative Thought */}
                    <div className="p-3 bg-red-50/60 border-l-2 border-red-400 rounded-r">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-red-900 block">
                        Automatic Negative Thought
                      </span>
                      <p className="text-xs text-red-950 mt-0.5 italic">
                        "{entry.automaticThought}"
                      </p>
                    </div>

                    {/* Cognitive Distortions Identified */}
                    {entry.distortionTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.distortionTags.map((tag, idx) => (
                          <Badge key={idx} variant="slate" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Cognitive Reframing */}
                    <div className="p-3 bg-sage-light/50 border-l-2 border-sage-accent rounded-r">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-deep block">
                        Evidence-Based Balanced Reframe
                      </span>
                      <p className="text-xs text-slate-deep font-medium mt-0.5 leading-relaxed">
                        {entry.cognitiveReframing}
                      </p>
                    </div>

                    {/* Outcome Note */}
                    {entry.outcomeNote && (
                      <p className="text-[11px] text-on-surface-variant bg-surface p-2 rounded border border-charcoal-soft/5">
                        <strong>Outcome:</strong> {entry.outcomeNote}
                      </p>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-charcoal-soft/10">
                    <span className="text-[10px] text-emerald-800 font-semibold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      +{entry.moodAfter - entry.moodBefore} Relief Improvement
                    </span>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Guided CBT Worksheet Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="2xl"
        title="5-Step CBT Cognitive Restructuring Worksheet"
        description="Transform unhelpful automatic thoughts into objective, compassionate perspectives."
      >
        <form onSubmit={handleSaveEntry} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">
              Entry Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Presentation Overthinking Reframe"
              className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:ring-1 focus:ring-clinical-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">
              1. What was the triggering situation?
            </label>
            <textarea
              required
              rows={2}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Describe what happened: Who, what, when, where..."
              className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:ring-1 focus:ring-clinical-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">
              2. What was your Automatic Negative Thought (ANT)?
            </label>
            <textarea
              required
              rows={2}
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              placeholder="What immediately crossed your mind? What worst-case scenario did you imagine?"
              className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:ring-1 focus:ring-clinical-blue focus:outline-none"
            />
          </div>

          {/* 3. Cognitive Distortions */}
          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1.5">
              3. Identify Cognitive Distortions (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-surface rounded border border-charcoal-soft/10">
              {COGNITIVE_DISTORTIONS.map((d) => {
                const isSelected = selectedDistortions.includes(d.name);
                return (
                  <button
                    type="button"
                    key={d.name}
                    onClick={() => toggleDistortion(d.name)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? 'bg-slate-deep text-bone-white border-slate-deep'
                        : 'bg-bone-white text-on-surface border-charcoal-soft/15 hover:bg-surface-container'
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">
              4. Evidence Examination & Balanced Reframe
            </label>
            <textarea
              required
              rows={3}
              value={cognitiveReframing}
              onChange={(e) => setCognitiveReframing(e.target.value)}
              placeholder="What is the objective evidence? What would you tell a friend in this exact situation?"
              className="w-full px-3 py-2 text-xs bg-sage-light/30 border border-sage-accent/30 rounded focus:ring-1 focus:ring-slate-deep focus:outline-none"
            />
          </div>

          {/* 5. Mood Before vs Mood After */}
          <div className="grid grid-cols-2 gap-4 bg-surface p-3 rounded-lg border border-charcoal-soft/10">
            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1">
                Mood Before (1-10): <span className="font-bold text-red-700">{moodBefore}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={moodBefore}
                onChange={(e) => setMoodBefore(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded cursor-pointer accent-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1">
                Mood After Reframe (1-10): <span className="font-bold text-emerald-700">{moodAfter}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={moodAfter}
                onChange={(e) => setMoodAfter(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">
              Outcome or Action Step (Optional)
            </label>
            <input
              type="text"
              value={outcomeNote}
              onChange={(e) => setOutcomeNote(e.target.value)}
              placeholder="e.g., Practiced 4-7-8 breathing and completed the meeting."
              className="w-full px-3 py-1.5 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-charcoal-soft/10">
            <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Sparkles className="w-4 h-4 text-sage-muted" />}
            >
              Save Thought Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cognitive Distortions Glossary Modal */}
      <Modal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        maxWidth="2xl"
        title={
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-clinical-blue" />
            <span>Guide to Cognitive Distortions</span>
          </div>
        }
        description="Cognitive distortions are irrational or exaggerated thought habits that reinforce negative feelings."
      >
        <div className="space-y-3 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {COGNITIVE_DISTORTIONS.map((d) => (
            <div key={d.name} className="p-3 bg-surface rounded-lg border border-charcoal-soft/10">
              <h4 className="text-xs font-bold text-slate-deep">
                {d.name}
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {d.description}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="primary" size="sm" onClick={() => setIsGlossaryOpen(false)}>
            Close Guide
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
};
