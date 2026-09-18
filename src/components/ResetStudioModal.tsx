/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  AlertTriangle, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  Database,
  Layers,
  ListTodo
} from 'lucide-react';

interface ResetStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (wipeAll: boolean) => Promise<void>;
  currentTaskCount: number;
  currentProjectCount: number;
  isDarkTheme?: boolean;
}

export const ResetStudioModal: React.FC<ResetStudioModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  currentTaskCount,
  currentProjectCount,
  isDarkTheme = false
}) => {
  const [resetScope, setResetScope] = useState<'tasks_only' | 'total'>('tasks_only');
  const [confirmInput, setConfirmInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim().toUpperCase() === 'RESET';

  const handleExecuteReset = async () => {
    if (!isConfirmed) {
      setErrorMessage('Ketik "RESET" pada kolom konfirmasi untuk melanjutkan.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await onConfirmReset(resetScope === 'total');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mereset data. Coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-rose-50/50 border-rose-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Reset Data Simulasi ke 0
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  CLEAN SLATE
                </span>
              </h2>
              <p className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                Kosongkan data simulasi agar aplikasi bisa dipakai dari awal (0) untuk kebutuhan nyata Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDarkTheme ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Warning Banner */}
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
            isDarkTheme 
              ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Tindakan ini menghapus data simulasi di database</strong>
              Tugas simulasi, riwayat notifikasi, atau proyek sampel akan dihapus permanen. Setelah di-reset, Anda dapat mulai membuat tugas riil studio dari 0.
            </div>
          </div>

          {/* Current Counts Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Tugas Saat Ini</span>
              <span className="text-xl font-black text-rose-600">{currentTaskCount} Tugas</span>
            </div>
            <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Proyek / Brand</span>
              <span className="text-xl font-black text-amber-600">{currentProjectCount} Proyek</span>
            </div>
          </div>

          {/* Reset Scope Selector */}
          <div className="space-y-2">
            <label className={`block text-xs font-bold ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
              Pilih Lingkup Reset:
            </label>

            <div 
              onClick={() => setResetScope('tasks_only')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                resetScope === 'tasks_only'
                  ? 'ring-2 ring-rose-500 ' + (isDarkTheme ? 'bg-rose-950/20 border-rose-800' : 'bg-rose-50/50 border-rose-300')
                  : isDarkTheme ? 'bg-stone-950 border-stone-800 hover:bg-stone-850' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                resetScope === 'tasks_only' ? 'border-rose-600 bg-rose-600' : 'border-slate-400'
              }`}>
                {resetScope === 'tasks_only' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-rose-500" />
                  Reset Semua Tugas Saja (Rekomendasi)
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hapus seluruh tugas simulasi (menjadi 0 tugas). Proyek brand & kategori tetap dipertahankan untuk langsung digunakan.
                </p>
              </div>
            </div>

            <div 
              onClick={() => setResetScope('total')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                resetScope === 'total'
                  ? 'ring-2 ring-rose-500 ' + (isDarkTheme ? 'bg-rose-950/20 border-rose-800' : 'bg-rose-50/50 border-rose-300')
                  : isDarkTheme ? 'bg-stone-950 border-stone-800 hover:bg-stone-850' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                resetScope === 'total' ? 'border-rose-600 bg-rose-600' : 'border-slate-400'
              }`}>
                {resetScope === 'total' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-rose-500" />
                  Reset Total & Bersih (Clean Slate Penuh)
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hapus semua tugas, notifikasi, proyek brand, dan kategori kembali ke kondisi awal kosong murni (0 data).
                </p>
              </div>
            </div>
          </div>

          {/* Type RESET Confirmation */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
              Ketik <span className="font-mono text-rose-600 font-black">RESET</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              placeholder="Ketik RESET di sini"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono font-bold transition focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
                isDarkTheme 
                  ? 'bg-stone-950 border-stone-800 text-white placeholder-stone-600 focus:border-rose-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-500'
              }`}
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-700 transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteReset}
            disabled={!isConfirmed || isProcessing}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Mereset Database...' : 'Konfirmasi Reset ke 0'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
