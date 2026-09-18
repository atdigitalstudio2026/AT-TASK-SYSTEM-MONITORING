/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  X, 
  Download, 
  Flame, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  Kanban, 
  Table as TableIcon,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Printer,
  FileText
} from 'lucide-react';
import { FilterState, Project, Category, Task, UserProfile } from '../types';

interface TaskFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  projects: Project[];
  categories: Category[];
  users?: UserProfile[];
  totalResults: number;
  tasksToExport?: Task[];
  onOpenReport?: () => void;
  isDarkTheme?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  setFilters,
  projects,
  categories,
  users = [],
  totalResults,
  tasksToExport = [],
  onOpenReport,
  isDarkTheme = false
}) => {
  const hasActiveFilters = Boolean(
    filters.search || 
    filters.projectId || 
    filters.categoryId || 
    filters.priority || 
    filters.status ||
    filters.assignedUserId
  );

  const handleResetFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: '',
      projectId: '',
      categoryId: '',
      priority: '',
      status: '',
      assignedUserId: ''
    }));
  };

  const handleQuickPreset = (type: 'all' | 'review' | 'revision' | 'urgent' | 'approved') => {
    setFilters(prev => {
      const reset = {
        ...prev,
        search: '',
        projectId: '',
        categoryId: '',
        priority: '',
        status: '',
        assignedUserId: ''
      };
      switch (type) {
        case 'review':
          return { ...reset, status: 'UNDER_REVIEW' };
        case 'revision':
          return { ...reset, status: 'REVISION' };
        case 'urgent':
          return { ...reset, priority: 'URGENT' };
        case 'approved':
          return { ...reset, status: 'APPROVED' };
        default:
          return reset;
      }
    });
  };

  const handleExportCSV = () => {
    const list = tasksToExport.length > 0 ? tasksToExport : [];
    if (list.length === 0) return;

    const headers = [
      'Task Code',
      'Title',
      'Project',
      'Category',
      'Status',
      'Priority',
      'Assignee',
      'Requester',
      'Deadline',
      'Dimensions',
      'Format',
      'Figma URL',
      'Revisions',
      'Brief'
    ];

    const escapeCSV = (str?: string | number) => {
      if (str === undefined || str === null) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = list.map(t => [
      escapeCSV(t.taskCode),
      escapeCSV(t.title),
      escapeCSV(t.projectName),
      escapeCSV(t.categoryName),
      escapeCSV(t.status),
      escapeCSV(t.priority),
      escapeCSV(t.assignedUserName),
      escapeCSV(t.requester),
      escapeCSV(t.deadline),
      escapeCSV(t.specsDimensions),
      escapeCSV(t.fileFormat),
      escapeCSV(t.figmaUrl),
      escapeCSV(t.revisionCount ?? 0),
      escapeCSV(t.designBrief)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AT-Studio-Tasks-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`border rounded-2xl p-3.5 space-y-3 mb-6 transition-all ${
      isDarkTheme 
        ? 'bg-stone-900 border-stone-800 shadow-xs' 
        : 'bg-white border-slate-200 shadow-xs'
    }`}>
      
      {/* Top row: Search input + View Mode Switch + CSV Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="task-search-input"
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Cari kode (AT-101), judul karya, brief, atau requester..."
            className={`w-full text-xs rounded-xl pl-9 pr-14 py-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
              isDarkTheme
                ? 'bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:border-amber-500'
                : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500'
            }`}
          />
          {filters.search ? (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border pointer-events-none ${
              isDarkTheme ? 'border-stone-800 bg-stone-900 text-stone-400' : 'border-slate-200 bg-white text-slate-400'
            }`}>
              ⌘K
            </span>
          )}
        </div>

        {/* View Mode Switch & Export Tools */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          
          {/* Results Counter */}
          <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">
            <strong className="text-amber-600 font-mono text-sm">{totalResults}</strong> tasks
          </span>

          {/* Kanban / Table / Calendar Toggle */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'kanban' }))}
              className={`px-2.5 py-1 rounded-lg transition text-xs flex items-center gap-1.5 font-bold ${
                filters.viewMode === 'kanban'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'table' }))}
              className={`px-2.5 py-1 rounded-lg transition text-xs flex items-center gap-1.5 font-bold ${
                filters.viewMode === 'table'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'calendar' }))}
              className={`px-2.5 py-1 rounded-lg transition text-xs flex items-center gap-1.5 font-bold ${
                filters.viewMode === 'calendar'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Calendar Deadline View"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kalender</span>
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            title="Download CSV dari daftar tugas ini"
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
              isDarkTheme
                ? 'bg-stone-800 text-stone-200 hover:bg-stone-700 border-stone-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Studio Production Report & Print */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              title="Buka Laporan Eksekutif & Format Cetak / Simpan PDF"
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laporan & Cetak</span>
            </button>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition flex items-center gap-1 font-bold"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}

        </div>

      </div>

      {/* Quick Chips & Dropdowns */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${
        isDarkTheme ? 'border-stone-800' : 'border-slate-100'
      }`}>
        
        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 mr-1">Filter Cepat:</span>
          
          <button
            onClick={() => handleQuickPreset('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              !filters.status && !filters.priority 
                ? 'bg-amber-500 text-white shadow-xs' 
                : isDarkTheme ? 'bg-stone-800 text-stone-400 hover:text-stone-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>

          <button
            onClick={() => handleQuickPreset('review')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filters.status === 'UNDER_REVIEW' 
                ? 'bg-teal-600 text-white shadow-xs' 
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            <Clock className="w-3 h-3" /> Butuh Review
          </button>

          <button
            onClick={() => handleQuickPreset('revision')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filters.status === 'REVISION' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <RotateCcw className="w-3 h-3 text-blue-600" /> Perlu Revisi
          </button>

          <button
            onClick={() => handleQuickPreset('urgent')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filters.priority === 'URGENT' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-500" /> Urgent
          </button>

          <button
            onClick={() => handleQuickPreset('approved')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filters.status === 'APPROVED' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-purple-600" /> Approved
          </button>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Project */}
          <select
            value={filters.projectId}
            onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
            className={`text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:border-amber-500 ${
              isDarkTheme
                ? 'bg-stone-950 border border-stone-800 text-stone-200'
                : 'bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <option value="">Semua Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
            className={`text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:border-amber-500 ${
              isDarkTheme
                ? 'bg-stone-950 border border-stone-800 text-stone-200'
                : 'bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={`text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:border-amber-500 ${
              isDarkTheme
                ? 'bg-stone-950 border border-stone-800 text-stone-200'
                : 'bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">01. Draft</option>
            <option value="ASSIGNED">01. Assigned</option>
            <option value="IN_PROGRESS">02. In Progress</option>
            <option value="SUBMITTED">03. Submitted</option>
            <option value="UNDER_REVIEW">03. Under Review</option>
            <option value="REVISION">04. Revision</option>
            <option value="APPROVED">05. Approved</option>
            <option value="COMPLETED">05. Completed</option>
          </select>

          {/* Priority */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className={`text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:border-amber-500 ${
              isDarkTheme
                ? 'bg-stone-950 border border-stone-800 text-stone-200'
                : 'bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <option value="">Semua Prioritas</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignee / Designer */}
          {users.length > 0 && (
            <select
              value={filters.assignedUserId}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedUserId: e.target.value }))}
              className={`text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:border-amber-500 ${
                filters.assignedUserId 
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold' 
                  : isDarkTheme
                    ? 'bg-stone-950 border border-stone-800 text-stone-200'
                    : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              <option value="">Semua Desainer</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.role === 'DESIGNER' ? '(Desainer)' : ''}
                </option>
              ))}
            </select>
          )}

        </div>

      </div>

    </div>
  );
};
