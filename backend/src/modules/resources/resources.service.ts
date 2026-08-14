import { prisma } from '../../db/prisma';

export const CRISIS_HOTLINES = [
  {
    id: 'us-988',
    country: 'United States & Canada',
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    description: 'Free, confidential support available 24/7 via phone or text for individuals experiencing mental distress, substance use crisis, or suicidal thoughts.',
    tags: ['24/7', 'Toll-Free', 'Call or Text', 'Confidential'],
    website: 'https://988lifeline.org',
  },
  {
    id: 'us-text-home',
    country: 'United States & Canada & UK',
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741 (US/CA) or 85258 (UK)',
    description: 'Connect with a volunteer Crisis Counselor 24/7 to receive support over text message.',
    tags: ['24/7', 'Text Support', 'Free'],
    website: 'https://www.crisistextline.org',
  },
  {
    id: 'uk-111',
    country: 'United Kingdom',
    name: 'NHS 111 Mental Health Option',
    number: '111',
    description: 'Call 111 and select the mental health option for urgent 24/7 NHS mental health services.',
    tags: ['24/7', 'NHS', 'Free'],
    website: 'https://111.nhs.uk',
  },
  {
    id: 'uk-samaritans',
    country: 'United Kingdom & Ireland',
    name: 'Samaritans Helpline',
    number: '116 123',
    description: 'Whatever you\'re going through, a Samaritan will face it with you. 24 hours a day, 365 days a year.',
    tags: ['24/7', 'Free', 'Confidential'],
    website: 'https://www.samaritans.org',
  },
  {
    id: 'eu-112',
    country: 'European Union',
    name: 'European Emergency Number',
    number: '112',
    description: 'The pan-European emergency number for immediate police, ambulance, or rescue services across Europe.',
    tags: ['24/7', 'Emergency', 'Free'],
    website: 'https://ec.europa.eu/digital-single-market/en/112',
  },
  {
    id: 'in-telemanas',
    country: 'India',
    name: 'Tele-MANAS (Govt of India)',
    number: '14416 / 1800-891-4416',
    description: 'National Tele Mental Health Programme of India providing 24/7 free mental health counselling in multiple languages.',
    tags: ['24/7', 'Govt of India', 'Multilingual', 'Free'],
    website: 'https://telemanas.mohfw.gov.in',
  },
  {
    id: 'au-lifeline',
    country: 'Australia',
    name: 'Lifeline Australia',
    number: '13 11 14',
    description: '24 hour crisis support and suicide prevention services in Australia.',
    tags: ['24/7', 'Confidential', 'Crisis Support'],
    website: 'https://www.lifeline.org.au',
  },
  {
    id: 'intl-befrienders',
    country: 'Worldwide Directory',
    name: 'Befrienders Worldwide',
    number: 'Visit Website',
    description: 'Find a confidential helpline near you anywhere across 30+ countries globally.',
    tags: ['Global', 'Directory'],
    website: 'https://www.befrienders.org',
  }
];

export const GROUNDING_TECHNIQUES = [
  {
    id: 'breathing-478',
    name: '4-7-8 Relaxing Breath',
    duration: '3-5 minutes',
    category: 'Somatic / Breathing',
    summary: 'A natural tranquilizer for the nervous system formulated by Dr. Andrew Weil.',
    instructions: [
      'Exhale completely through your mouth, making a whoosh sound.',
      'Close your mouth and inhale quietly through your nose for a mental count of 4.',
      'Hold your breath for a count of 7.',
      'Exhale completely through your mouth with a gentle whoosh for a count of 8.',
      'Repeat this cycle 4 times to stimulate the parasympathetic rest-and-digest response.'
    ]
  },
  {
    id: 'sensory-54321',
    name: '5-4-3-2-1 Sensory Grounding',
    duration: '5 minutes',
    category: 'Mindfulness / Grounding',
    summary: 'Engage your five senses to pull your attention away from panic or catastrophic thoughts back to the safe physical present.',
    instructions: [
      'Acknowledge 5 things you can SEE around you (e.g. a book, a shadow, a pattern).',
      'Acknowledge 4 things you can TOUCH or feel (e.g. feet on the floor, texture of your shirt).',
      'Acknowledge 3 things you can HEAR (e.g. ambient hum, birds outside, your own breath).',
      'Acknowledge 2 things you can SMELL (e.g. coffee, fresh air, paper).',
      'Acknowledge 1 thing you can TASTE (e.g. mint, water, or acknowledge the taste in your mouth).'
    ]
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing (4-4-4-4)',
    duration: '4 minutes',
    category: 'Somatic / Focus',
    summary: 'Used by Navy SEALs and athletes to restore focus, regulate heart rate, and clear mental fog under pressure.',
    instructions: [
      'Inhale slowly for 4 seconds.',
      'Hold your breath with full lungs for 4 seconds.',
      'Exhale smoothly for 4 seconds.',
      'Hold with empty lungs for 4 seconds.',
      'Repeat for 4 to 6 cycles.'
    ]
  }
];

export class ResourcesService {
  getCrisisHotlines() {
    return CRISIS_HOTLINES;
  }

  getGroundingTechniques() {
    return GROUNDING_TECHNIQUES;
  }

  async getSafetyPlan(userId: string) {
    const plan = await prisma.safetyPlan.findUnique({
      where: { userId }
    });

    if (!plan) {
      return {
        warningSigns: [],
        copingStrategies: [],
        distractionPlaces: [],
        supportiveContacts: [],
        professionalResources: [],
        safeEnvironmentSteps: [],
      };
    }

    return {
      id: plan.id,
      warningSigns: JSON.parse(plan.warningSigns || '[]'),
      copingStrategies: JSON.parse(plan.copingStrategies || '[]'),
      distractionPlaces: JSON.parse(plan.distractionPlaces || '[]'),
      supportiveContacts: JSON.parse(plan.supportiveContacts || '[]'),
      professionalResources: JSON.parse(plan.professionalResources || '[]'),
      safeEnvironmentSteps: JSON.parse(plan.safeEnvironmentSteps || '[]'),
      updatedAt: plan.updatedAt,
    };
  }

  async upsertSafetyPlan(userId: string, data: {
    warningSigns?: string[];
    copingStrategies?: string[];
    distractionPlaces?: string[];
    supportiveContacts?: { name: string; phone: string; relationship: string }[];
    professionalResources?: { agency: string; phone: string; contact: string }[];
    safeEnvironmentSteps?: string[];
  }) {
    const plan = await prisma.safetyPlan.upsert({
      where: { userId },
      create: {
        userId,
        warningSigns: JSON.stringify(data.warningSigns || []),
        copingStrategies: JSON.stringify(data.copingStrategies || []),
        distractionPlaces: JSON.stringify(data.distractionPlaces || []),
        supportiveContacts: JSON.stringify(data.supportiveContacts || []),
        professionalResources: JSON.stringify(data.professionalResources || []),
        safeEnvironmentSteps: JSON.stringify(data.safeEnvironmentSteps || []),
      },
      update: {
        warningSigns: data.warningSigns ? JSON.stringify(data.warningSigns) : undefined,
        copingStrategies: data.copingStrategies ? JSON.stringify(data.copingStrategies) : undefined,
        distractionPlaces: data.distractionPlaces ? JSON.stringify(data.distractionPlaces) : undefined,
        supportiveContacts: data.supportiveContacts ? JSON.stringify(data.supportiveContacts) : undefined,
        professionalResources: data.professionalResources ? JSON.stringify(data.professionalResources) : undefined,
        safeEnvironmentSteps: data.safeEnvironmentSteps ? JSON.stringify(data.safeEnvironmentSteps) : undefined,
      }
    });

    return {
      id: plan.id,
      warningSigns: JSON.parse(plan.warningSigns),
      copingStrategies: JSON.parse(plan.copingStrategies),
      distractionPlaces: JSON.parse(plan.distractionPlaces),
      supportiveContacts: JSON.parse(plan.supportiveContacts),
      professionalResources: JSON.parse(plan.professionalResources),
      safeEnvironmentSteps: JSON.parse(plan.safeEnvironmentSteps),
      updatedAt: plan.updatedAt,
    };
  }
}

export const resourcesService = new ResourcesService();
