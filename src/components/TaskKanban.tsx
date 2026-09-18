/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  MoreVertical,
  Plus,
  User,
  ArrowRight,
  ExternalLink,
  ListTodo,
  FileCode,
  FolderArchive,
  GripVertical
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Project } from '../types';

interface TaskKanbanProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onNewTaskWithStatus?: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: string;
  stepNumber: string;
  title: string;
  category: string;
  statuses: TaskStatus[];
  headerGradient: string;
  badgeBg: string;
  borderColor: string;
}

export const TaskKanban: React.FC<TaskKanbanProps & { isDarkTheme?: boolean }> = ({
  tasks,
  projects,
  onSelectTask,
  onQuickStatusChange,
  onNewTaskWithStatus,
  isDarkTheme = false
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const columns: ColumnConfig[] = [
    {
      id: 'step-01',
      stepNumber: '01',
      title: 'Brief & Draft',
      category: 'CREATIVE BRIEF',
      statuses: ['DRAFT', 'ASSIGNED'],
      headerGradient: 'from-amber-400 via-amber-500 to-amber-600',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      borderColor: 'border-amber-200'
    },
    {
      id: 'step-02',
      stepNumber: '02',
      title: 'Desain & Karya',
      category: 'IN PRODUCTION',
      statuses: ['IN_PROGRESS'],
      headerGradient: 'from-lime-500 via-emerald-500 to-green-600',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'step-03',
      stepNumber: '03',
      title: 'QC & Review',
      category: 'QUALITY CONTROL',
      statuses: ['SUBMITTED', 'UNDER_REVIEW'],
      headerGradient: 'from-cyan-500 via-teal-500 to-teal-600',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      borderColor: 'border-teal-200'
    },
    {
      id: 'step-04',
      stepNumber: '04',
      title: 'Revisi & Feedback',
      category: 'CLIENT APPROVAL',
      statuses: ['REVISION'],
      headerGradient: 'from-blue-500 via-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      borderColor: 'border-blue-200'
    },
    {
      id: 'step-05',
      stepNumber: '05',
      title: 'Selesai & Rilis',
      category: 'FINAL ASSETS',
      statuses: ['APPROVED', 'COMPLETED', 'ON_HOLD'],
      headerGradient: 'from-purple-500 via-violet-600 to-purple-700',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      borderColor: 'border-purple-200'
    }
  ];

  const getPriorityStyle = (priority?: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Draft', style: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'ASSIGNED':
        return { label: 'Assigned', style: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'SUBMITTED':
        return { label: 'Submitted', style: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', style: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'REVISION':
        return { label: 'Revision', style: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'APPROVED':
        return { label: 'Approved', style: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'COMPLETED':
        return { label: 'Completed', style: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'ON_HOLD':
        return { label: 'On Hold', style: 'bg-slate-100 text-slate-600 border-slate-200' };
      default:
        return { label: status, style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getProjectColor = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    return proj?.color || '#F59E0B';
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    const due = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 items-start pb-12">
      {columns.map(col => {
        const colTasks = tasks.filter(t => col.statuses.includes(t.status));

        return (
          <div 
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverColumnId !== col.id) {
                setDragOverColumnId(col.id);
              }
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragOverColumnId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverColumnId(null);
              const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
              if (taskId) {
                onQuickStatusChange(taskId, col.statuses[0]);
              }
            }}
            className={`flex flex-col rounded-2xl border transition-all min-h-[520px] p-2.5 ${
              dragOverColumnId === col.id
                ? 'ring-2 ring-amber-500 shadow-md scale-[1.01] ' + (isDarkTheme ? 'bg-amber-950/20 border-amber-500/60' : 'bg-amber-50/80 border-amber-400')
                : isDarkTheme
                ? 'bg-stone-900/60 border-stone-800'
                : 'bg-slate-100/80 border-slate-200/90 shadow-2xs'
            }`}
          >
            {/* Signature Infographic Header with Asymmetric Curve */}
            <div className={`relative mb-3 p-3 rounded-tl-xl rounded-tr-md rounded-bl-sm rounded-br-2xl bg-gradient-to-r ${col.headerGradient} text-white shadow-xs`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight bg-white/20 px-1.5 py-0.5 rounded text-white">
                    {col.stepNumber}
                  </span>
                  <div>
                    <div className="text-[9px] font-extrabold tracking-wider uppercase text-white/80 leading-tight">
                      {col.category}
                    </div>
                    <div className="text-xs font-black tracking-tight text-white leading-tight">
                      {col.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-900 shadow-2xs">
                    {colTasks.length}
                  </span>
                  {onNewTaskWithStatus && (
                    <button
                      onClick={() => onNewTaskWithStatus(col.statuses[0])}
                      className="p-1 text-white/90 hover:text-white hover:bg-white/20 rounded-md transition"
                      title={`Tambah tugas baru di ${col.title}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-2.5 flex-1">
              {colTasks.map(task => {
                const statusInfo = getStatusBadge(task.status);
                const overdue = isOverdue(task.deadline) && task.status !== 'COMPLETED' && task.status !== 'APPROVED';
                
                const checklistTotal = (task.checklist || []).length;
                const checklistDone = (task.checklist || []).filter(c => c.completed).length;

                return (
                  <div
                    key={task.id}
                    id={`task-card-${task.id}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedTaskId(task.id);
                    }}
                    onDragEnd={() => {
                      setDraggedTaskId(null);
                      setDragOverColumnId(null);
                    }}
                    onClick={() => onSelectTask(task)}
                    className={`group border rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden ${
                      draggedTaskId === task.id
                        ? 'opacity-40 scale-[0.98] ring-2 ring-amber-500'
                        : isDarkTheme
                        ? 'bg-stone-900 hover:bg-stone-850 border-stone-800 hover:border-amber-500/50 text-stone-100 shadow-xs'
                        : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md text-slate-900'
                    }`}
                  >
                    {/* Top row: Project color marker & Task code & Priority */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-amber-500 shrink-0 opacity-40 group-hover:opacity-100 transition" />
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: getProjectColor(task.projectId) }} 
                        />
                        <span className="text-[11px] font-mono font-extrabold text-amber-600 tracking-wider">
                          {task.taskCode}
                        </span>
                        {task.projectName && (
                          <span className={`text-[10.5px] truncate max-w-[80px] ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                            • {task.projectName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {task.priority && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-xs font-bold leading-snug line-clamp-2 mb-1.5 transition-colors ${
                      isDarkTheme ? 'text-stone-100 group-hover:text-amber-400' : 'text-slate-900 group-hover:text-amber-600'
                    }`}>
                      {task.title}
                    </h3>

                    {/* Category & Task Type */}
                    {(task.categoryName || task.taskType) && (
                      <div className="text-[10px] text-slate-500 mb-2 flex items-center gap-1 flex-wrap">
                        {task.categoryName && (
                          <span className="bg-slate-100 text-slate-700 font-medium px-1.5 py-0.2 rounded">
                            {task.categoryName}
                          </span>
                        )}
                        {task.taskType && (
                          <span className="text-slate-400 font-medium">
                            {task.taskType}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Creative Deliverable Badges (Figma, Drive, Checklist) */}
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {task.figmaUrl && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-purple-50 border border-purple-200 text-purple-700 rounded text-[9.5px] font-bold">
                          Figma
                        </span>
                      )}
                      {task.assetsUrl && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[9.5px] font-bold">
                          Drive
                        </span>
                      )}
                      {checklistTotal > 0 && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${
                          checklistDone === checklistTotal
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          <ListTodo className="w-2.5 h-2.5" /> {checklistDone}/{checklistTotal}
                        </span>
                      )}
                      {task.specsDimensions && (
                        <span className="text-[9.5px] text-slate-500 font-mono">
                          {task.specsDimensions.split('(')[0].trim()}
                        </span>
                      )}
                    </div>

                    {/* Footer: Assignee, Deadline & Revision Count */}
                    <div className={`flex items-center justify-between pt-2 border-t text-[10.5px] ${
                      isDarkTheme ? 'border-stone-800 text-stone-400' : 'border-slate-100 text-slate-500'
                    }`}>
                      {/* Assignee */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[10px] text-amber-800 font-bold">
                          {task.assignedUserName ? task.assignedUserName[0] : 'U'}
                        </div>
                        <span className={`truncate max-w-[80px] font-medium ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                          {task.assignedUserName || 'Unassigned'}
                        </span>
                      </div>

                      {/* Right info badges */}
                      <div className="flex items-center gap-1.5">
                        {Number(task.revisionCount ?? 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                            <RotateCcw className="w-2.5 h-2.5" />
                            Rev {task.revisionCount}
                          </span>
                        )}

                        {task.deadline && (
                          <span className={`flex items-center gap-1 text-[9.5px] font-mono ${overdue ? 'text-rose-600 font-bold' : isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                            <Calendar className="w-2.5 h-2.5" />
                            {task.deadline.slice(5)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Advance Bar on Hover */}
                    <div 
                      className={`mt-2 pt-1.5 border-t flex items-center justify-end gap-1 ${
                        isDarkTheme ? 'border-stone-800' : 'border-slate-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {task.status === 'DRAFT' && (
                        <button
                          onClick={() => onQuickStatusChange(task.id, 'IN_PROGRESS')}
                          className="px-2 py-0.5 text-[9.5px] font-bold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition flex items-center gap-1"
                        >
                          Mulai Kerja <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => onQuickStatusChange(task.id, 'UNDER_REVIEW')}
                          className="px-2 py-0.5 text-[9.5px] font-bold rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 transition flex items-center gap-1"
                        >
                          Kirim Review <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {(task.status === 'UNDER_REVIEW' || task.status === 'SUBMITTED') && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onQuickStatusChange(task.id, 'REVISION')}
                            className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 transition"
                          >
                            Revisi
                          </button>
                          <button
                            onClick={() => onQuickStatusChange(task.id, 'APPROVED')}
                            className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 transition flex items-center gap-0.5"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" /> Approve
                          </button>
                        </div>
                      )}
                      {task.status === 'REVISION' && (
                        <button
                          onClick={() => onQuickStatusChange(task.id, 'IN_PROGRESS')}
                          className="px-2 py-0.5 text-[9.5px] font-bold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition flex items-center gap-1"
                        >
                          Perbaiki <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {task.status === 'APPROVED' && (
                        <button
                          onClick={() => onQuickStatusChange(task.id, 'COMPLETED')}
                          className="px-2 py-0.5 text-[9.5px] font-bold rounded bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 transition flex items-center gap-0.5"
                        >
                          Selesai <CheckCircle2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className={`h-28 rounded-xl border border-dashed flex flex-col items-center justify-center text-xs text-center p-3 transition-colors ${
                  dragOverColumnId === col.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-bold'
                    : isDarkTheme
                    ? 'border-stone-800 text-stone-500'
                    : 'border-slate-300 text-slate-400'
                }`}>
                  <span>{dragOverColumnId === col.id ? 'Lepaskan kartu untuk memindahkan ke sini' : 'Tidak ada tugas di tahapan ini'}</span>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
