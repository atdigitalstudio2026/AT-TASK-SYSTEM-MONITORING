/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  LogIn,
  Sun,
  Moon,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  KeyRound
} from 'lucide-react';
import { loginWithUsernameOrPassword, signInWithGoogle } from '../firebase';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile | null) => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isDarkTheme,
  onToggleTheme
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showDefaultHelp, setShowDefaultHelp] = useState(false);
  const [showActivationGuide, setShowActivationGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanInput = usernameOrEmail.trim();
    if (!cleanInput) {
      setErrorMessage('Silakan masukkan username atau email akun Anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const { profile } = await loginWithUsernameOrPassword(cleanInput, password);
      
      if (rememberMe && profile) {
        localStorage.setItem('at_current_user_id', profile.id);
      } else {
        sessionStorage.setItem('at_current_user_id', profile?.id || '');
      }

      setSuccessNotice(`Autentikasi berhasil! Mengalihkan ke ruang kerja...`);
      setTimeout(() => {
        onLoginSuccess(profile);
      }, 500);
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || '';
      if (msg.includes('operation-not-allowed')) {
        setShowActivationGuide(true);
        setErrorMessage(
          'Metode login Email/Password belum diaktifkan di Firebase Console. ' +
          'Silakan ikuti panduan aktivasi di bawah atau gunakan akun bawaan yang tersedia.'
        );
      } else {
        setErrorMessage(
          err.message || 'Kredensial tidak cocok. Pastikan username dan password yang diberikan Manager sudah tepat.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsGoogleLoading(true);
    try {
      const { profile } = await signInWithGoogle();
      if (rememberMe && profile) {
        localStorage.setItem('at_current_user_id', profile.id);
      } else {
        sessionStorage.setItem('at_current_user_id', profile?.id || '');
      }
      setSuccessNotice('Login Google berhasil! Mengalihkan...');
      setTimeout(() => {
        onLoginSuccess(profile);
      }, 500);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-8 relative transition-colors duration-200 selection:bg-amber-500 selection:text-white ${
      isDarkTheme ? 'bg-stone-950 text-stone-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Decorative Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30 ${
          isDarkTheme ? 'bg-amber-500/20' : 'bg-amber-400/30'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-25 ${
          isDarkTheme ? 'bg-indigo-500/10' : 'bg-amber-300/30'
        }`} />
      </div>

      {/* Top Controls Bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <button
          onClick={onToggleTheme}
          className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
            isDarkTheme 
              ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white' 
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 shadow-xs'
          }`}
          title="Ganti Tema Tampilan"
        >
          {isDarkTheme ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Mode Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Mode Gelap</span>
            </>
          )}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-black text-xl shadow-lg shadow-amber-500/20">
              AT
            </div>
            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
                <span>AT DIGITAL</span>
                <span className="text-amber-500">STUDIO</span>
              </h1>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
                Creative Task & Workflow
              </p>
            </div>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
            Masuk ke Akun Anda
          </h2>
          <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            Gunakan username dan kata sandi yang telah diberikan oleh Manager Studio.
          </p>
        </div>

        {/* Card Box */}
        <div className={`p-7 rounded-2xl border shadow-xl transition-all ${
          isDarkTheme 
            ? 'bg-stone-900/90 border-stone-800 text-stone-100 backdrop-blur-md' 
            : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/50'
        }`}>
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Alert */}
          {successNotice && (
            <div className="mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{successNotice}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label 
                htmlFor="login-username"
                className={`block text-xs font-bold mb-1.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-700'}`}
              >
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-stone-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Contoh: admin atau elena"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                    isDarkTheme 
                      ? 'bg-stone-800/80 border-stone-700 text-white placeholder-stone-500 focus:bg-stone-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password"
                  className={`block text-xs font-bold ${isDarkTheme ? 'text-stone-200' : 'text-slate-700'}`}
                >
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-amber-500 dark:text-stone-400 flex items-center gap-1 transition"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Sembunyikan</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tampilkan</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                    isDarkTheme 
                      ? 'bg-stone-800/80 border-stone-700 text-white placeholder-stone-500 focus:bg-stone-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className={`text-xs ${isDarkTheme ? 'text-stone-300' : 'text-slate-600'}`}>
                  Ingat sesi login ini
                </span>
              </label>

              <span className="text-[11px] text-slate-400 dark:text-stone-500">
                Akses Terproteksi
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl transition shadow-md shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Masuk ke Ruang Kerja Studio</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className={`flex-grow border-t ${isDarkTheme ? 'border-stone-800' : 'border-slate-200'}`} />
              <span className="shrink-0 mx-3 text-[11px] font-medium text-slate-400 dark:text-stone-500 uppercase tracking-wider">
                atau
              </span>
              <div className={`flex-grow border-t ${isDarkTheme ? 'border-stone-800' : 'border-slate-200'}`} />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className={`w-full py-2.5 px-4 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-xs cursor-pointer ${
                isDarkTheme
                  ? 'bg-stone-800/80 border-stone-700 text-stone-200 hover:bg-stone-800 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Masuk dengan Akun Google</span>
            </button>
          </form>

          {/* Security & Manager Notice */}
          <div className={`mt-5 pt-4 border-t text-left ${isDarkTheme ? 'border-stone-800' : 'border-slate-100'}`}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed">
                Akun pengguna dan hak akses diatur oleh <strong className="text-slate-700 dark:text-stone-300">Manager Studio</strong>. Anda juga dapat mengganti kata sandi secara mandiri setelah berhasil masuk.
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Console Activation Guide Banner */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowActivationGuide(!showActivationGuide)}
            className={`w-full p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${
              showActivationGuide 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400' 
                : isDarkTheme 
                  ? 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-semibold">
                Cara Mengaktifkan Autentikasi Firebase (auth/operation-not-allowed)
              </span>
            </div>
            {showActivationGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showActivationGuide && (
            <div className={`mt-2 p-4 rounded-xl border text-xs space-y-3 animate-in fade-in ${
              isDarkTheme ? 'bg-stone-900 border-amber-500/30 text-stone-300' : 'bg-amber-50/70 border-amber-200 text-slate-800'
            }`}>
              <div className="font-bold text-[12px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>Langkah Aktivasi Email & Password di Firebase Console:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-stone-300">
                <li>
                  Buka tab <strong>Sign-in method</strong> di Firebase Console:
                  <div className="mt-1 ml-4">
                    <a 
                      href="https://console.firebase.google.com/project/nifty-byte-32ts5/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 text-[11px] transition shadow-xs"
                    >
                      <span>Buka Firebase Console (nifty-byte-32ts5)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>
                <li>Pada daftar <strong>Sign-in providers</strong>, klik <strong>Email/Password</strong>.</li>
                <li>Aktifkan sakelar toggle <strong>Enable</strong> pada baris pertama (Email/Password).</li>
                <li>Klik tombol <strong>Save</strong> (Simpan).</li>
              </ol>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px]">
                💡 <strong>Catatan:</strong> Sistem kami juga telah menyertakan sinkronisasi data langsung. Anda dapat langsung menguji login sekarang dengan akun manager di bawah!
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Info for Setup / Initial Credentials */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowDefaultHelp(!showDefaultHelp)}
            className="text-[11px] text-slate-400 hover:text-amber-500 dark:text-stone-500 transition inline-flex items-center gap-1 font-medium"
          >
            <Info className="w-3 h-3" />
            <span>Info akun bawaan studio & isi otomatis</span>
            {showDefaultHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDefaultHelp && (
            <div className={`mt-2 p-3.5 rounded-xl border text-left text-xs space-y-2 animate-in fade-in ${
              isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}>
              <div className="font-bold text-[11px] uppercase tracking-wider text-amber-500">
                Pilih Akun Pengujian (Klik untuk Isi Otomatis):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin', 'admin123456')}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                    isDarkTheme ? 'bg-stone-800 border-stone-700 hover:border-amber-500' : 'bg-slate-50 border-slate-200 hover:border-amber-500'
                  }`}
                >
                  <span className="font-bold text-amber-600 dark:text-amber-400">Marcus Vance (Manager)</span>
                  <span className="text-[10px] text-slate-400">Username: admin</span>
                  <span className="text-[10px] text-slate-400">Sandi: admin123456</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('elena', 'designer123')}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                    isDarkTheme ? 'bg-stone-800 border-stone-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-500'
                  }`}
                >
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Elena Rostova (Desainer)</span>
                  <span className="text-[10px] text-slate-400">Username: elena</span>
                  <span className="text-[10px] text-slate-400">Sandi: designer123</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-stone-500">
          &copy; {new Date().getFullYear()} AT Digital Studio. Creative Workflow System.
        </div>
      </div>
    </div>
  );
};
