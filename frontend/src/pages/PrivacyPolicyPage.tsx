import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/MotionWrapper';
import { ShieldCheck, Lock, Database, UserCheck, AlertTriangle, FileText, Mail, Clock } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-charcoal-soft/10 pb-6">
        <div className="flex items-center space-x-2">
          <Badge variant="sage">DPDP Act 2023 & Rules 2025 Compliant</Badge>
          <Badge variant="blue">GDPR & HIPAA Aligned</Badge>
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-deep">
          Privacy Policy & Personal Data Notice
        </h1>
        <p className="text-xs text-on-surface-variant">
          Version 2.0-DPDP-2026 · Effective Date: August 2026 · Digital Personal Data Protection Act 2023 Notice
        </p>
      </div>

      {/* Privacy Pledge Banner */}
      <div className="bg-sage-light/60 border border-sage-accent/30 p-4 rounded-xl space-y-1">
        <div className="flex items-center space-x-2 text-slate-deep font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Our Privacy Pledge: Zero Advertising & Data Monetization</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          MindEase treats all mood, emotional tracking, and USHA AI companion conversations as highly sensitive personal data. We do not sell, rent, monetize, or broker your personal mental health records to third-party data brokers, insurers, or advertisers.
        </p>
      </div>

      <Card padding="lg" className="space-y-6 text-xs text-on-surface leading-relaxed">
        {/* 1. Itemized Data Collection & Lawful Purpose */}
        <section className="space-y-3">
          <h2 className="text-base font-serif font-bold text-slate-deep flex items-center">
            <Database className="w-4 h-4 mr-1.5 text-clinical-blue" />
            1. Itemized Data Collection & Specific Purposes (DPDP Notice)
          </h2>
          <p>
            In compliance with Section 5 of the Digital Personal Data Protection Act, 2023, the table below itemizes every personal data category collected and its specific, lawful purpose:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-charcoal-soft/15 rounded-lg overflow-hidden">
              <thead className="bg-surface-container font-bold text-slate-deep">
                <tr>
                  <th className="p-2 border border-charcoal-soft/15">Data Category</th>
                  <th className="p-2 border border-charcoal-soft/15">Specific Data Items</th>
                  <th className="p-2 border border-charcoal-soft/15">Lawful Processing Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-soft/10 text-on-surface">
                <tr>
                  <td className="p-2 font-semibold border border-charcoal-soft/15">Account Identity</td>
                  <td className="p-2 border border-charcoal-soft/15">Email, bcrypt password hash, name, TOTP MFA secret</td>
                  <td className="p-2 border border-charcoal-soft/15">Authentication, account security, and session management</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-charcoal-soft/15">Mood & Wellness Data</td>
                  <td className="p-2 border border-charcoal-soft/15">Daily rating (1-10), emotion wheel tags, sleep hours, anxiety score, physical factors</td>
                  <td className="p-2 border border-charcoal-soft/15">Personalized emotional correlation analytics and visual progress trends</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-charcoal-soft/15">CBT Thought Diary</td>
                  <td className="p-2 border border-charcoal-soft/15">Trigger situation, automatic thought, distortion tags, reframings (AES-256 encrypted)</td>
                  <td className="p-2 border border-charcoal-soft/15">Cognitive restructuring exercises and relief shift tracking</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-charcoal-soft/15">USHA Companion Logs</td>
                  <td className="p-2 border border-charcoal-soft/15">Voice/text chat messages (AES-256 encrypted), crisis risk flags</td>
                  <td className="p-2 border border-charcoal-soft/15">Conversational empathy, somatic grounding guidance, and 24/7 crisis safety routing</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-charcoal-soft/15">Device & Audit Logs</td>
                  <td className="p-2 border border-charcoal-soft/15">Truncated IP address, browser user-agent, security timestamps</td>
                  <td className="p-2 border border-charcoal-soft/15">Account abuse prevention, rate limiting, and regulatory audit compliance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Security Safeguards (Rule 6 DPDP Rules 2025) */}
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep flex items-center">
            <Lock className="w-4 h-4 mr-1.5 text-slate-deep" />
            2. Technical & Organizational Security Safeguards (Rule 6)
          </h2>
          <p>
            MindEase enforces strict technical security safeguards to prevent data loss or unauthorized access:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
            <li><strong>Encryption at Rest:</strong> Sensitive thought logs, mood notes, and chat transcripts are encrypted using authenticated <strong>AES-256 encryption</strong> prior to database persistence.</li>
            <li><strong>Encryption in Transit:</strong> All HTTP traffic is enforced over <strong>TLS 1.3 / HSTS (max-age: 63072000)</strong> with strict anti-caching headers (<code>Cache-Control: no-store</code>) on sensitive endpoints.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Backend queries strictly enforce tenant isolation (<code>where: &#123; userId: req.user.id &#125;</code>).</li>
            <li><strong>Two-Factor Authentication:</strong> Time-based One-Time Password (TOTP) MFA support via Google Authenticator, Authy, or Microsoft Authenticator.</li>
          </ul>
        </section>

        {/* 3. Data Principal Rights & Consent Withdrawal */}
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep flex items-center">
            <UserCheck className="w-4 h-4 mr-1.5 text-clinical-blue" />
            3. Data Principal Rights & Consent Withdrawal
          </h2>
          <p>
            Under Section 6(4) of the DPDP Act and GDPR Article 17/20, you hold comprehensive rights over your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
            <li><strong>Right to Summary / Access:</strong> View all stored records directly in the MindEase dashboard.</li>
            <li><strong>Right to Data Portability:</strong> Export your complete data history anytime in machine-readable JSON or CSV format.</li>
            <li><strong>Right to Correction:</strong> Update profile details and reframings within the application.</li>
            <li><strong>Right to Erasure / "Right to be Forgotten":</strong> One-click permanent account deletion in Settings that irrecoverably purges all mood logs, thought diaries, and chat messages.</li>
            <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent at any time via Settings. Withdrawing consent terminates active data processing and initiates account erasure.</li>
          </ul>
        </section>

        {/* 4. Purpose-Based Retention & Erasure Schedule (Rule 8) */}
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-amber-700" />
            4. Purpose-Based Data Retention Schedule (Rule 8)
          </h2>
          <p>
            MindEase retains personal data only for as long as necessary to fulfill the specified wellness purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
            <li><strong>Active Account Wellness Records:</strong> Retained for the duration of account activity to maintain longitudinal trends.</li>
            <li><strong>Deleted Accounts:</strong> Hard-deleted from active databases immediately upon user confirmation.</li>
            <li><strong>Security Audit & Consent Logs:</strong> Retained for a minimum period of 1 year as required for regulatory compliance under DPDP Rule 8.</li>
            <li><strong>Password Reset Tokens:</strong> Automatically expired after 20 minutes and permanently cleared upon use.</li>
          </ul>
        </section>

        {/* 5. Incident & Breach Response Protocol (Rule 7) */}
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-error" />
            5. Personal Data Breach Response Protocol (Rule 7)
          </h2>
          <p>
            In the event of a confirmed personal data breach affecting user data:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-on-surface-variant">
            <li><strong>Stage 1 (Immediate Intimation):</strong> MindEase will notify affected users and send an initial intimation to the Data Protection Board of India <em>without delay</em>.</li>
            <li><strong>Stage 2 (Detailed 72-Hour Report):</strong> Within 72 hours, a comprehensive report covering the breach root cause, affected data scope, and remediation actions will be submitted to the Board.</li>
          </ol>
        </section>

        {/* 6. Cookies & Tracking Disclosure */}
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-slate-deep">6. Cookie & Storage Policy</h2>
          <p>
            MindEase uses strictly necessary cookies (HTTP-only secure JWT tokens) for authenticated sessions. Optional analytics cookies are disabled by default and require explicit opt-in via our cookie banner.
          </p>
        </section>

        {/* 7. Grievance Redressal & Contact Mechanism */}
        <section className="space-y-2 pt-2 border-t border-charcoal-soft/10">
          <h2 className="text-base font-serif font-bold text-slate-deep flex items-center">
            <Mail className="w-4 h-4 mr-1.5 text-slate-deep" />
            7. Grievance Officer & Data Protection Contact
          </h2>
          <p>
            For privacy inquiries, rights requests, or grievances under the DPDP Act 2023, please contact our designated Grievance Officer:
          </p>
          <div className="p-3 bg-surface rounded-lg border border-charcoal-soft/10 space-y-1 text-xs text-on-surface">
            <div><strong>Designation:</strong> Data Protection & Grievance Redressal Officer</div>
            <div><strong>Email:</strong> <code className="font-mono bg-bone-white px-1 py-0.5 rounded text-clinical-blue">grievance@mindease.app</code></div>
            <div><strong>Postal Address:</strong> MindEase Compliance Division, Tech Park Hub, Bengaluru, Karnataka 560100, India</div>
            <div><strong>Response Time:</strong> Acknowledged within 24 hours; resolved within 7 business days as per DPDP Rules.</div>
          </div>
        </section>
      </Card>
    </PageTransition>
  );
};
