import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';
import { evaluateCrisisRisk } from '../modules/ai-chat/crisis.detector';
import { encryptData, decryptData } from '../utils/crypto';

async function runTests() {
  console.log('🧪 Starting MindEase Backend Automated Unit & Safety Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing Test
  console.log('[1] Testing Password Security (Bcrypt)');
  const password = 'TestSecurePassword123!';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  const isMatch = await bcrypt.compare(password, hash);
  const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
  assert(isMatch === true, 'Correct password validates with bcrypt hash');
  assert(isWrongMatch === false, 'Incorrect password is appropriately rejected');

  // 2. TOTP MFA Test
  console.log('\n[2] Testing Multi-Factor Authentication (TOTP / Speakeasy)');
  const secret = speakeasy.generateSecret({ length: 20 });
  const token = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32',
  });
  const isValidTotp = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token,
    window: 1,
  });
  const isInvalidTotp = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: '000000',
    window: 1,
  });
  assert(isValidTotp === true, 'Generated TOTP token validates with shared secret');
  assert(isInvalidTotp === false, 'Bogus TOTP token is rejected');

  // 3. AES-256 Encryption at Rest Test
  console.log('\n[3] Testing AES-256 Data-at-Rest Encryption');
  const sensitiveThought = 'I felt extremely overwhelmed today and worried about failing.';
  const cipher = encryptData(sensitiveThought);
  const decrypted = decryptData(cipher);
  assert(cipher !== sensitiveThought, 'Plaintext is encrypted into ciphertext');
  assert(decrypted === sensitiveThought, 'Ciphertext accurately decrypts back to original thought');

  // 4. USHA Clinical Crisis Detection Safety Guardrail Test
  console.log('\n[4] Testing USHA AI Crisis Safety Engine');
  
  const crisisInput1 = 'I feel like I want to end my life, everything is too painful';
  const eval1 = evaluateCrisisRisk(crisisInput1);
  assert(eval1.isCrisis === true, 'Acute suicidal phrase triggers immediate isCrisis=true');
  assert(eval1.severity === 'ACUTE', 'Severity is correctly tagged as ACUTE');
  assert(Boolean(eval1.emergencyResources && eval1.emergencyResources.length > 0), '988 emergency resources attached to payload');

  const crisisInput2 = 'I am thinking of self-harm and hurting myself';
  const eval2 = evaluateCrisisRisk(crisisInput2);
  assert(eval2.isCrisis === true, 'Self-harm phrase triggers isCrisis=true');

  const normalInput = 'I had a stressful day at work and my boss gave tough feedback';
  const evalNormal = evaluateCrisisRisk(normalInput);
  assert(evalNormal.isCrisis === false, 'Standard emotional distress is NOT falsely tagged as acute crisis');

  console.log(`\n========================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
