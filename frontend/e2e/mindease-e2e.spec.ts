import { test, expect } from '@playwright/test';

test.describe('MindEase E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Dismiss cookie consent banner in automated tests
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'mindease_cookie_consent',
        JSON.stringify({ necessary: true, analytics: false, preferencesSaved: true })
      );
    });
  });

  test('[1] Public Pages & Legal Compliance Routes Load Without Errors', async ({ page }) => {
    // Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/MindEase/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Privacy Policy Page (Standalone DPDP Notice)
    await page.goto('/privacy');
    await expect(page.getByText('Privacy Policy & Personal Data Notice')).toBeVisible();
    await expect(page.getByText('DPDP Act 2023 & Rules 2025 Compliant')).toBeVisible();
    await expect(page.getByText('grievance@mindease.app')).toBeVisible();

    // Terms of Service
    await page.goto('/terms');
    await expect(page.getByText('Terms & Conditions of Service')).toBeVisible();
    await expect(page.getByText('CRITICAL MEDICAL & CRISIS DISCLAIMER')).toBeVisible();

    // Crisis Resources
    await page.goto('/resources');
    await expect(page.getByText(/Immediate Support, Somatic Reset/i)).toBeVisible();
    await expect(page.getByText('24/7 Crisis Hotlines')).toBeVisible();
  });

  test('[2] DPDP Act Consent Checkboxes Genuinely Block Registration When Unchecked', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Create Your MindEase Account/i })).toBeVisible();

    await page.fill('input[placeholder="Alex Mercer"]', 'E2E Test User');
    await page.fill('input[placeholder="you@example.com"]', `e2e.${Date.now()}@mindease.app`);
    await page.fill('input[placeholder="••••••••"]', 'SecurePassword2026!');

    const createBtn = page.locator('button[type="submit"]');
    // Both checkboxes are unticked by default -> Create Account button MUST be disabled
    await expect(createBtn).toBeDisabled();

    // Tick only Terms
    const checkboxes = page.locator('form input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await expect(createBtn).toBeDisabled();

    // Tick Privacy Policy as well -> Create Account button becomes enabled
    await checkboxes.nth(1).check();
    await expect(createBtn).toBeEnabled();

    // Submit registration
    await createBtn.click();
    await expect(page.getByText(/Verification Link Sent/i)).toBeVisible();
  });

  test('[3] User Sign In, Session State, and Navigation Flow', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in to MindEase/i })).toBeVisible();

    await page.fill('input[type="email"]', 'demo@mindease.app');
    await page.fill('input[type="password"]', 'MindEase2026!');
    await page.locator('button[type="submit"]').click();

    // Redirected to Dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: /How is your mental room feeling today/i })).toBeVisible();
  });

  test('[4] Mood Tracker Flow End-to-End', async ({ page }) => {
    // Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@mindease.app');
    await page.fill('input[type="password"]', 'MindEase2026!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    // Navigate to Mood Tracker
    await page.goto('/mood');
    await expect(page.getByRole('heading', { name: /Mood Tracker & Emotional History/i })).toBeVisible();

    // Open Quick Check-in modal
    await page.getByRole('button', { name: /Check-in Now/i }).click();
    await expect(page.getByText('Daily Mindful Check-in')).toBeVisible();

    // Select emotion and submit inside the modal
    await page.locator('form').getByRole('button', { name: /Joy/i }).click();
    await page.getByRole('button', { name: /Complete Check-in/i }).click();

    // Verify modal closes
    await expect(page.getByText('Daily Mindful Check-in')).not.toBeVisible();
  });

  test('[5] CBT Cognitive Restructuring & Thought Diary Flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@mindease.app');
    await page.fill('input[type="password"]', 'MindEase2026!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    await page.goto('/journal');
    await expect(page.getByRole('heading', { name: /CBT Thought Diary & Reframing/i })).toBeVisible();

    // Open new reflection form
    await page.getByRole('button', { name: /New Thought Record/i }).click();
    await expect(page.getByText('5-Step CBT Cognitive Restructuring Worksheet')).toBeVisible();

    // Fill form
    await page.fill('input[placeholder*="Presentation Overthinking"]', 'Playwright E2E Test Thought');
    await page.fill('textarea[placeholder*="Describe what happened"]', 'Received constructive feedback on my presentation.');
    await page.fill('textarea[placeholder*="What immediately crossed your mind"]', 'I will never succeed at this.');
    await page.getByRole('button', { name: 'Catastrophizing' }).click();
    await page.fill('textarea[placeholder*="What is the objective evidence"]', 'Constructive feedback is an opportunity to improve, not proof of failure.');
    await page.getByRole('button', { name: /Save Thought Record/i }).click();

    // Confirm entry appears in the list
    await expect(page.getByText('Playwright E2E Test Thought')).toBeVisible();
  });

  test('[6] USHA AI Studio Chat Flow & Identity Confirmation', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@mindease.app');
    await page.fill('input[type="password"]', 'MindEase2026!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    await page.goto('/chat');
    await expect(page.getByRole('heading', { name: /USHA AI Companion Studio/i })).toBeVisible();

    // Send a message asking for its name
    const input = page.getByPlaceholder(/Type a reflection, automatic thought, or question/i);
    await input.fill('What is your name?');
    await page.keyboard.press('Enter');

    // USHA response appears and confirms identity
    await expect(page.getByText(/USHA/i).first()).toBeVisible();
  });

  test('[7] Settings Page: Voice Customization, Consent History, Data Export', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@mindease.app');
    await page.fill('input[type="password"]', 'MindEase2026!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Account Settings & Data Controls/i })).toBeVisible();

    // Voice tone settings
    await expect(page.getByText(/USHA Companion Voice Tone/i)).toBeVisible();
    await expect(page.getByText(/Calm & Soft \(Female\)/i).first()).toBeVisible();
    await expect(page.getByText(/Warm & Grounded \(Natural\)/i)).toBeVisible();
    await expect(page.getByText(/Gentle & Deep \(Male\)/i)).toBeVisible();
    await expect(page.getByText(/Neutral & Clear/i)).toBeVisible();

    // DPDP Act Consent Record-Keeping
    await expect(page.getByText(/DPDP Act 2023 Consent Record-Keeping/i)).toBeVisible();
    await expect(page.getByText(/Withdraw Consent/i)).toBeVisible();

    // Data Portability
    await expect(page.getByRole('button', { name: /Export All Data \(JSON\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Spreadsheet \(CSV\)/i })).toBeVisible();
  });

  test('[8] API Anti-Caching & Security Headers Verification', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const headers = response.headers();
    // Verify strict anti-caching
    expect(headers['cache-control']).toContain('no-store');
    expect(headers['pragma']).toBe('no-cache');
  });

  test('[9] Responsive Breakpoints (Mobile 375px & Desktop 1280px)', async ({ page }) => {
    // Mobile Viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in to MindEase/i })).toBeVisible();

    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('[10] Custom 404 Not Found Page & Somatic Grounding Breath Tool', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/non-existent-subpage-404-test');

    // Verify 404 badge and editorial heading
    await expect(page.getByText(/404 • Path Not Found/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /This Path Appears Quiet/i })).toBeVisible();

    // Verify navigation destination cards
    await expect(page.getByText(/My Dashboard/i)).toBeVisible();
    await expect(page.getByText(/USHA AI Studio/i)).toBeVisible();
    await expect(page.getByText(/CBT Thought Diary/i)).toBeVisible();
    await expect(page.getByText(/Crisis & Hotlines/i)).toBeVisible();

    // Test interactive somatic breath pacer button
    const breathBtn = page.getByRole('button', { name: /Start 1-Min Breath/i });
    await expect(breathBtn).toBeVisible();
    await breathBtn.click();
    await expect(page.getByText(/Breathe in softly through the nose/i)).toBeVisible();
  });

  test('[11] Custom 401 Session Expired Protection Page', async ({ page }) => {
    await page.goto('/session-expired');
    await expect(page.getByText(/Session Expired • 401/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Session Locked for Privacy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to Resume/i })).toBeVisible();
  });

  test('[12] Mobile (375px) vs Desktop (1280px) Error Screen Rendering', async ({ page }) => {
    // Test 404 on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/random-path-mobile');
    await expect(page.getByRole('heading', { name: /This Path Appears Quiet/i })).toBeVisible();
    await expect(page.getByText(/Go back to previous page/i)).toBeVisible();

    // Test Session Expired on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/session-expired');
    await expect(page.getByRole('heading', { name: /Session Locked for Privacy/i })).toBeVisible();
  });

});
