/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RotateCcw, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Task } from '../types';

interface MetricsBarProps {
  tasks: Task[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  isDarkTheme?: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  tasks,
  activeStatusFilter,
  onSelectStatusFilter,
  isDarkTheme = false
}) => {
  const total = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const underReview = tasks.filter(t => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED').length;
  const inRevision = tasks.filter(t => t.status === 'REVISION').length;
  const approvedOrDone = tasks.filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED').length;

  const cards = [
    {
      id: 'ALL',
      label: 'Semua Tugas',
      count: total,
      icon: Layers,
      color: isDarkTheme ? 'text-stone-300' : 'text-slate-700',
      activeBorder: isDarkTheme ? 'border-amber-500 bg-amber-500/10' : 'border-amber-500 bg-amber-50 ring-2 ring-amber-400',
      badgeBg: isDarkTheme ? 'bg-stone-800 text-stone-300' : 'bg-slate-100 text-slate-700',
      tag: 'Portfolio'
    },
    {
      id: 'IN_PROGRESS',
      label: 'Dalam Pengerjaan',
      count: inProgress,
      icon: Clock,
      color: 'text-amber-500',
      activeBorder: isDarkTheme ? 'border-amber-500 bg-amber-500/10' : 'border-amber-500 bg-amber-50 ring-2 ring-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800',
      tag: 'Step 02'
    },
    {
      id: 'UNDER_REVIEW',
      label: 'Butuh Review',
      count: underReview,
      icon: AlertTriangle,
      color: 'text-teal-600',
      activeBorder: isDarkTheme ? 'border-teal-500 bg-teal-500/10' : 'border-teal-500 bg-teal-50 ring-2 ring-teal-400',
      badgeBg: 'bg-teal-100 text-teal-800',
      tag: 'Step 03'
    },
    {
      id: 'REVISION',
      label: 'Revisi & Feedback',
      count: inRevision,
      icon: RotateCcw,
      color: 'text-blue-600',
      activeBorder: isDarkTheme ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50 ring-2 ring-blue-400',
      badgeBg: 'bg-blue-100 text-blue-800',
      tag: 'Step 04'
    },
    {
      id: 'APPROVED',
      label: 'Selesai & Rilis',
      count: approvedOrDone,
      icon: CheckCircle2,
      color: 'text-purple-600',
      activeBorder: isDarkTheme ? 'border-purple-500 bg-purple-500/10' : 'border-purple-500 bg-purple-50 ring-2 ring-purple-400',
      badgeBg: 'bg-purple-100 text-purple-800',
      tag: `${total > 0 ? Math.round((approvedOrDone / total) * 100) : 0}% Rilis`
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-4">
      {cards.map(c => {
        const isSelected = activeStatusFilter === c.id || (c.id === 'ALL' && !activeStatusFilter);
        const Icon = c.icon;

        return (
          <button
            key={c.id}
            id={`metric-card-${c.id.toLowerCase()}`}
            onClick={() => onSelectStatusFilter(c.id === 'ALL' ? '' : c.id)}
            className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group shadow-xs ${
              isSelected 
                ? `${c.activeBorder}` 
                : isDarkTheme
                  ? 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold ${isDarkTheme ? 'text-stone-400 group-hover:text-stone-300' : 'text-slate-600 group-hover:text-slate-900'}`}>
                {c.label}
              </span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-black tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                {c.count}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${c.badgeBg}`}>
                {c.tag}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
