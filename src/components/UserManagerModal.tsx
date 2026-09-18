/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Briefcase, 
  Paintbrush, 
  FileText, 
  Mail, 
  Search,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, UserRole, Task } from '../types';
import { generateSafeId } from '../firebase';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  tasks: Task[];
  onSaveUser: (user: UserProfile) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  isDarkTheme?: boolean;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  users,
  tasks,
  onSaveUser,
  onDeleteUser,
  isDarkTheme = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Form State for Add / Edit
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('DESIGNER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('DESIGNER');
    setIsAdding(false);
    setEditingUserId(null);
    setErrorMessage(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleStartEdit = (user: UserProfile) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setIsAdding(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Nama pengguna wajib diisi');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setErrorMessage('Format email tidak valid');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingUserId) {
        // Update user
        const existing = users.find(u => u.id === editingUserId);
        const updated: UserProfile = {
          id: editingUserId,
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          avatar: existing?.avatar
        };
        await onSaveUser(updated);
      } else {
        // Create new user
        const newUser: UserProfile = {
          id: generateSafeId('user'),
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole
        };
        await onSaveUser(newUser);
      }
      resetForm();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan data pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setIsSubmitting(true);
      await onDeleteUser(userId);
      setDeleteConfirmId(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menghapus pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Admin Studio',
          icon: <ShieldCheck className="w-3 h-3 text-purple-500" />,
          classes: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
        };
      case 'MANAGER':
        return {
          label: 'Project Manager',
          icon: <Briefcase className="w-3 h-3 text-blue-500" />,
          classes: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
        };
      case 'DESIGNER':
        return {
          label: 'Graphic Designer',
          icon: <Paintbrush className="w-3 h-3 text-amber-500" />,
          classes: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
        };
      case 'CONTENT_CREATOR':
        return {
          label: 'Content Creator',
          icon: <FileText className="w-3 h-3 text-teal-500" />,
          classes: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full max-w-3xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Manajemen Tim & Hak Akses Pengguna
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  {users.length} ANGGOTA
                </span>
              </h2>
              <p className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                Atur peran desainer, manager, dan admin untuk pendelegasian tugas kreatif
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    isDarkTheme 
                      ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-500 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                  }`}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`px-2.5 py-1.5 text-xs rounded-xl border transition ${
                  isDarkTheme ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="ALL">Semua Peran</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="DESIGNER">Designer</option>
                <option value="CONTENT_CREATOR">Content Creator</option>
              </select>
            </div>

            {!isAdding && !editingUserId && (
              <button
                id="btn-add-user"
                onClick={handleStartAdd}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Pengguna</span>
              </button>
            )}
          </div>

          {/* Add / Edit Form Panel */}
          {(isAdding || editingUserId) && (
            <div className={`p-4 rounded-xl border animate-in slide-in-from-top-2 ${
              isDarkTheme ? 'bg-stone-950 border-indigo-900/50' : 'bg-indigo-50/50 border-indigo-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  {editingUserId ? <Edit3 className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  {editingUserId ? 'Edit Data Pengguna' : 'Tambah Anggota Tim Baru'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Batal
                </button>
              </div>

              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Name */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Sarah Wijaya"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border transition ${
                        isDarkTheme ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                      Email Kerja *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@atdigitalstudio.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border transition ${
                        isDarkTheme ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDarkTheme ? 'text-stone-300' : 'text-slate-700'}`}>
                      Peran / Hak Akses *
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as UserRole)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border transition ${
                        isDarkTheme ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="DESIGNER">Graphic Designer</option>
                      <option value="CONTENT_CREATOR">Content Creator</option>
                      <option value="MANAGER">Project Manager</option>
                      <option value="ADMIN">Admin Studio</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingUserId ? 'Simpan Perubahan' : 'Tambahkan Pengguna'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User List Table */}
          <div className={`border rounded-xl overflow-hidden ${
            isDarkTheme ? 'border-stone-800' : 'border-slate-200'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${
                  isDarkTheme ? 'bg-stone-950 text-stone-400 border-stone-800' : 'bg-slate-100/90 text-slate-600 border-slate-200'
                }`}>
                  <th className="py-2.5 px-3">Pengguna</th>
                  <th className="py-2.5 px-3">Peran / Role</th>
                  <th className="py-2.5 px-3 text-center">Tugas Aktif</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {filteredUsers.map(user => {
                  const assignedTasks = tasks.filter(t => t.assignedUserId === user.id);
                  const activeTasks = assignedTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'APPROVED');
                  const roleBadge = getRoleBadge(user.role);

                  return (
                    <tr 
                      key={user.id}
                      className={`transition ${
                        isDarkTheme ? 'hover:bg-stone-850/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${roleBadge.classes}`}>
                          {roleBadge.icon}
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Active Tasks Count */}
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          activeTasks.length > 0 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                            : 'bg-slate-100 text-slate-500 dark:bg-stone-800 dark:text-stone-400'
                        }`}>
                          {activeTasks.length} aktif / {assignedTasks.length} total
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        {deleteConfirmId === user.id ? (
                          <div className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">Hapus?</span>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={isSubmitting}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                            >
                              Ya
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-[10px]"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(user)}
                              title="Edit Pengguna"
                              className={`p-1.5 rounded-lg border transition ${
                                isDarkTheme 
                                  ? 'border-stone-700 hover:bg-stone-800 text-stone-300' 
                                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(user.id)}
                              title="Hapus Pengguna"
                              className={`p-1.5 rounded-lg border transition ${
                                isDarkTheme 
                                  ? 'border-stone-700 hover:bg-rose-950/40 text-stone-300 hover:text-rose-400' 
                                  : 'border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada pengguna yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDarkTheme ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="text-[11px] text-slate-400">
            Perubahan pengguna tersinkronisasi otomatis ke database studio.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-200 text-xs font-bold rounded-lg transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
