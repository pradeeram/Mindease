import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/motion/MotionWrapper';
import { Lock, CheckCircle2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Password reset link has expired or is invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <Card padding="lg" className="shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-deep">
            Set New Password
          </h1>
          <p className="text-xs text-on-surface-variant">
            Create a strong, 8+ character password for your account.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs leading-relaxed">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              Your password has been successfully updated! You may now sign in with your new credentials.
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/login')}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1">
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-slate-deep transition-colors focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-slate-deep transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              Update Password
            </Button>

            <div className="text-center text-xs text-on-surface-variant pt-2">
              <Link to="/login" className="font-bold text-clinical-blue hover:underline">
                Cancel and return to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </PageTransition>
  );
};
