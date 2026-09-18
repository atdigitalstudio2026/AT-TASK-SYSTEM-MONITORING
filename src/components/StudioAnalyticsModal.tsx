/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FolderKanban, 
  Users, 
  Sparkles,
  Download,
  Filter
} from 'lucide-react';
import { Task, Project, Category, UserProfile, TaskStatus } from '../types';

interface StudioAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  users: UserProfile[];
  onApplyFilter: (filterKey: string, value: string) => void;
  isDarkTheme?: boolean;
}

export const StudioAnalyticsModal: React.FC<StudioAnalyticsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  categories,
  users,
  onApplyFilter,
  isDarkTheme = false
}) => {
  if (!isOpen) return null;

  // Calculation metrics
  const total = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const reviewCount = tasks.filter(t => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED').length;
  const revisionCount = tasks.filter(t => t.status === 'REVISION').length;
  const draftCount = tasks.filter(t => t.status === 'DRAFT' || t.status === 'ASSIGNED').length;

  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  
  // Tasks with revision
  const tasksWithRevision = tasks.filter(t => (t.revisionCount ?? 0) > 0);
  const totalRevisions = tasks.reduce((sum, t) => sum + (t.revisionCount ?? 0), 0);
  const avgRevisions = tasksWithRevision.length > 0 ? (totalRevisions / tasksWithRevision.length).toFixed(1) : '0';

  // Overdue calculation
  const overdueCount = tasks.filter(t => {
    if (!t.deadline || t.status === 'COMPLETED' || t.status === 'APPROVED') return false;
    const due = new Date(t.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  // Breakdown by Project
  const projectStats = useMemo(() => {
    return projects.map(proj => {
      const projTasks = tasks.filter(t => t.projectId === proj.id);
      const done = projTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
      const rate = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;
      return {
        ...proj,
        total: projTasks.length,
        done,
        rate
      };
    }).sort((a, b) => b.total - a.total);
  }, [tasks, projects]);

  // Breakdown by Assignee / Designer
  const designerStats = useMemo(() => {
    const list = users.map(user => {
      const assigned = tasks.filter(t => t.assignedUserId === user.id);
      const active = assigned.filter(t => t.status !== 'COMPLETED' && t.status !== 'APPROVED');
      const inReview = assigned.filter(t => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED');
      const revisions = assigned.filter(t => t.status === 'REVISION');
      const done = assigned.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED');
      return {
        user,
        total: assigned.length,
        active: active.length,
        inReview: inReview.length,
        revisions: revisions.length,
        done: done.length
      };
    });

    // Unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assignedUserId);
    return {
      designers: list,
      unassignedCount: unassignedTasks.length
    };
  }, [tasks, users]);

  // Priority distribution
  const urgentCount = tasks.filter(t => t.priority === 'URGENT').length;
  const highCount = tasks.filter(t => t.priority === 'HIGH').length;
  const medCount = tasks.filter(t => t.priority === 'MEDIUM').length;
  const lowCount = tasks.filter(t => t.priority === 'LOW').length;

  const handleQuickFilter = (type: string, val: string) => {
    onApplyFilter(type, val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full max-w-4xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between transition-colors ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Studio Analytics & Performance Overview
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  REAL-TIME METRICS
                </span>
              </h2>
              <p className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                Evaluasi kapasitas beban kerja, siklus revisi, dan pipeline delivery tim desain
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Top Key Performance Indicators (KPI) Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            
            <div className={`p-4 rounded-xl border ${
              isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px]">Tingkat Delivery</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {completionRate}%
              </div>
              <div className={`text-[11px] mt-1 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                {completedCount} dari {total} tugas selesai
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px]">Sedang Aktif</span>
                <Clock className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-blue-600">
                {inProgressCount + reviewCount}
              </div>
              <div className={`text-[11px] mt-1 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                {inProgressCount} produksi • {reviewCount} QC review
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px]">Siklus Revisi</span>
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600">
                {avgRevisions}x
              </div>
              <div className={`text-[11px] mt-1 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                {tasksWithRevision.length} tugas mengalami revisi ({totalRevisions}x)
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px]">Overdue Risk</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className={`text-2xl font-black ${overdueCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {overdueCount}
              </div>
              <div className={`text-[11px] mt-1 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                {overdueCount > 0 ? 'Tugas melewati tanggal deadline' : 'Semua deadline terkontrol'}
              </div>
            </div>

          </div>

          {/* Middle Section: Campaign Breakdown & Designer Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Projects Delivery Breakdown */}
            <div className={`border rounded-xl p-4 space-y-3 ${
              isDarkTheme ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkTheme ? 'text-stone-300' : 'text-slate-700'
                }`}>
                  <FolderKanban className="w-4 h-4 text-amber-500" />
                  Progres per Campaign / Brand
                </h3>
                <span className="text-[11px] text-slate-400">Klik untuk filter</span>
              </div>

              <div className="space-y-2.5">
                {projectStats.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => handleQuickFilter('projectId', p.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer ${
                      isDarkTheme 
                        ? 'bg-stone-900 hover:bg-stone-800 border-stone-800' 
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#F59E0B' }} />
                        <span className="font-bold truncate max-w-[180px]">{p.name}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-500">
                        {p.done}/{p.total} ({p.rate}%)
                      </span>
                    </div>

                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isDarkTheme ? 'bg-stone-950' : 'bg-slate-200'
                    }`}>
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${p.rate}%`, backgroundColor: p.color || '#F59E0B' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Designer Workload Distribution */}
            <div className={`border rounded-xl p-4 space-y-3 ${
              isDarkTheme ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkTheme ? 'text-stone-300' : 'text-slate-700'
                }`}>
                  <Users className="w-4 h-4 text-blue-500" />
                  Beban Kerja Tim Desainer (Workload)
                </h3>
                <span className="text-[11px] text-slate-400">Status Tugas</span>
              </div>

              <div className="space-y-2.5">
                {designerStats.designers.map(item => (
                  <div 
                    key={item.user.id}
                    onClick={() => handleQuickFilter('assignedUserId', item.user.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer ${
                      isDarkTheme 
                        ? 'bg-stone-900 hover:bg-stone-800 border-stone-800' 
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[10px] text-amber-800 font-bold">
                          {item.user.name[0]}
                        </div>
                        <span className="font-bold">{item.user.name}</span>
                        <span className="text-[10px] text-slate-400">({item.user.role})</span>
                      </div>
                      <span className="font-bold text-xs">
                        {item.total} Tugas
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-1">
                      <span className="text-blue-600 font-semibold">{item.active} Aktif</span>
                      <span>•</span>
                      <span className="text-teal-600 font-semibold">{item.inReview} Review</span>
                      <span>•</span>
                      <span className="text-rose-600 font-semibold">{item.revisions} Revisi</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">{item.done} Selesai</span>
                    </div>
                  </div>
                ))}

                {designerStats.unassignedCount > 0 && (
                  <div className={`p-2 rounded-lg border text-xs text-amber-600 flex items-center justify-between ${
                    isDarkTheme ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <span>⚠️ {designerStats.unassignedCount} tugas belum ditugaskan ke desainer</span>
                    <button 
                      onClick={() => handleQuickFilter('assignedUserId', '')}
                      className="text-[11px] font-bold underline hover:text-amber-700"
                    >
                      Lihat Semua
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Bar: Priority Matrix and Quick Status Filters */}
          <div className={`border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 ${
            isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Filter Cepat Prioritas:</span>
              <button
                onClick={() => handleQuickFilter('priority', 'URGENT')}
                className="px-2.5 py-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition"
              >
                Urgent ({urgentCount})
              </button>
              <button
                onClick={() => handleQuickFilter('priority', 'HIGH')}
                className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold transition"
              >
                High ({highCount})
              </button>
              <button
                onClick={() => handleQuickFilter('priority', 'MEDIUM')}
                className="px-2.5 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold transition"
              >
                Medium ({medCount})
              </button>
              <button
                onClick={() => handleQuickFilter('priority', 'LOW')}
                className="px-2.5 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition"
              >
                Low ({lowCount})
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition shadow-xs"
            >
              Tutup Ringkasan
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
