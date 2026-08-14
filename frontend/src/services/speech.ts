// Web Speech API Voice and Audio Synthesis Service for AI Companion

export type VoicePresetKey = 'soft_female' | 'warm_natural' | 'gentle_male' | 'british_serene' | 'neutral_clarity';

export interface VoicePreset {
  id: VoicePresetKey;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  description: string;
  pitch: number;
  rate: number;
  sampleText: string;
}

export const VOICE_PRESETS: Record<VoicePresetKey, VoicePreset> = {
  soft_female: {
    id: 'soft_female',
    name: 'Calm & Soft (Female)',
    gender: 'Female',
    description: 'Empathetic, gentle cadence designed to reduce anxiety and calm your nervous system.',
    pitch: 1.08,
    rate: 0.90,
    sampleText: 'Hello! Take a slow, gentle breath with me. I am here whenever you need a safe space.',
  },
  warm_natural: {
    id: 'warm_natural',
    name: 'Warm & Grounded (Natural)',
    gender: 'Female',
    description: 'Conversational, grounded therapeutic tone with natural pacing for daily reflections.',
    pitch: 1.0,
    rate: 0.93,
    sampleText: 'Welcome back. Let us explore what is on your mind today, one step at a time.',
  },
  gentle_male: {
    id: 'gentle_male',
    name: 'Gentle & Deep (Male)',
    gender: 'Male',
    description: 'Warm, resonant masculine tone with steady pacing for mindful grounding.',
    pitch: 0.86,
    rate: 0.90,
    sampleText: 'I am here with you. Let your shoulders drop, and let us work through this together.',
  },
  british_serene: {
    id: 'british_serene',
    name: 'Serene & Mindful (British)',
    gender: 'Female',
    description: 'Crisp, articulate and deeply calming tone for structured CBT reframing.',
    pitch: 1.04,
    rate: 0.88,
    sampleText: 'Take a quiet moment for yourself. Notice your surroundings and allow your thoughts to settle.',
  },
  neutral_clarity: {
    id: 'neutral_clarity',
    name: 'Neutral & Clear',
    gender: 'Neutral',
    description: 'Balanced, articulate voice ideal for focused CBT worksheets and structured exercises.',
    pitch: 1.02,
    rate: 0.96,
    sampleText: 'Let us examine the evidence around this thought and find a more balanced perspective.',
  },
};

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }

      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
  }

  getActiveAiName(): string {
    if (typeof window === 'undefined') return 'USHA';
    const saved = localStorage.getItem('mindease_ai_name');
    if (saved && saved.trim().length > 0) return saved.trim();
    return 'USHA';
  }

  setActiveAiName(name: string): void {
    if (typeof window !== 'undefined') {
      const cleaned = (name || 'USHA').trim().slice(0, 30);
      localStorage.setItem('mindease_ai_name', cleaned);
    }
  }

  getActiveVoicePreset(): VoicePresetKey {
    if (typeof window === 'undefined') return 'soft_female';
    const saved = localStorage.getItem('mindease_voice_preset') as VoicePresetKey;
    if (saved && VOICE_PRESETS[saved]) {
      return saved;
    }
    return 'soft_female';
  }

  setVoicePreset(preset: VoicePresetKey): void {
    if (typeof window !== 'undefined' && VOICE_PRESETS[preset]) {
      localStorage.setItem('mindease_voice_preset', preset);
    }
  }

  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported in this browser.'));
      return false;
    }

    if (this.isListening) {
      return true;
    }

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      onResult(final || interim, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      this.isListening = false;
      onError(e);
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  private pickVoiceForPreset(presetKey: VoicePresetKey): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0) {
      this.loadVoices();
    }
    const voices = this.cachedVoices;
    if (voices.length === 0) return null;

    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    if (presetKey === 'soft_female') {
      const soft = pool.find(v =>
        /(zira|samantha|karen|victoria|female|eva|hazel|moira|catherine|serena)/i.test(v.name)
      );
      if (soft) return soft;
      const anyFemale = pool.find(v => /female|woman/i.test(v.name));
      return anyFemale || pool[0];
    }

    if (presetKey === 'warm_natural') {
      const warm = pool.find(v =>
        /(google.*us.*english|natural|jenny|fiona|tessa|allison)/i.test(v.name)
      );
      return warm || pool.find(v => /(female|woman)/i.test(v.name)) || pool[0];
    }

    if (presetKey === 'gentle_male') {
      const male = pool.find(v =>
        /(david|daniel|alex|male|man|guy|george|oliver|mark)/i.test(v.name)
      );
      return male || pool[0];
    }

    if (presetKey === 'british_serene') {
      const british = pool.find(v =>
        /(en-GB|british|uk|stephanie|libby|george|hazel)/i.test(v.name) || /en_GB/i.test(v.lang)
      );
      return british || pool[0];
    }

    if (presetKey === 'neutral_clarity') {
      const neutral = pool.find(v =>
        /(google.*uk|mark|microsoft|compact)/i.test(v.name)
      );
      return neutral || pool[0];
    }

    return pool[0] || null;
  }

  speak(text: string, onStart?: () => void, onEnd?: () => void, customPreset?: VoicePresetKey): void {
    if (!this.isSpeechSynthesisSupported()) return;

    window.speechSynthesis.cancel(); // cancel any active utterance

    // Strip markdown and emojis before synthesis
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    const presetKey = customPreset || this.getActiveVoicePreset();
    const preset = VOICE_PRESETS[presetKey] || VOICE_PRESETS.soft_female;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = preset.rate;
    utterance.pitch = preset.pitch;

    const selectedVoice = this.pickVoiceForPreset(presetKey);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (onStart) utterance.onstart = () => { this.isSpeaking = true; onStart(); };
    utterance.onend = () => { this.isSpeaking = false; if (onEnd) onEnd(); };
    utterance.onerror = () => { this.isSpeaking = false; if (onEnd) onEnd(); };

    window.speechSynthesis.speak(utterance);
  }

  previewVoice(presetKey: VoicePresetKey): void {
    const preset = VOICE_PRESETS[presetKey];
    const aiName = this.getActiveAiName();
    if (preset) {
      const text = `Hello, I am ${aiName}. ${preset.sampleText}`;
      this.speak(text, undefined, undefined, presetKey);
    }
  }

  stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const speechService = new SpeechService();
