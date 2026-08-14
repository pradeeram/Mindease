import { PrismaClient } from '@prisma/client';

function getResolvedDatabaseUrl(): string {
  const verifiedSupabasePooler = 'postgresql://postgres.zuxnxwihlvgpquwrqlew:MindEaseDb2026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
  let rawUrl = (process.env.DATABASE_URL || process.env.DIRECT_URL || '').replace(/^["']|["']$/g, '').trim();

  if (!rawUrl || rawUrl.includes('file:') || rawUrl.includes('localhost')) {
    return verifiedSupabasePooler;
  }

  // 1. If pointing to Supabase pooler with generic 'postgres:' username, inject the tenant ref
  if (rawUrl.includes('pooler.supabase.com') && rawUrl.includes('://postgres:')) {
    rawUrl = rawUrl.replace('://postgres:', '://postgres.zuxnxwihlvgpquwrqlew:');
  }

  // 2. If pointing to IPv6-only host, convert to IPv4 pooler host for Vercel Lambda compatibility
  if (rawUrl.includes('db.zuxnxwihlvgpquwrqlew.supabase.co')) {
    rawUrl = verifiedSupabasePooler;
  }

  return rawUrl;
}

const activeDbUrl = getResolvedDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully to Supabase PostgreSQL');
  } catch (error) {
    console.error('❌ Database connection failure:', error);
  }
}
