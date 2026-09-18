/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { changeCurrentUserPassword } from '../firebase';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  isDarkTheme?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  userName = 'Pengguna',
  isDarkTheme = false
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await changeCurrentUserPassword(newPassword);
      setSuccessMessage('Kata sandi Anda berhasil diperbarui!');
      setTimeout(() => {
        onClose();
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      console.error('Password change error:', err);
      setErrorMessage(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-bold">Ubah Kata Sandi</h2>
              <p className="text-[11px] text-amber-100">Akun: {userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl text-xs flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl text-xs flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className={`w-full px-3 py-2 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
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
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi baru"
              className={`w-full px-3 py-2 text-xs rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                isDarkTheme 
                  ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-2 text-xs rounded-xl transition ${
                isDarkTheme ? 'text-stone-400 hover:bg-stone-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
