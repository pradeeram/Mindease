# MindEase — Security, Compliance & QA Hardening
### Master Prompt for Google Antigravity Pro

Paste this whole document into Antigravity as your task brief. It is organized into five sequential phases with hard guardrails. Do not skip the guardrails section.

---

## 0. Non‑Negotiable Guardrails (apply to every phase)

1. **No UI/UX changes.** Do not alter layout, styling, component structure, colors, copy on existing screens, or navigation flow. All work here is backend, security, config, testing, and net‑new legal/consent screens only. Exception: Phase 4 performance work (image compression, lazy loading, code splitting, caching, minification) is allowed as long as the visual output is pixel-identical — if a performance fix would visibly change spacing, layout, or how something looks/behaves on screen, STOP and ask first.
2. **Small incremental steps.** One logical change per commit. Work phase by phase, not all at once.
3. **Ask before anything big**, including: database schema changes, new third‑party dependencies or major version bumps, changes to auth/session logic, changes to routing, deleting or rewriting existing files, any production deploy.
4. **After every phase**, produce a short changelog: what changed, which files, why, and what still needs manual action from me (e.g., dashboard settings you can't reach from code).
5. Never hardcode secrets/API keys — use environment variables and confirm `.env` is git‑ignored.
6. If something is ambiguous, propose your assumption in one line and proceed on small items; pause and ask on anything irreversible.

---

## Phase 1 — Legal & Compliance Foundation (DPDP Act 2023 + DPDP Rules 2025)

Context: MindEase is a mental wellness app with an AI chatbot (USHA, text + voice) and mood tracking. It stores account details, mood history, and chat history — treat mood/mental‑health data as high‑sensitivity even though the Act doesn't use a separate "sensitive data" tier the way older rules did; extra care here is a product-trust issue, not just a legal one.

**Build:**
- **Standalone Privacy Policy** and **Terms & Conditions** as separate documents (not merged into one wall of text — the Rules require a standalone, plain‑language notice distinct from general T&Cs). Itemize exactly what is collected (account info, mood entries, USHA chat/voice logs, device/session metadata) and the specific purpose of each.
- **Consent UI at signup/onboarding**: two distinct, unticked-by-default checkboxes — one for T&C acceptance, one for Privacy Policy acknowledgment — both must be explicitly checked before account creation proceeds. No pre-checked boxes, no bundled "I agree to everything" dark patterns.
- **Consent record-keeping**: log user ID, document version, and timestamp at the moment of acceptance, so we can prove what a user agreed to and when.
- **Consent withdrawal / account data controls** reachable from Settings: view what's stored, request correction, request erasure, withdraw consent (and what that means for continued app use).
- **Cookie handling**: a cookie banner that distinguishes strictly-necessary cookies (always on) from functional/analytics cookies (opt-in, blocked until consent given). All cookies get `Secure`, `HttpOnly` (where not needed client-side), and `SameSite=Lax` or `Strict`.
- **Caching rules**: `Cache-Control: no-store` on any response touching auth tokens, mood data, or chat/voice content — both at the CDN layer and in the app's HTTP headers. Static public assets (JS/CSS/images) can keep normal caching.
- **Grievance/contact mechanism**: a visible way for a user to reach a grievance officer/contact, as the Rules expect.

**Latest DPDP Rules, 2025 specifics to build to (notified 13 Nov 2025):**
- **Rule 6 — security safeguards:** implement encryption (or masking/obfuscation/tokenization) for mood and chat data at rest and in transit, strict role-based access controls on who/what can read that data, access logging, and a documented backup/business-continuity plan. If any processor (hosting, analytics, email) touches user data, their contract must commit to the same safeguards.
- **Rule 7 — breach response:** build (or stub, with a clear TODO for the ops process) a two-stage breach workflow — (1) notify affected users and give the Data Protection Board an initial intimation *without delay* the moment a breach is confirmed, then (2) a detailed report to the Board within 72 hours covering cause, impact, and remediation. Design logging now so that information is actually available if this is ever needed.
- **Rule 8 — retention/erasure:** define and enforce a purpose-based retention period for each data type (don't keep chat/mood history indefinitely by default) and make sure the erasure flow actually deletes data, not just soft-hides it. Keep access/consent logs for a minimum of 1 year.

**Gate before moving on:** confirm signup literally cannot complete unless both checkboxes are ticked, and that this required zero changes to existing screens beyond adding the consent step.

---

## Phase 2 — CodeRabbit Codebase Audit

1. Run CodeRabbit across the full repository (CLI or GitHub/GitLab integration, whichever Antigravity has access to).
2. Pull the full findings list and bucket it: **Critical / High / Medium / Low**.
3. Fix **Critical and High** items now, each as its own small commit with a one-line reason.
4. For **Medium/Low**, batch them into a list and ask me before doing a broad refactor — quick, safe fixes (unused imports, obvious null checks) can go ahead; anything touching shared logic waits for my go-ahead.
5. Re-run CodeRabbit after fixes to confirm the flagged issues are resolved and nothing new broke.
6. Report: total findings, how many fixed, how many deferred and why.

---

## Phase 3 — Playwright E2E, SSL, and CDN Checks

**Playwright E2E** — cover, at minimum:
- Signup/login/logout, MFA flow, OAuth flow
- Consent checkboxes genuinely blocking signup when unchecked
- Mood-tracking entry flow end to end
- USHA chat and voice chat flows
- Every primary route/page loads without console errors
- Form validation and error states
- Basic responsive breakpoints (mobile/tablet/desktop) and basic accessibility checks (labels, focus order)

**SSL check:** run an SSL Labs (Qualys) scan against the live/staging domain. Target A/A+. Fix any weak ciphers, missing HSTS, incomplete certificate chain, or outdated TLS versions found.

**CDN check:** verify security headers are actually present at the CDN edge — CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` — and check for cache-poisoning risk (make sure the CDN isn't caching personalized/auth responses) and any exposed origin IP or open proxy misconfiguration.

Fix what's found in small commits, re-test, and report before/after scores.

---

## Phase 4 — Performance & Mobile Optimization

Run Lighthouse (or equivalent) audits on every primary page/route, on both desktop and mobile profiles. Target 90+ on Performance, Accessibility, and Best Practices where realistic.

- **Core Web Vitals**: measure and improve LCP, INP, and CLS on the key screens (landing, login, mood tracker, USHA chat).
- **Asset optimization**: compress/convert images (WebP/AVIF where supported), lazy-load below-the-fold images and non-critical scripts, remove unused CSS/JS.
- **Bundle size**: check for code-splitting opportunities and unused/duplicate dependencies bloating the JS bundle.
- **Mobile-specific**: test on real mobile viewport sizes (not just resized desktop), confirm tap targets are large enough, no horizontal scroll/overflow, fonts stay legible, and the USHA voice-chat UI works on mobile mic permissions.
- **Network conditions**: spot-check performance on throttled 3G/4G, since mood-tracking and chat are the core flows and most likely to be used on mobile data.
- Remember the guardrail exception above: these are non-visual/technical optimizations. If any fix would visibly change layout or design, stop and ask first.

Report before/after Lighthouse and Core Web Vitals scores for each key page.

---

## Phase 5 — Full Self-Review

1. Run the entire Playwright suite plus a manual pass over every changed area.
2. Produce one consolidated changelog covering all five phases: files touched, what changed, what didn't (explicitly confirm no UI/UX was touched).
3. List anything that needs manual action from me outside the codebase (DNS/CDN dashboard settings, cert renewal, CodeRabbit dashboard config, publishing the Privacy Policy URL somewhere, etc.).
4. Stop and ask for explicit permission before any merge to main or deploy to production.

---

**Execution order:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5, checkpointing (changelog + my sign-off) at the end of each phase before starting the next.
