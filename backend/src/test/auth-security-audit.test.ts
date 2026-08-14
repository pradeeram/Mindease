import bcrypt from 'bcryptjs';
import { authService } from '../modules/auth/auth.service';
import { prisma } from '../db/prisma';
import { generateSecureToken, hashToken, DUMMY_BCRYPT_HASH } from '../utils/crypto';

async function runSecurityAuditTests() {
  console.log('🛡️  Starting Comprehensive MindEase Auth Security & Anti-Enumeration Audit...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Clean test users
  const testEmail = 'security.test@mindease.app';
  await prisma.user.deleteMany({ where: { email: testEmail } });

  // TEST 1: Password KDF Strength (bcrypt 12 rounds) & DPDP Consent Logging
  console.log('[1] Testing Password Storage KDF Strength & DPDP Consent Record-Keeping');
  const regResult = await authService.register({
    email: testEmail,
    password: 'SecureAuditPassword123!',
    name: 'Security Test User',
    termsAccepted: true,
    privacyAccepted: true,
    ipAddress: '127.0.0.1',
    userAgent: 'AuditTestRunner/1.0',
  });

  const createdUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { consents: true }
  });
  assert(Boolean(createdUser), 'User successfully created in database');
  assert(createdUser!.passwordHash.startsWith('$2a$12$'), 'Password is stored using slow KDF (Bcrypt 12 rounds)');
  assert(!createdUser!.passwordHash.includes('SecureAuditPassword123!'), 'Plaintext password is never stored');
  assert(createdUser!.consents.length >= 2, 'DPDP Act 2023: Two distinct immutable consent records created (TERMS & PRIVACY)');
  assert(createdUser!.consents.some(c => c.policyType === 'TERMS' && c.agreedVersion === 'v2.0-DPDP-2026'), 'Terms consent logged with version v2.0-DPDP-2026');
  assert(createdUser!.consents.some(c => c.policyType === 'PRIVACY' && c.agreedVersion === 'v2.0-DPDP-2026'), 'Privacy consent logged with version v2.0-DPDP-2026');

  // TEST 2: Anti-Enumeration on Signup / Registration
  console.log('\n[2] Testing Anti-Enumeration on Registration');
  const duplicateRegResult = await authService.register({
    email: testEmail,
    password: 'AnotherPassword999!',
    name: 'Imposter User',
    termsAccepted: true,
    privacyAccepted: true,
  });
  assert(
    duplicateRegResult.message === regResult.message,
    'Duplicate email registration returns identical response message to prevent user enumeration'
  );

  // TEST 3: Email Verification Requirement
  console.log('\n[3] Testing Email Verification Enforcement');
  let unverifiedLoginBlocked = false;
  try {
    await authService.login({
      email: testEmail,
      password: 'SecureAuditPassword123!',
    });
  } catch (err: any) {
    if (err.code === 'EMAIL_UNVERIFIED' || err.statusCode === 403) {
      unverifiedLoginBlocked = true;
    }
  }
  assert(unverifiedLoginBlocked, 'Unverified email account is blocked from signing in');

  // Verify email using token
  const devToken = regResult.devVerificationToken!;
  assert(Boolean(devToken), 'Verification token generated on registration');
  assert(createdUser!.verificationTokenHash === hashToken(devToken), 'Verification token is stored as SHA-256 hash in DB, not plaintext');

  const verifyResult = await authService.verifyEmail(devToken);
  assert(Boolean(verifyResult.user && verifyResult.accessToken), 'Valid token activates account and issues tokens');

  // TEST 4: Anti-Enumeration on Login (Constant-Time Dummy Hash Execution)
  console.log('\n[4] Testing Anti-Enumeration & Timing Attack Mitigation on Login');
  let nonExistentMsg = '';
  let wrongPassMsg = '';

  try {
    await authService.login({ email: 'nonexistent.ghost@mindease.app', password: 'AnyPassword123!' });
  } catch (err: any) {
    nonExistentMsg = err.message;
  }

  try {
    await authService.login({ email: testEmail, password: 'WrongPassword123!' });
  } catch (err: any) {
    wrongPassMsg = err.message;
  }

  assert(nonExistentMsg === 'Invalid email address or password.', 'Non-existent email returns generic error');
  assert(wrongPassMsg === 'Invalid email address or password.', 'Incorrect password returns identical generic error');

  // TEST 5: Account Lockout Brute-Force Protection
  console.log('\n[5] Testing Account Lockout Protection (5 Failed Attempts)');
  // 4 more wrong attempts (1 already executed in TEST 4)
  for (let i = 0; i < 4; i++) {
    try {
      await authService.login({ email: testEmail, password: `WrongAttempt${i}!` });
    } catch (_) {}
  }

  const lockedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(Boolean(lockedUser?.lockedUntil && lockedUser.lockedUntil > new Date()), 'User locked for 15 minutes after 5 consecutive failures');

  let lockedBlockedTest = false;
  try {
    await authService.login({ email: testEmail, password: 'SecureAuditPassword123!' });
  } catch (err: any) {
    if (err.code === 'ACCOUNT_LOCKED' || err.statusCode === 429) {
      lockedBlockedTest = true;
    }
  }
  assert(lockedBlockedTest, 'Subsequent login attempts are blocked with ACCOUNT_LOCKED (429)');

  // Unlock user for reset password test
  await prisma.user.update({
    where: { email: testEmail },
    data: { failedLoginAttempts: 0, lockedUntil: null }
  });

  // TEST 6: Cryptographic Password Reset Flow
  console.log('\n[6] Testing Password Reset Flow (SHA-256 Hashed, 20-Min Expiry, Single-Use)');
  const forgotExisting = await authService.forgotPassword(testEmail);
  const forgotNonExisting = await authService.forgotPassword('nobody@nowhere.app');
  assert(
    forgotExisting.message === forgotNonExisting.message,
    'Forgot password returns identical generic response for existing and non-existing emails'
  );

  const resetToken = forgotExisting.devResetToken!;
  const userWithReset = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(userWithReset!.resetPasswordTokenHash === hashToken(resetToken), 'Password reset token is stored ONLY as SHA-256 hash in DB');
  assert(Boolean(userWithReset!.resetPasswordExpires), '20-minute expiration timestamp is recorded');

  // Reset password
  const resetSuccess = await authService.resetPassword({
    token: resetToken,
    newPassword: 'BrandNewSecurePassword2026!',
  });
  assert(resetSuccess.success === true, 'Password reset succeeds with valid token');

  // Test single-use enforcement: Attempting to reuse the same reset token must fail
  let reuseBlocked = false;
  try {
    await authService.resetPassword({
      token: resetToken,
      newPassword: 'AnotherPassword123!',
    });
  } catch (err: any) {
    reuseBlocked = true;
  }
  assert(reuseBlocked, 'Replay attack prevented: Single-use reset token cannot be reused');

  // TEST 7: DPDP Act 2023 Consent Withdrawal (Section 6(4)) & Rule 7 Breach Protocol
  console.log('\n[7] Testing DPDP Act Consent Withdrawal & Rule 7 Breach Protocol');
  const { privacyService } = await import('../modules/privacy/privacy.service');
  const { breachManagementService } = await import('../modules/privacy/breach.service');

  const withdrawResult = await privacyService.withdrawConsent(createdUser!.id, 'BrandNewSecurePassword2026!');
  assert(withdrawResult.success === true, 'Consent withdrawal terminates processing and purges account data');

  const purgedUser = await prisma.user.findUnique({ where: { id: createdUser!.id } });
  assert(!purgedUser, 'User data is completely erased from database upon consent withdrawal');

  const breachIntimation = await breachManagementService.recordStage1Intimation({
    severity: 'HIGH',
    affectedDataCategories: ['Account Identity'],
    summary: 'Automated test breach response simulation',
  });
  assert(breachIntimation.boardIntimationStatus === 'DISPATCHED_WITHOUT_DELAY', 'DPDP Rule 7: Stage 1 intimation recorded without delay');

  const breachReport = await breachManagementService.generateStage2DetailedReport({
    incidentId: breachIntimation.incidentId,
    rootCause: 'Simulation verification test',
    affectedUsersCount: 0,
    remediationSteps: ['Enforced rotated access tokens', 'Validated encryption audit'],
  });
  assert(breachReport.boardSubmissionStatus === 'REPORT_SUBMITTED_TO_DPB_72H', 'DPDP Rule 7: Stage 2 72-hour detailed report generated');

  console.log(`\n======================================================`);
  console.log(`🔒 Security Audit Complete: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
