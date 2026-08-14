import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodEntry, MoodStats } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface MoodContextType {
  entries: MoodEntry[];
  stats: MoodStats | null;
  isLoading: boolean;
  isQuickLogOpen: boolean;
  openQuickLog: () => void;
  closeQuickLog: () => void;
  fetchMoodHistory: () => Promise<void>;
  fetchMoodStats: (days?: number) => Promise<void>;
  logMood: (data: Partial<MoodEntry>) => Promise<MoodEntry>;
  deleteMood: (id: string) => Promise<void>;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);

  const fetchMoodHistory = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await api.get('/mood/history?limit=30');
      if (res.data?.data?.entries) {
        setEntries(res.data.data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch mood history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoodStats = async (days: number = 30) => {
    if (!user) return;
    try {
      const res = await api.get(`/mood/stats?days=${days}`);
      if (res.data?.data?.stats) {
        setStats(res.data.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch mood stats:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMoodHistory();
      fetchMoodStats();
    } else {
      setEntries([]);
      setStats(null);
    }
  }, [user]);

  const logMood = async (data: Partial<MoodEntry>) => {
    const res = await api.post('/mood', data);
    const newEntry = res.data?.data?.entry;
    if (newEntry) {
      setEntries(prev => [newEntry, ...prev]);
      fetchMoodStats();
    }
    return newEntry;
  };

  const deleteMood = async (id: string) => {
    await api.delete(`/mood/${id}`);
    setEntries(prev => prev.filter(e => e.id !== id));
    fetchMoodStats();
  };

  return (
    <MoodContext.Provider value={{
      entries,
      stats,
      isLoading,
      isQuickLogOpen,
      openQuickLog: () => setIsQuickLogOpen(true),
      closeQuickLog: () => setIsQuickLogOpen(false),
      fetchMoodHistory,
      fetchMoodStats,
      logMood,
      deleteMood
    }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) throw new Error('useMood must be used within a MoodProvider');
  return context;
};
