import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma';
import { decryptData } from '../../utils/crypto';

export class PrivacyService {
  /**
   * Complete GDPR & Privacy compliant data export
   */
  async exportUserData(userId: string, format: 'json' | 'csv' = 'json') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        moodEntries: { orderBy: { loggedAt: 'desc' } },
        journalEntries: { orderBy: { loggedAt: 'desc' } },
        chatSessions: {
          include: {
            messages: { orderBy: { timestamp: 'asc' } }
          }
        },
        consents: { orderBy: { agreedAt: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
        safetyPlan: true,
      }
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const decryptedData = {
      exportGeneratedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        theme: user.theme,
        baselineScore: user.baselineScore,
        createdAt: user.createdAt,
      },
      moodEntries: user.moodEntries.map(m => ({
        id: m.id,
        score: m.score,
        primaryEmotion: m.primaryEmotion,
        secondaryEmotions: JSON.parse(m.secondaryEmotions || '[]'),
        intensity: m.intensity,
        factors: JSON.parse(m.factors || '[]'),
        sleepHours: m.sleepHours,
        anxietyLevel: m.anxietyLevel,
        energyLevel: m.energyLevel,
        notes: m.notesEncrypted ? decryptData(m.notesEncrypted) : '',
        loggedAt: m.loggedAt,
      })),
      journalEntries: user.journalEntries.map(j => ({
        id: j.id,
        title: j.title,
        situation: j.situation,
        automaticThought: j.automaticThought,
        distortionTags: JSON.parse(j.distortionTags || '[]'),
        cognitiveReframing: j.cognitiveReframing,
        moodBefore: j.moodBefore,
        moodAfter: j.moodAfter,
        outcomeNote: j.outcomeNote,
        loggedAt: j.loggedAt,
      })),
      chatHistory: user.chatSessions.map(s => ({
        sessionId: s.id,
        title: s.title,
        createdAt: s.createdAt,
        messages: s.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: decryptData(msg.contentEncrypted),
          isCrisisTriggered: msg.isCrisisTriggered,
          timestamp: msg.timestamp,
        }))
      })),
      safetyPlan: user.safetyPlan ? {
        warningSigns: JSON.parse(user.safetyPlan.warningSigns || '[]'),
        copingStrategies: JSON.parse(user.safetyPlan.copingStrategies || '[]'),
        distractionPlaces: JSON.parse(user.safetyPlan.distractionPlaces || '[]'),
        supportiveContacts: JSON.parse(user.safetyPlan.supportiveContacts || '[]'),
        professionalResources: JSON.parse(user.safetyPlan.professionalResources || '[]'),
        safeEnvironmentSteps: JSON.parse(user.safetyPlan.safeEnvironmentSteps || '[]'),
      } : null,
      consents: user.consents.map(c => ({
        policyType: c.policyType,
        agreedVersion: c.agreedVersion,
        agreedAt: c.agreedAt,
      })),
      auditLogs: user.auditLogs.map(a => ({
        action: a.action,
        status: a.status,
        details: a.details,
        timestamp: a.timestamp,
      })),
    };

    if (format === 'csv') {
      return this.convertToCSV(decryptedData);
    }

    return decryptedData;
  }

  private convertToCSV(data: any): string {
    const lines: string[] = [];
    lines.push('--- MINDEASE GDPR DATA EXPORT ---');
    lines.push(`Generated: ${data.exportGeneratedAt}`);
    lines.push(`User Email: ${data.user.email}`);
    lines.push('');
    lines.push('--- MOOD ENTRIES ---');
    lines.push('ID,Date,Score,Primary Emotion,Intensity,Sleep (Hours),Anxiety Level,Factors,Notes');
    for (const m of data.moodEntries) {
      const sanitizedNotes = `"${(m.notes || '').replace(/"/g, '""')}"`;
      const factors = `"${m.factors.join(';')}"`;
      lines.push(`${m.id},${m.loggedAt},${m.score},${m.primaryEmotion},${m.intensity},${m.sleepHours || ''},${m.anxietyLevel || ''},${factors},${sanitizedNotes}`);
    }
    lines.push('');
    lines.push('--- JOURNAL ENTRIES ---');
    lines.push('ID,Date,Title,Mood Before,Mood After,Distortions,Situation,Thought,Reframing');
    for (const j of data.journalEntries) {
      const title = `"${j.title.replace(/"/g, '""')}"`;
      const distortions = `"${j.distortionTags.join(';')}"`;
      const situation = `"${j.situation.replace(/"/g, '""')}"`;
      const thought = `"${j.automaticThought.replace(/"/g, '""')}"`;
      const reframe = `"${j.cognitiveReframing.replace(/"/g, '""')}"`;
      lines.push(`${j.id},${j.loggedAt},${title},${j.moodBefore},${j.moodAfter},${distortions},${situation},${thought},${reframe}`);
    }
    return lines.join('\n');
  }

  async getAuditLogs(userId: string) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  async getConsents(userId: string) {
    return prisma.consent.findMany({
      where: { userId },
      orderBy: { agreedAt: 'desc' }
    });
  }

  async deleteAccountAndPurgeData(userId: string, passwordConfirm: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(passwordConfirm, user.passwordHash);
    if (!isValidPassword) {
      const error: any = new Error('Incorrect password. Account deletion canceled for your protection.');
      error.statusCode = 401;
      throw error;
    }

    // Cascade delete user and all associated mental health records
    await prisma.user.delete({
      where: { id: userId }
    });

    return {
      success: true,
      message: 'Your account and all associated mental health records have been permanently and irrecoverably purged.',
    };
  }

  /**
   * Withdraw Consent under Section 6(4) of the DPDP Act 2023
   * Terminates active processing and initiates full data erasure.
   */
  async withdrawConsent(userId: string, passwordConfirm: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(passwordConfirm, user.passwordHash);
    if (!isValidPassword) {
      const error: any = new Error('Incorrect password. Consent withdrawal canceled.');
      error.statusCode = 401;
      throw error;
    }

    // Log consent withdrawal in audit records
    await prisma.consent.create({
      data: {
        userId,
        policyType: 'CONSENT_WITHDRAWAL',
        agreedVersion: 'v2.0-DPDP-2026',
      }
    });

    // Erase all user data as consequence of consent withdrawal
    await prisma.user.delete({
      where: { id: userId }
    });

    return {
      success: true,
      message: 'Consent successfully withdrawn. In accordance with DPDP regulations, all your wellness logs and account data have been completely erased.',
    };
  }
}

export const privacyService = new PrivacyService();
