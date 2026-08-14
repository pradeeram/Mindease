import { config } from '../../config';
import crypto from 'crypto';

/**
 * CBT Guidance Map from mindease/app/cbt_content.py
 * Human-reviewed, evidence-based CBT techniques per emotion category.
 */
export const CBT_GUIDANCE: Record<string, { validation: string; technique: string; suggestion: string }> = {
  sadness: {
    validation: "It sounds like you're carrying something heavy right now.",
    technique: "Behavioral Activation",
    suggestion: (
      "Sadness often makes us withdraw, which can deepen it. Try picking one " +
      "small, achievable activity today — a short walk, texting a friend, or " +
      "tidying one corner of a room — and notice how your mood shifts afterward."
    ),
  },
  joy: {
    validation: "That's wonderful to hear.",
    technique: "Positive Reinforcement / Savoring",
    suggestion: (
      "Take a moment to really savor this feeling. Research shows writing down " +
      "what led to positive emotions helps reinforce them over time — consider " +
      "jotting a line about what made this moment good."
    ),
  },
  love: {
    validation: "It's great that you're feeling connected to someone.",
    technique: "Relationship Reflection",
    suggestion: (
      "Strong connections are a real protective factor for mental health. " +
      "Consider expressing this feeling directly to the person involved — " +
      "naming appreciation out loud tends to deepen the bond."
    ),
  },
  anger: {
    validation: "That sounds frustrating, and it makes sense you'd feel angry.",
    technique: "Cognitive Reappraisal + Cool-down",
    suggestion: (
      "Before reacting, try the classic pause: breathe in for 4 counts, hold for " +
      "4, out for 6, repeat 4 times. Then ask yourself: what's the story I'm " +
      "telling myself about this situation, and is there another way to read it?"
    ),
  },
  fear: {
    validation: "It's understandable to feel anxious or afraid about this.",
    technique: "Grounding (5-4-3-2-1)",
    suggestion: (
      "Try grounding yourself: name 5 things you can see, 4 you can touch, 3 you " +
      "can hear, 2 you can smell, 1 you can taste. This helps interrupt the " +
      "spiral of anxious thoughts by anchoring you in the present."
    ),
  },
  surprise: {
    validation: "Sounds like something unexpected just happened.",
    technique: "Cognitive Processing",
    suggestion: (
      "Unexpected events can leave us unsettled even when they're neutral or " +
      "good. Give yourself a moment to process rather than immediately deciding " +
      "how you feel about it."
    ),
  },
};

export const DISCLAIMER =
  "I'm an AI support tool, not a licensed therapist. I can offer general, " +
  "CBT-inspired self-help ideas, but I can't diagnose or replace professional care.";

export const CRISIS_MESSAGE =
  "I'm really glad you told me this, and I want to take it seriously. " +
  "I'm not able to provide crisis support myself, but please reach out to " +
  "one of these right now if you're in India:\n\n" +
  "• iCall: 9152987821 (Mon–Sat, 10am–8pm)\n" +
  "• Vandrevala Foundation: 1860-2662-345 / 1800-2333-330 (24x7)\n" +
  "• KIRAN Helpline: 1800-599-0019 (24x7, toll-free)\n\n" +
  "Outside India, you can find a local helpline at https://findahelpline.com or call 988 in the US/Canada. " +
  "If you feel you're in immediate danger, please contact local emergency services or go to the nearest hospital. " +
  "You don't have to go through this alone.";

// Crisis detection regex from mindease/app/safety.py
const CRISIS_PATTERNS = [
  /\bsuicid\w*\b/i,
  /\bkill(ing)? myself\b/i,
  /\bwant(ing)? to die\b/i,
  /\bend(ing)? (my|it all)\b/i,
  /\bno reason to live\b/i,
  /\bself[\s-]?harm\w*\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bcut(ting)? myself\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\bcan'?t go on\b/i,
];

// Emotion keywords for the NLP classifier
const EMOTION_LEXICON: Record<string, string[]> = {
  sadness: ['sad', 'depressed', 'unhappy', 'lonely', 'hopeless', 'grief', 'down', 'crying', 'tears', 'heartbroken', 'gloomy', 'empty', 'miserable', 'tired of life', 'worthless', 'lost'],
  joy: ['happy', 'joy', 'excited', 'great', 'glad', 'delighted', 'wonderful', 'blessed', 'fantastic', 'cheerful', 'grateful', 'proud', 'peaceful', 'content', 'elated', 'optimistic'],
  love: ['love', 'loved', 'caring', 'affection', 'romance', 'partner', 'adore', 'fond', 'closeness', 'hug', 'cherish', 'attached', 'sweetheart', 'warmth'],
  anger: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'rage', 'hate', 'pissed', 'resentful', 'bitter', 'infuriated', 'hostile', 'snapped'],
  fear: ['fear', 'scared', 'afraid', 'terrified', 'anxious', 'anxiety', 'panic', 'nervous', 'worried', 'dread', 'frightened', 'uneasy', 'stressed', 'overwhelmed', 'freaking out'],
  surprise: ['surprise', 'surprised', 'shocked', 'unexpected', 'astonished', 'stunned', 'amazed', 'unbelievable', 'startled', 'jaw-dropping'],
};

export interface EmotionAnalysis {
  emotion: 'sadness' | 'joy' | 'love' | 'anger' | 'fear' | 'surprise' | 'neutral';
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  probabilities: Record<string, number>;
}

export class UshaEngine {
  private responseCache: Map<string, string> = new Map();
  private maxCacheSize: number = 500;

  /**
   * Evaluates text for crisis language (short-circuits before LLM invocation)
   */
  public containsCrisisLanguage(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return CRISIS_PATTERNS.some(pattern => pattern.test(text));
  }

  /**
   * Fast, zero-token NLP Emotion Classifier ported from mindease model/emotion_engine.py
   */
  public analyzeEmotion(text: string): EmotionAnalysis {
    const cleaned = (text || '').toLowerCase().replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) {
      return {
        emotion: 'neutral',
        confidence: 0.0,
        sentiment: 'neutral',
        probabilities: {},
      };
    }

    const words = cleaned.split(' ');
    const scores: Record<string, number> = {
      sadness: 0,
      joy: 0,
      love: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
    };

    for (const word of words) {
      for (const [emotion, keywords] of Object.entries(EMOTION_LEXICON)) {
        if (keywords.includes(word)) {
          scores[emotion] += 1;
        }
      }
    }

    let topEmotion: keyof typeof scores = 'sadness';
    let maxScore = -1;
    let totalScore = 0;

    for (const [emotion, score] of Object.entries(scores)) {
      totalScore += score;
      if (score > maxScore) {
        maxScore = score;
        topEmotion = emotion as keyof typeof scores;
      }
    }

    if (maxScore <= 0) {
      // Default to gentle sadness/reflective baseline if ambiguous
      return {
        emotion: 'neutral',
        confidence: 0.5,
        sentiment: 'neutral',
        probabilities: { sadness: 0.16, joy: 0.16, love: 0.16, anger: 0.16, fear: 0.16, surprise: 0.16 },
      };
    }

    const confidence = totalScore > 0 ? Number((maxScore / totalScore).toFixed(4)) : 0.85;
    const sentiment = ['joy', 'love', 'surprise'].includes(topEmotion) ? 'positive' : 'negative';

    const probabilities: Record<string, number> = {};
    for (const [e, s] of Object.entries(scores)) {
      probabilities[e] = totalScore > 0 ? Number((s / totalScore).toFixed(4)) : 0;
    }

    return {
      emotion: topEmotion as any,
      confidence,
      sentiment,
      probabilities,
    };
  }

  /**
   * Retrieves static, human-reviewed CBT guidance based on emotion
   */
  public getGuidance(emotion: string) {
    return CBT_GUIDANCE[emotion] || CBT_GUIDANCE['sadness'];
  }

  /**
   * Generates a conversational response using the MindEase architecture:
   * 1. Safety short-circuit runs FIRST
   * 2. Local Emotion Engine classifies text & retrieves approved CBT guidance
   * 3. Gemini LLM phrases the response naturally with sliding conversational memory
   * 4. Automatic zero-token fallback if API unavailable or quota reached
   */
  public async generateResponse(params: {
    message: string;
    conversationHistory: { role: string; content: string }[];
    userName?: string;
    aiName?: string;
  }): Promise<{
    reply: string;
    suggestedActions?: string[];
    detectedDistortion?: string;
    emotion?: string;
    isCrisisTriggered?: boolean;
  }> {
    const { message, conversationHistory, userName, aiName = 'USHA' } = params;
    const sanitizedMsg = (message || '').trim().slice(0, 1000);

    // 1. Non-negotiable safety check (runs before LLM or emotion classifier)
    if (this.containsCrisisLanguage(sanitizedMsg)) {
      return {
        reply: CRISIS_MESSAGE,
        suggestedActions: ['Call iCall Helpline (9152987821)', 'Call KIRAN (1800-599-0019)', 'View Crisis Resources'],
        isCrisisTriggered: true,
        emotion: 'crisis',
      };
    }

    // 2. Emotion analysis & CBT Guidance
    const emotionData = this.analyzeEmotion(sanitizedMsg);
    const cbt = this.getGuidance(emotionData.emotion);

    // 3. Check memory cache
    const cacheKey = this.getCacheKey(sanitizedMsg, emotionData.emotion, conversationHistory, aiName);
    if (this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey)!;
      return {
        reply: cached,
        suggestedActions: this.extractSuggestedActions(cached, emotionData.emotion),
        emotion: emotionData.emotion,
      };
    }

    // 4. Try Gemini with conversational sliding window prompt
    if (config.ai.geminiApiKey && config.ai.geminiApiKey !== 'your_gemini_api_key_here' && config.ai.geminiApiKey.trim().length > 10) {
      try {
        const geminiReply = await this.callGeminiAPI({
          userMessage: sanitizedMsg,
          history: conversationHistory,
          emotionData,
          cbt,
          userName: userName || 'Friend',
          aiName,
        });

        if (geminiReply && geminiReply.trim().length > 0) {
          if (this.responseCache.size >= this.maxCacheSize) {
            this.responseCache.clear();
          }
          this.responseCache.set(cacheKey, geminiReply);

          return {
            reply: geminiReply,
            suggestedActions: this.extractSuggestedActions(geminiReply, emotionData.emotion),
            emotion: emotionData.emotion,
          };
        }
      } catch (error) {
        console.warn('Gemini API call failed, using static CBT fallback:', error);
      }
    }

    // 5. Zero-token static CBT Fallback
    const fallbackReply = this.generateFallbackReply(emotionData, cbt, userName, aiName);
    return {
      reply: fallbackReply,
      suggestedActions: this.extractSuggestedActions(fallbackReply, emotionData.emotion),
      emotion: emotionData.emotion,
    };
  }

  private async callGeminiAPI(params: {
    userMessage: string;
    history: { role: string; content: string }[];
    emotionData: EmotionAnalysis;
    cbt: { validation: string; technique: string; suggestion: string };
    userName: string;
    aiName: string;
  }): Promise<string> {
    const { userMessage, history, emotionData, cbt, userName, aiName } = params;

    const systemInstruction = (
      `You are ${aiName}, a warm, emotionally present companion having an ongoing, ` +
      `real conversation — not a script-reader. You are NOT a therapist and ` +
      `must never claim to be one or give clinical diagnoses. For each turn ` +
      `you'll get: recent conversation history, the user's latest message, ` +
      `their detected emotion, and an approved CBT technique + suggestion ` +
      `you can draw on. Use them as raw material, not a template to repeat.\n\n` +
      `How to actually talk like a person:\n` +
      `- Your companion name is ${aiName}.\n` +
      `- Address the user warmly (their name is ${userName}).\n` +
      `- React to the SPECIFIC thing they said, not the general emotion category.\n` +
      `- Ask a genuine follow-up question most turns — what happened, how long it's been going on, ` +
      `what they've already tried, how they're feeling about it now. A real companion is curious, not just reassuring.\n` +
      `- Don't reflexively agree or validate everything. If something they say is unclear or contradicts ` +
      `what they said earlier, say so honestly and ask.\n` +
      `- Only bring in the CBT technique/suggestion when it actually fits the moment naturally.\n` +
      `- Keep replies concise (2-4 sentences or short paragraphs), like a thoughtful, empathetic message from a trusted friend.\n` +
      `- Do not invent dangerous medical advice or suggest medications.`
    );

    // Multi-turn sliding window (keep last 4-6 turns)
    const trimmedHistory = history.slice(-8);
    const contents: any[] = [];

    for (const turn of trimmedHistory) {
      contents.push({
        role: turn.role === 'user' ? 'user' : 'model',
        parts: [{ text: turn.content }]
      });
    }

    const turnPrompt = (
      `User's latest message: "${userMessage}"\n` +
      `Detected emotion: ${emotionData.emotion} (confidence ${emotionData.confidence})\n` +
      `Technique available if it fits: ${cbt.technique}\n` +
      `Suggestion available if it fits: ${cbt.suggestion}\n\n` +
      `Reply like you're actually talking with ${userName} — react to what they said, ` +
      `ask something if it'd be natural to, and only use the technique/suggestion if it genuinely fits this moment.`
    );

    contents.push({
      role: 'user',
      parts: [{ text: turnPrompt }]
    });

    const modelName = config.ai.geminiModel || 'gemini-flash-latest';
    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 350,
        topP: 0.95,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.ai.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API returned ${response.status}: ${err}`);
    }

    const data = await response.json();
    const candidateParts = data?.candidates?.[0]?.content?.parts || [];
    return candidateParts.map((p: any) => p.text || '').join('\n').trim();
  }

  private generateFallbackReply(
    emotionData: EmotionAnalysis,
    cbt: { validation: string; technique: string; suggestion: string },
    userName?: string,
    aiName: string = 'USHA'
  ): string {
    const name = userName ? userName : 'friend';
    return (
      `Hello ${name}, I am ${aiName}, your wellness companion. ${cbt.validation} ` +
      `${cbt.suggestion} (CBT Technique: ${cbt.technique})`
    );
  }

  private extractSuggestedActions(text: string, emotion?: string): string[] {
    const actions: string[] = [];
    const t = text.toLowerCase();

    if (t.includes('breath') || t.includes('4-4-6') || t.includes('4-7-8')) {
      actions.push('4-7-8 Breathing Pacer');
    }
    if (t.includes('ground') || t.includes('5-4-3-2-1') || t.includes('sensory')) {
      actions.push('5-4-3-2-1 Sensory Grounding');
    }
    if (t.includes('reframe') || t.includes('thought') || t.includes('diary')) {
      actions.push('Open Thought Diary');
    }
    if (t.includes('walk') || t.includes('activity') || t.includes('behavioral')) {
      actions.push('Behavioral Activation Log');
    }

    if (actions.length === 0) {
      if (emotion === 'fear' || emotion === 'anger') {
        actions.push('5-4-3-2-1 Grounding', 'Mindful Pause');
      } else if (emotion === 'sadness') {
        actions.push('Behavioral Activation', 'Journaling Prompt');
      } else if (emotion === 'joy' || emotion === 'love') {
        actions.push('Log Joy in Mood Tracker', 'Write Gratitude Note');
      } else {
        actions.push('Check My Mood', 'Open Thought Diary');
      }
    }

    return actions;
  }

  private getCacheKey(message: string, emotion: string, history: any[], aiName: string): string {
    const historyStr = (history || [])
      .slice(-4)
      .map(h => `${h.role}:${(h.content || '').trim().toLowerCase()}`)
      .join('|');
    const raw = `${aiName}::${historyStr}::${emotion}::${(message || '').trim().toLowerCase()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}

export const ushaEngine = new UshaEngine();
