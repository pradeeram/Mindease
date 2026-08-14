import { prisma } from '../../db/prisma';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        mfaEnabled: true,
        theme: true,
        baselineScore: true,
        onboarded: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            moodEntries: true,
            journalEntries: true,
            chatSessions: true,
          }
        }
      }
    });

    if (!user) {
      const error: any = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string; theme?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatar: data.avatar,
        theme: data.theme,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        theme: true,
        mfaEnabled: true,
        onboarded: true,
      }
    });

    return user;
  }

  async completeOnboarding(userId: string, data: { baselineScore: number; primaryGoals?: string[]; consentsAccepted: boolean }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        onboarded: true,
        baselineScore: data.baselineScore,
      },
      select: {
        id: true,
        email: true,
        name: true,
        onboarded: true,
        baselineScore: true,
      }
    });

    // Record consent
    if (data.consentsAccepted) {
      await prisma.consent.create({
        data: {
          userId,
          policyType: 'CRISIS_DISCLAIMER',
          agreedVersion: 'v1.0-2026',
        }
      });
    }

    return user;
  }
}

export const userService = new UserService();
