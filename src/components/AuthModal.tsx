/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Lock, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Paintbrush, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { loginWithUsernameOrPassword, registerNewUser } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile | null) => void;
  isDarkTheme?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDarkTheme = false
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('DESIGNER');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { profile } = await loginWithUsernameOrPassword(loginIdentifier, loginPassword);
      setSuccessNotice(`Selamat datang kembali, ${profile?.name || loginIdentifier}!`);
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal melakukan otentikasi username atau password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { profile } = await registerNewUser(
        regUsername,
        regName,
        regEmail,
        regPassword,
        regRole
      );
      setSuccessNotice(`Akun ${profile.name} berhasil dibuat dengan peran ${profile.role}!`);
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftarkan akun baru.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          isDarkTheme 
            ? 'bg-stone-900 border-stone-800 text-stone-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Ribbon */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-white text-base shadow-xs">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight flex items-center gap-2">
                Akses & Autentikasi Firebase
                <span className="text-[10px] font-semibold bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  RBAC
                </span>
              </h2>
              <p className="text-xs text-amber-100/90 font-medium">
                Masuk dengan Username & Kata Sandi (Kontrol Penuh Manager)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b text-xs font-semibold ${isDarkTheme ? 'border-stone-800 bg-stone-900/80' : 'border-slate-100 bg-slate-50'}`}>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition border-b-2 ${
              tab === 'login'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold bg-white dark:bg-stone-900'
                : 'border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition border-b-2 ${
              tab === 'register'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold bg-white dark:bg-stone-900'
                : 'border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Daftar Akun Baru
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
          {/* Status notices */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{successNotice}</div>
            </div>
          )}

          {tab === 'login' ? (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                    Username atau Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Contoh: admin atau elena"
                      className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                        isDarkTheme 
                          ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                          : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-stone-500 mt-1 block">
                    Bisa memasukkan username singkat (misal: <b>admin</b>) atau alamat email.
                  </span>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                        isDarkTheme 
                          ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                          : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-stone-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akses...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Studio</span>
                    </>
                  )}
                </button>
              </form>

              {/* Professional Notice */}
              <div className={`pt-4 border-t text-left ${isDarkTheme ? 'border-stone-800' : 'border-slate-100'}`}>
                <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-stone-400">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Akun studio dan hak akses dikelola terpusat oleh Manager. Silakan hubungi Manager Studio jika Anda belum memiliki username dan password.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                    Username (Login)
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="misal: desainer_andi"
                    className={`w-full px-3 py-2 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                      isDarkTheme 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="misal: Andi Wijaya"
                    className={`w-full px-3 py-2 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                      isDarkTheme 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="andi@atstudio.internal"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                      isDarkTheme 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                      isDarkTheme 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                  Peran Akun & Hak Akses (Role)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('DESIGNER')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      regRole === 'DESIGNER'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-stone-700 text-slate-600 dark:text-stone-400'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" />
                    <span>Desainer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('MANAGER')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      regRole === 'MANAGER'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-stone-700 text-slate-600 dark:text-stone-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Manager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('CONTENT_CREATOR')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      regRole === 'CONTENT_CREATOR'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-stone-700 text-slate-600 dark:text-stone-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Konten</span>
                  </button>
                </div>
              </div>

              <div className={`p-3 rounded-xl text-[11px] leading-relaxed border ${
                isDarkTheme ? 'bg-stone-800/60 border-stone-800 text-stone-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                ℹ️ <b>Manager</b> memiliki kendali penuh: mengelola pengguna, menghapus tugas/proyek, dan mereset sistem. <b>Desainer</b> memiliki akses untuk mengupdate dan mengerjakan tugas miliknya.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>Mendaftarkan Pengguna...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftarkan Akun & Masuk</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className={`px-6 py-3 border-t text-[11px] flex items-center justify-between ${
          isDarkTheme ? 'border-stone-800 bg-stone-900/60 text-stone-400' : 'border-slate-100 bg-slate-50 text-slate-500'
        }`}>
          <span>Database: <b>Firestore Realtime</b></span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Tersambung ke Firebase
          </span>
        </div>
      </div>
    </div>
  );
};
