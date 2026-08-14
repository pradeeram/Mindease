import React, { useState } from 'react';
import { useMood } from '../context/MoodContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/motion/MotionWrapper';
import { Plus, Trash2, Calendar, Moon, Activity, Zap, Smile, Search } from 'lucide-react';

export const MoodTrackerPage: React.FC = () => {
  const { entries, stats, openQuickLog, deleteMood } = useMood();
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEntries = entries.filter((entry) => {
    const matchesEmotion = selectedEmotionFilter === 'ALL' || entry.primaryEmotion === selectedEmotionFilter;
    const matchesSearch = !searchTerm ||
      entry.primaryEmotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.factors.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesEmotion && matchesSearch;
  });

  const uniqueEmotions = Array.from(new Set(entries.map(e => e.primaryEmotion)));

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-charcoal-soft/10 pb-6">
        <div className="space-y-2">
          <Badge variant="sage">Emotional Granularity</Badge>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-deep">
            Mood Tracker & Emotional History
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Tracking your emotional nuances over time builds cognitive self-awareness and reveals key underlying triggers.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={openQuickLog}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Check-in Now
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card padding="lg" className="bg-bone-white border border-charcoal-soft/10 shadow-sm space-y-2">
          <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Average Wellbeing Score</div>
          <div className="text-3xl font-serif font-bold text-slate-deep">
            {stats?.averageMood ? `${stats.averageMood} / 10` : '—'}
          </div>
          <div className="text-xs text-on-surface-variant">Calculated over past 30 days</div>
        </Card>

        <Card padding="lg" className="bg-bone-white border border-charcoal-soft/10 shadow-sm space-y-2">
          <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Most Frequent Emotion</div>
          <div className="text-3xl font-serif font-bold text-clinical-blue">
            {stats?.topFactors && stats.topFactors.length > 0 ? (
              Object.entries(stats.emotionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Calm'
            ) : 'Calm'}
          </div>
          <div className="text-xs text-on-surface-variant">Primary state of mind</div>
        </Card>

        <Card padding="lg" className="bg-bone-white border border-charcoal-soft/10 shadow-sm space-y-2">
          <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Top Influencing Factor</div>
          <div className="text-3xl font-serif font-bold text-slate-deep">
            {stats?.topFactors && stats.topFactors.length > 0 ? stats.topFactors[0].factor : 'Sleep'}
          </div>
          <div className="text-xs text-on-surface-variant">Correlation with mood quality</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-bone-white p-5 rounded-2xl border border-charcoal-soft/10 shadow-sm">
        <div className="flex items-center space-x-3 w-full sm:w-80 bg-surface px-4 py-2.5 rounded-xl border border-charcoal-soft/15 shadow-inner">
          <Search className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
          <input
            type="text"
            placeholder="Search notes, emotions, factors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-deep"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedEmotionFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold transition-all ${
              selectedEmotionFilter === 'ALL'
                ? 'bg-slate-deep text-bone-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            All Emotions ({entries.length})
          </button>
          {uniqueEmotions.map((emo) => (
            <button
              key={emo}
              onClick={() => setSelectedEmotionFilter(emo)}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                selectedEmotionFilter === emo
                  ? 'bg-slate-deep text-bone-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {emo}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Entries Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-serif font-bold text-slate-deep uppercase tracking-wider">
          Timeline ({filteredEntries.length} entries)
        </h3>

        {filteredEntries.length === 0 ? (
          <Card padding="lg" className="text-center py-16 space-y-4 bg-bone-white border border-charcoal-soft/10 rounded-2xl shadow-sm">
            <Smile className="w-12 h-12 text-on-surface-variant mx-auto opacity-40" />
            <p className="text-sm text-on-surface-variant">No mood entries matching your filter.</p>
            <Button variant="sage" size="md" onClick={openQuickLog}>
              Log Mood Now
            </Button>
          </Card>
        ) : (
          <StaggerContainer className="space-y-4">
            {filteredEntries.map((entry) => (
              <StaggerItem key={entry.id}>
                <Card padding="lg" className="hover:border-charcoal-soft/30 transition-all bg-bone-white border border-charcoal-soft/10 shadow-sm rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      {/* Score Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-surface-container border border-charcoal-soft/15 flex flex-col items-center justify-center font-serif font-bold text-slate-deep flex-shrink-0 shadow-inner">
                        <span className="text-base leading-none">{entry.score}</span>
                        <span className="text-[10px] text-on-surface-variant leading-none mt-0.5">/10</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-base font-bold text-slate-deep">
                            {entry.primaryEmotion}
                          </span>
                          <span className="text-xs text-on-surface-variant">·</span>
                          <span className="text-xs text-on-surface-variant flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {new Date(entry.loggedAt).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Physical / Mental Metrics Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant pt-1">
                          {entry.sleepHours !== undefined && entry.sleepHours !== null && (
                            <span className="flex items-center bg-surface px-2.5 py-1 rounded-lg border border-charcoal-soft/10">
                              <Moon className="w-3.5 h-3.5 mr-1 text-clinical-blue" />
                              {entry.sleepHours} hrs sleep
                            </span>
                          )}
                          {entry.anxietyLevel !== undefined && entry.anxietyLevel !== null && (
                            <span className="flex items-center bg-surface px-2.5 py-1 rounded-lg border border-charcoal-soft/10">
                              <Activity className="w-3.5 h-3.5 mr-1 text-rose-600" />
                              Anxiety: {entry.anxietyLevel}/10
                            </span>
                          )}
                          {entry.energyLevel !== undefined && entry.energyLevel !== null && (
                            <span className="flex items-center bg-surface px-2.5 py-1 rounded-lg border border-charcoal-soft/10">
                              <Zap className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              Energy: {entry.energyLevel}/10
                            </span>
                          )}
                        </div>

                        {/* Note */}
                        {entry.notes && (
                          <p className="text-xs sm:text-sm text-on-surface bg-sage-light/30 p-3.5 rounded-xl border border-sage-accent/20 mt-2 italic leading-relaxed">
                            "{entry.notes}"
                          </p>
                        )}

                        {/* Factors Chips */}
                        {entry.factors.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {entry.factors.map((f, i) => (
                              <Badge key={i} variant="neutral" size="sm">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteMood(entry.id)}
                      className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-xl self-end sm:self-auto transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
};
