/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  FolderKanban, 
  Tag, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  Sparkles, 
  Send, 
  ListTodo, 
  Link as LinkIcon, 
  Layers, 
  FileText,
  Loader2
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Project, TaskChecklistItem, TaskComment } from '../types';
import { generateSafeId } from '../firebase';

interface TaskDetailDrawerProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate?: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus, revisionNote?: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  isDarkTheme?: boolean;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  projects,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onUpdateTask,
  isDarkTheme = false
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Comment & AI Review state
  const [commentText, setCommentText] = useState('');
  const [isAiReviewLoading, setIsAiReviewLoading] = useState(false);
  const [aiFeedbackDraft, setAiFeedbackDraft] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(task.taskCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyFullBrief = () => {
    if (!task) return;
    const checklistText = (task.checklist || [])
      .map(c => `- [${c.completed ? 'x' : ' '}] ${c.title}`)
      .join('\n');

    const formatted = [
      `🎨 [${task.taskCode}] ${task.title}`,
      `Proyek: ${task.projectName || 'Umum'}`,
      `Kategori: ${task.categoryName || '-'} | Tipe: ${task.taskType || '-'}`,
      `Deadline: ${task.deadline || 'Belum diatur'} | Prioritas: ${task.priority || 'MEDIUM'}`,
      `PIC Desainer: ${task.assignedUserName || 'Belum ditugaskan'}`,
      `Requester: ${task.requester || '-'}`,
      task.specsDimensions ? `Dimensi: ${task.specsDimensions}` : '',
      task.fileFormat ? `Format File: ${task.fileFormat}` : '',
      task.figmaUrl ? `Figma URL: ${task.figmaUrl}` : '',
      task.assetsUrl ? `Assets URL: ${task.assetsUrl}` : '',
      '',
      '📋 CREATIVE BRIEF & INSTRUKSI:',
      task.designBrief || 'Belum ada catatan brief khusus.',
      '',
      task.checklist && task.checklist.length > 0 ? `☑️ MILESTONES / CHECKLIST:\n${checklistText}` : ''
    ].filter(line => Boolean(line)).join('\n');

    navigator.clipboard.writeText(formatted);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  const handleApplyRevision = () => {
    onStatusChange(task.id, 'REVISION', revisionNote);
    setShowRevisionInput(false);
    setRevisionNote('');
  };

  // Toggle checklist item
  const handleToggleChecklist = async (itemId: string) => {
    if (!task.checklist || !onUpdateTask) return;
    const updatedChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await onUpdateTask(task.id, { checklist: updatedChecklist });
  };

  // Add a new comment / feedback thread item
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onUpdateTask) return;

    const newComment: TaskComment = {
      id: generateSafeId('cmt'),
      authorName: 'Creative Team',
      authorRole: 'REVIEWER',
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
      type: 'comment'
    };

    const updatedComments = [...(task.comments || []), newComment];
    await onUpdateTask(task.id, { comments: updatedComments });
    setCommentText('');
  };

  // AI Art Director Feedback Generator
  const handleGenerateAiFeedback = async () => {
    setIsAiReviewLoading(true);
    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_feedback',
          title: task.title,
          brief: task.designBrief || '',
          feedback: revisionNote || commentText || 'Review kualitas desain keseluruhan'
        })
      });

      const data = await res.json();
      if (data.text) {
        setAiFeedbackDraft(data.text);
      }
    } catch (err) {
      console.error('AI Feedback error:', err);
    } finally {
      setIsAiReviewLoading(false);
    }
  };

  const stages: { status: TaskStatus; label: string }[] = [
    { status: 'DRAFT', label: 'Draft' },
    { status: 'ASSIGNED', label: 'Assigned' },
    { status: 'IN_PROGRESS', label: 'In Progress' },
    { status: 'UNDER_REVIEW', label: 'Review' },
    { status: 'APPROVED', label: 'Approved' },
    { status: 'COMPLETED', label: 'Done' }
  ];

  const currentStageIndex = stages.findIndex(s => s.status === task.status);

  const getPriorityStyle = (priority?: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return isDarkTheme
          ? 'bg-rose-500/20 text-rose-300 border-rose-600/40'
          : 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return isDarkTheme
          ? 'bg-amber-500/20 text-amber-300 border-amber-600/40'
          : 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
        return isDarkTheme
          ? 'bg-blue-500/20 text-blue-300 border-blue-600/40'
          : 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return isDarkTheme
          ? 'bg-stone-800 text-stone-400 border-stone-700'
          : 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  // Checklist completion calculation
  const completedSubtasks = (task.checklist || []).filter(c => c.completed).length;
  const totalSubtasks = (task.checklist || []).length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className={`w-full max-w-2xl border-l h-full flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className={`p-5 border-b flex items-start justify-between gap-4 transition-colors ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <button
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded border transition ${
                  isDarkTheme 
                    ? 'bg-stone-900 border-stone-800 text-amber-400 hover:bg-stone-800' 
                    : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
                title="Salin kode tugas"
              >
                {task.taskCode}
                {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>

              {task.priority && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
              )}

              {task.status === 'REVISION' && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> REVISION REQUIRED ({task.revisionCount ?? 1}x)
                </span>
              )}

              {task.status === 'APPROVED' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> APPROVED
                </span>
              )}
            </div>

            <h2 className={`text-lg font-bold tracking-tight leading-snug ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
              {task.title}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(task)}
                title="Duplikat tugas ini sebagai template baru"
                className={`p-2 rounded-lg transition ${
                  isDarkTheme ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-200'
                }`}
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(task)}
              title="Edit Task Data"
              className={`p-2 rounded-lg transition ${
                isDarkTheme ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close Drawer (Esc)"
              className={`p-2 rounded-lg transition ${
                isDarkTheme ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Workflow Stepper */}
          <div className={`border rounded-xl p-4 ${
            isDarkTheme ? 'bg-stone-950 border-stone-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider mb-3">
              <span className={isDarkTheme ? 'text-stone-400' : 'text-slate-500'}>Alur Progres Desain (5-Step Studio Pipeline)</span>
              <span className="text-amber-500 font-bold">{task.status.replace('_', ' ')}</span>
            </div>
            
            <div className="grid grid-cols-6 gap-1 relative">
              {stages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = task.status === stage.status || (task.status === 'REVISION' && stage.status === 'UNDER_REVIEW') || (task.status === 'SUBMITTED' && stage.status === 'IN_PROGRESS');

                return (
                  <button
                    key={stage.status}
                    onClick={() => onStatusChange(task.id, stage.status)}
                    className="flex flex-col items-center group text-center"
                    title={`Pindahkan status ke ${stage.label}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition mb-1 ${
                      isCurrent
                        ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400/40 shadow-xs'
                        : isPassed
                        ? isDarkTheme ? 'bg-stone-800 text-stone-200 group-hover:bg-stone-700' : 'bg-slate-200 text-slate-800 group-hover:bg-slate-300'
                        : isDarkTheme ? 'bg-stone-900 border border-stone-800 text-stone-600' : 'bg-white border border-slate-300 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] truncate max-w-full font-medium ${
                      isCurrent 
                        ? 'text-amber-500 font-bold' 
                        : isPassed 
                        ? isDarkTheme ? 'text-stone-300' : 'text-slate-700' 
                        : isDarkTheme ? 'text-stone-600' : 'text-slate-400'
                    }`}>
                      {stage.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review & Approval Action Bar */}
          <div className={`border rounded-xl p-4 shadow-xs ${
            isDarkTheme ? 'bg-stone-950/80 border-amber-500/20' : 'bg-amber-50/60 border-amber-200'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                Aksi Workflow Cepat
              </span>
              <span className={`text-[11px] ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                Tahap: <strong className="text-amber-500 font-bold">{task.status.replace('_', ' ')}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {task.status === 'DRAFT' && (
                <button
                  onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  Mulai Pengerjaan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {task.status === 'ASSIGNED' && (
                <button
                  onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  Mulai Pengerjaan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => onStatusChange(task.id, 'UNDER_REVIEW')}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  Kirim untuk Review <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {(task.status === 'UNDER_REVIEW' || task.status === 'SUBMITTED') && (
                <>
                  <button
                    onClick={() => onStatusChange(task.id, 'APPROVED')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Setujui Desain (Approve)
                  </button>
                  <button
                    onClick={() => setShowRevisionInput(!showRevisionInput)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border ${
                      isDarkTheme 
                        ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800' 
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" /> Minta Revisi Desain
                  </button>
                </>
              )}

              {task.status === 'REVISION' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Kerjakan Revisi
                  </button>
                  <button
                    onClick={() => onStatusChange(task.id, 'APPROVED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Setujui Langsung
                  </button>
                </div>
              )}

              {task.status === 'APPROVED' && (
                <button
                  onClick={() => onStatusChange(task.id, 'COMPLETED')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesaikan Tugas (Complete)
                </button>
              )}
            </div>

            {/* Revision feedback input drawer */}
            {showRevisionInput && (
              <div className={`mt-4 p-3.5 rounded-xl border animate-in slide-in-from-top-2 space-y-2.5 ${
                isDarkTheme ? 'bg-stone-900 border-rose-900/60' : 'bg-white border-rose-300 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Poin & Instruksi Revisi Desain:
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiFeedback}
                    disabled={isAiReviewLoading}
                    className="text-[11px] text-amber-500 hover:text-amber-600 font-semibold flex items-center gap-1"
                  >
                    {isAiReviewLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Draft saran revisi dengan AI
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Tuliskan spesifik perbaikan (misal: sesuaikan hierarchy judul, kontras warna background, margin padding, atau legal disclaimer)..."
                  className={`w-full border text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-relaxed ${
                    isDarkTheme 
                      ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />

                {aiFeedbackDraft && (
                  <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    isDarkTheme ? 'bg-stone-950 border-amber-500/30 text-stone-300' : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}>
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-600">
                      <span>✨ Rekomendasi Art Director AI</span>
                      <button
                        type="button"
                        onClick={() => {
                          setRevisionNote(prev => prev ? `${prev}\n\n${aiFeedbackDraft}` : aiFeedbackDraft);
                          setAiFeedbackDraft(null);
                        }}
                        className="text-amber-600 hover:underline text-[10px]"
                      >
                        Gunakan Teks Ini
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-line">
                      {aiFeedbackDraft}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowRevisionInput(false)}
                    className={`px-3 py-1 text-xs ${isDarkTheme ? 'text-stone-400 hover:text-stone-200' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleApplyRevision}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Kirim Permintaan Revisi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Deliverable Links & Specifications */}
          {(task.figmaUrl || task.assetsUrl || task.specsDimensions || task.fileFormat) && (
            <div className="space-y-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDarkTheme ? 'text-stone-400' : 'text-slate-600'
              }`}>
                <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
                Asset Deliverables & Spesifikasi Desain
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Figma Action Card */}
                {task.figmaUrl && (
                  <a
                    href={task.figmaUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`flex items-center justify-between p-3 border rounded-xl group transition ${
                      isDarkTheme 
                        ? 'bg-stone-950 border-stone-800 hover:border-purple-500/50' 
                        : 'bg-slate-50 border-slate-200 hover:border-purple-400 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 font-bold text-xs">
                        F
                      </div>
                      <div>
                        <span className={`text-xs font-bold transition block ${
                          isDarkTheme ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-700'
                        }`}>
                          Buka di Figma
                        </span>
                        <span className={`text-[10px] block truncate max-w-[180px] ${
                          isDarkTheme ? 'text-stone-500' : 'text-slate-400'
                        }`}>
                          {task.figmaUrl}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition" />
                  </a>
                )}

                {/* Cloud Assets Action Card */}
                {task.assetsUrl && (
                  <a
                    href={task.assetsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`flex items-center justify-between p-3 border rounded-xl group transition ${
                      isDarkTheme 
                        ? 'bg-stone-950 border-stone-800 hover:border-blue-500/50' 
                        : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-xs">
                        📁
                      </div>
                      <div>
                        <span className={`text-xs font-bold transition block ${
                          isDarkTheme ? 'text-white group-hover:text-blue-300' : 'text-slate-900 group-hover:text-blue-700'
                        }`}>
                          Folder Aset Digital
                        </span>
                        <span className={`text-[10px] block truncate max-w-[180px] ${
                          isDarkTheme ? 'text-stone-500' : 'text-slate-400'
                        }`}>
                          {task.assetsUrl}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                  </a>
                )}

                {/* Dimensions */}
                {task.specsDimensions && (
                  <div className={`p-3 border rounded-xl ${
                    isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Dimensi / Ratio</span>
                    <span className={`text-xs font-semibold mt-0.5 block ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                      {task.specsDimensions}
                    </span>
                  </div>
                )}

                {/* Formats */}
                {task.fileFormat && (
                  <div className={`p-3 border rounded-xl ${
                    isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Format Output</span>
                    <span className={`text-xs font-semibold mt-0.5 block ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                      {task.fileFormat}
                    </span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Subtask Milestone Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkTheme ? 'text-stone-400' : 'text-slate-600'
                }`}>
                  <ListTodo className="w-3.5 h-3.5 text-amber-500" />
                  Milestone Subtasks ({completedSubtasks}/{totalSubtasks})
                </h3>
                <span className="text-[11px] font-mono font-bold text-amber-500">
                  {progressPercent}% Selesai
                </span>
              </div>

              {/* Progress bar */}
              <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-200 border-slate-300'
              }`}>
                <div 
                  className="h-full bg-amber-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className={`space-y-1.5 border rounded-xl p-3 ${
                isDarkTheme ? 'bg-stone-950 border-stone-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                {task.checklist.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs select-none ${
                      isDarkTheme ? 'hover:bg-stone-900/80' : 'hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}} // Handled by parent label click
                      className="rounded border-slate-400 text-amber-500 focus:ring-amber-500/30"
                    />
                    <span className={item.completed ? 'line-through text-slate-400' : isDarkTheme ? 'text-stone-200 font-medium' : 'text-slate-800 font-medium'}>
                      {item.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Design Brief Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDarkTheme ? 'text-stone-400' : 'text-slate-600'
              }`}>
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Creative Design Brief & Instruksi Visual
              </h3>
              <button
                type="button"
                onClick={handleCopyFullBrief}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                  isDarkTheme 
                    ? 'border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300' 
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="Salin brief lengkap beserta spesifikasi & checklist ke clipboard"
              >
                {copiedBrief ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-amber-500" />
                    <span>Salin Format Brief</span>
                  </>
                )}
              </button>
            </div>
            <div className={`border rounded-xl p-4 text-xs leading-relaxed whitespace-pre-line font-sans ${
              isDarkTheme ? 'bg-stone-950 border-stone-800/80 text-stone-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              {task.designBrief || 'Belum ada detail brief untuk tugas ini.'}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDarkTheme ? 'text-stone-400' : 'text-slate-600'
            }`}>
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              Detail Produksi & Penugasan
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Project</span>
                <span className={`text-xs font-semibold truncate block mt-0.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  {task.projectName || 'Unassigned'}
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Kategori</span>
                <span className={`text-xs font-semibold truncate block mt-0.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  {task.categoryName || 'Standard'}
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Tipe Asset</span>
                <span className={`text-xs font-semibold truncate block mt-0.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  {task.taskType || 'Creative Asset'}
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Desainer / Assignee</span>
                <span className={`text-xs font-semibold truncate block mt-0.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  {task.assignedUserName || 'Belum ada'}
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Requester</span>
                <span className={`text-xs font-semibold truncate block mt-0.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  {task.requester || 'Agency Team'}
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Deadline</span>
                <span className={`text-xs font-semibold truncate block mt-0.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  {task.deadline || 'Tidak ada batas'}
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Siklus Revisi</span>
                <span className="text-xs font-semibold text-amber-500 block mt-0.5">
                  {task.revisionCount ?? 0} siklus
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Tanggal Dibuat</span>
                <span className={`text-xs font-semibold block mt-0.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  {task.createdDate || 'Baru'}
                </span>
              </div>

              <div className={`border p-3 rounded-lg ${isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase font-medium ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>Sinkronisasi</span>
                <span className={`text-xs font-semibold block mt-0.5 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString() : 'Baru saja'}
                </span>
              </div>

            </div>
          </div>

          {/* Activity / Feedback Thread */}
          <div className="space-y-3 pt-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDarkTheme ? 'text-stone-400' : 'text-slate-600'
            }`}>
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              Diskusi & Catatan Feedback ({task.comments?.length || 0})
            </h3>

            {/* Comment List */}
            <div className="space-y-2.5">
              {(task.comments || []).map((c) => (
                <div 
                  key={c.id} 
                  className={`p-3 rounded-xl border text-xs ${
                    c.type === 'revision'
                      ? isDarkTheme ? 'bg-rose-950/40 border-rose-900/60' : 'bg-rose-50 border-rose-200'
                      : c.type === 'approval'
                      ? isDarkTheme ? 'bg-emerald-950/40 border-emerald-900/60' : 'bg-emerald-50 border-emerald-200'
                      : isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isDarkTheme ? 'text-stone-200' : 'text-slate-900'}`}>{c.authorName}</span>
                      {c.type === 'revision' && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300">
                          REVISI
                        </span>
                      )}
                      {c.type === 'approval' && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                          APPROVED
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                    {c.text}
                  </p>
                </div>
              ))}

              {(!task.comments || task.comments.length === 0) && (
                <div className={`text-center py-5 text-xs rounded-xl border ${
                  isDarkTheme ? 'text-stone-500 bg-stone-950/50 border-stone-800/60' : 'text-slate-400 bg-slate-50 border-slate-200'
                }`}>
                  Belum ada catatan diskusi atau review. Kirim pesan di bawah.
                </div>
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tambahkan catatan review atau tanggapan..."
                className={`flex-1 border text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkTheme ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" /> Kirim
              </button>
            </form>

          </div>

          {/* Delete confirmation section */}
          <div className={`pt-4 border-t ${isDarkTheme ? 'border-stone-800' : 'border-slate-200'}`}>
            {confirmDelete ? (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg flex items-center justify-between gap-3">
                <span className="text-xs text-rose-800 font-medium">Yakin hapus permanen tugas kreatif ini?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className={`text-xs flex items-center gap-1.5 transition ${
                  isDarkTheme ? 'text-stone-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus tugas kreatif ini
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
