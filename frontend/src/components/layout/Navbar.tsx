import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMood } from '../../context/MoodContext';
import { Button } from '../ui/Button';
import { CrisisModal } from '../chat/CrisisModal';
import {
  Heart,
  Smile,
  BookOpen,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings,
  Plus,
  Download
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { openQuickLog } = useMood();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [crisisModalOpen, setCrisisModalOpen] = useState<boolean>(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Heart className="w-4 h-4" /> },
    { name: 'Mood Tracker', path: '/mood', icon: <Smile className="w-4 h-4" /> },
    { name: 'CBT Journal', path: '/journal', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'USHA AI Studio', path: '/chat', icon: <Sparkles className="w-4 h-4 text-sage-accent" /> },
    { name: 'Insights', path: '/insights', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Crisis Resources', path: '/resources', icon: <ShieldAlert className="w-4 h-4 text-error" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-bone-white/95 backdrop-blur-md border-b border-charcoal-soft/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-slate-deep flex items-center justify-center text-sage-muted shadow-sm group-hover:bg-primary transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
                  <path d="M16 7C14.5 12 11 15 8 16C11 17 14.5 20 16 25C17.5 20 21 17 24 16C21 15 17.5 12 16 7Z" fill="#8AA399" />
                  <circle cx="16" cy="16" r="3" fill="#DDE5B6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold text-slate-deep tracking-tight">
                  MindEase
                </span>
                <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-semibold -mt-1">
                  Evidence-Based Wellness
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all ${
                        active
                          ? 'bg-surface-container text-slate-deep border-b-2 border-slate-deep'
                          : 'text-on-surface-variant hover:text-slate-deep hover:bg-surface-container/60'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Action Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Urgent Crisis Helpline Trigger */}
              <button
                onClick={() => setCrisisModalOpen(true)}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-error bg-error-container/50 border border-error/20 rounded hover:bg-error-container transition-colors"
                title="24/7 Crisis Hotline (988)"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>24/7 Crisis Help</span>
              </button>

              {user ? (
                <>
                  {/* Quick Check-in Button */}
                  <Button
                    variant="sage"
                    size="sm"
                    onClick={openQuickLog}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="hidden sm:inline-flex"
                  >
                    Check-in
                  </Button>

                  {/* User Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-surface-container transition-colors border border-charcoal-soft/10"
                      aria-label="User profile menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-clinical-blue text-bone-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </button>

                    {profileDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 bg-bone-white border border-charcoal-soft/10 shadow-xl rounded-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-charcoal-soft/10">
                          <p className="text-xs font-semibold text-slate-deep truncate">{user.name}</p>
                          <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                        </div>

                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-4 py-2 text-xs text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <Settings className="w-4 h-4 text-on-surface-variant" />
                          <span>Settings & Profile</span>
                        </Link>

                        <Link
                          to="/settings#export"
                          className="flex items-center space-x-2 px-4 py-2 text-xs text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <Download className="w-4 h-4 text-clinical-blue" />
                          <span>Export My Data</span>
                        </Link>

                        <button
                          onClick={() => logout()}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-error hover:bg-error-container/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu hamburger button */}
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-on-surface-variant hover:text-slate-deep rounded hover:bg-surface-container"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-charcoal-soft/10 bg-bone-white px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-surface-container text-slate-deep font-bold'
                    : 'text-on-surface hover:bg-surface-container/60'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            <div className="pt-2 border-t border-charcoal-soft/10 space-y-2">
              <Button
                variant="sage"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQuickLog();
                }}
                className="w-full justify-center"
              >
                Daily Check-in
              </Button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCrisisModalOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-1.5 p-2 bg-error-container/40 text-error rounded text-xs font-bold"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>24/7 Crisis Support (988)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <CrisisModal
        isOpen={crisisModalOpen}
        onClose={() => setCrisisModalOpen(false)}
      />
    </>
  );
};
