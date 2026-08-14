export interface CrisisEvaluation {
  isCrisis: boolean;
  severity: 'NONE' | 'MODERATE' | 'ACUTE';
  matchedTriggers: string[];
  crisisMessage?: string;
  emergencyResources?: {
    title: string;
    description: string;
    contact: string;
    available: string;
  }[];
}

const ACUTE_CRISIS_KEYWORDS = [
  /\bkill\s+(myself|me)\b/i,
  /\bend\s+my\s+life\b/i,
  /\bsuicid(e|al|ing)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bhurt\s+myself\b/i,
  /\bself[\s-]harm\b/i,
  /\bcutting\s+myself\b/i,
  /\bcan'?t\s+go\s+on\s+living\b/i,
  /\bdon'?t\s+want\s+to\s+live\s+anymore\b/i,
  /\btake\s+my\s+own\s+life\b/i,
  /\boverdose\s+on\b/i,
  /\bhang\s+myself\b/i,
  /\bjump\s+off\b/i,
  /\bgoodbye\s+cruel\s+world\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\beveryone\s+would\s+be\s+better\s+off\s+without\s+me\b/i,
];

const MODERATE_DISTRESS_KEYWORDS = [
  /\bhopeless\b/i,
  /\bcan'?t\s+take\s+this\s+pain\b/i,
  /\bworthless\b/i,
  /\btrapped\b/i,
  /\bno\s+way\s+out\b/i,
  /\beverything\s+is\s+falling\s+apart\b/i,
  /\bpanic\s+attack\b/i,
  /\bsevere\s+anxiety\b/i,
];

export function evaluateCrisisRisk(userMessage: string): CrisisEvaluation {
  const normalized = userMessage.toLowerCase().trim();
  const matchedTriggers: string[] = [];

  // Check acute crisis triggers
  for (const regex of ACUTE_CRISIS_KEYWORDS) {
    if (regex.test(normalized)) {
      matchedTriggers.push(regex.source);
    }
  }

  if (matchedTriggers.length > 0) {
    return {
      isCrisis: true,
      severity: 'ACUTE',
      matchedTriggers,
      crisisMessage: `I care deeply about your safety and wellbeing. It sounds like you are going through immense pain right now. Because I am an AI and not a crisis service, please connect with people who can support you right now. You are not alone, and help is available 24/7.`,
      emergencyResources: [
        {
          title: '988 Suicide & Crisis Lifeline (US & Canada)',
          description: 'Free, confidential support available 24/7 via call or text.',
          contact: '988',
          available: '24/7 / Free / Confidential',
        },
        {
          title: 'Crisis Text Line',
          description: 'Text HOME to connect with a crisis counselor in English/Spanish.',
          contact: 'Text HOME to 741741',
          available: '24/7 / Text Only',
        },
        {
          title: 'International Emergency Services',
          description: 'Emergency assistance: 112 (EU/UK), 999 (UK), 911 (US/Canada), 14416 (Tele-MANAS India).',
          contact: '112 / 911 / 999',
          available: 'Immediate Emergency Dispatch',
        },
        {
          title: 'The Trevor Project (LGBTQ+ Youth)',
          description: 'Call 1-866-488-7386 or text START to 678-678.',
          contact: '1-866-488-7386',
          available: '24/7 Specialized Support',
        }
      ]
    };
  }

  // Check moderate distress
  for (const regex of MODERATE_DISTRESS_KEYWORDS) {
    if (regex.test(normalized)) {
      matchedTriggers.push(regex.source);
    }
  }

  if (matchedTriggers.length >= 2) {
    return {
      isCrisis: false,
      severity: 'MODERATE',
      matchedTriggers,
    };
  }

  return {
    isCrisis: false,
    severity: 'NONE',
    matchedTriggers: [],
  };
}
