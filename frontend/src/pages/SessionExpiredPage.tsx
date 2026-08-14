import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Home, ShieldCheck } from 'lucide-react';

export const SessionExpiredPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/dashboard';

  return (
    <div className="min-h-[80vh] bg-surface flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-on-surface">
      <div className="w-full max-w-md bg-white border border-sand rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-deep/5 text-center flex flex-col items-center animate-fade-in">
        {/* Lock Shield Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-deep/10 rounded-full flex items-center justify-center text-slate-deep mb-6 shadow-inner">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-slate-deep stroke-[1.5]" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
          Session Expired • 401
        </div>

        {/* Heading */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-deep mb-3">
          Session Locked for Privacy
        </h1>

        {/* Body */}
        <p className="text-sm text-slate-deep/70 leading-relaxed mb-6 font-sans">
          To safeguard your private clinical reflections and mental health records against unauthorized access, inactive sessions are automatically locked.
        </p>

        {/* Security Feature Card */}
        <div className="w-full bg-surface-variant/40 border border-sand rounded-xl p-3.5 mb-6 text-left flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-slate-deep shrink-0" />
          <p className="text-xs text-slate-deep/80">
            Your encrypted thought records and mood streaks remain safely stored in your account.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => navigate('/login', { state: { from } })}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-deep text-white text-sm font-semibold rounded-xl hover:bg-slate-deep/90 active:scale-[0.98] transition-all shadow-md shadow-slate-deep/15"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Resume
          </button>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-sand text-slate-deep text-xs font-semibold rounded-xl hover:bg-sage-muted/20 active:scale-[0.98] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
