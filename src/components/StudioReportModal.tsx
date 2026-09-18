/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  Layers, 
  Users, 
  FolderKanban, 
  Sparkles,
  ShieldCheck,
  Calendar,
  FileText
} from 'lucide-react';
import { Task, Project, UserProfile, TaskStatus } from '../types';

interface StudioReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  users: UserProfile[];
  isDarkTheme?: boolean;
}

export const StudioReportModal: React.FC<StudioReportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  users,
  isDarkTheme = false
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Filter tasks according to local report filters
  const filteredTasks = tasks.filter(t => {
    if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false;
    if (selectedStatusFilter !== 'all' && t.status !== selectedStatusFilter) return false;
    return true;
  });

  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const reviewCount = filteredTasks.filter(t => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED').length;
  const revisionCount = filteredTasks.filter(t => t.status === 'REVISION').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = filteredTasks.filter(t => 
    t.deadline && 
    t.deadline < todayStr && 
    t.status !== 'COMPLETED' && 
    t.status !== 'APPROVED'
  ).length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const onTimeRate = totalCount > 0 ? Math.round(((totalCount - overdueCount) / totalCount) * 100) : 100;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export filtered report to CSV
  const handleExportCSV = () => {
    if (filteredTasks.length === 0) return;

    const headers = [
      'Task Code',
      'Title',
      'Project',
      'Category',
      'Status',
      'Priority',
      'PIC Assignee',
      'Requester',
      'Deadline',
      'Revisions'
    ];

    const escapeCSV = (str?: string | number) => `"${String(str ?? '').replace(/"/g, '""')}"`;

    const rows = filteredTasks.map(t => [
      escapeCSV(t.taskCode),
      escapeCSV(t.title),
      escapeCSV(t.projectName),
      escapeCSV(t.categoryName),
      escapeCSV(t.status),
      escapeCSV(t.priority),
      escapeCSV(t.assignedUserName),
      escapeCSV(t.requester),
      escapeCSV(t.deadline),
      escapeCSV(t.revisionCount ?? 0)
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Studio_Production_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      
      {/* Report Modal Card */}
      <div 
        className={`w-full max-w-5xl rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden transition-all ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Screen Header (Excluded in print) */}
        <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 print:hidden ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Laporan Produksi & Rekap Eksekutif Studio
              </h2>
              <p className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                Rekapitulasi beban kerja kreatif, status deliverables, dan lembar cetak resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 ${
                isDarkTheme ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition ${
                isDarkTheme ? 'border-stone-800 hover:bg-stone-800 text-stone-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Excluded in print) */}
        <div className={`p-3 sm:px-5 border-b flex flex-wrap items-center justify-between gap-3 text-xs print:hidden ${
          isDarkTheme ? 'bg-stone-900 border-stone-800' : 'bg-amber-50/40 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500">Filter Laporan:</span>
            
            {/* Project Filter */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer ${
                isDarkTheme ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Semua Proyek Studio ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer ${
                isDarkTheme ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Semua Status Alur Kerja</option>
              <option value="DRAFT">01. Draft & Brief</option>
              <option value="IN_PROGRESS">02. Dalam Pengerjaan</option>
              <option value="UNDER_REVIEW">03. Review / QC</option>
              <option value="REVISION">04. Butuh Revisi</option>
              <option value="APPROVED">05. Approved</option>
              <option value="COMPLETED">05. Selesai (Completed)</option>
            </select>
          </div>

          <span className="text-slate-400 font-medium">
            Menampilkan <strong>{totalCount}</strong> tugas dalam cakupan
          </span>
        </div>

        {/* Printable Report Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 print:p-0 print:overflow-visible text-slate-900 dark:text-stone-100 print:text-black">
          
          {/* Formal Letterhead */}
          <div className="border-b pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-black text-xs font-mono">
                  AT
                </div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  AT DIGITAL STUDIO
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-stone-400 print:text-gray-600 font-medium">
                Design & Creative Task Management System • Executive Production Summary
              </p>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div><strong className="text-slate-700 dark:text-stone-300 print:text-black">Tanggal Laporan:</strong> {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
              <div className="text-slate-500 print:text-gray-500 font-mono text-[11px]">Ref ID: RPT-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* Executive KPI Scorecard */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 print:text-gray-700 mb-3">
              1. Indikator Kinerja Utama (Studio KPIs)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200 print:border-gray-300'}`}>
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Total Tugas</span>
                <span className="text-2xl font-black font-mono mt-1 block">{totalCount}</span>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-emerald-50/50 border-emerald-200 print:border-gray-300'}`}>
                <span className="text-[10.5px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Selesai / Approved</span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">{completedCount}</span>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-amber-50/50 border-amber-200 print:border-gray-300'}`}>
                <span className="text-[10.5px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Dalam Pengerjaan</span>
                <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1 block">{inProgressCount}</span>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-teal-50/50 border-teal-200 print:border-gray-300'}`}>
                <span className="text-[10.5px] uppercase font-bold text-teal-600 dark:text-teal-400 block">Review & QC</span>
                <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1 block">{reviewCount}</span>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-rose-50/50 border-rose-200 print:border-gray-300'}`}>
                <span className="text-[10.5px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Revisi Aktif</span>
                <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1 block">{revisionCount}</span>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200 print:border-gray-300'}`}>
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Tingkat Sukses</span>
                <span className="text-2xl font-black font-mono text-amber-500 mt-1 block">{completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Project Progress Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 print:text-gray-700 mb-3">
              2. Progres Portofolio Brand & Proyek
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map(p => {
                const projTasks = tasks.filter(t => t.projectId === p.id);
                const projDone = projTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
                const percent = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;

                return (
                  <div 
                    key={p.id} 
                    className={`p-3.5 rounded-xl border ${
                      isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-white border-slate-200 print:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#F59E0B' }} />
                        <span className="text-xs font-bold">{p.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold">{projDone}/{projTasks.length} ({percent}%)</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-stone-800 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Task Manifest Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 print:text-gray-700">
                3. Daftar Rincian Tugas Kreatif
              </h3>
              <span className="text-xs text-slate-400 print:hidden font-mono">Total {filteredTasks.length} entri</span>
            </div>

            <div className="border rounded-xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[10.5px] uppercase font-bold ${
                    isDarkTheme ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-slate-100 border-slate-200 text-slate-600 print:bg-gray-100'
                  }`}>
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Judul Karya</th>
                    <th className="py-2.5 px-3">Proyek</th>
                    <th className="py-2.5 px-3">PIC Desainer</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Revisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-stone-800 print:divide-gray-200">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        Tidak ada tugas yang sesuai dengan filter laporan.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-stone-800/50 print:hover:bg-transparent">
                        <td className="py-2 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">{t.taskCode}</td>
                        <td className="py-2 px-3 font-medium max-w-[200px] truncate">{t.title}</td>
                        <td className="py-2 px-3 text-slate-500 dark:text-stone-400">{t.projectName || '-'}</td>
                        <td className="py-2 px-3">{t.assignedUserName || 'Unassigned'}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{t.deadline || '-'}</td>
                        <td className="py-2 px-3 font-bold text-[10px]">
                          <span className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-stone-700">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono">{t.revisionCount ?? 0}x</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Authorization & Sign-off block (Essential for agency printouts) */}
          <div className="pt-8 border-t grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="text-slate-400 dark:text-stone-500 print:text-gray-500 mb-12">
                Dipersiapkan & Diverifikasi Oleh:
              </div>
              <div className="font-bold border-b border-dashed border-slate-400 dark:border-stone-600 pb-1 max-w-[220px] mx-auto">
                Lead Creative Project Manager
              </div>
              <div className="text-[10.5px] text-slate-400 mt-1">AT Digital Studio</div>
            </div>

            <div>
              <div className="text-slate-400 dark:text-stone-500 print:text-gray-500 mb-12">
                Disetujui & Diterima Oleh:
              </div>
              <div className="font-bold border-b border-dashed border-slate-400 dark:border-stone-600 pb-1 max-w-[220px] mx-auto">
                Creative Director / Client Representative
              </div>
              <div className="text-[10.5px] text-slate-400 mt-1">Authorization Sign-off</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
