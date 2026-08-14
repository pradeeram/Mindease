import { PrismaClient } from '@prisma/client';

function getResolvedDatabaseUrl(): string {
  const directFallback = 'postgresql://postgres:MindEaseDb2026@db.zuxnxwihlvgpquwrqlew.supabase.co:5432/postgres';
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!rawUrl || rawUrl.trim() === '') {
    return directFallback;
  }

  // Automatically convert Supabase pooler URL (:6543) to verified direct connection host (:5432)
  try {
    const poolerMatch = rawUrl.match(/postgres\.([a-z0-9]+):([^@]+)@[^:]+:6543\/postgres/i);
    if (poolerMatch) {
      const projectRef = poolerMatch[1];
      const password = poolerMatch[2];
      return `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
    }
  } catch (e) {
    // Ignore parsing error
  }

  return rawUrl;
}

const activeDbUrl = getResolvedDatabaseUrl();

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: activeDbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully to Supabase PostgreSQL');
  } catch (error) {
    console.error('❌ Database connection failure:', error);
  }
}
