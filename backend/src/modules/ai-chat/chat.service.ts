import { prisma } from '../../db/prisma';
import { encryptData, decryptData } from '../../utils/crypto';
import { evaluateCrisisRisk, CrisisEvaluation } from './crisis.detector';
import { ushaEngine } from './usha.engine';

export class ChatService {
  async getOrCreateActiveSession(userId: string, title?: string) {
    let session = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: title || 'Reflection with USHA',
        }
      });
    }

    return session;
  }

  async createNewSession(userId: string, title?: string) {
    return prisma.chatSession.create({
      data: {
        userId,
        title: title || `Reflection ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      }
    });
  }

  async getUserSessions(userId: string) {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    return sessions;
  }

  async getSessionMessages(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      const error: any = new Error('Chat session not found.');
      error.statusCode = 404;
      throw error;
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' }
    });

    return messages.map(msg => ({
      id: msg.id,
      sessionId: msg.sessionId,
      role: msg.role,
      content: decryptData(msg.contentEncrypted),
      isCrisisTriggered: msg.isCrisisTriggered,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
      timestamp: msg.timestamp,
    }));
  }

  async sendMessage(userId: string, data: { sessionId?: string; message: string; aiName?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    // Get or create session
    let sessionId = data.sessionId;
    if (!sessionId) {
      const session = await this.getOrCreateActiveSession(userId);
      sessionId = session.id;
    }

    // 1. Evaluate Crisis Risk FIRST (Safety Non-Negotiable)
    const crisisEval: CrisisEvaluation = evaluateCrisisRisk(data.message);

    // Save User message (Encrypted at rest)
    const userMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        userId,
        role: 'user',
        contentEncrypted: encryptData(data.message.trim()),
        isCrisisTriggered: crisisEval.isCrisis,
      }
    });

    // Touch session update time
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    // 2. If Acute Crisis, respond with strict safety emergency protocol
    if (crisisEval.isCrisis && crisisEval.crisisMessage) {
      const ushaReply = crisisEval.crisisMessage;
      const metadata = {
        crisisSeverity: crisisEval.severity,
        emergencyResources: crisisEval.emergencyResources,
        matchedTriggers: crisisEval.matchedTriggers,
      };

      const aiMsg = await prisma.chatMessage.create({
        data: {
          sessionId,
          userId,
          role: 'usha',
          contentEncrypted: encryptData(ushaReply),
          isCrisisTriggered: true,
          metadata: JSON.stringify(metadata),
        }
      });

      return {
        sessionId,
        userMessage: {
          id: userMsg.id,
          role: 'user',
          content: data.message.trim(),
          timestamp: userMsg.timestamp,
        },
        ushaMessage: {
          id: aiMsg.id,
          role: 'usha',
          content: ushaReply,
          isCrisisTriggered: true,
          metadata,
          timestamp: aiMsg.timestamp,
        },
        crisisEvaluation: crisisEval,
      };
    }

    // 3. Otherwise, fetch recent conversation history and generate CBT response
    const previousMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
      take: 6,
    });

    const conversationHistory = previousMessages.reverse().map(m => ({
      role: m.role,
      content: decryptData(m.contentEncrypted),
    }));

    const aiResponse = await ushaEngine.generateResponse({
      message: data.message.trim(),
      conversationHistory,
      userName: user.name.split(' ')[0], // first name for warmth
      aiName: data.aiName || 'USHA',
    });

    const metadata = {
      suggestedActions: aiResponse.suggestedActions,
      detectedDistortion: aiResponse.detectedDistortion,
      crisisSeverity: crisisEval.severity,
    };

    const aiMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        userId,
        role: 'usha',
        contentEncrypted: encryptData(aiResponse.reply),
        isCrisisTriggered: false,
        metadata: JSON.stringify(metadata),
      }
    });

    return {
      sessionId,
      userMessage: {
        id: userMsg.id,
        role: 'user',
        content: data.message.trim(),
        timestamp: userMsg.timestamp,
      },
      ushaMessage: {
        id: aiMsg.id,
        role: 'usha',
        content: aiResponse.reply,
        isCrisisTriggered: false,
        metadata,
        timestamp: aiMsg.timestamp,
      },
      crisisEvaluation: crisisEval,
    };
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      const error: any = new Error('Chat session not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.chatSession.delete({ where: { id: sessionId } });
    return { success: true, message: 'Chat session deleted successfully.' };
  }
}

export const chatService = new ChatService();
