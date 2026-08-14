# MindEase 🌿

> **Evidence-Based Mental Wellness, Cognitive Behavioral Therapy (CBT) & USHA AI Companion**

MindEase is a production-ready mental wellness web platform crafted with **Clinical Empathy**. It brings together guided Cognitive Restructuring, granular emotional tracking, real-time voice & text companion conversations with **USHA**, somatic grounding pacers, and enterprise-grade privacy and security (TOTP MFA, AES-256 data-at-rest encryption, GDPR data portability).

---

## 🌟 Key Features

### 1. 🧠 Cognitive Behavioral Therapy (CBT) Thought Diary
- **5-Step Cognitive Restructuring Worksheet**: Guided pathway to identify triggering situations, capture Automatic Negative Thoughts (ANTs), isolate cognitive distortions, evaluate empirical evidence, and craft balanced, compassionate reframes.
- **Distortion Identifier**: Interactive catalog of 10+ recognized cognitive distortions (*Catastrophizing*, *All-or-Nothing*, *Mind Reading*, *Emotional Reasoning*, *Should Statements*).
- **Before vs. After Mood Re-evaluation**: Track tangible numerical relief improvements (+3.5 avg relief score) after completing thought records.

### 2. 🌿 Emotion Granularity & Mood Tracker
- **10-Point Wellbeing Continuum**: Nuanced rating scale with emotional category badges (*Joy*, *Calm*, *Contentment*, *Anxiety*, *Overwhelm*, *Sadness*, *Anger*, *Fatigue*).
- **Multi-Factor Correlation**: Track sleep duration, exercise, work pressure, nutrition, and screen time to uncover what drives your emotional baseline.
- **Historical Timeline**: View, filter by distortion/emotion, and manage all your past logs.

### 3. 🤖 USHA AI Companion (Voice & Text Studio)
- **Clinical Empathy Conversational Engine**: Warm, CBT-informed wellness companion that guides users through unhelpful thought patterns and grounding exercises.
- **Web Speech API Voice Integration**: Real-time speech-to-text (STT) and natural therapeutic speech playback (TTS) with audio wave animations.
- **Strict Crisis Safety Protocol**: Built-in 40+ pattern crisis detection engine that automatically triggers immediate emergency overlays (988 Lifeline, Crisis Text Line) and prevents the AI from attempting to handle clinical emergencies alone.
- **Swappable AI Backend**: Seamlessly configured for Google Gemini API or intelligent offline CBT heuristic fallback.

### 4. 🫁 Somatic Grounding & Crisis Support Suite
- **4-7-8 Breathing Pacer**: Interactive animated breathing orb calibrated to Dr. Andrew Weil's parasympathetic relaxation rhythm (Inhale 4s, Hold 7s, Exhale 8s).
- **5-4-3-2-1 Sensory Grounding Tool**: Step-by-step interactive sensory grounding to pull attention back from panic to physical safety.
- **24/7 Global Hotlines**: Click-to-call directory (988 US/Canada, 111 NHS UK, 112 EU, Tele-MANAS India, Crisis Text Line).
- **Personal Safety Plan Builder**: Save warning signs, coping mechanisms, safe contacts, and environmental triggers directly to your encrypted account.

### 5. 📊 Visual Analytics & Insights
- **Trajectory Line Charts**: Chronological visualization of wellbeing scores.
- **Sleep vs. Anxiety Heatmaps**: Discover personal sleep-to-anxiety correlations.
- **Top Distortion Distribution**: Understand which mental traps appear most frequently.

### 6. 🔒 Enterprise Security & GDPR Privacy
- **Multi-Factor Authentication (TOTP MFA)**: QR code enrollment compatible with Google Authenticator, Microsoft Authenticator, and Authy.
- **AES-256 Encryption at Rest**: Sensitive mental health reflections and chat logs are encrypted before database persistence.
- **GDPR Data Portability**: One-click download of all user records in machine-readable **JSON** or **CSV** spreadsheet format.
- **Right to be Forgotten**: One-click permanent account deletion and complete data purge.
- **Security Audit Logs**: Track authentication timestamps and security events.

---

## 🎨 Serene Logic Design System

MindEase implements the **Serene Logic** aesthetic tokens:
- **Typography**: `Source Serif 4` (Headlines) & `Hanken Grotesk` (Body & UI triggers).
- **Palette**:
  - `slate-deep`: `#2C3E50` (Stable UI anchors & headers)
  - `sage-accent`: `#8AA399` (Growth actions & progress)
  - `sage-muted`: `#DDE5B6` (Gentle highlights)
  - `clinical-blue`: `#4A6274` (Interactive elements)
  - `bone-white`: `#FDFDFD` (Soothing warm backgrounds)
- **Motion**: Powered by `framer-motion` for spring transitions, staggered reveals, and pulsing somatic orbs.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+ and npm

### 1. Clone & Install Dependencies
```bash
# From the root directory:
npm run install:all
```

### 2. Initialize Database & Seed Demonstration Data
```bash
cd backend
npx prisma db push
npm run seed
cd ..
```

### 3. Run Frontend & Backend Concurrently
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

### Demo Account Credentials
- **Email**: `demo@mindease.app`
- **Password**: `MindEase2026!`
*(Or click "Fill Demo Credentials" on the Sign-In page)*

---

## ☁️ Free-Tier Hosting on Vercel + Supabase

MindEase is structured for 100% free deployment on **Vercel** (Frontend + Serverless API) and **Supabase** (PostgreSQL Database).

### Step 1: Create a Free Database on Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Copy your PostgreSQL Connection String (`postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`).

### Step 2: Deploy to Vercel
1. Install Vercel CLI or import your GitHub repository into [vercel.com](https://vercel.com).
2. Configure your Environment Variables in the Vercel Dashboard:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_ACCESS_SECRET`: A secure 32+ character random string.
   - `JWT_REFRESH_SECRET`: A secure 32+ character random string.
   - `DATA_ENCRYPTION_KEY`: A secure 32-byte encryption key.
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key for USHA cloud LLM responses.
   - `NODE_ENV`: `production`
3. Deploy! Vercel will automatically read `vercel.json`, build the React frontend, and serve the API routes.

---

## 🧪 Automated Testing

Run the automated backend security and crisis safety test suite:
```bash
cd backend
npm test
```
**Test Coverage Includes:**
- Bcrypt 12-round password hashing & verification
- TOTP Multi-Factor Authentication token generation & verification
- AES-256 data-at-rest encryption & decryption
- USHA acute crisis detection & 988 emergency resource attachment

---

## 📄 Legal & Compliance Notice

MindEase includes draft templates for Terms of Service and Privacy Policy (`/terms` and `/privacy`). Mental health wellness platforms carry regulatory responsibilities (GDPR in the EU, HIPAA considerations in the US). Please have all legal disclosures reviewed by qualified legal counsel prior to public commercial launch.

---

© 2026 MindEase Platform. Built with Clinical Empathy.
