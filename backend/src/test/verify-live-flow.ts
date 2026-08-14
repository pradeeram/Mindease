import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const directUrl = 'postgresql://postgres:MindEaseDb2026@db.zuxnxwihlvgpquwrqlew.supabase.co:5432/postgres';
const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });

async function main() {
  const timestamp = Date.now();
  const testEmail = `live.test.${timestamp}@mindease.app`;
  const testPassword = 'SecurePassword2026!';
  const testName = 'Autonomous Test User';

  console.log(`\n======================================================`);
  console.log(`🧪 TESTING LIVE SUPABASE USER REGISTRATION & PERSISTENCE`);
  console.log(`======================================================`);
  console.log(`Testing Email: ${testEmail}`);

  // 1. Check if DB is reachable
  console.log(`[1/4] Connecting to Supabase PostgreSQL...`);
  await prisma.$connect();
  console.log(`✅ Supabase PostgreSQL connected!`);

  // 2. Hash password & insert user
  console.log(`[2/4] Hashing password with bcrypt (cost: 12)...`);
  const passwordHash = await bcrypt.hash(testPassword, 12);
  
  console.log(`[3/4] Creating user & DPDP Act consent records...`);
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: testName,
      passwordHash,
      emailVerified: true,
      onboarded: true,
      consents: {
        create: [
          {
            policyType: 'TERMS',
            agreedVersion: 'v2.0-DPDP-2026',
            ipAddress: '127.0.0.1',
          },
          {
            policyType: 'PRIVACY',
            agreedVersion: 'v2.0-DPDP-2026',
            ipAddress: '127.0.0.1',
          }
        ]
      }
    },
    include: {
      consents: true,
    }
  });

  console.log(`✅ User successfully created in Supabase!`);
  console.log(`   User ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Consents Logged: ${user.consents.length} records`);

  // 3. Verify user can be queried and password authenticated
  console.log(`[4/4] Verifying password check on newly created user...`);
  const queriedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!queriedUser) throw new Error('User not found after creation!');

  const isPasswordValid = await bcrypt.compare(testPassword, queriedUser.passwordHash);
  if (!isPasswordValid) throw new Error('Password mismatch on bcrypt comparison!');
  console.log(`✅ Password comparison validated: ${isPasswordValid}`);

  console.log(`======================================================`);
  console.log(`🎉 ALL DATABASE OPERATIONS VERIFIED WITH 100% SUCCESS!`);
  console.log(`======================================================\n`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`❌ Test failed:`, err);
    process.exit(1);
  });
