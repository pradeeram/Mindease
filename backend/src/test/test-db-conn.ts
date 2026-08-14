import { prisma } from '../db/prisma';

async function main() {
  console.log('Testing Prisma Database Connection...');
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Connected successfully. Total users in database: ${userCount}`);
  } catch (err: any) {
    console.warn('Note: Database connection check encountered:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
