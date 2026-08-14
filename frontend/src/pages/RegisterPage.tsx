import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/motion/MotionWrapper';
import { Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck, CheckSquare, Square } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [devVerificationToken, setDevVerificationToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setError('You must explicitly agree to both the Terms of Service and Privacy Policy before proceeding.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        termsAccepted,
        privacyAccepted,
      });
      setIsRegistered(true);
      if (res.data?.data?.devVerificationToken) {
        setDevVerificationToken(res.data.data.devVerificationToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <Card padding="lg" className="shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 32 32">
              <path d="M16 7C14.5 12 11 15 8 16C11 17 14.5 20 16 25C17.5 20 21 17 24 16C21 15 17.5 12 16 7Z" fill="#8AA399" />
              <circle cx="16" cy="16" r="3" fill="#DDE5B6" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-deep">
            {isRegistered ? 'Verification Link Sent' : 'Create Your MindEase Account'}
          </h1>
          <p className="text-xs text-on-surface-variant">
            {isRegistered
              ? 'Please verify your email address to activate your account.'
              : 'Begin your evidence-based journey with CBT tools and USHA AI companion.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded text-xs font-semibold">
            {error}
          </div>
        )}

        {isRegistered ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs leading-relaxed">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              We have sent a verification link to <strong className="text-slate-deep">{email}</strong>. Please check your inbox and click the link to activate your account.
            </div>

            {devVerificationToken && (
              <div className="p-3 bg-surface-container border border-charcoal-soft/20 rounded-lg text-left text-xs space-y-1">
                <span className="font-bold text-slate-deep block">🧪 Local Dev Verification Link:</span>
                <Link
                  to={`/verify-email?token=${devVerificationToken}`}
                  className="text-clinical-blue underline break-all block"
                >
                  Click here to verify email instantly
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link to="/login" className="text-xs font-bold text-clinical-blue hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                />
              </div>
            </div>

            {/* DPDP Act 2023 Explicit Two-Consent Checkboxes (Unticked by default) */}
            <div className="space-y-2.5 pt-1 border-t border-charcoal-soft/10">
              <label className="flex items-start space-x-2.5 cursor-pointer text-left">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-slate-deep rounded border-charcoal-soft/30 focus:ring-slate-deep focus:ring-offset-0"
                />
                <span className="text-[11px] text-on-surface leading-tight">
                  I have read and explicitly agree to the{' '}
                  <Link to="/terms" target="_blank" className="font-semibold text-clinical-blue underline">
                    Terms & Conditions of Service
                  </Link>.
                </span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer text-left">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-slate-deep rounded border-charcoal-soft/30 focus:ring-slate-deep focus:ring-offset-0"
                />
                <span className="text-[11px] text-on-surface leading-tight">
                  I acknowledge the standalone{' '}
                  <Link to="/privacy" target="_blank" className="font-semibold text-clinical-blue underline">
                    Privacy Policy & DPDP Data Notice
                  </Link>{' '}
                  and consent to encrypted storage of my wellness logs.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!termsAccepted || !privacyAccepted || isLoading}
              isLoading={isLoading}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>
        )}

        {!isRegistered && (
          <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-charcoal-soft/10">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-clinical-blue hover:underline">
              Sign In
            </Link>
          </div>
        )}
      </Card>
    </PageTransition>
  );
};
