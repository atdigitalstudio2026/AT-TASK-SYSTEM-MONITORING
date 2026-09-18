/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Palette, 
  Search, 
  UserCheck, 
  Clock, 
  ChevronsRight, 
  Layers, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

export interface WorkflowStepConfig {
  id: string;
  stepNumber: string;
  stepLabel: string;
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  statuses: TaskStatus[];
  theme: {
    backplateGradient: string;
    backplateBg: string;
    textColor: string;
    accentColor: string;
    ringColor: string;
    badgeBg: string;
    arrowColor: string;
    notchBorderColor: string;
  };
}

export const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    id: 'step-01',
    stepNumber: '01',
    stepLabel: 'STEP',
    category: 'CREATIVE BRIEF',
    title: 'BRIEF & DRAFT',
    description: 'Penerimaan instruksi klien, spesifikasi dimensi, moodboard, dan penugasan awal tim.',
    icon: FileText,
    statuses: ['DRAFT', 'ASSIGNED'],
    theme: {
      backplateGradient: 'from-amber-400 via-amber-500 to-amber-600',
      backplateBg: '#F59E0B',
      textColor: 'text-amber-700',
      accentColor: '#D97706',
      ringColor: 'ring-amber-500',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      arrowColor: 'text-amber-200',
      notchBorderColor: 'border-t-white'
    }
  },
  {
    id: 'step-02',
    stepNumber: '02',
    stepLabel: 'STEP',
    category: 'IN PRODUCTION',
    title: 'DESAIN & KARYA',
    description: 'Eksplorasi visual di Figma, penyusunan layout, pemilihan tipografi, dan slicing aset.',
    icon: Palette,
    statuses: ['IN_PROGRESS'],
    theme: {
      backplateGradient: 'from-lime-500 via-emerald-500 to-green-600',
      backplateBg: '#22C55E',
      textColor: 'text-emerald-700',
      accentColor: '#16A34A',
      ringColor: 'ring-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      arrowColor: 'text-emerald-200',
      notchBorderColor: 'border-t-white'
    }
  },
  {
    id: 'step-03',
    stepNumber: '03',
    stepLabel: 'STEP',
    category: 'QUALITY CONTROL',
    title: 'QC & REVIEW',
    description: 'Verifikasi Art Director terhadap brief, ketepatan copywriting, format warna & file export.',
    icon: Search,
    statuses: ['SUBMITTED', 'UNDER_REVIEW'],
    theme: {
      backplateGradient: 'from-cyan-500 via-teal-500 to-teal-600',
      backplateBg: '#0D9488',
      textColor: 'text-teal-700',
      accentColor: '#0E7490',
      ringColor: 'ring-teal-500',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
      arrowColor: 'text-teal-200',
      notchBorderColor: 'border-t-white'
    }
  },
  {
    id: 'step-04',
    stepNumber: '04',
    stepLabel: 'STEP',
    category: 'STAKEHOLDER',
    title: 'REVISI & FEEDBACK',
    description: 'Catatan feedback klien, perbaikan iteratif desainer, dan peninjauan approval kedua.',
    icon: UserCheck,
    statuses: ['REVISION'],
    theme: {
      backplateGradient: 'from-blue-500 via-blue-600 to-indigo-600',
      backplateBg: '#2563EB',
      textColor: 'text-blue-700',
      accentColor: '#1D4ED8',
      ringColor: 'ring-blue-500',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      arrowColor: 'text-blue-200',
      notchBorderColor: 'border-t-white'
    }
  },
  {
    id: 'step-05',
    stepNumber: '05',
    stepLabel: 'STEP',
    category: 'FINAL ASSETS',
    title: 'SELESAI & RILIS',
    description: 'Persetujuan resmi, penyerahan file cetak CMYK / aset digital, serta pengarsipan drive.',
    icon: Clock,
    statuses: ['APPROVED', 'COMPLETED'],
    theme: {
      backplateGradient: 'from-purple-500 via-violet-600 to-purple-700',
      backplateBg: '#8B5CF6',
      textColor: 'text-purple-700',
      accentColor: '#7C3AED',
      ringColor: 'ring-purple-500',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
      arrowColor: 'text-purple-200',
      notchBorderColor: 'border-t-white'
    }
  }
];

interface StepProcessMenuProps {
  tasks: Task[];
  activeStepId: string | null;
  onSelectStep: (stepId: string | null, statuses?: TaskStatus[]) => void;
  isDarkTheme?: boolean;
}

export const StepProcessMenu: React.FC<StepProcessMenuProps> = ({
  tasks,
  activeStepId,
  onSelectStep,
  isDarkTheme = false
}) => {
  const totalTasks = tasks.length;

  const getStepTaskCount = (step: WorkflowStepConfig) => {
    return tasks.filter(t => step.statuses.includes(t.status)).length;
  };

  const completedCount = tasks.filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <section className="relative my-6 select-none" aria-label="Workflow Process Infographic Menu">
      {/* Menu Header / Pipeline Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
              Interactive Workflow Pipeline
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300/80">
              5-Step Studio System
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
            Klik salah satu tahapan proses di bawah untuk memfilter dan memantau karya desain secara instan.
          </p>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Progress Pill */}
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-2xs ${
            isDarkTheme 
              ? 'bg-stone-900 border-stone-800 text-stone-300' 
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Progress Global:</span>
            <strong className="text-emerald-600 font-bold">{overallProgress}%</strong>
            <span className="text-slate-400 font-normal">({completedCount}/{totalTasks})</span>
          </div>

          {/* Reset / All Steps Button */}
          <button
            onClick={() => onSelectStep(null)}
            className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
              activeStepId === null
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : isDarkTheme
                  ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Tampilkan seluruh tugas tanpa filter tahapan"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Semua Tahapan</span>
            {activeStepId === null && (
              <span className="ml-1 bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {totalTasks}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 5-Step Process Horizontal Cards (Faithful to image.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3.5">
        {WORKFLOW_STEPS.map((step) => {
          const isSelected = activeStepId === step.id;
          const taskCount = getStepTaskCount(step);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              id={`infographic-step-${step.stepNumber}`}
              onClick={() => {
                if (isSelected) {
                  onSelectStep(null);
                } else {
                  onSelectStep(step.id, step.statuses);
                }
              }}
              className={`group relative cursor-pointer transition-all duration-300 ease-out transform ${
                isSelected 
                  ? '-translate-y-2 scale-[1.02]' 
                  : 'hover:-translate-y-1.5 hover:scale-[1.01]'
              }`}
            >
              {/* Backplate Container (Vibrant Colored with signature rounded-br-[36px]) */}
              <div 
                className={`relative w-full h-full pt-4 px-2 pb-4 rounded-tl-xl rounded-tr-xl rounded-bl-lg rounded-br-[38px] bg-gradient-to-b ${step.theme.backplateGradient} shadow-md transition-shadow duration-300 ${
                  isSelected 
                    ? 'ring-4 ring-offset-2 ring-slate-800/20 shadow-xl' 
                    : 'shadow-slate-400/40 group-hover:shadow-lg'
                }`}
                style={{
                  minHeight: '290px'
                }}
              >
                {/* Top Elevated White Card (With Signature Asymmetrical rounded-tl-[32px] and pointer notch) */}
                <div 
                  className={`relative w-full bg-white rounded-tl-[32px] rounded-tr-md rounded-bl-sm rounded-br-sm p-4 text-center transition-all duration-300 border border-slate-100 ${
                    isSelected
                      ? 'shadow-lg shadow-black/15'
                      : 'shadow-md shadow-black/10 group-hover:shadow-lg'
                  }`}
                  style={{ minHeight: '198px' }}
                >
                  {/* Top Step Icon (colored according to step) */}
                  <div className="flex justify-center mb-2.5">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ color: step.theme.accentColor }}
                    >
                      <Icon className="w-7 h-7 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Subtitle / Category Eyebrow */}
                  <div 
                    className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5 line-clamp-1"
                    style={{ color: step.theme.accentColor }}
                  >
                    {step.category}
                  </div>

                  {/* Bold Main Title */}
                  <h3 
                    className="text-xs sm:text-[13px] font-black tracking-tight uppercase leading-tight mb-2"
                    style={{ color: step.theme.accentColor }}
                  >
                    {step.title}
                  </h3>

                  {/* Concise Description Body */}
                  <p className="text-[10.5px] leading-relaxed text-slate-600 line-clamp-3 px-0.5 font-normal">
                    {step.description}
                  </p>

                  {/* Live Count Pill inside the white card */}
                  <div className="mt-2.5 flex items-center justify-center">
                    <span 
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs"
                      style={{
                        backgroundColor: isSelected ? step.theme.accentColor : '#F8FAFC',
                        color: isSelected ? '#FFFFFF' : step.theme.accentColor,
                        borderColor: isSelected ? step.theme.accentColor : '#E2E8F0'
                      }}
                    >
                      <span>{taskCount} {taskCount === 1 ? 'Karya' : 'Karya'}</span>
                      {isSelected && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </span>
                  </div>

                  {/* Downward Triangle Notch (White Speech Bubble Pointer pointing into backplate) */}
                  <div 
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white drop-shadow-xs z-10"
                    aria-hidden="true"
                  />
                </div>

                {/* Bottom Backplate Content (Big Number + STEP + Chevrons >>) */}
                <div className="mt-4 px-3 flex items-end justify-between text-white">
                  <div>
                    {/* Big Bold Step Number */}
                    <div className="text-3xl sm:text-[34px] font-black tracking-tighter leading-none text-white drop-shadow-xs">
                      {step.stepNumber}
                    </div>
                    {/* STEP Label */}
                    <div className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-white/95 mt-0.5">
                      {step.stepLabel}
                    </div>
                  </div>

                  {/* Forward Directional Chevrons >> */}
                  <div className="flex items-center pb-1">
                    <div className="flex items-center text-white/85 font-black text-xl tracking-tighter transition-transform group-hover:translate-x-1">
                      <ChevronsRight className="w-6 h-6 stroke-[3]" />
                    </div>
                  </div>
                </div>

                {/* Active Indicator Pulse Ring */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                )}
              </div>

              {/* Glossy Floor Reflection Effect (Matches the clean reflective studio floor in image.png) */}
              <div 
                className="hidden lg:block w-full h-9 mt-1 overflow-hidden pointer-events-none opacity-25 rounded-br-[28px] transform scale-y-[-1] blur-[0.6px]"
                style={{
                  background: `linear-gradient(to top, ${step.theme.backplateBg}, transparent)`,
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)'
                }}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>

      {/* Active Filter Helper Banner */}
      {activeStepId && (
        <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              Menampilkan karya pada tahap: <strong>{WORKFLOW_STEPS.find(s => s.id === activeStepId)?.title}</strong> ({WORKFLOW_STEPS.find(s => s.id === activeStepId)?.category})
            </span>
          </div>
          <button
            onClick={() => onSelectStep(null)}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline ml-3"
          >
            Reset ke Semua Tahapan
          </button>
        </div>
      )}
    </section>
  );
};
