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
  Palette,
  Eye,
  EyeOff,
  Sliders,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { speechService, VOICE_PRESETS, VoicePresetKey } from '../services/speech';

const THEME_OPTIONS = [
  { id: 'light', name: 'Warm Bone (Light)', desc: 'Clean, soothing cream aesthetic designed for clear daily reflection', color: '#FDFBF7', border: '#E6E1DA' },
  { id: 'warm_sand', name: 'Warm Sand', desc: 'Earth-toned calming palette inspired by gentle grounding therapy', color: '#F5F0EB', border: '#D8CFC4' },
  { id: 'dark', name: 'Deep Slate (Dark)', desc: 'Low-light dark mode engineered to reduce eye strain in evening hours', color: '#1E293B', border: '#334155' },
  { id: 'sage_calm', name: 'Calm Sage', desc: 'Organic herbal sage green palette for restorative mindfulness', color: '#EAF0EC', border: '#C5D6C9' },
];

const AI_NAME_PRESETS = ['USHA', 'Maya', 'Aria', 'Oliver', 'Echo', 'MindEase'];

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  // Profile update
  const [name, setName] = useState<string>(user?.name || '');
  const [theme, setTheme] = useState<string>(user?.theme || 'light');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<boolean>(false);

  // AI Companion & Customization State
  const [aiName, setAiName] = useState<string>(speechService.getActiveAiName());
  const [selectedVoice, setSelectedVoice] = useState<VoicePresetKey>(speechService.getActiveVoicePreset());
  const [previewingVoice, setPreviewingVoice] = useState<VoicePresetKey | null>(null);
  const [customizationSuccess, setCustomizationSuccess] = useState<boolean>(false);

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

  const handleSaveCustomizations = async () => {
    const finalAiName = (aiName || 'USHA').trim().slice(0, 30);
    speechService.setActiveAiName(finalAiName);
    speechService.setVoicePreset(selectedVoice);

    try {
      const res = await api.patch('/users/profile', {
        theme,
      });
      if (res.data?.data?.user) {
        updateUser({ ...res.data.data.user, theme, aiName: finalAiName, aiVoice: selectedVoice });
      }
    } catch (e) {
      // Offline fallback: save locally
      updateUser({ theme, aiName: finalAiName, aiVoice: selectedVoice });
    }

    setCustomizationSuccess(true);
    setTimeout(() => setCustomizationSuccess(false), 3500);
  };

  const handleSelectVoice = (preset: VoicePresetKey) => {
    setSelectedVoice(preset);
    speechService.setVoicePreset(preset);
  };

  const handlePreviewVoice = (preset: VoicePresetKey) => {
    setPreviewingVoice(preset);
    speechService.previewVoice(preset);
    setTimeout(() => setPreviewingVoice(null), 4000);
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

  return (
    <PageTransition className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-charcoal-soft/10 pb-6 space-y-2">
        <Badge variant="slate">Settings & Preferences</Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-deep">
          Account Settings & Customization
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
          Personalize your AI companion identity, voice tone, aesthetic theme, security protocols, and DPDP Act compliance controls.
        </p>
      </div>

      {/* 1. AI Companion & Customization Suite */}
      <Card padding="lg" className="space-y-8 bg-bone-white border border-charcoal-soft/10 shadow-sm" id="customization">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-soft/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-deep">
                AI Companion & Experience Customization
              </h2>
              <p className="text-xs text-on-surface-variant">
                Customize your assistant's name, vocal cadence, and website color palette.
              </p>
            </div>
          </div>
          <Badge variant="sage" size="md">Personalized Setup</Badge>
        </div>

        {customizationSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Customizations saved successfully! Your companion name, voice tone, and theme are now active.</span>
          </div>
        )}

        <div className="space-y-8">
          {/* A. AI Companion Name Changer */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-serif font-bold text-slate-deep flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-clinical-blue" />
                <span>AI Companion Name</span>
              </label>
              <p className="text-xs text-on-surface-variant">
                Give your companion a name that feels welcoming and comforting to you. This updates all conversational greetings, chat titles, and assistant prompts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {AI_NAME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAiName(preset)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    aiName === preset
                      ? 'bg-slate-deep text-bone-white shadow-sm ring-1 ring-slate-deep'
                      : 'bg-surface border border-charcoal-soft/15 text-slate-deep hover:bg-surface-container'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="max-w-md">
              <input
                type="text"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                placeholder="Or type a custom companion name (e.g. Maya)"
                maxLength={30}
                className="w-full px-4 py-2.5 text-xs bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue text-slate-deep"
              />
            </div>
          </div>

          {/* B. AI Voice Selection & Preview */}
          <div className="space-y-4 border-t border-charcoal-soft/10 pt-6">
            <div className="space-y-1">
              <label className="text-sm font-serif font-bold text-slate-deep flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-clinical-blue" />
                <span>AI Companion Voice Tone</span>
              </label>
              <p className="text-xs text-on-surface-variant">
                Select the vocal pitch, rhythm, and cadence used during voice reflections and grounding exercises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {(Object.keys(VOICE_PRESETS) as VoicePresetKey[]).map((key) => {
                const preset = VOICE_PRESETS[key];
                const isSelected = selectedVoice === key;

                return (
                  <div
                    key={key}
                    onClick={() => handleSelectVoice(key)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-slate-deep bg-surface-container/90 ring-2 ring-slate-deep shadow-md'
                        : 'border-charcoal-soft/15 bg-surface/70 hover:bg-surface-container/50 hover:border-charcoal-soft/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="ai_voice_preset"
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

                    <div className="pt-2 pl-6 flex items-center justify-between border-t border-charcoal-soft/10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewVoice(key);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-semibold text-clinical-blue hover:text-slate-deep bg-bone-white border border-charcoal-soft/15 rounded-lg hover:border-clinical-blue transition-all"
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
          </div>

          {/* C. Theme Selection */}
          <div className="space-y-4 border-t border-charcoal-soft/10 pt-6">
            <div className="space-y-1">
              <label className="text-sm font-serif font-bold text-slate-deep flex items-center space-x-2">
                <Palette className="w-4 h-4 text-clinical-blue" />
                <span>Visual Theme Palette</span>
              </label>
              <p className="text-xs text-on-surface-variant">
                Choose the color ambiance that feels most soothing for your daily wellness practices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-slate-deep bg-surface-container/90 ring-2 ring-slate-deep shadow-md'
                        : 'border-charcoal-soft/15 bg-surface/70 hover:bg-surface-container/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-slate-deep">
                          {opt.name}
                        </span>
                        <div
                          className="w-5 h-5 rounded-full border border-charcoal-soft/20 shadow-inner"
                          style={{ backgroundColor: opt.color }}
                        />
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="pt-2 border-t border-charcoal-soft/10 flex items-center text-[10px] font-bold text-slate-deep">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                        Active Theme
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleSaveCustomizations}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save Customizations
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Profile Information */}
      <Card padding="lg" className="space-y-6 bg-bone-white border border-charcoal-soft/10 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-charcoal-soft/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-deep">
              Profile Details
            </h2>
            <p className="text-xs text-on-surface-variant">Manage your account name and identity</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Profile details updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue text-slate-deep"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1.5">
              Email Address (Login Identity)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 text-xs bg-surface-container/60 border border-charcoal-soft/10 rounded-xl text-on-surface-variant cursor-not-allowed"
            />
          </div>

          <Button type="submit" variant="secondary" size="md" isLoading={isUpdatingProfile}>
            Update Name
          </Button>
        </form>
      </Card>

      {/* 3. Security & Two-Factor Authentication (TOTP MFA) */}
      <Card padding="lg" className="space-y-6 bg-bone-white border border-charcoal-soft/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-soft/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-deep">
                Two-Factor Authentication (TOTP MFA)
              </h2>
              <p className="text-xs text-on-surface-variant">Time-based One-Time Password multi-factor protection</p>
            </div>
          </div>
          <Badge variant={user?.mfaEnabled ? 'sage' : 'neutral'} size="md">
            {user?.mfaEnabled ? 'Active & Protected' : 'Disabled'}
          </Badge>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl">
          Two-Factor Authentication adds an essential layer of security by requiring a 6-digit verification code from Google Authenticator, Authy, or Microsoft Authenticator upon sign-in.
        </p>

        <div className="pt-2">
          {user?.mfaEnabled ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsDisableMfaOpen(true)}
            >
              Disable Two-Factor Authentication
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleStartMfaSetup}
              isLoading={isMfaLoading}
              leftIcon={<QrCode className="w-4 h-4 text-sage-muted" />}
            >
              Set Up Authenticator App
            </Button>
          )}
        </div>
      </Card>

      {/* 4. DPDP Act 2023 Consent History & Rights */}
      <Card padding="lg" className="space-y-6 bg-bone-white border border-charcoal-soft/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-soft/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-sm">
              <UserCheck className="w-5 h-5 text-clinical-blue" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-deep">
                DPDP Act 2023 Consent Record-Keeping
              </h2>
              <p className="text-xs text-on-surface-variant">Digital Personal Data Protection Act compliance records</p>
            </div>
          </div>
          <Badge variant="sage" size="md">Immutable Audit Log</Badge>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl">
          In accordance with the Digital Personal Data Protection Act, 2023, your explicitly given consents are logged with document versions, IP stamps, and timestamps:
        </p>

        <div className="space-y-2.5 text-xs">
          {consents.length === 0 ? (
            <p className="text-on-surface-variant italic py-2">Loading consent audit records...</p>
          ) : (
            consents.map((c, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-surface rounded-xl border border-charcoal-soft/10 gap-2">
                <div className="flex items-center space-x-2.5">
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

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-charcoal-soft/10">
          <div className="text-xs text-on-surface-variant">
            Need to reach our Grievance Officer? Email{' '}
            <a href="mailto:grievance@mindease.app" className="text-clinical-blue font-semibold underline">
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

      {/* 5. Data Portability & Machine-Readable Exports */}
      <Card padding="lg" className="space-y-6 bg-bone-white border border-charcoal-soft/10 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-charcoal-soft/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-sm">
            <Download className="w-5 h-5 text-clinical-blue" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-deep">
              Data Portability & Complete Export
            </h2>
            <p className="text-xs text-on-surface-variant">Download all your mood logs, journals, and reflections anytime</p>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl">
          You own your mental health reflections. Export your complete account data as structured JSON or spreadsheet-ready CSV.
        </p>

        {exportSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        {exportErrorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{exportErrorMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleExportData('json')}
            isLoading={isExportingJson}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Export as JSON (Full Archive)
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => handleExportData('csv')}
            isLoading={isExportingCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export as CSV (Spreadsheet)
          </Button>
        </div>
      </Card>

      {/* 6. Account Erasure & Right to be Forgotten */}
      <Card padding="lg" className="space-y-6 border border-rose-200 bg-rose-50/20 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-rose-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-sm">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-rose-900">
              Right to Erasure (Delete Account)
            </h2>
            <p className="text-xs text-rose-700">Permanent deletion under DPDP Act 2023 Section 12(3)</p>
          </div>
        </div>

        <p className="text-xs text-rose-800 leading-relaxed max-w-3xl">
          Permanently erase all your personal data, mood journals, encrypted reflections, and authentication records from MindEase servers. This action is irreversible.
        </p>

        <div>
          <Button
            variant="danger"
            size="md"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete My Account & Erase All Data
          </Button>
        </div>
      </Card>

      {/* Modals */}

      {/* MFA Setup Modal */}
      <Modal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
        title="Set Up Two-Factor Authentication"
        maxWidth="md"
      >
        <div className="space-y-5">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Scan this QR code using your authenticator app (Google Authenticator, Authy, or Microsoft Authenticator), then enter the 6-digit verification code.
          </p>

          {mfaQrCode && (
            <div className="flex flex-col items-center justify-center p-5 bg-surface-container rounded-2xl border border-charcoal-soft/10">
              <img src={mfaQrCode} alt="TOTP MFA QR Code" className="w-48 h-48 rounded-xl shadow-sm" />
              <p className="text-[11px] text-on-surface-variant font-mono mt-3 select-all bg-surface px-3 py-1 rounded-lg border border-charcoal-soft/15">
                Secret: {mfaSecret}
              </p>
            </div>
          )}

          {mfaError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {mfaError}
            </div>
          )}

          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-deep mb-1.5">
                6-Digit Authenticator Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsMfaModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isMfaLoading}>
                Verify & Activate
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        isOpen={isDisableMfaOpen}
        onClose={() => setIsDisableMfaOpen(false)}
        title="Disable Two-Factor Authentication"
        maxWidth="sm"
      >
        <form onSubmit={handleDisableMfa} className="space-y-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Please enter your password and current 6-digit authenticator code to confirm disabling MFA.
          </p>

          {mfaError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {mfaError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <input
                type={showDisablePassword ? 'text' : 'password'}
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-xs bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue"
              />
              <button
                type="button"
                onClick={() => setShowDisablePassword(!showDisablePassword)}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-slate-deep p-0.5"
              >
                {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1.5">
              6-Digit Authenticator Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-widest text-base font-mono px-3 py-2 text-xs bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDisableMfaOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isMfaLoading}>
              Disable MFA
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account & Erase All Records"
        maxWidth="sm"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <p>This action is irreversible. All your mood records, journal reflections, and personal data will be completely deleted from our database.</p>
          </div>

          {deleteError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {deleteError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1.5">
              Enter your password to confirm
            </label>
            <div className="relative">
              <input
                type={showDeletePassword ? 'text' : 'password'}
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your account password"
                className="w-full pl-3 pr-10 py-2.5 text-xs bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword(!showDeletePassword)}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-slate-deep p-0.5"
              >
                {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isDeleting}>
              Permanently Delete
            </Button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Consent Confirmation Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Consent (DPDP Act Sec. 6(4))"
        maxWidth="sm"
      >
        <form onSubmit={handleWithdrawConsent} className="space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <p>Under Section 6(4) of the DPDP Act 2023, withdrawing consent terminates processing of your personal data and requires closing your account.</p>
          </div>

          {withdrawError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {withdrawError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-deep mb-1.5">
              Enter your password to confirm withdrawal
            </label>
            <div className="relative">
              <input
                type={showWithdrawPassword ? 'text' : 'password'}
                required
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                placeholder="Your account password"
                className="w-full pl-3 pr-10 py-2.5 text-xs bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowWithdrawPassword(!showWithdrawPassword)}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-slate-deep p-0.5"
              >
                {showWithdrawPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isWithdrawing}>
              Confirm Withdrawal
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
};
