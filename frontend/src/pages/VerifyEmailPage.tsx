import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/motion/MotionWrapper';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'ERROR' | 'IDLE'>(
    token ? 'VERIFYING' : 'IDLE'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      async function verify() {
        try {
          const res = await api.post('/auth/verify-email', { token });
          if (res.data?.data?.user) {
            updateUser(res.data.data.user);
          }
          setStatus('SUCCESS');
        } catch (err: any) {
          setStatus('ERROR');
          setErrorMessage(
            err.response?.data?.error?.message || 'Verification link has expired or is invalid.'
          );
        }
      }
      verify();
    }
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email: resendEmail });
      setResendSent(true);
    } catch (_) {
      setResendSent(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PageTransition className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <Card padding="lg" className="shadow-xl space-y-6 text-center">
        {status === 'VERIFYING' && (
          <div className="space-y-4 py-8">
            <div className="w-12 h-12 border-3 border-slate-deep border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-serif font-bold text-slate-deep">
              Verifying Your Email Address...
            </h2>
            <p className="text-xs text-on-surface-variant">
              Confirming your cryptographic verification token.
            </p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-deep">
              Email Verified Successfully!
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your MindEase account is now fully active and protected with clinical-grade encryption.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/dashboard')}
              className="w-full justify-center mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Dashboard
            </Button>
          </div>
        )}

        {(status === 'ERROR' || status === 'IDLE') && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-deep">
              {status === 'ERROR' ? 'Verification Link Expired' : 'Verify Your Email'}
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {status === 'ERROR'
                ? errorMessage
                : 'Please check your inbox and click the verification link to activate your account.'}
            </p>

            {resendSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold">
                If an unverified account with that email exists, a fresh verification link has been sent!
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
                <label className="block text-xs font-semibold text-slate-deep">
                  Request a new verification link:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                  />
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  isLoading={isResending}
                  className="w-full justify-center"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Resend Verification Link
                </Button>
              </form>
            )}

            <div className="pt-2">
              <Link to="/login" className="text-xs font-bold text-clinical-blue hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </Card>
    </PageTransition>
  );
};
