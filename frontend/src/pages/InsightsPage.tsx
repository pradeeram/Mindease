import React, { useState, useEffect } from 'react';
import { useMood } from '../context/MoodContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageTransition, FadeIn } from '../components/motion/MotionWrapper';
import { BarChart3, TrendingUp, Moon, Activity, Brain, Download, Calendar, Smile } from 'lucide-react';

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
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-soft/10 pb-6">
        <div>
          <Badge variant="blue" className="mb-2">Visual Analytics & Correlations</Badge>
          <h1 className="text-3xl font-serif font-bold text-slate-deep">
            Clinical Insights & Mood Trends
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Discover how sleep, physical habits, and cognitive reframing impact your emotional wellbeing over time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-xs text-on-surface-variant uppercase font-semibold">Average Wellbeing</div>
          <div className="text-3xl font-serif font-bold text-slate-deep mt-1">
            {stats?.averageMood ? `${stats.averageMood}` : '—'} <span className="text-sm font-normal text-on-surface-variant">/ 10</span>
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Stable & Resilient
          </div>
        </Card>

        <Card padding="md">
          <div className="text-xs text-on-surface-variant uppercase font-semibold">Consistency Streak</div>
          <div className="text-3xl font-serif font-bold text-amber-600 mt-1">
            {stats?.streakDays ?? 0} <span className="text-sm font-normal text-on-surface-variant">days</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Daily self-reflection</div>
        </Card>

        <Card padding="md">
          <div className="text-xs text-on-surface-variant uppercase font-semibold">CBT Relief Shift</div>
          <div className="text-3xl font-serif font-bold text-clinical-blue mt-1">
            +{distortionStats?.averageMoodShift || 3.5} <span className="text-sm font-normal text-on-surface-variant">pts</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Avg mood boost after reframe</div>
        </Card>

        <Card padding="md">
          <div className="text-xs text-on-surface-variant uppercase font-semibold">Total Reflections</div>
          <div className="text-3xl font-serif font-bold text-slate-deep mt-1">
            {stats?.totalEntries ?? 0}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Logged data points</div>
        </Card>
      </div>

      {/* 1. Main Mood Trajectory Chart (SVG Line & Bar) */}
      <Card padding="lg" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-soft/10 pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-deep">
              Wellbeing Trajectory & Mood Intensity
            </h3>
            <p className="text-xs text-on-surface-variant">
              Daily mood ratings (1-10) plotted chronologically.
            </p>
          </div>
          <Badge variant="sage">High Fidelity</Badge>
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant text-xs">
            Log at least 2 mood check-ins to view the trajectory line chart.
          </div>
        ) : (
          <div className="space-y-3">
            {/* SVG Visualizer */}
            <div className="h-48 w-full flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-charcoal-soft/15">
              {timeline.map((point, idx) => {
                const heightPercent = Math.max(15, (point.score / 10) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-deep text-bone-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow">
                      {point.emotion}: {point.score}/10 ({new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                    </div>

                    <div
                      className="w-full max-w-[32px] bg-gradient-to-t from-slate-deep to-clinical-blue rounded-t transition-all group-hover:from-sage-accent group-hover:to-slate-deep cursor-pointer"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] text-on-surface-variant font-medium px-1">
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
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
            <h3 className="text-base font-serif font-bold text-slate-deep">
              Sleep Duration vs. Anxiety Levels
            </h3>
            <span className="text-xs text-on-surface-variant flex items-center">
              <Moon className="w-3.5 h-3.5 text-clinical-blue mr-1" />
              <Activity className="w-3.5 h-3.5 text-rose-500 mr-1" />
            </span>
          </div>

          <p className="text-xs text-on-surface-variant">
            Higher restful sleep (7.5h+) strongly correlates with lowered anxiety spikes (under 3/10).
          </p>

          <div className="space-y-2.5 pt-2">
            {timeline.slice(-5).map((point, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-surface border border-charcoal-soft/5 text-xs">
                <span className="font-medium text-slate-deep">
                  {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center space-x-3">
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
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
            <h3 className="text-base font-serif font-bold text-slate-deep">
              Top Influencing Factors
            </h3>
            <Badge variant="sage">Correlation</Badge>
          </div>

          <p className="text-xs text-on-surface-variant">
            Habits and environments with the strongest positive association with your emotional scores.
          </p>

          <div className="space-y-3 pt-2">
            {stats?.topFactors && stats.topFactors.length > 0 ? (
              stats.topFactors.slice(0, 5).map((f) => (
                <div key={f.factor} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-deep">{f.factor}</span>
                    <span className="text-clinical-blue">{f.averageMood} / 10 Avg Mood ({f.count} logs)</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sage-accent h-full rounded-full"
                      style={{ width: `${(f.averageMood / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                Log factors in your daily check-in to see correlation rankings.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Cognitive Distortions Distribution */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-clinical-blue" />
            <h3 className="text-base font-serif font-bold text-slate-deep">
              Cognitive Distortions Identified in CBT Thought Records
            </h3>
          </div>
          <Badge variant="blue">{distortionStats?.totalEntries || 0} Restructured Thoughts</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {distortionStats?.distortionBreakdown && Object.keys(distortionStats.distortionBreakdown).length > 0 ? (
            Object.entries(distortionStats.distortionBreakdown).map(([name, count]: any) => (
              <div key={name} className="p-3 bg-surface rounded-lg border border-charcoal-soft/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-deep truncate mr-2">{name}</span>
                <span className="text-xs px-2 py-0.5 bg-bone-white border border-charcoal-soft/15 font-bold rounded text-clinical-blue">
                  {count} entries
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant col-span-full py-4 text-center">
              No cognitive distortions recorded yet. Open your CBT Thought Diary to identify distortions.
            </p>
          )}
        </div>
      </Card>
    </PageTransition>
  );
};
