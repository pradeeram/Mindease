import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { encryptData } from '../utils/crypto';

async function seed() {
  console.log('🌱 Seeding MindEase database with rich clinical CBT demonstration data...');

  // Clean existing demo user if present
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@mindease.app' }
  });

  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 1. Create Demo User
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('MindEase2026!', salt);

  const user = await prisma.user.create({
    data: {
      email: 'demo@mindease.app',
      name: 'Alex Mercer',
      passwordHash,
      emailVerified: true,
      role: 'USER',
      theme: 'light',
      onboarded: true,
      baselineScore: 68,
    }
  });

  // Create DPDP consents for demo user
  await prisma.consent.createMany({
    data: [
      {
        userId: user.id,
        policyType: 'TERMS',
        agreedVersion: 'v2.0-DPDP-2026',
        ipAddress: '127.0.0.1',
        userAgent: 'SeedScript',
      },
      {
        userId: user.id,
        policyType: 'PRIVACY',
        agreedVersion: 'v2.0-DPDP-2026',
        ipAddress: '127.0.0.1',
        userAgent: 'SeedScript',
      }
    ]
  });

  console.log(`✅ Created demo user: demo@mindease.app / MindEase2026! (ID: ${user.id})`);

  // 2. Create 14 days of Mood Entries
  const moodData = [
    { daysAgo: 13, score: 4, emotion: 'Anxiety', secondary: ['Overwhelmed', 'Restless'], intensity: 75, sleep: 5.5, anxiety: 7, energy: 4, factors: ['Work', 'Sleep', 'Screen Time'], notes: 'Big deadline approaching at work. Felt a knot in my chest all morning.' },
    { daysAgo: 12, score: 5, emotion: 'Fatigue', secondary: ['Tired', 'Low Energy'], intensity: 60, sleep: 6.0, anxiety: 6, energy: 3, factors: ['Sleep', 'Work'], notes: 'Still feeling groggy. Took a short walk during lunch which helped a bit.' },
    { daysAgo: 11, score: 6, emotion: 'Neutral', secondary: ['Quiet', 'Focused'], intensity: 40, sleep: 7.0, anxiety: 5, energy: 6, factors: ['Work', 'Routine'], notes: 'Made good progress on my project. Practiced 4-7-8 breathing before meeting.' },
    { daysAgo: 10, score: 5, emotion: 'Anxiety', secondary: ['Self-Doubt', 'Nervous'], intensity: 65, sleep: 6.5, anxiety: 7, energy: 5, factors: ['Work', 'Social'], notes: 'Felt like my presentation was not good enough. Noticed mind-reading distortion.' },
    { daysAgo: 9, score: 7, emotion: 'Calm', secondary: ['Relief', 'Grounded'], intensity: 40, sleep: 8.0, anxiety: 3, energy: 7, factors: ['Exercise', 'Nature', 'Sleep'], notes: 'Went for an evening run in the park. Felt peaceful and grounded.' },
    { daysAgo: 8, score: 8, emotion: 'Joy', secondary: ['Grateful', 'Optimistic'], intensity: 80, sleep: 7.5, anxiety: 2, energy: 8, factors: ['Friends', 'Social', 'Exercise'], notes: 'Caught up with old friends over dinner. Laughed so much.' },
    { daysAgo: 7, score: 7, emotion: 'Contentment', secondary: ['Peaceful', 'Satisfied'], intensity: 50, sleep: 8.0, anxiety: 2, energy: 7, factors: ['Rest', 'Reading'], notes: 'Quiet Sunday reading and meal prepping.' },
    { daysAgo: 6, score: 5, emotion: 'Anxiety', secondary: ['Monday Blues', 'Pressure'], intensity: 60, sleep: 6.5, anxiety: 6, energy: 5, factors: ['Work', 'Commute'], notes: 'Monday morning backlog. Used thought diary to challenge urgency.' },
    { daysAgo: 5, score: 6, emotion: 'Neutral', secondary: ['Steady', 'Productive'], intensity: 45, sleep: 7.0, anxiety: 4, energy: 6, factors: ['Work', 'Nutrition'], notes: 'Good steady focus. Kept boundaries on overtime.' },
    { daysAgo: 4, score: 7, emotion: 'Calm', secondary: ['Balanced', 'Present'], intensity: 50, sleep: 7.5, anxiety: 3, energy: 7, factors: ['Exercise', 'Hydration'], notes: 'Morning yoga session set a gentle tone for the whole day.' },
    { daysAgo: 3, score: 8, emotion: 'Joy', secondary: ['Accomplished', 'Proud'], intensity: 85, sleep: 8.0, anxiety: 2, energy: 8, factors: ['Work', 'Growth'], notes: 'Successfully delivered the quarterly review! Received warm feedback.' },
    { daysAgo: 2, score: 7, emotion: 'Contentment', secondary: ['Relaxed', 'Comfortable'], intensity: 60, sleep: 7.5, anxiety: 2, energy: 7, factors: ['Rest', 'Hobbies'], notes: 'Spent evening working on watercolours.' },
    { daysAgo: 1, score: 8, emotion: 'Joy', secondary: ['Grateful', 'Calm'], intensity: 75, sleep: 8.0, anxiety: 1, energy: 8, factors: ['Nature', 'Social'], notes: 'Sunny hike with partner. Feeling very connected and calm.' },
    { daysAgo: 0, score: 8, emotion: 'Calm', secondary: ['Grounded', 'Present'], intensity: 70, sleep: 7.8, anxiety: 2, energy: 8, factors: ['Morning Routine', 'Mindfulness'], notes: 'Started the day with mindful coffee and 10 mins meditation.' },
  ];

  for (const m of moodData) {
    const loggedAt = new Date();
    loggedAt.setDate(loggedAt.getDate() - m.daysAgo);
    loggedAt.setHours(9, 30, 0, 0);

    await prisma.moodEntry.create({
      data: {
        userId: user.id,
        score: m.score,
        primaryEmotion: m.emotion,
        secondaryEmotions: JSON.stringify(m.secondary),
        intensity: m.intensity,
        sleepHours: m.sleep,
        anxietyLevel: m.anxiety,
        energyLevel: m.energy,
        factors: JSON.stringify(m.factors),
        notesEncrypted: encryptData(m.notes),
        loggedAt,
      }
    });
  }

  console.log(`✅ Seeded ${moodData.length} historical mood entries`);

  // 3. Create CBT Journal Entries
  const journalData = [
    {
      title: 'Presentation Catastrophizing Reframe',
      situation: 'Preparing for the quarterly project presentation to the executive leadership team.',
      automaticThought: 'If I stumble over one slide, everyone will think I am incompetent and I might lose my job.',
      distortionTags: ['Catastrophizing', 'All-or-Nothing Thinking', 'Fortune Telling'],
      cognitiveReframing: 'Stumbling over a word is normal and human. I have prepared thoroughly for two weeks, and leadership values the actual project metrics, not robotic perfection. One minor slip does not erase my track record.',
      moodBefore: 3,
      moodAfter: 7,
      outcomeNote: 'The meeting went smoothly. Even when I paused to check my notes, nobody minded. I felt much calmer.',
      isFavorite: true,
      daysAgo: 10,
    },
    {
      title: 'Challenging "Mind Reading" with Coworker',
      situation: 'Sent an email to a teammate asking for feedback and received a brief 3-word response.',
      automaticThought: 'She is annoyed with me and thinks my draft was terrible.',
      distortionTags: ['Mind Reading', 'Jumping to Conclusions', 'Personalization'],
      cognitiveReframing: 'A short email usually means the other person is busy or on their mobile, not that they are angry with me. I have no evidence of irritation. I can ask politely in our 1-on-1 if she needs any context.',
      moodBefore: 4,
      moodAfter: 8,
      outcomeNote: 'In our 1-on-1, she mentioned she was rushing between back-to-back client calls. It had nothing to do with me.',
      isFavorite: true,
      daysAgo: 6,
    },
    {
      title: 'Letting Go of Perfectionism in Workout Routine',
      situation: 'Had only 20 minutes available to exercise instead of my usual 60-minute routine.',
      automaticThought: 'There is no point in exercising for just 20 minutes; today is completely wasted.',
      distortionTags: ['All-or-Nothing Thinking', 'Disqualifying the Positive'],
      cognitiveReframing: '20 minutes of gentle movement is infinitely better than zero. Consistency and honoring my body matter far more than rigid perfection.',
      moodBefore: 4,
      moodAfter: 7,
      outcomeNote: 'Did a 15-min brisk walk and stretch. Felt energized and proud of maintaining momentum.',
      isFavorite: false,
      daysAgo: 3,
    }
  ];

  for (const j of journalData) {
    const loggedAt = new Date();
    loggedAt.setDate(loggedAt.getDate() - j.daysAgo);

    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: j.title,
        situation: j.situation,
        automaticThought: j.automaticThought,
        distortionTags: JSON.stringify(j.distortionTags),
        cognitiveReframing: j.cognitiveReframing,
        moodBefore: j.moodBefore,
        moodAfter: j.moodAfter,
        outcomeNote: j.outcomeNote,
        isFavorite: j.isFavorite,
        loggedAt,
      }
    });
  }

  console.log(`✅ Seeded ${journalData.length} CBT cognitive restructuring entries`);

  // 4. Create USHA Chat Session
  const session = await prisma.chatSession.create({
    data: {
      userId: user.id,
      title: 'Mindful Evening Reflection',
    }
  });

  const chatMessages = [
    { role: 'user', content: 'Hi USHA, I felt a bit overwhelmed with work today and found my mind racing ahead to tomorrow.' },
    { role: 'usha', content: 'Hello Alex. It is completely understandable to feel that mental momentum when a workday is dense. When our brain tries to solve tomorrow tonight, it is often trying to create certainty.\n\nLet’s gently press pause together. Take a slow breath and let your jaw loosen. What is one small thought that felt most demanding today?', metadata: JSON.stringify({ suggestedActions: ['Try 4-7-8 Breathing', 'Open Thought Diary'] }) },
    { role: 'user', content: 'I kept thinking I must finish every single email before shutting down my laptop.' },
    { role: 'usha', content: 'Notice how the word "must" creates urgency—in CBT, we call this a *Should/Must Statement*. Emails will continually arrive, but your rest is essential for tomorrow\'s clarity.\n\nYou did meaningful work today. Giving yourself permission to close the laptop is an active practice of self-care.', metadata: JSON.stringify({ detectedDistortion: 'Should Statements' }) }
  ];

  for (const msg of chatMessages) {
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        role: msg.role,
        contentEncrypted: encryptData(msg.content),
        isCrisisTriggered: false,
        metadata: msg.metadata || null,
      }
    });
  }

  console.log(`✅ Seeded USHA chat conversation`);

  // 5. Create Reminders
  await prisma.reminder.createMany({
    data: [
      {
        userId: user.id,
        type: 'MOOD_CHECKIN',
        title: 'Morning Emotional Check-in',
        time: '08:30',
        daysOfWeek: JSON.stringify(['MON','TUE','WED','THU','FRI','SAT','SUN']),
        isEnabled: true,
      },
      {
        userId: user.id,
        type: 'BREATHING_BREAK',
        title: 'Midday Mindful Reset (4-7-8 Breath)',
        time: '14:00',
        daysOfWeek: JSON.stringify(['MON','TUE','WED','THU','FRI']),
        isEnabled: true,
      }
    ]
  });

  // 6. Create Safety Plan
  await prisma.safetyPlan.create({
    data: {
      userId: user.id,
      warningSigns: JSON.stringify(['Tightness in chest', 'Withdrawing from texting friends', 'Insomnia past 1 AM']),
      copingStrategies: JSON.stringify(['4-7-8 Breathing Pacer for 4 minutes', 'Playing acoustic guitar', 'Splashing cold water on wrists']),
      distractionPlaces: JSON.stringify(['Local botanical gardens', 'Corner cafe with a notebook', 'Public library reading room']),
      supportiveContacts: JSON.stringify([
        { name: 'Sarah (Sister)', phone: '555-0192', relationship: 'Sister' },
        { name: 'Dr. Linda Hayes', phone: '555-0144', relationship: 'Therapist' }
      ]),
      professionalResources: JSON.stringify([
        { agency: '988 Suicide & Crisis Lifeline', phone: '988', contact: '24/7 Phone & Text' },
        { agency: 'Local Crisis Care Clinic', phone: '555-0199', contact: 'Walk-in 8 AM - 10 PM' }
      ]),
      safeEnvironmentSteps: JSON.stringify(['Keep work laptop out of the bedroom', 'Set phone to Do-Not-Disturb after 10 PM']),
    }
  });

  console.log('🎉 Seed complete! Demo account ready for instant testing.');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
