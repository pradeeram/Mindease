import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/motion/MotionWrapper';
import { Mail, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      if (res.data?.data?.devResetToken) {
        setDevToken(res.data.data.devResetToken);
      }
    } catch (err) {
      // Even if rate-limited or error, we show generic feedback to protect privacy
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <Card padding="lg" className="shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-deep">
            Reset Your Password
          </h1>
          <p className="text-xs text-on-surface-variant">
            Enter your email to receive a secure, time-limited reset link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs leading-relaxed">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              If an account with that email exists, we have sent a secure 20-minute reset link to your inbox.
            </div>

            {devToken && (
              <div className="p-3 bg-surface-container border border-charcoal-soft/20 rounded-lg text-left text-xs space-y-1">
                <span className="font-bold text-slate-deep block">🧪 Local Dev Reset Link:</span>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="text-clinical-blue underline break-all block"
                >
                  Click here to test password reset with token
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Secure Reset Link
            </Button>

            <div className="text-center text-xs text-on-surface-variant pt-2">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-clinical-blue hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </PageTransition>
  );
};
