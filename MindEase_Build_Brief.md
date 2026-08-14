# MindEase — Full-Stack Build Brief
*(Optimized prompt — paste this into Google Antigravity Pro as your project's starting task)*

---

## 0. Before you paste this in

1. **Set Antigravity's mode first.** In Agent Manager setup, choose **Review-driven** or **Agent-assisted** mode (not "Autopilot"). This is what actually makes the agent stop and ask before big changes — the instruction in Section 8 reinforces it, but the mode setting is what enforces it.
2. **Pull your Stitch design in.** I don't have a connector to your private Stitch project, so I couldn't read project `11745580782843054389` directly. Two ways to get it into Antigravity:
   - In Stitch: select your project → export **DESIGN.md** (design tokens/system) and the **HTML/React code** for each screen → drop both into your Antigravity project folder before you start the agent.
   - Or use Stitch's 1-click export to hand the code straight into an AI-assisted workflow, then move that project folder into Antigravity.
3. **Paste your exact screen/feature list** where marked `[INSERT STITCH FEATURE LIST HERE]` below — I've filled that section with a sensible baseline for this category of app so the brief is usable immediately, but your actual Stitch screens should override it.

---

## 1. Project identity

- **Product name:** MindEase
- Rename **every** occurrence of "ClinicalClam" / "clinicalclam" throughout the project: UI copy, component/file names, package name (`package.json`), database name, API route prefixes, environment variable prefixes, meta tags/SEO, app icon labels, email templates, and documentation. Do a full repo-wide search for the old name before considering the rebrand done.

---

## 2. Features to build

`[INSERT STITCH FEATURE LIST HERE — paste the exact screens/flows from your DESIGN.md export]`

Baseline feature set (use as fallback / gap-filler for anything not covered by the Stitch export):
- Onboarding & profile setup
- Mood tracking / daily check-in with history view
- Journal entries
- AI chat with USHA (see Section 3)
- Insights dashboard (mood trends over time)
- Reminders/notifications
- Resources / crisis-support screen (see Section 6)
- Account & privacy settings

---

## 3. AI chatbot — "USHA"

- **Name:** USHA, text chat + voice chat, accessible from its own tab and as a floating entry point on other screens.
- **Voice chat, two viable tiers:**
  - *Fastest to ship:* browser **Web Speech API** for speech-to-text and text-to-speech — free, zero extra infra, works well for a first release.
  - *Self-hosted/open-source upgrade path:* **Whisper** (speech-to-text) + **Piper** or **Coqui TTS** (text-to-speech) run as your own service, for when you want offline capability or don't want to depend on the browser API.
- **Language model backend:** pick one LLM provider and keep the integration behind a single internal "AI service" module so it's swappable later:
  - Managed API (Anthropic Claude API or Google Gemini API) — needs an API key, simplest to start.
  - Open-source, self-hosted alternative (e.g., Llama-family model via Ollama) if you want to avoid per-message API costs long-term.
- **Safety requirement (non-negotiable for a wellness app):** USHA must include a system prompt that (a) states clearly it is not a substitute for professional mental health care, and (b) triggers a crisis-resources screen/response if a conversation shows signs of self-harm or crisis — do not let the chatbot try to "handle" a crisis conversation on its own.
- Every chat message is stored against the user's account (see schema below), encrypted at rest.

---

## 4. Database — open-source recommendation

**Recommended: PostgreSQL**, via **Supabase** (open-source, self-hostable, and gives you Postgres + Auth + Row-Level Security + Realtime in one place — which pairs well with the MFA/OAuth requirement below).
**Alternative:** MongoDB (self-hosted or Atlas free tier) if you'd rather have a flexible schema for chat data — but Postgres' relational structure is a better fit for mood history + account data.

Baseline schema:
- `users` — account details, hashed password, MFA secret, OAuth provider links
- `mood_entries` — user_id, mood value, notes, timestamp
- `chat_sessions` / `chat_messages` — user_id, session id, message, role (user/USHA), timestamp
- `consents` — what the user agreed to and when (needed for your privacy policy compliance)
- `audit_logs` — auth events, data-export/deletion requests

---

## 5. Security, authentication & authorization

- **Password hashing:** bcrypt (your request) — note that **argon2id** is the current best-practice successor if you want the strongest available option; either is acceptable, bcrypt is simpler to wire up.
- **Sessions:** JWT access tokens + refresh tokens, short expiry on access tokens.
- **MFA:** TOTP (Google/Microsoft Authenticator-compatible) via `otplib` or `speakeasy`.
- **OAuth:** Google Sign-In at minimum; add Apple Sign-In if you'll ever ship to iOS (Apple requires it if you offer any other social login).
- **Transport/storage:** HTTPS/TLS everywhere, encryption at rest for the database, secrets in an env/secrets manager — never hard-coded.
- **App hardening:** rate limiting + brute-force lockout on auth endpoints, input validation/sanitization on every endpoint, CSRF protection, secure headers (e.g. `helmet.js`).
- **Because this app stores mood/mental-health data:** treat it as sensitive data end-to-end (encryption, least-privilege access, audit logging). Depending on where your users are, this may bring you into scope of HIPAA (US health data) or GDPR (EU users) — flagging this now so it's a conscious decision, not an afterthought. See Section 10.

---

## 6. Terms & Conditions / Privacy Policy

Have the agent generate **draft** templates covering: what data is collected (account info, mood history, chat logs), how it's used and stored, data retention and deletion rights, age restriction, cookie/tracking disclosure, and a clear crisis disclaimer ("MindEase and USHA are not a substitute for professional care — if you're in crisis, contact emergency services or a crisis line").

**Important:** I'm not a lawyer, and neither is Antigravity's agent. Mental-health-adjacent apps carry real regulatory exposure (HIPAA/GDPR/state privacy laws depending on your market). Treat whatever gets generated as a **first draft only** — see the manual step in Section 10.

---

## 7. System architecture — clean & scalable

Start as a **modular monolith**, organized so any module can later be pulled out into its own service without a rewrite:

```
/frontend        → from Stitch export (React/Next.js)
/backend
  /modules
    /auth         → login, MFA, OAuth
    /users        → account/profile
    /mood         → mood entries, insights
    /ai-chat      → USHA orchestration (swappable LLM provider)
    /voice        → STT/TTS orchestration (swappable provider)
    /notifications
  /db             → Postgres via Prisma/Supabase client
/infra            → Docker, CI/CD (GitHub Actions), env config
```

- Config/secrets via environment variables, never committed.
- Docker for local dev parity with production.
- CI/CD pipeline for automated tests + deploy.
- This structure lets you extract `ai-chat` or `voice` into a separately-scalable worker later (e.g., if USHA's traffic grows) without touching the rest of the app.

---

## 8. Instruction to the agent: ask before big changes

> Before making any structural or high-impact change — database schema changes, deleting or overwriting existing files, changing the authentication flow, switching the AI/voice provider, or adding a new paid dependency — stop and describe the change, then wait for my explicit confirmation before proceeding. Small, reversible edits (styling, copy, minor bug fixes) don't need this.

(This is reinforced by setting Antigravity to Review-driven/Agent-assisted mode per Section 0.)

---

## 9. Summary of technology choices (for your records)

| Layer | Choice |
|---|---|
| Frontend | From your Stitch export (React/Next.js + Tailwind) |
| Backend | Node.js modular monolith |
| Database | PostgreSQL (via Supabase) |
| Password hashing | bcrypt (argon2id optional upgrade) |
| MFA | TOTP (otplib/speakeasy) |
| OAuth | Google (+ Apple if going to iOS) |
| AI chat (USHA) | Claude or Gemini API, swappable module (Ollama/Llama as open-source fallback) |
| Voice | Web Speech API to start → Whisper + Piper/Coqui for self-hosted upgrade |
| Hosting/infra | Docker + CI/CD, deploy target of your choice (Vercel/Render/Railway) |

---

## 10. What you'll need to do manually after the build

- [ ] Register OAuth apps in Google Cloud Console (and Apple Developer if applicable) and add the client IDs/secrets to your env config.
- [ ] Get an API key from your chosen LLM provider (Anthropic/Google/OpenAI) and add it to secrets — set a usage/cost alert.
- [ ] Create the production Supabase/Postgres project and update connection strings.
- [ ] Buy a domain, set up hosting and SSL.
- [ ] **Get the Terms & Conditions and Privacy Policy reviewed by an actual lawyer** before launch — especially given the mood/health data involved.
- [ ] Decide whether HIPAA (US) or GDPR (EU) obligations apply to your target users, and implement what's needed (e.g., data processing agreements, a BAA with any vendor touching health data).
- [ ] Set up error monitoring/logging (e.g., Sentry) and database backups.
- [ ] Manually test the full MFA, OAuth, and voice-chat flows end-to-end before real users touch it.
- [ ] If shipping to app stores, set up Apple Developer / Google Play accounts and go through their review requirements (mental-health apps often get extra scrutiny).
- [ ] Publish a visible crisis-support contact (helpline info) somewhere users can always reach it, not just inside USHA's chat.

---

*Paste Sections 1–8 as your opening message to the Antigravity agent; keep Sections 9–10 for yourself as a reference/checklist.*
