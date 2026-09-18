/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  FolderKanban, 
  Plus, 
  Tag, 
  Check, 
  Trash2, 
  Palette,
  Sparkles
} from 'lucide-react';
import { Project, Category, CategoryType } from '../types';
import { generateSafeId, saveProject, saveCategory } from '../firebase';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  categories: Category[];
  onProjectsUpdated: () => void;
  isDarkTheme?: boolean;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  categories,
  onProjectsUpdated,
  isDarkTheme = false
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'categories'>('projects');

  // New Project State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [savingProject, setSavingProject] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryType>('DESIGN');
  const [savingCategory, setSavingCategory] = useState(false);

  if (!isOpen) return null;

  const colorOptions = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#64748B'  // slate
  ];

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setSavingProject(true);
    try {
      const pId = generateSafeId('proj');
      await saveProject({
        id: pId,
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        color: newProjectColor,
        createdAt: new Date().toISOString()
      });
      setNewProjectName('');
      setNewProjectDesc('');
      onProjectsUpdated();
    } catch (err) {
      console.error('Error adding project:', err);
    } finally {
      setSavingProject(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSavingCategory(true);
    try {
      const cId = generateSafeId('cat');
      await saveCategory({
        id: cId,
        name: newCatName.trim(),
        type: newCatType
      });
      setNewCatName('');
      onProjectsUpdated();
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setSavingCategory(false);
    }
  };

  const inputClass = isDarkTheme
    ? 'w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500'
    : 'w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20';

  const selectClass = isDarkTheme
    ? 'bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500'
    : 'bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between transition-colors ${
          isDarkTheme ? 'border-stone-800 bg-stone-950' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className={`text-sm sm:text-base font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Workspace Configuration
              </h2>
              <p className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                Manage campaigns, client brands & deliverable categories
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

        {/* Tab switch */}
        <div className={`flex border-b px-5 pt-2 transition-colors ${
          isDarkTheme ? 'border-stone-800 bg-stone-950/60' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'projects'
                ? 'border-amber-500 text-amber-500'
                : isDarkTheme ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Campaign Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-amber-500 text-amber-500'
                : isDarkTheme ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Design & Content Categories ({categories.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {activeTab === 'projects' && (
            <div className="space-y-4">
              
              {/* Add Project Form */}
              <form onSubmit={handleAddProject} className={`p-3.5 border rounded-xl space-y-3 transition-colors ${
                isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`font-semibold flex items-center gap-1.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  <Plus className="w-3.5 h-3.5 text-amber-500" /> Add New Brand / Campaign
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project Name (e.g. Zenith Rebrand 2026)"
                    className={inputClass}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Brief description or campaign focus..."
                    className={inputClass}
                  />
                </div>

                {/* Color Palette Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] mr-1 ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>Brand Color:</span>
                    {colorOptions.map(col => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewProjectColor(col)}
                        className={`w-5 h-5 rounded-full border transition ${
                          newProjectColor === col ? 'ring-2 ring-amber-500 scale-110' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={savingProject}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold rounded-lg transition shadow-xs disabled:opacity-50"
                  >
                    {savingProject ? 'Saving...' : 'Add Project'}
                  </button>
                </div>
              </form>

              {/* Projects List */}
              <div className="space-y-2">
                <div className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                  Active Projects
                </div>
                <div className={`divide-y border rounded-xl overflow-hidden ${
                  isDarkTheme ? 'divide-stone-800 border-stone-800 bg-stone-950/60' : 'divide-slate-200 border-slate-200 bg-white'
                }`}>
                  {projects.map(proj => (
                    <div key={proj.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: proj.color || '#F59E0B' }} />
                        <div className="truncate">
                          <div className={`font-semibold text-xs truncate ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                            {proj.name}
                          </div>
                          {proj.description && (
                            <div className={`text-[11px] truncate ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                              {proj.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {proj.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              
              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className={`p-3.5 border rounded-xl space-y-3 transition-colors ${
                isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`font-semibold flex items-center gap-1.5 ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                  <Plus className="w-3.5 h-3.5 text-amber-500" /> Add New Category
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name (e.g. 3D Renders)"
                    className={`sm:col-span-2 ${inputClass}`}
                  />
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as CategoryType)}
                    className={selectClass}
                  >
                    <option value="DESIGN">Design</option>
                    <option value="CONTENT">Content</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold rounded-lg transition shadow-xs disabled:opacity-50"
                  >
                    {savingCategory ? 'Saving...' : 'Add Category'}
                  </button>
                </div>
              </form>

              {/* Categories List */}
              <div className="space-y-2">
                <div className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                  Configured Categories
                </div>
                <div className={`divide-y border rounded-xl overflow-hidden ${
                  isDarkTheme ? 'divide-stone-800 border-stone-800 bg-stone-950/60' : 'divide-slate-200 border-slate-200 bg-white'
                }`}>
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                        <span className={`font-semibold text-xs ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isDarkTheme 
                          ? 'bg-stone-800 text-stone-300 border-stone-700' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {cat.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
