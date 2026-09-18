/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Paintbrush, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  TrendingUp, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Users,
  Briefcase,
  Layers,
  MessageSquare,
  ShieldCheck,
  FileText,
  Mail,
  ArrowDownRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Task, UserProfile, TaskStatus } from '../types';

interface DesignerWorkloadSectionProps {
  tasks: Task[];
  users: UserProfile[];
  selectedUserId?: string;
  activeStatusFilter?: string;
  showOverdueOnly?: boolean;
  onFilterDesignerAndStatus: (userId: string, status?: string, showOverdueOnly?: boolean) => void;
  isDarkTheme?: boolean;
}

export const DesignerWorkloadSection: React.FC<DesignerWorkloadSectionProps> = ({
  tasks,
  users,
  selectedUserId = '',
  activeStatusFilter = '',
  showOverdueOnly = false,
  onFilterDesignerAndStatus,
  isDarkTheme = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showAllTeam, setShowAllTeam] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'single' | 'all'>('single');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Filter graphic designers or all team members
  const designersList = useMemo(() => {
    const graphicDesigners = users.filter(u => u.role === 'DESIGNER');

    if (showAllTeam) {
      return users;
    }

    if (graphicDesigners.length > 0) {
      return graphicDesigners;
    }

    return users;
  }, [users, showAllTeam]);

  // Selected designer for single view (defaults to first designer or active selectedUserId)
  const [currentDesignerId, setCurrentDesignerId] = useState<string>(() => {
    if (selectedUserId) return selectedUserId;
    const firstDesigner = users.find(u => u.role === 'DESIGNER') || users[0];
    return firstDesigner ? firstDesigner.id : '';
  });

  // Keep currentDesignerId in sync if selectedUserId changes externally
  React.useEffect(() => {
    if (selectedUserId) {
      setCurrentDesignerId(selectedUserId);
    }
  }, [selectedUserId]);

  // Ensure currentDesignerId points to a valid user if designersList changes
  React.useEffect(() => {
    if (designersList.length > 0 && !designersList.some(d => d.id === currentDesignerId)) {
      setCurrentDesignerId(designersList[0].id);
    }
  }, [designersList, currentDesignerId]);

  // Compute stats for each designer
  const allDesignerStats = useMemo(() => {
    return designersList.map(designer => {
      const assignedTasks = tasks.filter(t => 
        t.assignedUserId === designer.id || 
        (t.assignedUserName && t.assignedUserName.toLowerCase() === designer.name.toLowerCase())
      );

      const totalJobs = assignedTasks.length;
      
      // Status breakdown
      const draftJobs = assignedTasks.filter(t => t.status === 'DRAFT').length;
      const assignedJobs = assignedTasks.filter(t => t.status === 'ASSIGNED').length;
      const inProgressJobs = assignedTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const submittedJobs = assignedTasks.filter(t => t.status === 'SUBMITTED').length;
      const underReviewJobs = assignedTasks.filter(t => t.status === 'UNDER_REVIEW').length;
      const revisionJobs = assignedTasks.filter(t => t.status === 'REVISION').length;
      const approvedJobs = assignedTasks.filter(t => t.status === 'APPROVED').length;
      const completedJobs = assignedTasks.filter(t => t.status === 'COMPLETED').length;
      const onHoldJobs = assignedTasks.filter(t => t.status === 'ON_HOLD').length;
      const cancelledJobs = assignedTasks.filter(t => t.status === 'CANCELLED').length;

      // Group totals
      const totalInProgress = assignedJobs + inProgressJobs;
      const totalReviewRevision = submittedJobs + underReviewJobs + revisionJobs;
      const totalDone = approvedJobs + completedJobs;

      const overdueJobs = assignedTasks.filter(t => 
        t.deadline && 
        t.deadline < todayStr && 
        t.status !== 'COMPLETED' && 
        t.status !== 'APPROVED'
      ).length;

      const completionPercentage = totalJobs > 0 
        ? Math.round((totalDone / totalJobs) * 100) 
        : 0;

      return {
        designer,
        assignedTasks,
        totalJobs,
        draftJobs,
        assignedJobs,
        inProgressJobs,
        submittedJobs,
        underReviewJobs,
        revisionJobs,
        approvedJobs,
        completedJobs,
        onHoldJobs,
        cancelledJobs,
        totalInProgress,
        totalReviewRevision,
        totalDone,
        overdueJobs,
        completionPercentage
      };
    });
  }, [designersList, tasks, todayStr]);

  const activeDesignerStat = useMemo(() => {
    return allDesignerStats.find(s => s.designer.id === currentDesignerId) || allDesignerStats[0];
  }, [allDesignerStats, currentDesignerId]);

  const handleStatusClick = (designerId: string, status?: string, overdue?: boolean) => {
    onFilterDesignerAndStatus(designerId, status, overdue);
  };

  // Helper to render the 4 Infographic Columns for a given designer stat
  const renderInfographicColumns = (stat: typeof allDesignerStats[0]) => {
    if (!stat) return null;
    const { designer } = stat;

    // Check if this card/status is currently the active filter
    const isDesignerActive = selectedUserId === designer.id;
    const isTotalActive = isDesignerActive && !activeStatusFilter && !showOverdueOnly;

    return (
      <div className="relative pt-2 pb-6 px-1">
        {/* Horizontal Connecting Timeline Line */}
        <div 
          className={`absolute bottom-[20px] left-6 right-6 h-1.5 rounded-full z-0 hidden md:block ${
            isDarkTheme ? 'bg-stone-800' : 'bg-slate-200'
          }`} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          
          {/* ======================================================== */}
          {/* COLUMN 1: ORANGE GRADIENT - TOTAL JOB & DRAFT */}
          {/* ======================================================== */}
          <div className="flex flex-col items-center group">
            {/* Top Ribbon Header */}
            <div className="w-full relative">
              <div className="h-16 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-3 sm:px-4 flex items-center justify-between text-white shadow-md relative overflow-hidden">
                {/* Background lighting shimmer */}
                <div className="absolute inset-0 bg-white/10 opacity-40 pointer-events-none" />
                
                {/* Number 1 */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black italic tracking-tighter leading-none drop-shadow-sm font-sans select-none">
                    1
                  </span>
                  <div className="border-l border-white/30 pl-2.5">
                    <span className="block text-[11px] font-black uppercase tracking-wider leading-tight">
                      TOTAL JOB
                    </span>
                    <span className="block text-[9.5px] font-medium opacity-90 leading-tight">
                      KARYA & DRAFT
                    </span>
                  </div>
                </div>

                {/* Quick Action Tag */}
                <button
                  onClick={() => handleStatusClick(designer.id, '', false)}
                  className="text-[10px] font-bold bg-white/20 hover:bg-white/30 active:scale-95 px-2 py-0.5 rounded-full backdrop-blur-xs transition flex items-center gap-1 cursor-pointer"
                  title="Klik untuk melihat semua job desainer ini"
                >
                  <span>Semua</span>
                  <ArrowDownRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3D Ribbon Fold Wings */}
              <div className="absolute -bottom-1.5 left-0 w-0 h-0 border-t-6 border-t-orange-800 border-l-6 border-l-transparent z-10" />
              <div className="absolute -bottom-1.5 right-0 w-0 h-0 border-t-6 border-t-amber-800 border-r-6 border-r-transparent z-10" />
            </div>

            {/* Card Body */}
            <div className={`w-full rounded-b-2xl border-x border-b p-4 flex flex-col justify-between transition-all duration-200 shadow-sm ${
              isTotalActive 
                ? isDarkTheme 
                  ? 'bg-stone-900 border-orange-500/80 ring-2 ring-orange-500/50' 
                  : 'bg-orange-50/40 border-orange-400 ring-2 ring-orange-400/40'
                : isDarkTheme 
                  ? 'bg-stone-900/90 border-stone-800 hover:border-orange-500/40 hover:bg-stone-900' 
                  : 'bg-white border-slate-200/80 hover:border-orange-300 hover:shadow-md'
            }`}>
              {/* Card Content */}
              <div>
                {/* Big Metric Display */}
                <div 
                  onClick={() => handleStatusClick(designer.id, '', false)}
                  className={`p-3 rounded-xl border mb-3 cursor-pointer transition-all ${
                    isTotalActive
                      ? 'bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-400'
                      : isDarkTheme
                        ? 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                        : 'bg-slate-50/90 border-slate-100 hover:bg-orange-50/40 hover:border-orange-200'
                  }`}
                  title="Klik untuk menyaring semua tugas desainer ini"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-tight">
                      Total Beban Job
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                      {stat.completionPercentage}% Tuntas
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {stat.totalJobs}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                      Tugas Terdaftar
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full h-2 rounded-full bg-slate-200 dark:bg-stone-800 overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${Math.max(stat.completionPercentage, stat.totalJobs > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* Sub Status Breakdown Clickables */}
                <div className="space-y-2">
                  {/* DRAFT BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'DRAFT', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'DRAFT'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400 font-bold ring-1 ring-orange-400'
                        : isDarkTheme
                          ? 'bg-stone-950/50 border-stone-800/80 hover:border-orange-500/40 text-stone-300'
                          : 'bg-white border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/30 text-slate-700'
                    }`}
                    title="Klik untuk melihat tugas status Draft / Konsep"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400 group-hover/btn:scale-125 transition-transform" />
                      <span className="font-medium">Draft / Konsep Awal</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 group-hover/btn:bg-orange-500 group-hover/btn:text-white transition">
                      {stat.draftJobs}
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom Icon */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Droplet Neck Connector & Bottom Pin (Matches Reference Image) */}
            <div className="w-12 h-9 -mt-0.5 relative flex flex-col items-center justify-end z-20">
              <svg viewBox="0 0 48 36" className={`w-12 h-9 fill-current drop-shadow-xs transition-colors ${
                isDarkTheme ? 'text-stone-900' : 'text-white'
              }`}>
                <path d="M 0 0 C 14 0 16 18 16 26 C 16 31 19.5 35 24 35 C 28.5 35 32 31 32 26 C 32 18 34 0 48 0 Z" />
              </svg>
              {/* Bottom Dot sitting exactly on the baseline */}
              <div className="absolute bottom-0 w-5 h-5 rounded-full p-0.5 shadow-md bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white dark:bg-stone-950" />
              </div>
            </div>
          </div>


          {/* ======================================================== */}
          {/* COLUMN 2: BLUE/PURPLE GRADIENT - IN PROGRESS & ASSIGNED */}
          {/* ======================================================== */}
          <div className="flex flex-col items-center group">
            {/* Top Ribbon Header */}
            <div className="w-full relative">
              <div className="h-16 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 sm:px-4 flex items-center justify-between text-white shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-40 pointer-events-none" />

                {/* Number 2 */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black italic tracking-tighter leading-none drop-shadow-sm font-sans select-none">
                    2
                  </span>
                  <div className="border-l border-white/30 pl-2.5">
                    <span className="block text-[11px] font-black uppercase tracking-wider leading-tight">
                      DALAM PROSES
                    </span>
                    <span className="block text-[9.5px] font-medium opacity-90 leading-tight">
                      ASSIGNED & ON PROGRESS
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStatusClick(designer.id, 'IN_PROGRESS', false)}
                  className="text-[10px] font-bold bg-white/20 hover:bg-white/30 active:scale-95 px-2 py-0.5 rounded-full backdrop-blur-xs transition flex items-center gap-1 cursor-pointer"
                  title="Klik untuk melihat tugas yang sedang aktif dikerjakan"
                >
                  <span>Aktif</span>
                  <ArrowDownRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3D Ribbon Fold Wings */}
              <div className="absolute -bottom-1.5 left-0 w-0 h-0 border-t-6 border-t-blue-900 border-l-6 border-l-transparent z-10" />
              <div className="absolute -bottom-1.5 right-0 w-0 h-0 border-t-6 border-t-purple-900 border-r-6 border-r-transparent z-10" />
            </div>

            {/* Card Body */}
            <div className={`w-full rounded-b-2xl border-x border-b p-4 flex flex-col justify-between transition-all duration-200 shadow-sm ${
              isDesignerActive && (activeStatusFilter === 'IN_PROGRESS' || activeStatusFilter === 'ASSIGNED')
                ? isDarkTheme 
                  ? 'bg-stone-900 border-blue-500/80 ring-2 ring-blue-500/50' 
                  : 'bg-blue-50/40 border-blue-400 ring-2 ring-blue-400/40'
                : isDarkTheme 
                  ? 'bg-stone-900/90 border-stone-800 hover:border-blue-500/40 hover:bg-stone-900' 
                  : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-md'
            }`}>
              <div>
                {/* Big Metric Display */}
                <div 
                  onClick={() => handleStatusClick(designer.id, 'IN_PROGRESS', false)}
                  className={`p-3 rounded-xl border mb-3 cursor-pointer transition-all ${
                    isDesignerActive && activeStatusFilter === 'IN_PROGRESS'
                      ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400'
                      : isDarkTheme
                        ? 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                        : 'bg-slate-50/90 border-slate-100 hover:bg-blue-50/40 hover:border-blue-200'
                  }`}
                  title="Klik untuk filter tugas Dalam Pengerjaan"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-tight">
                      Total Pengerjaan Aktif
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      Aktif Berjalan
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {stat.totalInProgress}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                      Tugas Sedang Diproses
                    </span>
                  </div>
                </div>

                {/* Sub Status Breakdown Clickables */}
                <div className="space-y-1.5">
                  {/* ASSIGNED BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'ASSIGNED', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'ASSIGNED'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-400'
                        : isDarkTheme
                          ? 'bg-stone-950/50 border-stone-800/80 hover:border-blue-500/40 text-stone-300'
                          : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 text-slate-700'
                    }`}
                    title="Klik untuk filter tugas Ditugaskan (ASSIGNED)"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-sky-500 group-hover/btn:scale-125 transition-transform" />
                      <span className="font-medium">Baru Ditugaskan (Assigned)</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 group-hover/btn:bg-blue-600 group-hover/btn:text-white transition">
                      {stat.assignedJobs}
                    </span>
                  </button>

                  {/* IN_PROGRESS BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'IN_PROGRESS', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'IN_PROGRESS'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-400'
                        : isDarkTheme
                          ? 'bg-stone-950/50 border-stone-800/80 hover:border-indigo-500/40 text-stone-300'
                          : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700'
                    }`}
                    title="Klik untuk filter tugas Dalam Pengerjaan (IN PROGRESS)"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse group-hover/btn:scale-125 transition-transform" />
                      <span className="font-medium">Sedang Dikerjakan</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 group-hover/btn:bg-indigo-600 group-hover/btn:text-white transition">
                      {stat.inProgressJobs}
                    </span>
                  </button>

                  {/* OVERDUE BADGE IF ANY */}
                  {stat.overdueJobs > 0 && (
                    <button
                      onClick={() => handleStatusClick(designer.id, '', true)}
                      className={`w-full p-1.5 rounded-lg border text-left text-xs flex items-center justify-between transition cursor-pointer ${
                        isDesignerActive && showOverdueOnly
                          ? 'bg-rose-500/20 border-rose-500 text-rose-600 font-bold'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                      }`}
                      title="Klik untuk melihat tugas yang melewati batas deadline"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-semibold text-[11px]">Tenggat Terlewati</span>
                      </div>
                      <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px]">
                        {stat.overdueJobs} Overdue
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Icon */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Droplet Neck Connector & Bottom Pin */}
            <div className="w-12 h-9 -mt-0.5 relative flex flex-col items-center justify-end z-20">
              <svg viewBox="0 0 48 36" className={`w-12 h-9 fill-current drop-shadow-xs transition-colors ${
                isDarkTheme ? 'text-stone-900' : 'text-white'
              }`}>
                <path d="M 0 0 C 14 0 16 18 16 26 C 16 31 19.5 35 24 35 C 28.5 35 32 31 32 26 C 32 18 34 0 48 0 Z" />
              </svg>
              <div className="absolute bottom-0 w-5 h-5 rounded-full p-0.5 shadow-md bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white dark:bg-stone-950" />
              </div>
            </div>
          </div>


          {/* ======================================================== */}
          {/* COLUMN 3: CYAN/TEAL GRADIENT - REVIEW & REVISION */}
          {/* ======================================================== */}
          <div className="flex flex-col items-center group">
            {/* Top Ribbon Header */}
            <div className="w-full relative">
              <div className="h-16 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-3 sm:px-4 flex items-center justify-between text-white shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-40 pointer-events-none" />

                {/* Number 3 */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black italic tracking-tighter leading-none drop-shadow-sm font-sans select-none">
                    3
                  </span>
                  <div className="border-l border-white/30 pl-2.5">
                    <span className="block text-[11px] font-black uppercase tracking-wider leading-tight">
                      REVIEW & REVISI
                    </span>
                    <span className="block text-[9.5px] font-medium opacity-90 leading-tight">
                      QUALITY & FEEDBACK
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStatusClick(designer.id, 'UNDER_REVIEW', false)}
                  className="text-[10px] font-bold bg-white/20 hover:bg-white/30 active:scale-95 px-2 py-0.5 rounded-full backdrop-blur-xs transition flex items-center gap-1 cursor-pointer"
                  title="Klik untuk melihat tugas dalam tahap review"
                >
                  <span>Review</span>
                  <ArrowDownRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3D Ribbon Fold Wings */}
              <div className="absolute -bottom-1.5 left-0 w-0 h-0 border-t-6 border-t-teal-900 border-l-6 border-l-transparent z-10" />
              <div className="absolute -bottom-1.5 right-0 w-0 h-0 border-t-6 border-t-blue-900 border-r-6 border-r-transparent z-10" />
            </div>

            {/* Card Body */}
            <div className={`w-full rounded-b-2xl border-x border-b p-4 flex flex-col justify-between transition-all duration-200 shadow-sm ${
              isDesignerActive && (activeStatusFilter === 'SUBMITTED' || activeStatusFilter === 'UNDER_REVIEW' || activeStatusFilter === 'REVISION')
                ? isDarkTheme 
                  ? 'bg-stone-900 border-cyan-500/80 ring-2 ring-cyan-500/50' 
                  : 'bg-cyan-50/40 border-cyan-400 ring-2 ring-cyan-400/40'
                : isDarkTheme 
                  ? 'bg-stone-900/90 border-stone-800 hover:border-cyan-500/40 hover:bg-stone-900' 
                  : 'bg-white border-slate-200/80 hover:border-cyan-300 hover:shadow-md'
            }`}>
              <div>
                {/* Big Metric Display */}
                <div 
                  onClick={() => handleStatusClick(designer.id, 'UNDER_REVIEW', false)}
                  className={`p-3 rounded-xl border mb-3 cursor-pointer transition-all ${
                    isDesignerActive && activeStatusFilter === 'UNDER_REVIEW'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : isDarkTheme
                        ? 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                        : 'bg-slate-50/90 border-slate-100 hover:bg-cyan-50/40 hover:border-cyan-200'
                  }`}
                  title="Klik untuk filter tugas dalam tahap Review"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-tight">
                      Dalam Tahap Review
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                      Pemeriksaan
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {stat.totalReviewRevision}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                      Tugas Menunggu / Revisi
                    </span>
                  </div>
                </div>

                {/* Sub Status Breakdown Clickables */}
                <div className="space-y-1.5">
                  {/* SUBMITTED BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'SUBMITTED', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'SUBMITTED'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold ring-1 ring-cyan-400'
                        : isDarkTheme
                          ? 'bg-stone-950/50 border-stone-800/80 hover:border-cyan-500/40 text-stone-300'
                          : 'bg-white border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/30 text-slate-700'
                    }`}
                    title="Klik untuk filter tugas Diserahkan (SUBMITTED)"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 group-hover/btn:scale-125 transition-transform" />
                      <span className="font-medium">Terkirim (Submitted)</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 group-hover/btn:bg-cyan-600 group-hover/btn:text-white transition">
                      {stat.submittedJobs}
                    </span>
                  </button>

                  {/* UNDER_REVIEW BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'UNDER_REVIEW', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'UNDER_REVIEW'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-600 dark:text-teal-400 font-bold ring-1 ring-teal-400'
                        : isDarkTheme
                          ? 'bg-stone-950/50 border-stone-800/80 hover:border-teal-500/40 text-stone-300'
                          : 'bg-white border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/30 text-slate-700'
                    }`}
                    title="Klik untuk filter tugas Sedang Ditinjau (UNDER REVIEW)"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 group-hover/btn:scale-125 transition-transform" />
                      <span className="font-medium">Sedang Diperiksa</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 group-hover/btn:bg-teal-600 group-hover/btn:text-white transition">
                      {stat.underReviewJobs}
                    </span>
                  </button>

                  {/* REVISION BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'REVISION', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'REVISION'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-400'
                        : stat.revisionJobs > 0
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                          : isDarkTheme
                            ? 'bg-stone-950/50 border-stone-800/80 hover:border-amber-500/40 text-stone-300'
                            : 'bg-white border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 text-slate-700'
                    }`}
                    title="Klik untuk filter tugas Butuh Revisi (REVISION)"
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className={`w-3 h-3 ${stat.revisionJobs > 0 ? 'text-amber-500 animate-spin-slow' : 'text-slate-400'}`} />
                      <span className="font-medium">Revisi Desain</span>
                    </div>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded-md transition ${
                      stat.revisionJobs > 0 
                        ? 'bg-amber-500 text-stone-950' 
                        : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300'
                    }`}>
                      {stat.revisionJobs}
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom Icon */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Droplet Neck Connector & Bottom Pin */}
            <div className="w-12 h-9 -mt-0.5 relative flex flex-col items-center justify-end z-20">
              <svg viewBox="0 0 48 36" className={`w-12 h-9 fill-current drop-shadow-xs transition-colors ${
                isDarkTheme ? 'text-stone-900' : 'text-white'
              }`}>
                <path d="M 0 0 C 14 0 16 18 16 26 C 16 31 19.5 35 24 35 C 28.5 35 32 31 32 26 C 32 18 34 0 48 0 Z" />
              </svg>
              <div className="absolute bottom-0 w-5 h-5 rounded-full p-0.5 shadow-md bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white dark:bg-stone-950" />
              </div>
            </div>
          </div>


          {/* ======================================================== */}
          {/* COLUMN 4: MAGENTA/ROSE GRADIENT - APPROVED & COMPLETED */}
          {/* ======================================================== */}
          <div className="flex flex-col items-center group">
            {/* Top Ribbon Header */}
            <div className="w-full relative">
              <div className="h-16 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 p-3 sm:px-4 flex items-center justify-between text-white shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-40 pointer-events-none" />

                {/* Number 4 */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black italic tracking-tighter leading-none drop-shadow-sm font-sans select-none">
                    4
                  </span>
                  <div className="border-l border-white/30 pl-2.5">
                    <span className="block text-[11px] font-black uppercase tracking-wider leading-tight">
                      APPROVED & FINAL
                    </span>
                    <span className="block text-[9.5px] font-medium opacity-90 leading-tight">
                      SELESAI & TUNTAS
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStatusClick(designer.id, 'COMPLETED', false)}
                  className="text-[10px] font-bold bg-white/20 hover:bg-white/30 active:scale-95 px-2 py-0.5 rounded-full backdrop-blur-xs transition flex items-center gap-1 cursor-pointer"
                  title="Klik untuk melihat tugas yang telah tuntas selesai"
                >
                  <span>Selesai</span>
                  <ArrowDownRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3D Ribbon Fold Wings */}
              <div className="absolute -bottom-1.5 left-0 w-0 h-0 border-t-6 border-t-pink-900 border-l-6 border-l-transparent z-10" />
              <div className="absolute -bottom-1.5 right-0 w-0 h-0 border-t-6 border-t-red-900 border-r-6 border-r-transparent z-10" />
            </div>

            {/* Card Body */}
            <div className={`w-full rounded-b-2xl border-x border-b p-4 flex flex-col justify-between transition-all duration-200 shadow-sm ${
              isDesignerActive && (activeStatusFilter === 'COMPLETED' || activeStatusFilter === 'APPROVED')
                ? isDarkTheme 
                  ? 'bg-stone-900 border-rose-500/80 ring-2 ring-rose-500/50' 
                  : 'bg-rose-50/40 border-rose-400 ring-2 ring-rose-400/40'
                : isDarkTheme 
                  ? 'bg-stone-900/90 border-stone-800 hover:border-rose-500/40 hover:bg-stone-900' 
                  : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-md'
            }`}>
              <div>
                {/* Big Metric Display */}
                <div 
                  onClick={() => handleStatusClick(designer.id, 'COMPLETED', false)}
                  className={`p-3 rounded-xl border mb-3 cursor-pointer transition-all ${
                    isDesignerActive && activeStatusFilter === 'COMPLETED'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400'
                      : isDarkTheme
                        ? 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                        : 'bg-slate-50/90 border-slate-100 hover:bg-rose-50/40 hover:border-rose-200'
                  }`}
                  title="Klik untuk filter tugas Selesai Final"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-tight">
                      Total Karya Tuntas
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Deliverable Ready
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {stat.totalDone}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                      Tugas Disetujui & Selesai
                    </span>
                  </div>
                </div>

                {/* Sub Status Breakdown Clickables */}
                <div className="space-y-1.5">
                  {/* APPROVED BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'APPROVED', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'APPROVED'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-400'
                        : isDarkTheme
                          ? 'bg-stone-950/50 border-stone-800/80 hover:border-emerald-500/40 text-stone-300'
                          : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-700'
                    }`}
                    title="Klik untuk filter tugas Disetujui (APPROVED)"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover/btn:scale-125 transition-transform" />
                      <span className="font-medium">Disetujui (Approved)</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 group-hover/btn:bg-emerald-600 group-hover/btn:text-white transition">
                      {stat.approvedJobs}
                    </span>
                  </button>

                  {/* COMPLETED BUTTON */}
                  <button
                    onClick={() => handleStatusClick(designer.id, 'COMPLETED', false)}
                    className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition group/btn cursor-pointer ${
                      isDesignerActive && activeStatusFilter === 'COMPLETED'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-bold ring-1 ring-rose-400'
                        : isDarkTheme
                          ? 'bg-stone-950/50 border-stone-800/80 hover:border-rose-500/40 text-stone-300'
                          : 'bg-white border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 text-slate-700'
                    }`}
                    title="Klik untuk filter tugas Selesai Akhir (COMPLETED)"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover/btn:scale-125 transition-transform" />
                      <span className="font-medium">Final Selesai (Completed)</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 group-hover/btn:bg-rose-600 group-hover/btn:text-white transition">
                      {stat.completedJobs}
                    </span>
                  </button>

                  {/* ON_HOLD or CANCELLED if any */}
                  {(stat.onHoldJobs > 0 || stat.cancelledJobs > 0) && (
                    <button
                      onClick={() => handleStatusClick(designer.id, stat.onHoldJobs > 0 ? 'ON_HOLD' : 'CANCELLED', false)}
                      className="w-full p-1.5 rounded-lg border text-left text-[11px] flex items-center justify-between opacity-75 hover:opacity-100 transition cursor-pointer"
                    >
                      <span className="text-slate-500 dark:text-stone-400">Tertunda / Batal</span>
                      <span className="font-mono font-bold">
                        {stat.onHoldJobs + stat.cancelledJobs}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Icon */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Droplet Neck Connector & Bottom Pin */}
            <div className="w-12 h-9 -mt-0.5 relative flex flex-col items-center justify-end z-20">
              <svg viewBox="0 0 48 36" className={`w-12 h-9 fill-current drop-shadow-xs transition-colors ${
                isDarkTheme ? 'text-stone-900' : 'text-white'
              }`}>
                <path d="M 0 0 C 14 0 16 18 16 26 C 16 31 19.5 35 24 35 C 28.5 35 32 31 32 26 C 32 18 34 0 48 0 Z" />
              </svg>
              <div className="absolute bottom-0 w-5 h-5 rounded-full p-0.5 shadow-md bg-gradient-to-r from-pink-600 to-red-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white dark:bg-stone-950" />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <section 
      id="designer-workload-dashboard-section" 
      className={`rounded-2xl border transition-all duration-200 shadow-xs mb-5 overflow-hidden ${
        isDarkTheme 
          ? 'bg-stone-900/95 border-stone-800 text-stone-100' 
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      {/* SECTION HEADER */}
      <div className={`p-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 border-b ${
        isDarkTheme ? 'bg-stone-950/70 border-stone-800' : 'bg-slate-50/80 border-slate-200/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
            <Paintbrush className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-extrabold tracking-tight flex items-center gap-2">
                Beban Kerja & Progres Desainer Grafis
              </h2>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border font-mono ${
                isDarkTheme 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-amber-100/70 text-amber-800 border-amber-200'
              }`}>
                {allDesignerStats.length} Desainer
              </span>

              {/* Active Filter Pill */}
              {selectedUserId && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-stone-950 flex items-center gap-1.5 shadow-xs">
                  <span>
                    Filter: {users.find(u => u.id === selectedUserId)?.name || 'Desainer'}
                    {activeStatusFilter ? ` • ${activeStatusFilter.replace('_', ' ')}` : ''}
                    {showOverdueOnly ? ' • Overdue' : ''}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterDesignerAndStatus('', '', false);
                    }}
                    title="Hapus filter aktif"
                    className="hover:opacity-75 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
              Klik kartu atau status manapun untuk langsung membuka dan memfilter tugas desainer terkait
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2">
          {/* Display Mode Switcher (Tab Single Desainer vs Semua Desainer Sekaligus) */}
          <div className={`flex items-center rounded-lg p-0.5 border text-xs ${
            isDarkTheme ? 'bg-stone-900 border-stone-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setDisplayMode('single')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                displayMode === 'single'
                  ? 'bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-200'
              }`}
            >
              Fokus Per Desainer
            </button>
            <button
              onClick={() => setDisplayMode('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                displayMode === 'all'
                  ? 'bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-200'
              }`}
            >
              Semua Sekaligus
            </button>
          </div>

          {/* Toggle Graphic Designers vs All Team */}
          <button
            id="toggle-all-team-btn"
            onClick={() => setShowAllTeam(prev => !prev)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1 cursor-pointer ${
              showAllTeam
                ? isDarkTheme ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-50 text-amber-800 border-amber-300'
                : isDarkTheme ? 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Tampilkan semua anggota tim atau khusus desainer grafis"
          >
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">{showAllTeam ? 'Semua Tim' : 'Desainer'}</span>
          </button>

          {/* Collapse/Expand Section */}
          <button
            id="toggle-expand-designers-btn"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isDarkTheme 
                ? 'border-stone-800 hover:bg-stone-800 text-stone-400' 
                : 'border-slate-200 hover:bg-slate-100 text-slate-500'
            }`}
            title={isExpanded ? 'Sembunyikan Panel' : 'Tampilkan Panel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5">
          {/* DESIGNER SELECTOR TABS (Quick Clickable Carousel / Pill List) */}
          <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-tight mr-1">
              Pilih Desainer:
            </span>
            {allDesignerStats.map(({ designer, totalJobs, completionPercentage, overdueJobs }) => {
              const isCurrent = currentDesignerId === designer.id;
              const isFiltered = selectedUserId === designer.id;

              return (
                <button
                  key={designer.id}
                  onClick={() => {
                    setCurrentDesignerId(designer.id);
                    // Filter by this designer and scroll
                    handleStatusClick(designer.id, '');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2.5 transition shrink-0 cursor-pointer ${
                    isFiltered || (displayMode === 'single' && isCurrent)
                      ? isDarkTheme
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-xs font-bold'
                        : 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/40 shadow-xs font-bold'
                      : isDarkTheme
                        ? 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {/* Designer Avatar */}
                  {designer.avatar ? (
                    <img
                      src={designer.avatar}
                      alt={designer.name}
                      className="w-5 h-5 rounded-full object-cover border border-amber-500/40 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">
                      {designer.name[0]}
                    </div>
                  )}

                  <span>{designer.name}</span>

                  <span className="px-1.5 py-0.2 rounded-md font-mono text-[10px] bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                    {totalJobs} Job
                  </span>

                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {completionPercentage}%
                  </span>

                  {overdueJobs > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" title={`${overdueJobs} job overdue`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* MAIN CONTENT AREA */}
          {allDesignerStats.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Belum ada data desainer grafis yang terdaftar.
            </div>
          ) : displayMode === 'single' ? (
            /* SINGLE DESIGNER FOCUSED INFOGRAPHIC */
            <div>
              {/* Active Designer Banner Info */}
              {activeDesignerStat && (
                <div className={`mb-3 p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  isDarkTheme ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50/90 border-slate-200/70'
                }`}>
                  <div className="flex items-center gap-3">
                    {activeDesignerStat.designer.avatar ? (
                      <img
                        src={activeDesignerStat.designer.avatar}
                        alt={activeDesignerStat.designer.name}
                        className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                        {activeDesignerStat.designer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold">
                          {activeDesignerStat.designer.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                          Desainer Grafis Studio
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                        Memiliki total <strong>{activeDesignerStat.totalJobs} tugas</strong> • {activeDesignerStat.totalDone} Selesai • {activeDesignerStat.totalInProgress} Sedang Dikerjakan
                      </p>
                    </div>
                  </div>

                  {/* Right side quick jump button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusClick(activeDesignerStat.designer.id, '')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Lihat Semua Tugas Desainer Ini</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* The 4 Signature Infographic Columns */}
              {renderInfographicColumns(activeDesignerStat)}
            </div>
          ) : (
            /* ALL DESIGNERS MODE: Each designer has their own signature timeline row */
            <div className="space-y-8">
              {allDesignerStats.map(stat => (
                <div 
                  key={stat.designer.id} 
                  className={`p-4 rounded-2xl border ${
                    isDarkTheme ? 'bg-stone-950/40 border-stone-800' : 'bg-slate-50/40 border-slate-200/80'
                  }`}
                >
                  {/* Designer Mini Bar */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                      {stat.designer.avatar ? (
                        <img
                          src={stat.designer.avatar}
                          alt={stat.designer.name}
                          className="w-8 h-8 rounded-xl object-cover border border-amber-500/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center">
                          {stat.designer.name[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold">{stat.designer.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {stat.totalJobs} Total Job • {stat.completionPercentage}% Selesai
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStatusClick(stat.designer.id, '')}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Filter Desainer Ini</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {renderInfographicColumns(stat)}
                </div>
              ))}
            </div>
          )}

          {/* Direct Navigation Hint Footer */}
          <div className={`mt-2 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
            isDarkTheme ? 'border-stone-800 text-stone-400' : 'border-slate-100 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Tip: Setiap kartu kolom dan status di atas dapat diklik untuk langsung menyaring daftar tugas di bawah secara instan.
              </span>
            </div>

            {selectedUserId && (
              <button
                onClick={() => onFilterDesignerAndStatus('', '', false)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Reset Semua Filter Desainer & Status
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
