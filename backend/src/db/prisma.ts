import { PrismaClient } from '@prisma/client';

function getResolvedDatabaseUrl(): string {
  // IPv4 compatible Supabase connection for AWS Lambda / Vercel Serverless
  const ipv4SupabaseUrl = 'postgresql://postgres.zuxnxwihlvgpquwrqlew:MindEaseDb2026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
  let rawUrl = (process.env.DIRECT_URL || process.env.DATABASE_URL || '').replace(/^["']|["']$/g, '').trim();

  if (!rawUrl || rawUrl.includes('file:') || rawUrl.includes('localhost') || rawUrl.includes('db.zuxnxwihlvgpquwrqlew.supabase.co')) {
    return ipv4SupabaseUrl;
  }

  // If pointing to transaction pooler :6543, ensure pgbouncer parameter
  if (rawUrl.includes(':6543') && !rawUrl.includes('pgbouncer=true')) {
    rawUrl += (rawUrl.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
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
