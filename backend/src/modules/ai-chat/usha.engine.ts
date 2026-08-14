import { config } from '../../config';

const SYSTEM_PROMPT = `
You are USHA (Unified Supportive Healthcare Assistant / Understanding, Supportive & Helpful Assistant), the empathetic AI wellness companion for MindEase.
YOUR NAME IS ALWAYS USHA. Never refer to yourself as Alex or any other name under any circumstance.
When introduced or asked for your name, always warmly state: "My name is USHA, your dedicated CBT wellness companion on MindEase."

Your communication is grounded in "Clinical Empathy" — warm, validating, structured, calm, and evidence-based (Cognitive Behavioral Therapy & Mindfulness).

CRITICAL BOUNDARIES & SAFETY RULES:
1. You are a supportive mental wellness companion, NOT a licensed medical professional, therapist, or emergency service.
2. If the user mentions self-harm, suicide, or physical emergency, express immediate gentle care and direct them to emergency services or the 988 Lifeline. Never attempt to solve a crisis on your own.
3. Help the user:
   - Identify automatic negative thoughts (ANTs) and cognitive distortions (like catastrophizing, all-or-nothing thinking, emotional reasoning).
   - Reframe thoughts with balanced, compassionate evidence.
   - Practice mindful breathing (such as 4-7-8 breathing) and 5-4-3-2-1 sensory grounding.
4. Keep responses conversational, concise (2-4 paragraphs max), warm, and non-judgmental. Ask gentle reflective open questions.
`.trim();

export class UshaEngine {
  /**
   * Generates a response from USHA using either the Google Gemini API or the built-in empathetic CBT engine
   */
  async generateResponse(params: {
    message: string;
    conversationHistory: { role: string; content: string }[];
    userName?: string;
  }): Promise<{ reply: string; suggestedActions?: string[]; detectedDistortion?: string }> {
    const { message, conversationHistory, userName } = params;

    // 1. If Gemini API key is configured, call Gemini API
    if (config.ai.geminiApiKey && config.ai.geminiApiKey !== 'your_gemini_api_key_here' && config.ai.geminiApiKey.trim().length > 10) {
      try {
        const geminiReply = await this.callGeminiAPI(message, conversationHistory, userName);
        if (geminiReply) {
          return {
            reply: geminiReply,
            suggestedActions: this.extractSuggestedActions(geminiReply),
          };
        }
      } catch (error) {
        console.warn('Gemini API request failed, falling back to CBT heuristic engine:', error);
      }
    }

    // 2. Intelligent Built-in CBT Engine (Offline / Zero-Config fallback)
    return this.generateCBTResponse(message, userName);
  }

  private async callGeminiAPI(
    userMessage: string,
    history: { role: string; content: string }[],
    userName?: string
  ): Promise<string> {
    const contents: any[] = [];

    // Add recent context (last 6 messages)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Add current user message with user context
    contents.push({
      role: 'user',
      parts: [{
        text: `${userName ? `[User Name: ${userName}] ` : ''}${userMessage}`
      }]
    });

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
        topP: 0.9,
      }
    };

    // Try Gemini 1.5-flash or 2.0-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || '';
  }

  private generateCBTResponse(userMessage: string, userName: string = 'friend'): { reply: string; suggestedActions: string[]; detectedDistortion?: string } {
    const msg = userMessage.toLowerCase();
    const name = userName ? userName : 'friend';

    // 0. Identity & Name Questions
    if (msg.includes('your name') || msg.includes('who are you') || msg.includes('who r u') || msg.includes('alex') || msg.includes('what are you called') || msg.includes('introduce yourself')) {
      return {
        reply: `Hello ${name}! My name is **USHA** (Understanding, Supportive & Helpful Assistant), your dedicated CBT wellness companion here on MindEase.\n\nI am here to help you navigate anxious thoughts, practice mindfulness, reframe difficult situations, and provide a safe, non-judgmental space whenever you need support. How can I assist you today?`,
        suggestedActions: ['Start 4-7-8 Breathing', 'Open Thought Diary', 'Check My Mood'],
      };
    }

    // 1. Anxiety & Overthinking
    if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('overthinking') || msg.includes('panic') || msg.includes('worried') || msg.includes('nervous')) {
      return {
        reply: `Hello ${name}. I can hear how overwhelming those anxious thoughts feel right now. When anxiety peaks, our nervous system often races ahead into worst-case scenarios—a pattern we call *catastrophizing*.\n\nTake a slow, deep breath with me right now. Let your shoulders drop away from your ears. What is one specific thought that feels loudest in your mind right this second? We can look at it gently together.`,
        suggestedActions: ['Try 4-7-8 Breathing', 'Open Thought Diary', '5-4-3-2-1 Grounding'],
        detectedDistortion: 'Catastrophizing',
      };
    }

    // 2. Work / Burnout / Overwhelmed
    if (msg.includes('work') || msg.includes('burnout') || msg.includes('tired') || msg.includes('exhausted') || msg.includes('overwhelm') || msg.includes('deadline') || msg.includes('stress')) {
      return {
        reply: `It sounds like you have been carrying an extraordinary amount of weight on your shoulders, ${name}. Burnout often whispers that we must do everything perfectly or all at once—which is an impossible standard.\n\nYou don't have to solve everything in this single moment. Give yourself permission to pause. If you could take just one tiny task off your plate today, what would give you the most breathing room?`,
        suggestedActions: ['Start 2-Min Pause', 'Log Current Mood', 'Write in Journal'],
        detectedDistortion: 'All-or-Nothing Thinking',
      };
    }

    // 3. Self-Criticism / Feeling not good enough / Failure
    if (msg.includes('fail') || msg.includes('not good enough') || msg.includes('stupid') || msg.includes('useless') || msg.includes('hate myself') || msg.includes('guilt') || msg.includes('mistake')) {
      return {
        reply: `I hear so much self-criticism in what you shared, ${name}. It is painful when our internal critic gets loud. In CBT, we recognize this as *Labeling* or *Emotional Reasoning*—just because we feel like we made a mistake does not mean we are broken or unworthy.\n\nIf a dear friend came to you in this exact situation, what kind words would you offer them? You deserve that same gentle compassion right now.`,
        suggestedActions: ['Reframe This Thought', 'Self-Compassion Exercise', 'View CBT Tools'],
        detectedDistortion: 'Labeling & Self-Criticism',
      };
    }

    // 4. Sleep & Insomnia
    if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('can\'t sleep') || msg.includes('wake up') || msg.includes('nightmare')) {
      return {
        reply: `Tossing and turning when your mind refuses to quiet down is deeply exhausting, ${name}. When our brain is in high gear at night, forcing sleep often increases friction.\n\nInstead of trying to force sleep, let's shift the goal to simple *rest*. Allow your eyes to soften and practice unclasping your jaw. Would you like to do a gentle 4-7-8 breathing cycle together to calm your nervous system?`,
        suggestedActions: ['4-7-8 Breathing Pacer', 'Body Relaxation Guide', 'Log Sleep Metrics'],
        detectedDistortion: 'Mental Racing',
      };
    }

    // 5. Sadness / Loneliness / Low Mood
    if (msg.includes('sad') || msg.includes('lonely') || msg.includes('alone') || msg.includes('depressed') || msg.includes('down') || msg.includes('cry')) {
      return {
        reply: `Thank you for sharing that with me, ${name}. Feeling down or isolated can make the world feel heavy and distant. Your feelings are completely valid, and it is okay to not be okay today.\n\nYou don't have to force positivity right now. Just being present with yourself is an act of courage. Would you like to write down what's on your heart, or simply rest for a moment with some grounding?`,
        suggestedActions: ['Expressive Journaling', '5-4-3-2-1 Sensory Grounding', 'Crisis Resources'],
        detectedDistortion: 'Mental Filter',
      };
    }

    // 6. Gratitude / Positive Check-in
    if (msg.includes('happy') || msg.includes('good') || msg.includes('grateful') || msg.includes('calm') || msg.includes('better') || msg.includes('peaceful') || msg.includes('proud')) {
      return {
        reply: `What a wonderful moment to celebrate, ${name}! Savoring these moments of peace, joy, or relief helps rewire our brain's emotional baseline.\n\nTake a moment to notice how this calm or happiness feels in your physical body right now. Logging this in your Mood Tracker can serve as a great anchor for future days!`,
        suggestedActions: ['Log Joy in Mood Tracker', 'Write Gratitude Note', 'View Mood Trends'],
      };
    }

    // Default Empathetic CBT Reflection
    return {
      reply: `I am here with you, ${name}. I am USHA, your CBT wellness companion. Thank you for taking this moment to check in with yourself. Mindfulness and CBT teach us that our thoughts and emotions are visitors—they come and go, but they do not define who you are.\n\nWhat is one feeling or reflection you would like to explore today? Whether it's sorting through a busy mind or simply taking a peaceful breath, we can take it one step at a time.`,
      suggestedActions: ['Daily Mood Check-in', 'Open CBT Thought Diary', 'Explore Breathing Guide'],
    };
  }

  private extractSuggestedActions(text: string): string[] {
    const actions: string[] = [];
    if (/breath/i.test(text)) actions.push('Try 4-7-8 Breathing');
    if (/thought|journal|reframe/i.test(text)) actions.push('Open Thought Diary');
    if (/ground|sensory|5-4-3-2-1/i.test(text)) actions.push('5-4-3-2-1 Grounding');
    if (actions.length === 0) {
      actions.push('Log Mood', 'Explore CBT Worksheets');
    }
    return actions;
  }
}

export const ushaEngine = new UshaEngine();
