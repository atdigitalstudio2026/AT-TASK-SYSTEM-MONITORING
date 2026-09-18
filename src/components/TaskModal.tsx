/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Sparkles, 
  Check, 
  Calendar, 
  User, 
  Tag, 
  FolderKanban,
  FileText,
  Link,
  ListTodo,
  Trash2,
  ExternalLink,
  Layers,
  Wand2,
  Loader2,
  Palette
} from 'lucide-react';
import { Task, Project, Category, TaskPriority, TaskStatus, UserProfile, TaskChecklistItem } from '../types';
import { generateSafeId } from '../firebase';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
  editingTask: Task | null;
  projects: Project[];
  categories: Category[];
  users: UserProfile[];
  totalTasksCount: number;
  isDarkTheme?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  projects,
  categories,
  users,
  totalTasksCount,
  isDarkTheme = false
}) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'deliverables' | 'checklist'>('brief');
  const [title, setTitle] = useState('');
  const [taskCode, setTaskCode] = useState('');
  const [projectId, setProjectId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [taskType, setTaskType] = useState('Key Visual');
  const [requester, setRequester] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('DRAFT');
  const [deadline, setDeadline] = useState('');
  const [designBrief, setDesignBrief] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [assetsUrl, setAssetsUrl] = useState('');
  const [specsDimensions, setSpecsDimensions] = useState('');
  const [fileFormat, setFileFormat] = useState('Figma + PNG/SVG');
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setTaskCode(editingTask.taskCode);
      setProjectId(editingTask.projectId);
      setCategoryId(editingTask.categoryId || '');
      setTaskType(editingTask.taskType || 'Key Visual');
      setRequester(editingTask.requester || '');
      setAssignedUserId(editingTask.assignedUserId || '');
      setPriority(editingTask.priority || 'MEDIUM');
      setStatus(editingTask.status || 'DRAFT');
      setDeadline(editingTask.deadline || '');
      setDesignBrief(editingTask.designBrief || '');
      setFigmaUrl(editingTask.figmaUrl || '');
      setAssetsUrl(editingTask.assetsUrl || '');
      setSpecsDimensions(editingTask.specsDimensions || '');
      setFileFormat(editingTask.fileFormat || 'Figma + PNG/SVG');
      setChecklist(editingTask.checklist || []);
    } else {
      setTitle('');
      const nextNum = 101 + totalTasksCount;
      setTaskCode(`AT-${nextNum}`);
      setProjectId(projects[0]?.id || 'proj_aura_brand');
      setCategoryId(categories[0]?.id || 'cat_brand_id');
      setTaskType('Key Visual');
      setRequester('Art Direction Lead');
      setAssignedUserId(users[0]?.id || '');
      setPriority('MEDIUM');
      setStatus('DRAFT');
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDeadline(nextWeek.toISOString().split('T')[0]);
      setDesignBrief('');
      setFigmaUrl('');
      setAssetsUrl('');
      setSpecsDimensions('1080x1350 (IG Feed) & 1080x1920 (Story)');
      setFileFormat('Figma + WebP (sRGB)');
      setChecklist([
        { id: generateSafeId('chk'), title: 'Moodboard & visual references', completed: false },
        { id: generateSafeId('chk'), title: 'Rough concept layout & typography grid', completed: false },
        { id: generateSafeId('chk'), title: 'High-fidelity design execution in Figma', completed: false },
        { id: generateSafeId('chk'), title: 'Export final assets package', completed: false }
      ]);
    }
    setErrorMsg(null);
    setAiMessage(null);
    setActiveTab('brief');
  }, [editingTask, isOpen, projects, categories, users, totalTasksCount]);

  if (!isOpen) return null;

  // AI Brief Enhancer trigger
  const handleEnhanceBriefWithAi = async () => {
    if (!title.trim() && !designBrief.trim()) {
      setErrorMsg('Mohon isi Judul Tugas atau catatan singkat sebelum meminta saran AI.');
      return;
    }
    setIsAiLoading(true);
    setAiMessage(null);
    try {
      const selectedCat = categories.find(c => c.id === categoryId)?.name || 'Design';
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance_brief',
          title,
          brief: designBrief,
          category: selectedCat,
          requester,
          taskType
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI assist error');
      }

      if (data.text) {
        setDesignBrief(data.text);
        setAiMessage('✨ Creative Brief berhasil disempurnakan oleh Gemini AI!');
        setTimeout(() => setAiMessage(null), 4000);
      }
    } catch (err: any) {
      console.warn('AI error:', err);
      setErrorMsg(err.message || 'Gagal menyempurnakan brief dengan AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Checklist Generator trigger
  const handleGenerateChecklistWithAi = async () => {
    setIsAiLoading(true);
    setAiMessage(null);
    try {
      const selectedCat = categories.find(c => c.id === categoryId)?.name || 'Design';
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_checklist',
          title: title || 'Desain Kreatif',
          brief: designBrief,
          category: selectedCat,
          taskType
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI assist error');
      }

      if (Array.isArray(data.checklist) && data.checklist.length > 0) {
        const newItems: TaskChecklistItem[] = data.checklist.map((item: string) => ({
          id: generateSafeId('chk'),
          title: item,
          completed: false
        }));
        setChecklist(newItems);
        setActiveTab('checklist');
        setAiMessage('✨ 5 subtasks checklist berhasil digenerate otomatis!');
        setTimeout(() => setAiMessage(null), 4000);
      }
    } catch (err: any) {
      console.warn('AI Checklist error:', err);
      setErrorMsg(err.message || 'Gagal membuat checklist otomatis.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Palette & Visual Direction generator
  const handleGeneratePaletteAndDirection = async () => {
    if (!title.trim() && !designBrief.trim()) {
      setErrorMsg('Mohon isi Judul Tugas atau catatan singkat terlebih dahulu.');
      return;
    }
    setIsAiLoading(true);
    setAiMessage(null);
    try {
      const selectedCat = categories.find(c => c.id === categoryId)?.name || 'Design';
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_palette_and_specs',
          title,
          brief: designBrief,
          category: selectedCat,
          taskType
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan panduan warna');
      }

      if (data.text) {
        setDesignBrief(prev => prev ? `${prev}\n\n--- 🎨 REKOMENDASI PALET & VISUAL DIRECTION (AI) ---\n${data.text}` : data.text);
        setAiMessage('🎨 Rekomendasi Palet Warna & Visual Direction berhasil disisipkan ke brief!');
        setTimeout(() => setAiMessage(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat rekomendasi palet.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist(prev => [
      ...prev,
      { id: generateSafeId('chk'), title: newChecklistText.trim(), completed: false }
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Mohon isi Judul Tugas / Task Title.');
      return;
    }
    if (!projectId) {
      setErrorMsg('Mohon pilih Project / Brand.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedProject = projects.find(p => p.id === projectId);
    const selectedCategory = categories.find(c => c.id === categoryId);
    const selectedUser = users.find(u => u.id === assignedUserId);

    const taskPayload: Task = {
      id: editingTask ? editingTask.id : generateSafeId('task'),
      taskCode: taskCode.trim() || `AT-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim().slice(0, 256),
      projectId,
      projectName: selectedProject?.name || 'Default Project',
      categoryId: categoryId || undefined,
      categoryName: selectedCategory?.name || undefined,
      taskType: taskType || undefined,
      requester: requester.trim() || undefined,
      assignedUserId: assignedUserId || undefined,
      assignedUserName: selectedUser?.name || undefined,
      priority,
      status,
      deadline: deadline || undefined,
      designBrief: designBrief.trim().slice(0, 5000) || undefined,
      figmaUrl: figmaUrl.trim() || undefined,
      assetsUrl: assetsUrl.trim() || undefined,
      specsDimensions: specsDimensions.trim() || undefined,
      fileFormat: fileFormat.trim() || undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
      comments: editingTask?.comments || [],
      revisionCount: editingTask ? editingTask.revisionCount ?? 0 : 0,
      createdDate: editingTask?.createdDate || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    try {
      await onSave(taskPayload);
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setErrorMsg('Gagal menyimpan tugas ke Firestore. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = isDarkTheme
    ? 'w-full bg-stone-950 border border-stone-800 text-stone-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500'
    : 'w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20';

  const selectClass = isDarkTheme
    ? 'w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500'
    : 'w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20';

  const labelClass = isDarkTheme
    ? 'block text-xs font-semibold text-stone-300 mb-1'
    : 'block text-xs font-semibold text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div 
        className={`border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between transition-colors ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-sm">
              AT
            </div>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                {editingTask ? `Edit Task (${editingTask.taskCode})` : 'Create Creative Task Brief'}
              </h2>
              <p className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                Lengkapi spesifikasi, deliverable assets, dan instruksi workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDarkTheme ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {errorMsg && (
            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              isDarkTheme ? 'bg-rose-950/80 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              <span>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:opacity-80">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {aiMessage && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              isDarkTheme ? 'bg-amber-950/70 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{aiMessage}</span>
            </div>
          )}

          {/* Primary Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Task Code */}
            <div>
              <label className={labelClass}>
                Task Code
              </label>
              <input
                type="text"
                value={taskCode}
                onChange={(e) => setTaskCode(e.target.value)}
                placeholder="AT-101"
                className={`w-full font-mono text-xs rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-amber-500 border ${
                  isDarkTheme 
                    ? 'bg-stone-950 border-stone-800 text-amber-400' 
                    : 'bg-slate-50 border-slate-300 text-amber-700'
                }`}
              />
            </div>

            {/* Task Title */}
            <div className="md:col-span-3">
              <label className={labelClass}>
                Task Title <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aura Fall Lookbook Key Visuals & Typography Grid"
                className={`${inputClass} font-medium`}
              />
            </div>

          </div>

          {/* Project, Category, Type, Assignee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Project */}
            <div>
              <label className={labelClass}>
                Project / Brand <span className="text-amber-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={selectClass}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectClass}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Task Type */}
            <div>
              <label className={labelClass}>
                Task Asset Type
              </label>
              <input
                type="text"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                placeholder="Key Visual, Packaging, 3D..."
                className={inputClass}
              />
            </div>

            {/* Assigned Member */}
            <div>
              <label className={labelClass}>
                Assignee
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

          </div>

          {/* Priority, Status, Requester, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Priority */}
            <div>
              <label className={labelClass}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={selectClass}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={selectClass}
              >
                <option value="DRAFT">01. Draft</option>
                <option value="ASSIGNED">01. Assigned</option>
                <option value="IN_PROGRESS">02. In Progress</option>
                <option value="SUBMITTED">03. Submitted</option>
                <option value="UNDER_REVIEW">03. Under Review</option>
                <option value="REVISION">04. Revision Required</option>
                <option value="APPROVED">05. Approved</option>
                <option value="COMPLETED">05. Completed</option>
              </select>
            </div>

            {/* Requester */}
            <div>
              <label className={labelClass}>
                Requester / Client
              </label>
              <input
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                placeholder="e.g. Marketing VP"
                className={inputClass}
              />
            </div>

            {/* Deadline */}
            <div>
              <label className={labelClass}>
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputClass}
              />
            </div>

          </div>

          {/* Sub-Section Navigation Tabs */}
          <div className={`flex border-b gap-4 pt-2 ${isDarkTheme ? 'border-stone-800' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setActiveTab('brief')}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition border-b-2 ${
                activeTab === 'brief'
                  ? 'border-amber-500 text-amber-500'
                  : isDarkTheme ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Creative Brief & AI Assist
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deliverables')}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition border-b-2 ${
                activeTab === 'deliverables'
                  ? 'border-amber-500 text-amber-500'
                  : isDarkTheme ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              Deliverables & Specs
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition border-b-2 ${
                activeTab === 'checklist'
                  ? 'border-amber-500 text-amber-500'
                  : isDarkTheme ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Checklist Subtasks ({checklist.length})
            </button>
          </div>

          {/* TAB 1: Creative Brief & AI Assist */}
          {activeTab === 'brief' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className={labelClass}>
                  Design Brief & Creative Specifications
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGeneratePaletteAndDirection}
                    disabled={isAiLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition border disabled:opacity-50 ${
                      isDarkTheme 
                        ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30' 
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300'
                    }`}
                    title="Dapatkan rekomendasi palet warna & font pairing"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>AI Color & Direction</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEnhanceBriefWithAi}
                    disabled={isAiLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition border disabled:opacity-50 ${
                      isDarkTheme 
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                    title="Otomatis rapikan brief dengan struktur standar agensi desain AT"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>AI Enhance Brief</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={6}
                value={designBrief}
                onChange={(e) => setDesignBrief(e.target.value)}
                placeholder="Tuliskan objektif kampanye, visual references, copy mandatory, mood, dan preferensi estetika..."
                className={`w-full text-xs rounded-xl p-3.5 focus:outline-none focus:border-amber-500 leading-relaxed font-sans border ${
                  isDarkTheme 
                    ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-amber-500/20'
                }`}
              />
            </div>
          )}

          {/* TAB 2: Deliverables & Specifications */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Figma Link */}
                <div>
                  <label className={labelClass}>
                    Figma Project / File URL
                  </label>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://figma.com/file/..."
                    className={inputClass}
                  />
                  <span className={`text-[10px] mt-1 block ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>
                    Link langsung ke artboard atau prototype kerja
                  </span>
                </div>

                {/* Assets Folder Link */}
                <div>
                  <label className={labelClass}>
                    Cloud Assets Folder (Drive / Dropbox)
                  </label>
                  <input
                    type="url"
                    value={assetsUrl}
                    onChange={(e) => setAssetsUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className={inputClass}
                  />
                  <span className={`text-[10px] mt-1 block ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>
                    Folder foto mentah, font file, atau render video
                  </span>
                </div>

                {/* Specs & Dimensions */}
                <div>
                  <label className={labelClass}>
                    Dimensions & Aspect Ratio
                  </label>
                  <input
                    type="text"
                    value={specsDimensions}
                    onChange={(e) => setSpecsDimensions(e.target.value)}
                    placeholder="1080x1350 (IG Feed), 1920x1080 (Web), A4..."
                    className={inputClass}
                  />
                </div>

                {/* Export File Format */}
                <div>
                  <label className={labelClass}>
                    Export Output Formats
                  </label>
                  <input
                    type="text"
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    placeholder="Figma + PNG (sRGB), PDF CMYK 300DPI, MP4..."
                    className={inputClass}
                  />
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Checklist Subtasks */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                  Pecah tugas kreatif menjadi milestone pengerjaan praktis
                </span>
                <button
                  type="button"
                  onClick={handleGenerateChecklistWithAi}
                  disabled={isAiLoading}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition border disabled:opacity-50 ${
                    isDarkTheme 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                  title="Generate otomatis langkah-langkah desain dengan AI"
                >
                  {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  <span>Auto-Generate with AI</span>
                </button>
              </div>

              {/* Add item input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Tambahkan subtask (misal: Moodboard, Wireframe, Feedback review)..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-1 ${
                    isDarkTheme 
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              {/* Subtasks list */}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-2.5 border rounded-lg group ${
                      isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <label className={`flex items-center gap-2.5 text-xs cursor-pointer flex-1 ${
                      isDarkTheme ? 'text-stone-300' : 'text-slate-800'
                    }`}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklistItem(item.id)}
                        className="rounded border-slate-400 text-amber-500 focus:ring-amber-500/30"
                      />
                      <span className={item.completed ? 'line-through text-slate-400' : 'font-medium'}>
                        {item.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded opacity-60 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {checklist.length === 0 && (
                  <div className={`p-6 text-center text-xs border border-dashed rounded-xl ${
                    isDarkTheme ? 'text-stone-500 border-stone-800' : 'text-slate-400 border-slate-300'
                  }`}>
                    Belum ada subtask checklist. Tambahkan secara manual atau klik "Auto-Generate with AI".
                  </div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 transition-colors ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-medium transition ${
              isDarkTheme ? 'text-stone-400 hover:text-stone-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{editingTask ? 'Perbarui Task' : 'Buat Task Baru'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
