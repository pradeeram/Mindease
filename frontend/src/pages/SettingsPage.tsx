import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PageTransition, FadeIn } from '../components/motion/MotionWrapper';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  QrCode,
  User,
  KeyRound,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Activity,
  UserCheck,
  HelpCircle,
  Volume2,
  Play,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { speechService, VOICE_PRESETS, VoicePresetKey } from '../services/speech';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  // Profile update
  const [name, setName] = useState<string>(user?.name || '');
  const [theme, setTheme] = useState<string>(user?.theme || 'light');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<boolean>(false);

  // USHA Voice Selection
  const [selectedVoice, setSelectedVoice] = useState<VoicePresetKey>(speechService.getActiveVoicePreset());
  const [previewingVoice, setPreviewingVoice] = useState<VoicePresetKey | null>(null);
  const [voiceChangeSuccess, setVoiceChangeSuccess] = useState<boolean>(false);

  // MFA Modal State
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [mfaQrCode, setMfaQrCode] = useState<string>('');
  const [mfaSecret, setMfaSecret] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [isMfaLoading, setIsMfaLoading] = useState<boolean>(false);
  const [mfaError, setMfaError] = useState<string>('');

  // Disable MFA
  const [isDisableMfaOpen, setIsDisableMfaOpen] = useState<boolean>(false);
  const [disablePassword, setDisablePassword] = useState<string>('');
  const [showDisablePassword, setShowDisablePassword] = useState<boolean>(false);
  const [disableCode, setDisableCode] = useState<string>('');

  // Delete Account Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [showDeletePassword, setShowDeletePassword] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  // Data Export Loading States
  const [isExportingJson, setIsExportingJson] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string>('');
  const [exportErrorMsg, setExportErrorMsg] = useState<string>('');

  // Withdraw Consent Modal (DPDP Act Sec 6(4))
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawPassword, setWithdrawPassword] = useState<string>('');
  const [showWithdrawPassword, setShowWithdrawPassword] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string>('');

  // Audit Logs & Consents
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [consents, setConsents] = useState<any[]>([]);

  useEffect(() => {
    async function loadAuditAndConsents() {
      try {
        const [auditRes, consentRes] = await Promise.allSettled([
          api.get('/privacy/audit-logs'),
          api.get('/privacy/consents'),
        ]);

        if (auditRes.status === 'fulfilled' && auditRes.value.data?.data?.logs) {
          setAuditLogs(auditRes.value.data.data.logs);
        }
        if (consentRes.status === 'fulfilled' && consentRes.value.data?.data?.consents) {
          setConsents(consentRes.value.data.data.consents);
        }
      } catch (err) {
        console.error('Error loading compliance data:', err);
      }
    }
    loadAuditAndConsents();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.patch('/users/profile', { name, theme });
      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleStartMfaSetup = async () => {
    setIsMfaLoading(true);
    setMfaError('');
    try {
      const res = await api.post('/auth/mfa/setup');
      if (res.data?.data) {
        setMfaQrCode(res.data.data.qrCode);
        setMfaSecret(res.data.data.secret);
        setIsMfaModalOpen(true);
      }
    } catch (err: any) {
      setMfaError(err.response?.data?.error?.message || 'Failed to initiate MFA setup.');
    } finally {
      setIsMfaLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMfaLoading(true);
    setMfaError('');
    try {
      const res = await api.post('/auth/mfa/verify', { token: mfaCode });
      if (res.data?.data) {
        updateUser({ mfaEnabled: true });
        setIsMfaModalOpen(false);
        setMfaCode('');
      }
    } catch (err: any) {
      setMfaError(err.response?.data?.error?.message || 'Invalid verification code.');
    } finally {
      setIsMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMfaLoading(true);
    setMfaError('');
    try {
      const res = await api.post('/auth/mfa/disable', {
        password: disablePassword,
        token: disableCode,
      });
      if (res.data?.data) {
        updateUser({ mfaEnabled: false });
        setIsDisableMfaOpen(false);
        setDisablePassword('');
        setDisableCode('');
      }
    } catch (err: any) {
      setMfaError(err.response?.data?.error?.message || 'Failed to disable MFA.');
    } finally {
      setIsMfaLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    if (format === 'json') setIsExportingJson(true);
    else setIsExportingCsv(true);
    setExportSuccessMsg('');
    setExportErrorMsg('');

    try {
      const res = await api.get(`/privacy/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json',
      });

      const blob = format === 'csv'
        ? new Blob([res.data], { type: 'text/csv' })
        : new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindease-user-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExportSuccessMsg(`Your complete records were successfully exported as a ${format.toUpperCase()} file.`);
      setTimeout(() => setExportSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error('Error exporting data:', err);
      setExportErrorMsg('Failed to export data. Please try again or contact support.');
    } finally {
      if (format === 'json') setIsExportingJson(false);
      else setIsExportingCsv(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.post('/privacy/delete-account', { passwordConfirm: deletePassword });
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      setDeleteError(err.response?.data?.error?.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  const handleWithdrawConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    setWithdrawError('');
    try {
      await api.post('/privacy/withdraw-consent', { passwordConfirm: withdrawPassword });
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      setWithdrawError(err.response?.data?.error?.message || 'Failed to withdraw consent.');
      setIsWithdrawing(false);
    }
  };

  const handleSelectVoice = (preset: VoicePresetKey) => {
    setSelectedVoice(preset);
    speechService.setVoicePreset(preset);
    setVoiceChangeSuccess(true);
    setTimeout(() => setVoiceChangeSuccess(false), 3000);
  };

  const handlePreviewVoice = (preset: VoicePresetKey) => {
    setPreviewingVoice(preset);
    speechService.previewVoice(preset);
    setTimeout(() => setPreviewingVoice(null), 4000);
  };

  return (
    <PageTransition className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-charcoal-soft/10 pb-6 space-y-1">
        <Badge variant="slate">Account, Security & DPDP Compliance</Badge>
        <h1 className="text-3xl font-serif font-bold text-slate-deep">
          Account Settings & Data Controls
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Manage profile details, USHA AI companion voice tone, Multi-Factor Authentication, DPDP consent history, and data exports.
        </p>
      </div>

      {/* 1. Profile Information */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-charcoal-soft/10 pb-3">
          <User className="w-5 h-5 text-slate-deep" />
          <h3 className="text-base font-serif font-bold text-slate-deep">
            Profile Details
          </h3>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-semibold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:outline-none focus:ring-1 focus:ring-clinical-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">
              Email Address (Login Identity)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 text-xs bg-surface-container/60 border border-charcoal-soft/10 rounded text-on-surface-variant cursor-not-allowed"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
            Save Profile
          </Button>
        </form>
      </Card>

      {/* 2. USHA AI Voice Tone Settings */}
      <Card padding="lg" className="space-y-4" id="voice-settings">
        <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-clinical-blue" />
            <h3 className="text-base font-serif font-bold text-slate-deep">
              USHA Companion Voice Tone
            </h3>
          </div>
          <Badge variant="sage">
            {VOICE_PRESETS[selectedVoice]?.name || 'Calm & Soft (Female)'}
          </Badge>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
          Customize the vocal cadence and tone USHA uses during voice reflections and grounding exercises. Default is set to a calm, soothing female tone.
        </p>

        {voiceChangeSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-semibold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
            USHA voice preset updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {(Object.keys(VOICE_PRESETS) as VoicePresetKey[]).map((key) => {
            const preset = VOICE_PRESETS[key];
            const isSelected = selectedVoice === key;

            return (
              <div
                key={key}
                onClick={() => handleSelectVoice(key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-deep bg-surface-container/90 ring-1 ring-slate-deep shadow-sm'
                    : 'border-charcoal-soft/15 bg-surface/60 hover:bg-surface-container/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="usha_voice_preset"
                        checked={isSelected}
                        onChange={() => handleSelectVoice(key)}
                        className="w-4 h-4 text-slate-deep focus:ring-slate-deep"
                      />
                      <span className="text-xs font-serif font-bold text-slate-deep">
                        {preset.name}
                      </span>
                    </div>
                    <Badge variant={key === 'soft_female' ? 'sage' : 'neutral'} size="sm">
                      {preset.gender}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-on-surface-variant leading-relaxed pl-6">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-3 pl-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewVoice(key);
                    }}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold text-clinical-blue hover:text-slate-deep bg-bone-white border border-charcoal-soft/15 rounded-lg hover:border-clinical-blue transition-all"
                  >
                    <Play className={`w-3 h-3 ${previewingVoice === key ? 'text-emerald-600 animate-spin' : ''}`} />
                    <span>{previewingVoice === key ? 'Playing Sample...' : 'Play Sample'}</span>
                  </button>

                  {isSelected && (
                    <span className="text-[10px] font-bold text-slate-deep flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      Active Voice
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Security & Two-Factor Authentication (TOTP MFA) */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-serif font-bold text-slate-deep">
              Two-Factor Authentication (TOTP MFA)
            </h3>
          </div>
          <Badge variant={user?.mfaEnabled ? 'sage' : 'neutral'}>
            {user?.mfaEnabled ? 'Active & Protected' : 'Disabled'}
          </Badge>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
          Two-Factor Authentication adds an essential layer of security by requiring a 6-digit verification code from Google Authenticator, Authy, or Microsoft Authenticator upon sign-in.
        </p>

        <div className="pt-2">
          {user?.mfaEnabled ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDisableMfaOpen(true)}
            >
              Disable Two-Factor Authentication
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartMfaSetup}
              isLoading={isMfaLoading}
              leftIcon={<QrCode className="w-4 h-4 text-sage-muted" />}
            >
              Set Up Authenticator App
            </Button>
          )}
        </div>
      </Card>

      {/* 3. DPDP Act 2023 Consent History & Rights */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-clinical-blue" />
            <h3 className="text-base font-serif font-bold text-slate-deep">
              DPDP Act 2023 Consent Record-Keeping
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant">Immutable Audit Records</span>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          In accordance with the Digital Personal Data Protection Act, 2023, your explicitly given consents are logged with document versions and timestamps:
        </p>

        <div className="space-y-2 text-xs">
          {consents.length === 0 ? (
            <p className="text-on-surface-variant italic py-2">Loading consent audit records...</p>
          ) : (
            consents.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-surface rounded border border-charcoal-soft/10">
                <div className="flex items-center space-x-2">
                  <Badge variant="sage" size="sm">{c.policyType}</Badge>
                  <span className="font-semibold text-slate-deep">Version {c.agreedVersion}</span>
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  Agreed on {new Date(c.agreedAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal-soft/10">
          <div className="text-[11px] text-on-surface-variant">
            Need to reach our Grievance Officer? Email{' '}
            <a href="mailto:grievance@mindease.app" className="text-clinical-blue underline">
              grievance@mindease.app
            </a>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="text-amber-800 hover:text-amber-900 text-xs"
          >
            Withdraw Consent (DPDP Sec. 6(4))
          </Button>
        </div>
      </Card>

      {/* 4. Data Portability & Machine-Readable Exports */}
      <Card padding="lg" className="space-y-4" id="export">
        <div className="flex items-center space-x-2 border-b border-charcoal-soft/10 pb-3">
          <Download className="w-5 h-5 text-clinical-blue" />
          <h3 className="text-base font-serif font-bold text-slate-deep">
            Data Portability (Download Your Records)
          </h3>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
          Under DPDP Section 6 and GDPR Article 20, you have the right to receive all your personal data (mood history, thought records, decrypted chat transcripts, safety plan) in a machine-readable format anytime.
        </p>

        {exportSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs font-semibold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        {exportErrorMsg && (
          <div className="p-3 bg-error-container text-on-error-container rounded text-xs font-semibold flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-error flex-shrink-0" />
            <span>{exportErrorMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExportData('json')}
            isLoading={isExportingJson}
            disabled={isExportingJson || isExportingCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export All Data (JSON)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExportData('csv')}
            isLoading={isExportingCsv}
            disabled={isExportingJson || isExportingCsv}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Export Spreadsheet (CSV)
          </Button>
        </div>
      </Card>

      {/* 5. Security & Activity Audit Log */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-slate-deep" />
            <h3 className="text-base font-serif font-bold text-slate-deep">
              Security & Activity Audit Log
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant">Last 50 events</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
          {auditLogs.length === 0 ? (
            <p className="text-on-surface-variant text-center py-4">No recent security events.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2.5 bg-surface rounded border border-charcoal-soft/5">
                <div>
                  <span className="font-semibold text-slate-deep">{log.action}</span>
                  {log.details && <p className="text-[11px] text-on-surface-variant">{log.details}</p>}
                </div>
                <div className="text-right">
                  <Badge variant={log.status === 'SUCCESS' ? 'sage' : 'error'} size="sm">
                    {log.status}
                  </Badge>
                  <span className="block text-[10px] text-on-surface-variant mt-0.5">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 6. Danger Zone: Right to be Forgotten */}
      <Card padding="lg" className="border-error/30 bg-error-container/10 space-y-4">
        <div className="flex items-center space-x-2 border-b border-error/20 pb-3">
          <AlertTriangle className="w-5 h-5 text-error" />
          <h3 className="text-base font-serif font-bold text-error">
            Danger Zone: Right to be Forgotten (Account Purge)
          </h3>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Permanently delete your user account and irrecoverably purge all mental health records, mood entries, thought diaries, and chat messages from our databases.
        </p>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Permanently Delete My Account
        </Button>
      </Card>

      {/* Withdraw Consent Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center text-amber-900 space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <span>Withdraw DPDP Data Consent</span>
          </div>
        }
        description="Withdrawing consent terminates active data processing in accordance with DPDP Section 6(4)."
      >
        <form onSubmit={handleWithdrawConsent} className="space-y-4 mt-4">
          {withdrawError && (
            <div className="p-2.5 bg-error-container text-error rounded text-xs font-semibold">
              {withdrawError}
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong>What this means:</strong> When you withdraw consent, MindEase can no longer process your mood tracking, thought diary, or USHA AI chat data. Your account will be closed and all personal health records will be completely erased.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-deep mb-1">
              Confirm your password to withdraw consent:
            </label>
            <div className="relative">
              <input
                type={showWithdrawPassword ? 'text' : 'password'}
                required
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-3 pr-9 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:ring-1 focus:ring-amber-700"
              />
              <button
                type="button"
                onClick={() => setShowWithdrawPassword(!showWithdrawPassword)}
                aria-label={showWithdrawPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-2 text-on-surface-variant hover:text-slate-deep transition-colors focus:outline-none"
              >
                {showWithdrawPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-charcoal-soft/10">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isWithdrawing}>
              Confirm Consent Withdrawal
            </Button>
          </div>
        </form>
      </Modal>

      {/* MFA Setup Modal */}
      <Modal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
        maxWidth="md"
        title="Enroll in Two-Factor Authentication"
        description="Scan this QR code with Google Authenticator, Microsoft Authenticator, or Authy."
      >
        <form onSubmit={handleVerifyMfa} className="space-y-3 mt-4 text-center">
          {mfaQrCode && (
            <div className="p-3 bg-bone-white border border-charcoal-soft/20 rounded-xl inline-block shadow-sm">
              <img src={mfaQrCode} alt="TOTP QR Code" className="w-48 h-48 mx-auto" />
            </div>
          )}

          <p className="text-xs text-on-surface-variant">
            Or manually enter secret key: <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono font-bold text-slate-deep">{mfaSecret}</code>
          </p>

          {mfaError && (
            <div className="p-2.5 bg-error-container text-error rounded text-xs font-semibold">
              {mfaError}
            </div>
          )}

          <div className="space-y-2 text-left">
            <label className="block text-xs font-bold text-slate-deep">Enter 6-Digit Authenticator Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123456"
              className="w-full text-center text-xl font-mono tracking-widest px-3 py-2 bg-surface border border-charcoal-soft/15 rounded-lg focus:ring-2 focus:ring-slate-deep focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-charcoal-soft/10">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsMfaModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isMfaLoading}>
              Verify & Enable 2FA
            </Button>
          </div>
        </form>
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        isOpen={isDisableMfaOpen}
        onClose={() => setIsDisableMfaOpen(false)}
        maxWidth="md"
        title="Disable Two-Factor Authentication"
        description="Verify your credentials to remove two-factor authentication from your account."
      >
        <form onSubmit={handleDisableMfa} className="space-y-3 mt-4">
          {mfaError && (
            <div className="p-2.5 bg-error-container text-error rounded text-xs font-semibold">
              {mfaError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">Account Password</label>
            <div className="relative">
              <input
                type={showDisablePassword ? 'text' : 'password'}
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 text-xs bg-surface border border-charcoal-soft/15 rounded"
              />
              <button
                type="button"
                onClick={() => setShowDisablePassword(!showDisablePassword)}
                aria-label={showDisablePassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1.5 text-on-surface-variant hover:text-slate-deep transition-colors focus:outline-none"
              >
                {showDisablePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1">6-Digit Authenticator Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center font-mono text-base px-3 py-1.5 bg-surface border border-charcoal-soft/15 rounded"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-charcoal-soft/10">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDisableMfaOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isMfaLoading}>
              Disable MFA
            </Button>
          </div>
        </form>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center text-error space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Irreversible Account Deletion</span>
          </div>
        }
        description="Are you sure you want to permanently purge your account and all associated mental health records?"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 mt-4">
          {deleteError && (
            <div className="p-2.5 bg-error-container text-error rounded text-xs font-semibold">
              {deleteError}
            </div>
          )}

          <p className="text-xs text-on-surface-variant leading-relaxed">
            This action cannot be undone. All mood entries, thought restructuring records, chat sessions, and settings will be permanently erased.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-deep mb-1">
              Confirm your password to proceed:
            </label>
            <div className="relative">
              <input
                type={showDeletePassword ? 'text' : 'password'}
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-3 pr-9 py-2 text-xs bg-surface border border-charcoal-soft/15 rounded focus:ring-1 focus:ring-error"
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword(!showDeletePassword)}
                aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-2 text-on-surface-variant hover:text-slate-deep transition-colors focus:outline-none"
              >
                {showDeletePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-charcoal-soft/10">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Keep My Account
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isDeleting}>
              Permanently Purge
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
};
