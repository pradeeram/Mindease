import { PrismaClient } from '@prisma/client';

const activeDbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  ...(activeDbUrl ? { datasources: { db: { url: activeDbUrl } } } : {}),
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failure:', error);
  }
}
