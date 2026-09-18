/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Bell, 
  Database, 
  FolderKanban, 
  Sparkles, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  BarChart3,
  Users,
  RotateCcw,
  Printer
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { NotificationItem, Project } from '../types';

interface NavbarProps {
  currentUser: User | null;
  connectionHealthy: boolean;
  unreadCount: number;
  onOpenNewTask: () => void;
  onOpenProjects: () => void;
  onOpenNotifications: () => void;
  onOpenAnalytics?: () => void;
  onOpenReport?: () => void;
  onOpenUsers?: () => void;
  onOpenReset?: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
  theme?: 'infographic' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  connectionHealthy,
  unreadCount,
  onOpenNewTask,
  onOpenProjects,
  onOpenNotifications,
  onOpenAnalytics,
  onOpenReport,
  onOpenUsers,
  onOpenReset,
  onSeedData,
  isSeeding,
  theme = 'infographic',
  onToggleTheme
}) => {
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign in error:', err);
      setAuthError('Sign-in cancelled or blocked.');
      setTimeout(() => setAuthError(null), 4000);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-30 transition-colors border-b backdrop-blur-md shadow-xs ${
      isDark 
        ? 'bg-stone-900/95 border-stone-800 text-stone-100' 
        : 'bg-white/95 border-slate-200 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & System Title with Signature Asymmetric Curve */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-tl-xl rounded-tr-sm rounded-bl-sm rounded-br-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-sm">
              AT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold tracking-tight text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Task System Control
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  CREATIVE WORKFLOW
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`inline-block w-2 h-2 rounded-full ${connectionHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-medium">{connectionHealthy ? 'Live Cloud Firestore' : 'Checking Connection'}</span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isDark ? "Ganti ke Tema Studio Infografis (Light)" : "Ganti ke Tema Gelap (Dark)"}
                className={`p-2 rounded-lg border transition ${
                  isDark 
                    ? 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Seed Sample Data Action */}
            <button
              id="seed-sample-data-btn"
              onClick={onSeedData}
              disabled={isSeeding}
              title="Populate creative workspace with realistic projects and briefs"
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition disabled:opacity-50 ${
                isDark
                  ? 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {isSeeding ? 'Seeding...' : 'Load Sample Work'}
            </button>

            {/* Projects & Brands Modal trigger */}
            <button
              id="projects-manager-btn"
              onClick={onOpenProjects}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isDark
                  ? 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Manage brand campaigns and projects"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Projects</span>
            </button>

            {/* Studio Analytics & Performance */}
            {onOpenAnalytics && (
              <button
                id="studio-analytics-btn"
                onClick={onOpenAnalytics}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Studio Analytics, Performance & Workload"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            )}

            {/* Studio Production Report & Print */}
            {onOpenReport && (
              <button
                id="studio-report-btn"
                onClick={onOpenReport}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Laporan Eksekutif Studio & Format Cetak PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden lg:inline">Laporan</span>
              </button>
            )}

            {/* Team & User Access Management */}
            {onOpenUsers && (
              <button
                id="user-manager-btn"
                onClick={onOpenUsers}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Kelola Tim & Hak Akses Pengguna"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden md:inline">Tim & Akses</span>
              </button>
            )}

            {/* Reset ke 0 (Clean Slate) */}
            {onOpenReset && (
              <button
                id="reset-studio-btn"
                onClick={onOpenReset}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-rose-950/30 text-rose-300 border-rose-900/50 hover:bg-rose-900/40'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
                title="Reset semua data simulasi ke 0 (Mulai dari Nol)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden xl:inline">Reset ke 0</span>
              </button>
            )}

            {/* Notifications Button */}
            <button
              id="notifications-bell-btn"
              onClick={onOpenNotifications}
              className={`relative p-2 rounded-lg border transition ${
                isDark
                  ? 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Workflow Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* New Task CTA (Signature Asymmetric Shape) */}
            <button
              id="new-task-btn"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold rounded-tl-lg rounded-br-lg shadow-xs hover:shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Task</span>
            </button>

            <div className={`h-6 w-[1px] mx-1 hidden sm:block ${isDark ? 'bg-stone-800' : 'bg-slate-200'}`} />

            {/* User Account / Google Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-xs font-bold">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className={`text-xs font-semibold truncate max-w-[110px] ${isDark ? 'text-stone-200' : 'text-slate-800'}`}>
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-amber-600 font-bold">Admin Control</div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className={`p-1.5 rounded-lg transition ${
                    isDark ? 'text-stone-400 hover:text-rose-400 hover:bg-stone-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="google-signin-btn"
                onClick={handleSignIn}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-stone-800 text-stone-300 hover:text-white border-stone-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

          </div>
        </div>

        {authError && (
          <div className="py-1 px-3 mb-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{authError}</span>
          </div>
        )}
      </div>
    </header>
  );
};
