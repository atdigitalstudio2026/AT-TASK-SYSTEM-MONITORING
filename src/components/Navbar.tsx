/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Bell, 
  FolderKanban, 
  Sparkles, 
  LogOut, 
  Sun, 
  Moon, 
  BarChart3, 
  Users, 
  RotateCcw, 
  Printer, 
  KeyRound, 
  ShieldCheck, 
  ChevronDown, 
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { signOutCurrentUser } from '../firebase';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentProfile?: UserProfile | null;
  connectionHealthy: boolean;
  unreadCount: number;
  onOpenNewTask: () => void;
  onOpenProjects: () => void;
  onOpenNotifications: () => void;
  onOpenAnalytics?: () => void;
  onOpenReport?: () => void;
  onOpenUsers?: () => void;
  onOpenReset?: () => void;
  onOpenAuthModal?: () => void;
  onOpenChangePassword?: () => void;
  onSignOut?: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
  theme?: 'infographic' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentProfile,
  connectionHealthy,
  unreadCount,
  onOpenNewTask,
  onOpenProjects,
  onOpenNotifications,
  onOpenAnalytics,
  onOpenReport,
  onOpenUsers,
  onOpenReset,
  onOpenAuthModal,
  onOpenChangePassword,
  onSignOut,
  onSeedData,
  isSeeding,
  theme = 'infographic',
  onToggleTheme
}) => {
  const [authError] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      if (onSignOut) {
        onSignOut();
      } else {
        await signOutCurrentUser();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isDark = theme === 'dark';
  const isManager = currentProfile?.role === 'ADMIN' || currentProfile?.role === 'MANAGER';

  return (
    <header className={`sticky top-0 z-30 transition-colors border-b backdrop-blur-md shadow-2xs ${
      isDark 
        ? 'bg-stone-900/95 border-stone-800 text-stone-100' 
        : 'bg-white/95 border-slate-200/90 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
          
          {/* Brand & Studio Title - Fixed height & shrink-0 to prevent vertical wrapping */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-black text-base tracking-wider shadow-xs select-none">
              AT
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className={`font-bold tracking-tight text-sm sm:text-base leading-none whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Task System Control
                </span>
                <span className="hidden xl:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                  CREATIVE WORKFLOW
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-stone-400 font-medium leading-none mt-1 whitespace-nowrap">
                <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${connectionHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="truncate">{connectionHealthy ? 'Live Cloud Firestore' : 'Connecting...'}</span>
              </div>
            </div>
          </div>

          {/* Center Segmented Navigation Hub (Desktop & Tablet Landscape) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-stone-800/80 border border-slate-200/80 dark:border-stone-700/60 shadow-2xs shrink-0">
            {/* Projects */}
            <button
              id="projects-manager-btn"
              onClick={onOpenProjects}
              className={`h-7.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isDark
                  ? 'text-stone-300 hover:text-white hover:bg-stone-700/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
              }`}
              title="Kelola Folder Proyek & Kampanye Brand"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Projects</span>
            </button>

            {/* Analytics */}
            {onOpenAnalytics && (
              <button
                id="studio-analytics-btn"
                onClick={onOpenAnalytics}
                className={`h-7.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isDark
                    ? 'text-stone-300 hover:text-white hover:bg-stone-700/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
                }`}
                title="Analitik Kinerja & Beban Kerja Tim Studio"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Analytics</span>
              </button>
            )}

            {/* Production Report */}
            {onOpenReport && (
              <button
                id="studio-report-btn"
                onClick={onOpenReport}
                className={`h-7.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isDark
                    ? 'text-stone-300 hover:text-white hover:bg-stone-700/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
                }`}
                title="Laporan Produksi Studio & Format Cetak PDF"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Laporan</span>
              </button>
            )}

            {/* Team & Access Control */}
            {onOpenUsers && (
              <button
                id="user-manager-btn"
                onClick={onOpenUsers}
                className={`h-7.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isManager 
                    ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/15'
                    : isDark
                      ? 'text-stone-300 hover:text-white hover:bg-stone-700/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
                }`}
                title={isManager ? "Pusat Kontrol Manager & Hak Akses Tim" : "Daftar Tim & Beban Kerja"}
              >
                {isManager ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                )}
                <span>Tim & Akses</span>
                {isManager && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-500 text-stone-950 uppercase leading-none">
                    Admin
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Action Tools & Account Controls (Unified Height & Clean Spacing) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Studio Tools Dropdown (Load Sample Work + Reset ke 0) */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                title="Studio Simulation Tools & Reset Data"
                className={`h-9 px-2.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isToolsMenuOpen
                    ? isDark ? 'bg-stone-800 border-amber-500/50 text-amber-400' : 'bg-slate-100 border-amber-500/50 text-amber-600'
                    : isDark
                      ? 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xl:inline">Studio Tools</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isToolsMenuOpen && (
                <div className={`absolute right-0 mt-2 w-60 rounded-xl border shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 ${
                  isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'
                }`}>
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-stone-500">
                    Manajemen Simulasi
                  </div>
                  
                  {/* Load Sample Work */}
                  <button
                    id="seed-sample-data-btn"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onSeedData();
                    }}
                    disabled={isSeeding}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer disabled:opacity-50 ${
                      isDark ? 'hover:bg-stone-800 text-stone-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-semibold">{isSeeding ? 'Memuat Data...' : 'Muat Data Sampel'}</div>
                      <div className="text-[10px] text-slate-400 dark:text-stone-500">Isi alur kerja dengan task & brief kreatif</div>
                    </div>
                  </button>

                  {/* Reset ke 0 (Manager only) */}
                  {onOpenReset && isManager && (
                    <button
                      id="reset-studio-btn"
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        onOpenReset();
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 text-rose-600 dark:text-rose-400 transition cursor-pointer ${
                        isDark ? 'hover:bg-rose-950/30' : 'hover:bg-rose-50'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <div className="font-semibold">Reset Semua Data ke 0</div>
                        <div className="text-[10px] text-rose-500/80">Kosongkan data untuk mulai dari awal</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isDark ? "Ganti ke Tema Studio Infografis (Light)" : "Ganti ke Tema Gelap (Dark)"}
                className={`w-9 h-9 rounded-lg border transition flex items-center justify-center cursor-pointer shrink-0 ${
                  isDark 
                    ? 'bg-stone-800/80 border-stone-700/80 text-amber-400 hover:bg-stone-800 hover:border-stone-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Notifications Button with Unread Badge */}
            <button
              id="notifications-bell-btn"
              onClick={onOpenNotifications}
              title="Notifikasi & Pembaruan Workflow"
              className={`w-9 h-9 rounded-lg border relative transition flex items-center justify-center cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-amber-500 text-stone-950 rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Primary Action: New Task */}
            <button
              id="new-task-btn"
              onClick={onOpenNewTask}
              className="h-9 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:shadow transition whitespace-nowrap cursor-pointer shrink-0"
              title="Buat Tugas Desain Baru (Shortcut: N)"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Task</span>
            </button>

            <div className={`h-5 w-[1px] mx-0.5 hidden sm:block ${isDark ? 'bg-stone-800' : 'bg-slate-200'}`} />

            {/* User Profile Pill */}
            {(currentUser || currentProfile) ? (
              <div className="relative" ref={profileMenuRef}>
                <div 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`h-9 flex items-center gap-2 pl-1.5 pr-2.5 rounded-lg border transition cursor-pointer select-none shrink-0 ${
                    isDark
                      ? 'border-stone-800 bg-stone-900/90 hover:bg-stone-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 shadow-2xs'
                  }`}
                  title="Klik untuk membuka menu profil & ganti kata sandi"
                >
                  {currentProfile?.avatar || currentUser?.photoURL ? (
                    <img
                      src={currentProfile?.avatar || currentUser?.photoURL || ''}
                      alt={currentProfile?.name || currentUser?.displayName || 'User'}
                      className="w-6.5 h-6.5 rounded-full ring-1 ring-amber-400/60 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 ring-1 ring-amber-300 flex items-center justify-center text-stone-950 text-xs font-black shadow-xs shrink-0">
                      {(currentProfile?.name || currentUser?.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  
                  <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs font-semibold truncate max-w-[85px] md:max-w-[110px] leading-tight ${
                      isDark ? 'text-stone-100' : 'text-slate-800'
                    }`}>
                      {currentProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0]}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${
                      isManager 
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20' 
                        : currentProfile?.role === 'DESIGNER'
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {isManager ? 'Manager' : currentProfile?.role === 'DESIGNER' ? 'Desainer' : 'Konten'}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                {/* Profile Popover Menu */}
                {isProfileMenuOpen && (
                  <div 
                    className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 ${
                      isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className={`p-3.5 border-b ${isDark ? 'bg-stone-950/90 border-stone-800' : 'bg-slate-50/90 border-slate-100'}`}>
                      <div className="flex items-center gap-2.5 mb-2">
                        {currentProfile?.avatar || currentUser?.photoURL ? (
                          <img
                            src={currentProfile?.avatar || currentUser?.photoURL || ''}
                            alt={currentProfile?.name || 'User'}
                            className="w-9 h-9 rounded-full border border-amber-400 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center text-stone-950 text-sm font-black shadow-xs shrink-0">
                            {(currentProfile?.name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate leading-tight">
                            {currentProfile?.name || 'Studio User'}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-stone-400 font-mono truncate">
                            @{currentProfile?.username || 'user'}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-stone-400 font-mono truncate mb-2">
                        {currentProfile?.email || currentUser?.email}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-stone-800/60">
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isManager ? 'Manager Studio' : 'Desainer Grafis'}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {onOpenChangePassword && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenChangePassword();
                          }}
                          className={`w-full text-left px-2.5 py-2 text-xs rounded-lg flex items-center gap-2 transition cursor-pointer ${
                            isDark ? 'hover:bg-stone-800 text-stone-200' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ubah Kata Sandi Saya</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleSignOut();
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 text-rose-600 dark:text-rose-400 transition cursor-pointer ${
                          isDark ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50'
                        }`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="firebase-auth-btn"
                onClick={onOpenAuthModal}
                className="h-9 px-3 rounded-lg border bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer shrink-0"
                title="Masuk dengan Username & Password (Firebase Auth)"
              >
                <KeyRound className="w-3.5 h-3.5 text-stone-950" />
                <span>Masuk Akun</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle (< lg) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 transition ${
                isMobileMenuOpen
                  ? isDark ? 'bg-stone-800 border-amber-500 text-amber-400' : 'bg-slate-100 border-amber-500 text-amber-600'
                  : isDark ? 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`}
              title="Menu Navigasi Mobile"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Panel */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden border-t py-3 px-1 animate-in fade-in slide-in-from-top-2 ${
            isDark ? 'border-stone-800 text-stone-200' : 'border-slate-200 text-slate-800'
          }`}>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProjects();
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 text-left ${
                  isDark ? 'bg-stone-800 border-stone-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Projects</span>
              </button>

              {onOpenAnalytics && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAnalytics();
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 text-left ${
                    isDark ? 'bg-stone-800 border-stone-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Analytics</span>
                </button>
              )}

              {onOpenReport && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenReport();
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 text-left ${
                    isDark ? 'bg-stone-800 border-stone-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Printer className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Laporan Cetak</span>
                </button>
              )}

              {onOpenUsers && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenUsers();
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 text-left ${
                    isDark ? 'bg-stone-800 border-stone-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isManager ? <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" /> : <Users className="w-4 h-4 text-indigo-500 shrink-0" />}
                  <span>Tim & Hak Akses</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-stone-800 text-xs">
              <span className="text-[11px] text-slate-400">Pintasan Keyboard: Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-stone-800 font-mono text-[10px]">N</kbd> untuk New Task</span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">AT Studio v2.4</span>
            </div>
          </div>
        )}

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
