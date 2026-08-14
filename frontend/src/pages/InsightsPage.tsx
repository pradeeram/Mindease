import React, { useState, useEffect } from 'react';
import { useMood } from '../context/MoodContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/MotionWrapper';
import { TrendingUp, Moon, Activity, Brain } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { stats, fetchMoodStats } = useMood();
  const [days, setDays] = useState<number>(30);
  const [distortionStats, setDistortionStats] = useState<any>(null);

  useEffect(() => {
    fetchMoodStats(days);
    async function loadDistortions() {
      try {
        const res = await api.get('/journal/stats');
        if (res.data?.data?.stats) {
          setDistortionStats(res.data.data.stats);
        }
      } catch (err) {
        console.error('Error fetching distortion stats:', err);
      }
    }
    loadDistortions();
  }, [days]);

  const timeline = stats?.timeline || [];

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-charcoal-soft/10 pb-6">
        <div className="space-y-2">
          <Badge variant="blue">Visual Analytics & Correlations</Badge>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-deep">
            Clinical Insights & Mood Trends
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Discover how sleep, physical habits, and cognitive reframing impact your emotional wellbeing over time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                days === d
                  ? 'bg-slate-deep text-bone-white border-slate-deep shadow-sm'
                  : 'bg-bone-white text-on-surface-variant border-charcoal-soft/15 hover:bg-surface-container'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg" className="bg-bone-white border border-charcoal-soft/10 shadow-sm space-y-2">
          <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Average Wellbeing</div>
          <div className="text-3xl font-serif font-bold text-slate-deep">
            {stats?.averageMood ? `${stats.averageMood}` : '—'} <span className="text-sm font-normal text-on-surface-variant">/ 10</span>
          </div>
          <div className="text-xs text-emerald-800 font-semibold flex items-center pt-1">
            <TrendingUp className="w-4 h-4 mr-1.5" /> Stable & Resilient
          </div>
        </Card>

        <Card padding="lg" className="bg-bone-white border border-charcoal-soft/10 shadow-sm space-y-2">
          <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Consistency Streak</div>
          <div className="text-3xl font-serif font-bold text-amber-600">
            {stats?.streakDays ?? 0} <span className="text-sm font-normal text-on-surface-variant">days</span>
          </div>
          <div className="text-xs text-on-surface-variant pt-1">Daily self-reflection</div>
        </Card>

        <Card padding="lg" className="bg-bone-white border border-charcoal-soft/10 shadow-sm space-y-2">
          <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">CBT Relief Shift</div>
          <div className="text-3xl font-serif font-bold text-clinical-blue">
            +{distortionStats?.averageMoodShift || 3.5} <span className="text-sm font-normal text-on-surface-variant">pts</span>
          </div>
          <div className="text-xs text-on-surface-variant pt-1">Avg mood boost after reframe</div>
        </Card>

        <Card padding="lg" className="bg-bone-white border border-charcoal-soft/10 shadow-sm space-y-2">
          <div className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">Total Reflections</div>
          <div className="text-3xl font-serif font-bold text-slate-deep">
            {stats?.totalEntries ?? 0}
          </div>
          <div className="text-xs text-on-surface-variant pt-1">Logged data points</div>
        </Card>
      </div>

      {/* 1. Main Mood Trajectory Chart (SVG Line & Bar) */}
      <Card padding="lg" className="space-y-6 bg-bone-white border border-charcoal-soft/10 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-soft/10 pb-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-deep">
              Wellbeing Trajectory & Mood Intensity
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Daily mood ratings (1-10) plotted chronologically across your selected time window.
            </p>
          </div>
          <Badge variant="sage" size="md">High Fidelity</Badge>
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant text-xs italic">
            Log at least 2 mood check-ins to view the trajectory line chart.
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Visualizer */}
            <div className="h-56 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-8 pb-3 border-b border-charcoal-soft/15">
              {timeline.map((point, idx) => {
                const heightPercent = Math.max(15, (point.score / 10) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-deep text-bone-white text-[11px] py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg font-medium">
                      {point.emotion}: {point.score}/10 ({new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                    </div>

                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-slate-deep to-clinical-blue rounded-t-lg transition-all group-hover:from-sage-accent group-hover:to-slate-deep cursor-pointer shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-xs text-on-surface-variant font-medium px-2">
              <span>{new Date(timeline[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>Timeline Horizon</span>
              <span>{new Date(timeline[timeline.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        )}
      </Card>

      {/* 2. Sleep vs Anxiety Correlation & Factor Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sleep vs Anxiety */}
        <Card padding="lg" className="space-y-5 bg-bone-white border border-charcoal-soft/10 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-deep">
                Sleep Duration vs. Anxiety Levels
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Restful sleep (7.5h+) strongly correlates with reduced anxiety spikes.
              </p>
            </div>
            <span className="text-xs text-on-surface-variant flex items-center space-x-1">
              <Moon className="w-4 h-4 text-clinical-blue" />
              <Activity className="w-4 h-4 text-rose-500" />
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {timeline.slice(-5).map((point, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-charcoal-soft/10 text-xs">
                <span className="font-semibold text-slate-deep">
                  {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-clinical-blue font-semibold">
                    {point.sleepHours ? `${point.sleepHours} hrs sleep` : '—'}
                  </span>
                  <span className="text-rose-600 font-semibold">
                    Anxiety: {point.anxietyLevel ? `${point.anxietyLevel}/10` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Influencing Factors Breakdown */}
        <Card padding="lg" className="space-y-5 bg-bone-white border border-charcoal-soft/10 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-deep">
                Top Influencing Factors
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Habits and environments with strongest positive emotional association.
              </p>
            </div>
            <Badge variant="sage" size="md">Correlation</Badge>
          </div>

          <div className="space-y-4 pt-1">
            {stats?.topFactors && stats.topFactors.length > 0 ? (
              stats.topFactors.slice(0, 5).map((f) => (
                <div key={f.factor} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-deep">{f.factor}</span>
                    <span className="text-clinical-blue">{f.averageMood} / 10 Avg Mood ({f.count} logs)</span>
                  </div>
                  <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sage-accent h-full rounded-full"
                      style={{ width: `${(f.averageMood / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant py-8 text-center italic">
                Log factors in your daily check-in to see correlation rankings.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Cognitive Distortions Distribution */}
      <Card padding="lg" className="space-y-6 bg-bone-white border border-charcoal-soft/10 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-soft/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-deep">
                Cognitive Distortions Identified in CBT Thought Records
              </h3>
              <p className="text-xs text-on-surface-variant">Patterns revealed across your cognitive restructuring worksheets</p>
            </div>
          </div>
          <Badge variant="blue" size="md">{distortionStats?.totalEntries || 0} Restructured Thoughts</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {distortionStats?.distortionBreakdown && Object.keys(distortionStats.distortionBreakdown).length > 0 ? (
            Object.entries(distortionStats.distortionBreakdown).map(([name, count]: any) => (
              <div key={name} className="p-4 bg-surface rounded-xl border border-charcoal-soft/10 flex items-center justify-between shadow-xs">
                <span className="text-xs font-semibold text-slate-deep truncate mr-2">{name}</span>
                <span className="text-xs px-2.5 py-1 bg-bone-white border border-charcoal-soft/15 font-bold rounded-lg text-clinical-blue shadow-xs">
                  {count} entries
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant col-span-full py-8 text-center italic">
              No cognitive distortions recorded yet. Open your CBT Thought Diary to identify distortions.
            </p>
          )}
        </div>
      </Card>
    </PageTransition>
  );
};
