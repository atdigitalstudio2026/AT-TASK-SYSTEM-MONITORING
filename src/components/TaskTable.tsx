/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  RotateCcw, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Download, 
  AlertCircle,
  Copy
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Project } from '../types';

interface TaskTableProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask?: (task: Task) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onBatchStatusChange?: (taskIds: string[], newStatus: TaskStatus) => void;
  onBatchDelete?: (taskIds: string[]) => void;
  isDarkTheme?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  projects,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onQuickStatusChange,
  onBatchStatusChange,
  onBatchDelete,
  isDarkTheme = false
}) => {
  const [sortField, setSortField] = useState<keyof Task>('deadline');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const toggleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleSelectTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(t => t.id));
    }
  };

  const handleBatchStatus = (newStatus: TaskStatus) => {
    if (onBatchStatusChange) {
      onBatchStatusChange(selectedTaskIds, newStatus);
    } else {
      selectedTaskIds.forEach(id => onQuickStatusChange(id, newStatus));
    }
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Yakin ingin menghapus ${selectedTaskIds.length} tugas yang dipilih?`)) {
      if (onBatchDelete) {
        onBatchDelete(selectedTaskIds);
      } else {
        selectedTaskIds.forEach(id => onDeleteTask(id));
      }
      setSelectedTaskIds([]);
    }
  };

  const handleExportSelectedCSV = () => {
    const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.id));
    if (selectedTasks.length === 0) return;

    const headers = ['Task Code', 'Title', 'Project', 'Category', 'Status', 'Priority', 'Assignee', 'Deadline'];
    const escapeCSV = (str?: string | number) => `"${String(str ?? '').replace(/"/g, '""')}"`;
    const rows = selectedTasks.map(t => [
      escapeCSV(t.taskCode),
      escapeCSV(t.title),
      escapeCSV(t.projectName),
      escapeCSV(t.categoryName),
      escapeCSV(t.status),
      escapeCSV(t.priority),
      escapeCSV(t.assignedUserName),
      escapeCSV(t.deadline)
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks_selected_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border border-rose-300';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border border-blue-300';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const getProjectColor = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    return proj?.color || '#F59E0B';
  };

  return (
    <div className={`border rounded-xl overflow-hidden shadow-xs mb-8 transition-colors ${
      isDarkTheme ? 'bg-stone-900 border-stone-800' : 'bg-white border-slate-200'
    }`}>
      {/* Floating Batch Actions Bar */}
      {selectedTaskIds.length > 0 && (
        <div className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 animate-in fade-in ${
          isDarkTheme ? 'bg-amber-950/30 border-amber-800/40 text-stone-200' : 'bg-amber-50 border-amber-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedTaskIds.length} tugas dipilih</span>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-[11px] font-normal underline text-slate-500 hover:text-slate-700 ml-2"
            >
              Batal pilih
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Ubah Status:</span>
            <button
              onClick={() => handleBatchStatus('IN_PROGRESS')}
              className="px-2 py-1 text-[10.5px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-2xs"
            >
              02. In Progress
            </button>
            <button
              onClick={() => handleBatchStatus('UNDER_REVIEW')}
              className="px-2 py-1 text-[10.5px] font-bold rounded bg-teal-600 text-white hover:bg-teal-500 transition shadow-2xs"
            >
              03. QC Review
            </button>
            <button
              onClick={() => handleBatchStatus('APPROVED')}
              className="px-2 py-1 text-[10.5px] font-bold rounded bg-purple-600 text-white hover:bg-purple-500 transition shadow-2xs"
            >
              05. Approve
            </button>
            <button
              onClick={() => handleBatchStatus('COMPLETED')}
              className="px-2 py-1 text-[10.5px] font-bold rounded bg-slate-800 text-white hover:bg-slate-700 transition shadow-2xs"
            >
              Selesai
            </button>

            <div className="h-4 w-[1px] bg-slate-300 mx-1" />

            <button
              onClick={handleExportSelectedCSV}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold rounded border transition ${
                isDarkTheme ? 'border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Download className="w-3 h-3" /> CSV
            </button>

            <button
              onClick={handleBatchDelete}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold rounded bg-rose-600 hover:bg-rose-500 text-white transition shadow-2xs"
            >
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
              isDarkTheme 
                ? 'bg-stone-950/80 border-stone-800 text-stone-400' 
                : 'bg-slate-100/90 border-slate-200 text-slate-600'
            }`}>
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-amber-600" onClick={() => toggleSort('taskCode')}>
                <div className="flex items-center gap-1">
                  Code <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[240px] cursor-pointer hover:text-amber-600" onClick={() => toggleSort('title')}>
                <div className="flex items-center gap-1">
                  Karya & Deliverables <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Project & Category</th>
              <th className="py-3 px-4 cursor-pointer hover:text-amber-600" onClick={() => toggleSort('priority')}>
                <div className="flex items-center gap-1">
                  Prioritas <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 cursor-pointer hover:text-amber-600" onClick={() => toggleSort('status')}>
                <div className="flex items-center gap-1">
                  Status <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-amber-600" onClick={() => toggleSort('deadline')}>
                <div className="flex items-center gap-1">
                  Deadline <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Rev</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${isDarkTheme ? 'divide-stone-800/80' : 'divide-slate-100'}`}>
            {sortedTasks.map(task => {
              const projColor = getProjectColor(task.projectId);
              const overdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED' && task.status !== 'APPROVED';
              
              const checklistTotal = (task.checklist || []).length;
              const checklistDone = (task.checklist || []).filter(c => c.completed).length;

              return (
                <tr 
                  key={task.id}
                  id={`table-row-${task.id}`}
                  className={`transition cursor-pointer ${
                    selectedTaskIds.includes(task.id)
                      ? isDarkTheme ? 'bg-amber-950/40 text-stone-100' : 'bg-amber-50/70 text-slate-900'
                      : isDarkTheme ? 'hover:bg-stone-850/60 text-stone-200' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                  onClick={() => onSelectTask(task)}
                >
                  {/* Select Checkbox */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => toggleSelectTask(task.id)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </td>

                  {/* Task Code */}
                  <td className="py-3 px-4 font-mono font-bold text-amber-600">
                    {task.taskCode}
                  </td>

                  {/* Title, Deliverable badges & Brief */}
                  <td className="py-3 px-4">
                    <div className={`font-semibold transition-colors line-clamp-1 ${
                      isDarkTheme ? 'text-stone-100 hover:text-amber-400' : 'text-slate-900 hover:text-amber-600'
                    }`}>
                      {task.title}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {task.figmaUrl && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 border border-purple-200 text-purple-700">
                          Figma
                        </span>
                      )}
                      {task.assetsUrl && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-700">
                          Drive
                        </span>
                      )}
                      {checklistTotal > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1">
                          <ListTodo className="w-2.5 h-2.5" /> {checklistDone}/{checklistTotal}
                        </span>
                      )}
                      {task.specsDimensions && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {task.specsDimensions.split('(')[0].trim()}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Project & Category */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: projColor }} />
                      <span className={`font-semibold ${isDarkTheme ? 'text-stone-300' : 'text-slate-800'}`}>{task.projectName || 'Default'}</span>
                    </div>
                    {task.categoryName && (
                      <div className="text-[10px] text-slate-400 mt-0.5 pl-3.5">
                        {task.categoryName}
                      </div>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    {task.priority && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[10px] text-amber-800 font-bold">
                        {task.assignedUserName ? task.assignedUserName[0] : 'U'}
                      </div>
                      <span className={isDarkTheme ? 'text-stone-300' : 'text-slate-700'}>{task.assignedUserName || 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* Status with quick select */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => onQuickStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`text-[11px] font-semibold rounded px-2 py-1 border focus:border-amber-500 focus:outline-none ${
                        isDarkTheme 
                          ? 'bg-stone-950 border-stone-800 text-stone-200' 
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="DRAFT">01. Draft</option>
                      <option value="ASSIGNED">01. Assigned</option>
                      <option value="IN_PROGRESS">02. In Progress</option>
                      <option value="SUBMITTED">03. Submitted</option>
                      <option value="UNDER_REVIEW">03. Under Review</option>
                      <option value="REVISION">04. Revision</option>
                      <option value="APPROVED">05. Approved</option>
                      <option value="COMPLETED">05. Completed</option>
                      <option value="ON_HOLD">05. On Hold</option>
                    </select>
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4">
                    {task.deadline ? (
                      <span className={`flex items-center gap-1 font-mono text-[11px] ${overdue ? 'text-rose-600 font-bold' : isDarkTheme ? 'text-stone-400' : 'text-slate-600'}`}>
                        <Calendar className="w-3 h-3" />
                        {task.deadline}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No date</span>
                    )}
                  </td>

                  {/* Revision Count */}
                  <td className="py-3 px-4 text-center">
                    {Number(task.revisionCount ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        <RotateCcw className="w-2.5 h-2.5" />
                        {task.revisionCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold">0</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectTask(task)}
                        title="Lihat Detail"
                        className={`p-1.5 rounded transition ${
                          isDarkTheme ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {onDuplicateTask && (
                        <button
                          onClick={() => onDuplicateTask(task)}
                          title="Duplikat Tugas"
                          className={`p-1.5 rounded transition ${
                            isDarkTheme ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
                          }`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditTask(task)}
                        title="Edit Tugas"
                        className={`p-1.5 rounded transition ${
                          isDarkTheme ? 'text-stone-400 hover:text-blue-400 hover:bg-stone-800' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Hapus Tugas"
                        className={`p-1.5 rounded transition ${
                          isDarkTheme ? 'text-stone-400 hover:text-rose-400 hover:bg-stone-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {sortedTasks.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                  Tidak ada tugas yang sesuai kriteria pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
