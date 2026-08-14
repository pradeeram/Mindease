import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MoodCheckInModal } from './components/mood/MoodCheckInModal';
import { UshaFloatingWidget } from './components/chat/UshaFloatingWidget';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';

// Route-level Dynamic Code Splitting for Core Web Vitals & Instant LCP
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MoodTrackerPage = lazy(() => import('./pages/MoodTrackerPage').then(m => ({ default: m.MoodTrackerPage })));
const JournalPage = lazy(() => import('./pages/JournalPage').then(m => ({ default: m.JournalPage })));
const UshaChatPage = lazy(() => import('./pages/UshaChatPage').then(m => ({ default: m.UshaChatPage })));
const InsightsPage = lazy(() => import('./pages/InsightsPage').then(m => ({ default: m.InsightsPage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));

// Minimalistic Page Transition Loader
const PageSuspenseFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-2 border-slate-deep border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-serif font-semibold text-slate-deep">Loading MindEase...</span>
    </div>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSuspenseFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main App Routes Container
const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<PageSuspenseFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected Routes */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/mood" element={<ProtectedRoute><MoodTrackerPage /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><UshaChatPage /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      {/* Global Modals & Floating Tools */}
      {user && <MoodCheckInModal />}
      <UshaFloatingWidget />
      <CookieConsentBanner />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MoodProvider>
        <Router>
          <AppContent />
        </Router>
      </MoodProvider>
      <Analytics />
    </AuthProvider>
  );
};

export default App;
