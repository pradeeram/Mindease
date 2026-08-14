import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Phone, MessageSquare, ShieldAlert, HeartHandshake, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center text-error space-x-2">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <span>Immediate Support & Crisis Resources</span>
        </div>
      }
      description="If you or someone you know is struggling or in distress, help is available 24/7. You do not have to carry this alone."
    >
      <div className="space-y-4 my-4">
        {/* Urgent Callout Card */}
        <div className="bg-error-container/40 border-l-4 border-error p-4 rounded-r-lg">
          <p className="text-sm font-semibold text-slate-deep">
            MindEase and USHA are not substitutes for emergency care.
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            If you are in immediate physical danger, please call your local emergency number (such as <strong>911</strong> in the US/Canada or <strong>112</strong> in Europe/UK) or go to the nearest hospital emergency room.
          </p>
        </div>

        {/* 24/7 Lifeline Direct Connectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:988"
            className="flex items-start p-4 bg-bone-white border-2 border-slate-deep/20 rounded-lg hover:border-clinical-blue hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-clinical-blue/10 rounded-full text-clinical-blue mr-3 group-hover:bg-clinical-blue group-hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-clinical-blue">
                US & Canada (24/7)
              </div>
              <div className="text-lg font-serif font-bold text-slate-deep">
                988 Lifeline
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Free, confidential call or text anytime.
              </p>
            </div>
          </a>

          <a
            href="sms:741741?&body=HOME"
            className="flex items-start p-4 bg-bone-white border-2 border-slate-deep/20 rounded-lg hover:border-clinical-blue hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-sage-accent/20 rounded-full text-slate-deep mr-3 group-hover:bg-sage-accent transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-deep">
                Crisis Text Line
              </div>
              <div className="text-lg font-serif font-bold text-slate-deep">
                Text HOME to 741741
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Free 24/7 text support via SMS.
              </p>
            </div>
          </a>
        </div>

        {/* International & Specialized Lines */}
        <div className="bg-surface-container p-4 rounded-lg space-y-2 text-xs text-on-surface-variant">
          <div className="font-semibold text-slate-deep text-sm mb-1">
            Global Hotlines & Specialized Care:
          </div>
          <div className="flex justify-between items-center py-1 border-b border-charcoal-soft/10">
            <span>🇬🇧 <strong>UK NHS 111 Mental Health</strong></span>
            <a href="tel:111" className="text-clinical-blue font-bold hover:underline">Call 111</a>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-charcoal-soft/10">
            <span>🇪🇺 <strong>European Emergency Dispatch</strong></span>
            <a href="tel:112" className="text-clinical-blue font-bold hover:underline">Call 112</a>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-charcoal-soft/10">
            <span>🇮🇳 <strong>Tele-MANAS (India Govt)</strong></span>
            <a href="tel:14416" className="text-clinical-blue font-bold hover:underline">Call 14416</a>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>🏳️‍🌈 <strong>The Trevor Project (LGBTQ+ Youth)</strong></span>
            <a href="tel:18664887386" className="text-clinical-blue font-bold hover:underline">1-866-488-7386</a>
          </div>
        </div>

        {/* Immediate Calming Grounding Option */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-charcoal-soft/10">
          <Link
            to="/resources"
            onClick={onClose}
            className="flex items-center text-xs font-semibold text-clinical-blue hover:text-slate-deep"
          >
            <Wind className="w-4 h-4 mr-1 text-sage-accent" />
            Open 4-7-8 Breathing Pacer & Safety Plan
          </Link>
          <Button variant="primary" size="md" onClick={onClose}>
            I Understand
          </Button>
        </div>
      </div>
    </Modal>
  );
};
