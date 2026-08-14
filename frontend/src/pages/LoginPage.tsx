import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition, FadeIn } from '../components/motion/MotionWrapper';
import { Lock, Mail, KeyRound, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, mfaPending, clearMfaPending } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mfaToken, setMfaToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login({ email, password, mfaToken: mfaPending ? mfaToken : undefined });
      if (!result.mfaRequired) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@mindease.app');
    setPassword('MindEase2026!');
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
            {mfaPending ? 'Two-Factor Verification' : 'Sign in to MindEase'}
          </h1>
          <p className="text-xs text-on-surface-variant">
            {mfaPending
              ? 'Enter the 6-digit code from your authenticator app.'
              : 'Welcome back. Access your private reflections and USHA companion.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!mfaPending ? (
            <>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-deep">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[11px] font-semibold text-clinical-blue hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-deep text-center">
                6-Digit Authenticator Code (TOTP)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full text-center text-xl font-mono tracking-widest px-3 py-2.5 bg-surface border border-charcoal-soft/15 rounded-lg focus:ring-2 focus:ring-slate-deep focus:outline-none"
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full justify-center"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {mfaPending ? 'Verify & Sign In' : 'Sign In'}
          </Button>

          {mfaPending && (
            <button
              type="button"
              onClick={clearMfaPending}
              className="w-full text-center text-xs text-on-surface-variant hover:underline"
            >
              Cancel and sign in with another account
            </button>
          )}
        </form>

        {/* Demo Fast Login Helper */}
        {!mfaPending && (
          <div className="pt-2 border-t border-charcoal-soft/10 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full p-2 bg-sage-light text-slate-deep rounded border border-sage-accent/30 text-xs font-semibold hover:bg-sage-accent/20 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sage-accent" />
              <span>Fill Demo Credentials (demo@mindease.app)</span>
            </button>
          </div>
        )}

        <div className="text-center text-xs text-on-surface-variant">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-clinical-blue hover:underline">
            Create free account
          </Link>
        </div>
      </Card>
    </PageTransition>
  );
};
