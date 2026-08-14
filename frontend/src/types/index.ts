export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  mfaEnabled: boolean;
  theme: string;
  aiName?: string;
  aiVoice?: string;
  baselineScore?: number;
  onboarded: boolean;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  score: number; // 1 to 10
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number;
  factors: string[];
  sleepHours?: number;
  anxietyLevel?: number;
  energyLevel?: number;
  notes?: string;
  loggedAt: string;
}

export interface MoodStats {
  totalEntries: number;
  averageMood: number;
  streakDays: number;
  emotionBreakdown: Record<string, number>;
  topFactors: { factor: string; count: number; averageMood: number }[];
  timeline: {
    id: string;
    date: string;
    score: number;
    emotion: string;
    intensity: number;
    sleepHours?: number;
    anxietyLevel?: number;
  }[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  situation: string;
  automaticThought: string;
  distortionTags: string[];
  cognitiveReframing: string;
  moodBefore: number;
  moodAfter: number;
  outcomeNote?: string;
  isFavorite: boolean;
  loggedAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'usha' | 'system';
  content: string;
  isCrisisTriggered: boolean;
  metadata?: {
    suggestedActions?: string[];
    detectedDistortion?: string;
    crisisSeverity?: string;
    emergencyResources?: CrisisHotline[];
  };
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface CrisisHotline {
  id: string;
  country: string;
  name: string;
  number: string;
  description: string;
  tags: string[];
  website: string;
}

export interface GroundingTechnique {
  id: string;
  name: string;
  duration: string;
  category: string;
  summary: string;
  instructions: string[];
}

export interface SafetyPlan {
  id?: string;
  warningSigns: string[];
  copingStrategies: string[];
  distractionPlaces: string[];
  supportiveContacts: { name: string; phone: string; relationship: string }[];
  professionalResources: { agency: string; phone: string; contact: string }[];
  safeEnvironmentSteps: string[];
  updatedAt?: string;
}

export interface Reminder {
  id: string;
  type: 'MOOD_CHECKIN' | 'BREATHING_BREAK' | 'JOURNALING' | 'MEDICATION';
  title: string;
  time: string;
  daysOfWeek: string[];
  isEnabled: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  status: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}
