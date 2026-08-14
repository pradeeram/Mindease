import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/MotionWrapper';
import { ShieldAlert, FileText, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-charcoal-soft/10 pb-6">
        <Badge variant="slate">Legal & Ethical Agreement</Badge>
        <h1 className="text-3xl font-serif font-bold text-slate-deep">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-on-surface-variant">
          Last Updated: August 2026 · Version 1.0 (Draft Template for Legal Review)
        </p>
      </div>

      <div className="bg-error-container/40 border-l-4 border-error p-4 rounded-r-lg space-y-1">
        <div className="flex items-center space-x-2 text-error font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>CRITICAL MEDICAL & CRISIS DISCLAIMER</span>
        </div>
        <p className="text-xs text-on-surface leading-relaxed">
          MindEase and its AI conversational companion (USHA) are intended strictly for educational, self-reflection, and Cognitive Behavioral Therapy (CBT) journaling purposes. <strong>MindEase is NOT a medical device, licensed medical clinic, psychological emergency service, or psychiatric care provider.</strong> If you are experiencing thoughts of self-harm, suicide, or an acute emergency, please contact <strong>988</strong> (US/Canada), <strong>112</strong> (EU), <strong>111</strong> (UK), or your local emergency dispatch immediately.
        </p>
      </div>

      <Card padding="lg" className="space-y-6 text-xs text-on-surface leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the MindEase website, mobile interfaces, or USHA companion, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep">2. Eligibility & Age Requirements</h2>
          <p>
            You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to create an account on MindEase. MindEase is not directed at children under the age of 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep">3. Nature of the AI Companion (USHA)</h2>
          <p>
            USHA is an automated artificial intelligence system. While USHA is programmed with clinical empathy and Cognitive Behavioral Therapy principles, it does not possess human consciousness, clinical judgment, or medical diagnosis capabilities. Conversations with USHA do not establish a therapist-client or doctor-patient relationship.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep">4. User Account Security & Two-Factor Authentication</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials. We strongly advise enabling Multi-Factor Authentication (TOTP MFA) in your account settings. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep">5. Data Ownership & Right to Deletion</h2>
          <p>
            You retain 100% ownership of the personal reflections, mood logs, and thought records you input into MindEase. You have the permanent right to export your complete data in JSON/CSV format or permanently delete your account and records at any time via the Settings page.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, MindEase and its creators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use or inability to use the platform.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-charcoal-soft/10">
          <h2 className="text-base font-serif font-bold text-slate-deep">7. Grievance Redressal & Regulatory Dispute Resolution</h2>
          <p>
            In accordance with the Digital Personal Data Protection (DPDP) Act, 2023, you have the right to register grievances with our Grievance Redressal Officer at <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-clinical-blue">grievance@mindease.app</code>. If a grievance is not resolved within the statutory period, you may escalate your complaint to the Data Protection Board of India.
          </p>
        </section>
      </Card>
    </PageTransition>
  );
};
