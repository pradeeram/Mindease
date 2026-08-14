import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Heart, Phone } from 'lucide-react';
import { CrisisModal } from '../chat/CrisisModal';

export const Footer: React.FC = () => {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <>
      <footer className="bg-bone-white border-t border-charcoal-soft/10 text-on-surface-variant text-xs mt-20">
        {/* Clinical Disclaimer Banner */}
        <div className="bg-surface-container/60 border-b border-charcoal-soft/10 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-[11px] leading-relaxed text-on-surface-variant max-w-4xl">
              <strong>Clinical & Wellness Disclaimer:</strong> MindEase and USHA are evidence-based wellness tools designed for emotional self-regulation and Cognitive Behavioral Therapy (CBT) journaling. They are <strong>not</strong> medical devices, do not diagnose conditions, and are not a substitute for professional mental health therapy or crisis intervention.
            </p>
            <button
              onClick={() => setCrisisOpen(true)}
              className="text-xs font-bold text-error hover:underline flex items-center whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 mr-1" />
              24/7 Crisis Support (988)
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Identity */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-slate-deep flex items-center justify-center text-sage-muted">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 32 32">
                    <path d="M16 7C14.5 12 11 15 8 16C11 17 14.5 20 16 25C17.5 20 21 17 24 16C21 15 17.5 12 16 7Z" fill="#8AA399" />
                    <circle cx="16" cy="16" r="3" fill="#DDE5B6" />
                  </svg>
                </div>
                <span className="text-base font-serif font-bold text-slate-deep">MindEase</span>
              </div>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                Evidence-based Cognitive Behavioral Therapy, mindful emotion tracking, and clinical empathy companion for mental clarity.
              </p>
              <div className="flex items-center space-x-3 text-[11px] text-slate-deep font-semibold">
                <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 text-sage-accent mr-1" /> TOTP MFA</span>
                <span className="flex items-center"><Lock className="w-3.5 h-3.5 text-clinical-blue mr-1" /> AES-256 Encrypted</span>
              </div>
            </div>

            {/* Column 2: Therapy & Tools */}
            <div>
              <h4 className="font-semibold text-slate-deep text-xs uppercase tracking-wider mb-3">
                CBT & Wellness Tools
              </h4>
              <ul className="space-y-2">
                <li><Link to="/mood" className="hover:text-slate-deep transition-colors">Daily Emotion Wheel</Link></li>
                <li><Link to="/journal" className="hover:text-slate-deep transition-colors">Cognitive Restructuring Diary</Link></li>
                <li><Link to="/chat" className="hover:text-slate-deep transition-colors">USHA AI Voice & Text Studio</Link></li>
                <li><Link to="/insights" className="hover:text-slate-deep transition-colors">Mood & Trigger Analytics</Link></li>
                <li><Link to="/resources" className="hover:text-slate-deep transition-colors">4-7-8 Breathing Pacer</Link></li>
              </ul>
            </div>

            {/* Column 3: Privacy & Security */}
            <div>
              <h4 className="font-semibold text-slate-deep text-xs uppercase tracking-wider mb-3">
                Security & Privacy
              </h4>
              <ul className="space-y-2">
                <li><Link to="/settings" className="hover:text-slate-deep transition-colors">Two-Factor Authentication (MFA)</Link></li>
                <li><Link to="/settings" className="hover:text-slate-deep transition-colors">GDPR Data Export (JSON/CSV)</Link></li>
                <li><Link to="/settings" className="hover:text-slate-deep transition-colors">Right-to-be-Forgotten Purge</Link></li>
                <li><Link to="/privacy" className="hover:text-slate-deep transition-colors">Privacy Policy & HIPAA Disclosures</Link></li>
                <li><Link to="/terms" className="hover:text-slate-deep transition-colors">Terms & Clinical Conditions</Link></li>
              </ul>
            </div>

            {/* Column 4: 24/7 Lifeline */}
            <div>
              <h4 className="font-semibold text-slate-deep text-xs uppercase tracking-wider mb-3">
                Immediate Crisis Lines
              </h4>
              <div className="space-y-2 text-[11px]">
                <p className="font-semibold text-slate-deep">988 Suicide & Crisis Lifeline</p>
                <p className="text-on-surface-variant">Call or text <strong>988</strong> anytime in US/Canada.</p>
                <p className="font-semibold text-slate-deep mt-2">Crisis Text Line</p>
                <p className="text-on-surface-variant">Text <strong>HOME</strong> to <strong>741741</strong>.</p>
                <button
                  onClick={() => setCrisisOpen(true)}
                  className="mt-2 inline-block px-3 py-1 bg-error/10 text-error font-bold rounded hover:bg-error/20 transition-colors"
                >
                  View Global Directory
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-charcoal-soft/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-on-surface-variant gap-2">
            <p>© {new Date().getFullYear()} MindEase Platform. All rights reserved.</p>
            <p className="flex items-center">
              Crafted with <Heart className="w-3 h-3 text-rose-500 mx-1 fill-current" /> Clinical Empathy
            </p>
          </div>
        </div>
      </footer>

      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </>
  );
};
