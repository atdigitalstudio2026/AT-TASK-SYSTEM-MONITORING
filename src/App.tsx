/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  testConnection, 
  handleFirestoreError, 
  OperationType,
  saveTask,
  updateTaskPartial,
  removeTask,
  saveNotification,
  saveProject,
  saveCategory,
  saveUserProfile,
  removeUserProfile,
  clearAllStudioData,
  generateSafeId,
  getUserProfile,
  findUserByUsernameOrEmail,
  registerNewUser,
  resetUserPasswordAsManager,
  signOutCurrentUser
} from './firebase';
import { 
  Task, 
  Project, 
  Category, 
  NotificationItem, 
  UserProfile, 
  UserRole,
  FilterState, 
  TaskStatus 
} from './types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_CATEGORIES, 
  INITIAL_USERS, 
  INITIAL_TASKS, 
  INITIAL_NOTIFICATIONS 
} from './data/seedData';
import { Navbar } from './components/Navbar';
import { StepProcessMenu, WORKFLOW_STEPS } from './components/StepProcessMenu';
import { MetricsBar } from './components/MetricsBar';
import { DesignerWorkloadSection } from './components/DesignerWorkloadSection';
import { TaskFilters } from './components/TaskFilters';
import { TaskKanban } from './components/TaskKanban';
import { TaskTable } from './components/TaskTable';
import { TaskModal } from './components/TaskModal';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { StudioAnalyticsModal } from './components/StudioAnalyticsModal';
import { StudioReportModal } from './components/StudioReportModal';
import { UserManagerModal } from './components/UserManagerModal';
import { ResetStudioModal } from './components/ResetStudioModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { TaskCalendar } from './components/TaskCalendar';
import { Sparkles, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(() => {
    const savedId = localStorage.getItem('at_current_user_id') || sessionStorage.getItem('at_current_user_id');
    if (savedId) {
      const found = INITIAL_USERS.find(u => u.id === savedId);
      if (found) return found;
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [connectionHealthy, setConnectionHealthy] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Theme state: default to 'infographic' (Studio Infographic light theme)
  const [theme, setTheme] = useState<'infographic' | 'dark'>('infographic');
  const isDarkTheme = theme === 'dark';
  const toggleTheme = () => setTheme(prev => prev === 'infographic' ? 'dark' : 'infographic');

  // Active workflow step filter from StepProcessMenu
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<string | null>(null);

  // Modals & Drawers state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts (⌘K, N, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Cmd/Ctrl + K => Focus Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('task-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Esc => Close open modals & drawers
      if (e.key === 'Escape') {
        if (isTaskModalOpen) setIsTaskModalOpen(false);
        if (selectedTaskDetail) setSelectedTaskDetail(null);
        if (isProjectsModalOpen) setIsProjectsModalOpen(false);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
        if (isAnalyticsOpen) setIsAnalyticsOpen(false);
        if (isReportModalOpen) setIsReportModalOpen(false);
        if (isUserManagerOpen) setIsUserManagerOpen(false);
        if (isResetModalOpen) setIsResetModalOpen(false);
        return;
      }

      // 'N' or 'n' => Open New Task Modal (when not in typing input)
      if (!isInput && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setEditingTask(null);
        setIsTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, selectedTaskDetail, isProjectsModalOpen, isNotificationsOpen, isAnalyticsOpen, isReportModalOpen]);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    projectId: '',
    categoryId: '',
    priority: '',
    status: '',
    assignedUserId: '',
    viewMode: 'kanban'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Connection check and Auth state
  useEffect(() => {
    testConnection().then(healthy => {
      setConnectionHealthy(healthy);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setCurrentProfile(profile);
            localStorage.setItem('at_current_user_id', profile.id);
          } else {
            const matched = await findUserByUsernameOrEmail(user.email || '');
            if (matched) {
              setCurrentProfile(matched);
              localStorage.setItem('at_current_user_id', matched.id);
            } else {
              const fallbackProfile: UserProfile = {
                id: user.uid,
                username: user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user',
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                role: 'MANAGER',
                status: 'ACTIVE',
                avatar: user.photoURL || undefined,
                createdAt: new Date().toISOString()
              };
              await saveUserProfile(fallbackProfile);
              setCurrentProfile(fallbackProfile);
              localStorage.setItem('at_current_user_id', fallbackProfile.id);
            }
          }
        } catch (err) {
          console.warn('User profile sync error:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore Listeners with mandatory error handling
  useEffect(() => {
    let hasLoadedTasks = false;

    // Tasks listener
    const tasksPath = 'tasks';
    const unsubTasks = onSnapshot(
      collection(db, tasksPath),
      (snapshot) => {
        const loadedTasks: Task[] = [];
        snapshot.forEach((doc) => {
          loadedTasks.push(doc.data() as Task);
        });
        setTasks(loadedTasks);
        setLoading(false);

        // Keep active drawer task in sync with latest Firestore data
        setSelectedTaskDetail(prev => {
          if (!prev) return null;
          const fresh = loadedTasks.find(t => t.id === prev.id);
          return fresh || prev;
        });

        // Auto-seed initial tasks once if Firestore is empty on first boot (unless explicitly reset to zero)
        const isStudioCleared = localStorage.getItem('at_studio_cleared') === 'true';
        if (!hasLoadedTasks && loadedTasks.length === 0 && !isStudioCleared) {
          hasLoadedTasks = true;
          handleSeedInitialData();
        }
      },
      (error) => {
        console.error('Tasks listener error:', error);
        handleFirestoreError(error, OperationType.GET, tasksPath);
      }
    );

    // Projects listener
    const projPath = 'projects';
    const unsubProjects = onSnapshot(
      collection(db, projPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedProj: Project[] = [];
          snapshot.forEach((doc) => loadedProj.push(doc.data() as Project));
          setProjects(loadedProj);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, projPath);
      }
    );

    // Categories listener
    const catPath = 'categories';
    const unsubCategories = onSnapshot(
      collection(db, catPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedCat: Category[] = [];
          snapshot.forEach((doc) => loadedCat.push(doc.data() as Category));
          setCategories(loadedCat);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, catPath);
      }
    );

    // Notifications listener
    const notifPath = 'notifications';
    const unsubNotifications = onSnapshot(
      collection(db, notifPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedNotifs: NotificationItem[] = [];
          snapshot.forEach((doc) => loadedNotifs.push(doc.data() as NotificationItem));
          loadedNotifs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setNotifications(loadedNotifs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, notifPath);
      }
    );

    // Users listener
    const usersPath = 'users';
    const unsubUsers = onSnapshot(
      collection(db, usersPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedUsers: UserProfile[] = [];
          snapshot.forEach((doc) => loadedUsers.push(doc.data() as UserProfile));
          setUsers(loadedUsers);

          // Refresh current profile if updated in Firestore
          setCurrentProfile(prev => {
            if (!prev) {
              const defaultAdmin = loadedUsers.find(u => u.role === 'ADMIN' || u.role === 'MANAGER') || loadedUsers[0];
              return defaultAdmin || null;
            }
            const found = loadedUsers.find(u => u.id === prev.id || (prev.username && u.username === prev.username));
            return found || prev;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, usersPath);
      }
    );

    return () => {
      unsubTasks();
      unsubProjects();
      unsubCategories();
      unsubNotifications();
      unsubUsers();
    };
  }, []);

  // Manager & Admin full control check
  const isManager = currentProfile?.role === 'ADMIN' || currentProfile?.role === 'MANAGER';

  // Seed initial data handler
  const handleSeedInitialData = async () => {
    setIsSeeding(true);
    localStorage.removeItem('at_studio_cleared');
    try {
      // Save projects
      for (const p of INITIAL_PROJECTS) {
        await saveProject(p);
      }
      // Save categories
      for (const c of INITIAL_CATEGORIES) {
        await saveCategory(c);
      }
      // Save users
      for (const u of INITIAL_USERS) {
        await saveUserProfile(u);
      }
      // Save initial tasks
      for (const t of INITIAL_TASKS) {
        await saveTask(t);
      }
      // Save notifications
      for (const n of INITIAL_NOTIFICATIONS) {
        await saveNotification(n);
      }
      showToast('Sample creative studio tasks loaded successfully.');
    } catch (err) {
      console.warn('Error seeding initial data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Reset Studio simulation data to 0
  const handleConfirmReset = async (wipeAll: boolean) => {
    if (!isManager) {
      showToast('Akses Dibatasi: Hanya Manager/Administrator yang berhak mereset sistem.');
      return;
    }

    try {
      localStorage.setItem('at_studio_cleared', 'true');
      await clearAllStudioData({ wipeAll });
      setTasks([]);
      setNotifications([]);
      setSelectedTaskDetail(null);
      setEditingTask(null);
      if (wipeAll) {
        setProjects([]);
        setCategories([]);
      }
      showToast('Semua data simulasi berhasil di-reset ke 0. Ruang kerja siap dipakai dari awal!');
    } catch (err: any) {
      console.error('Reset error:', err);
      showToast('Gagal mereset data: ' + (err?.message || 'Error'));
    }
  };

  // User Management Handlers (Full Manager Control)
  const handleSaveUser = async (userProfile: UserProfile) => {
    if (!isManager) {
      showToast('Akses Dibatasi: Hanya Manager yang dapat mengedit hak akses pengguna.');
      return;
    }

    await saveUserProfile(userProfile);
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === userProfile.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = userProfile;
        return copy;
      }
      return [...prev, userProfile];
    });

    if (currentProfile?.id === userProfile.id) {
      setCurrentProfile(userProfile);
    }
    showToast(`Data anggota @${userProfile.username || userProfile.name} berhasil disimpan.`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isManager) {
      showToast('Akses Dibatasi: Hanya Manager yang dapat menghapus akun pengguna.');
      return;
    }

    await removeUserProfile(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('Akses pengguna berhasil dihapus dari sistem.');
  };

  // Register Auth User from Manager Panel
  const handleRegisterAuthUser = async (
    username: string,
    name: string,
    email: string,
    pass: string,
    role: UserRole
  ) => {
    if (!isManager) {
      showToast('Akses Dibatasi: Hanya Manager yang dapat mendaftarkan akun baru.');
      return;
    }

    const { profile } = await registerNewUser(username, name, email, pass, role);
    setUsers(prev => [...prev.filter(u => u.id !== profile.id), profile]);
    showToast(`Akun @${profile.username} (${profile.role}) berhasil didaftarkan ke Firebase.`);
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
      setCurrentUser(null);
      localStorage.removeItem('at_current_user_id');
      sessionStorage.removeItem('at_current_user_id');
      setCurrentProfile(null);
      showToast('Berhasil keluar dari akun studio.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Add task with prefilled deadline from calendar
  const handleAddTaskWithDeadline = (dateStr: string) => {
    setEditingTask({
      id: generateSafeId('task'),
      taskCode: `AT-${String(tasks.length + 101).padStart(3, '0')}`,
      title: '',
      projectId: projects[0]?.id || '',
      categoryId: categories[0]?.id || '',
      taskType: 'Key Visual',
      requester: 'Creative Director',
      assignedUserId: users[0]?.id || '',
      priority: 'MEDIUM',
      status: 'DRAFT',
      deadline: dateStr,
      revisionCount: 0
    } as Task);
    setIsTaskModalOpen(true);
  };

  // Duplicate / Clone Task Handler
  const handleDuplicateTask = (taskToDuplicate: Task) => {
    const existingNums = tasks.map(t => {
      const match = t.taskCode.match(/AT-(\d+)/);
      return match ? parseInt(match[1], 10) : 100;
    });
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 101;
    const newTaskCode = `AT-${String(nextNum).padStart(3, '0')}`;

    const clonedTask: Task = {
      ...taskToDuplicate,
      id: generateSafeId('task'),
      taskCode: newTaskCode,
      title: `${taskToDuplicate.title} (Salinan)`,
      status: 'DRAFT',
      revisionCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      comments: [],
      checklist: (taskToDuplicate.checklist || []).map(item => ({
        ...item,
        id: generateSafeId('chk'),
        completed: false
      }))
    };

    setEditingTask(clonedTask);
    setIsTaskModalOpen(true);
    if (selectedTaskDetail) {
      setSelectedTaskDetail(null);
    }
    showToast(`Menduplikasi tugas ke kode ${newTaskCode}`);
  };

  // Status Change Workflow Handler
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, revisionNote?: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    try {
      const updates: Partial<Task> = {
        status: newStatus
      };

      if (newStatus === 'REVISION') {
        const nextRev = (targetTask.revisionCount ?? 0) + 1;
        updates.revisionCount = nextRev;
        if (revisionNote) {
          updates.designBrief = `${targetTask.designBrief || ''}\n\n[REVISION #${nextRev} NOTE - ${new Date().toLocaleDateString()}]: ${revisionNote}`.slice(0, 5000);
        }

        // Add notification
        await saveNotification({
          id: generateSafeId('notif'),
          userId: 'all',
          title: `Revision Requested: ${targetTask.taskCode}`,
          message: revisionNote ? `Feedback: ${revisionNote}` : 'Creative adjustments requested.',
          type: 'revision',
          read: false,
          createdAt: new Date().toISOString()
        });
      } else if (newStatus === 'APPROVED') {
        await saveNotification({
          id: generateSafeId('notif'),
          userId: 'all',
          title: `Design Approved: ${targetTask.taskCode}`,
          message: `${targetTask.title} was officially approved.`,
          type: 'approval',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      await updateTaskPartial(taskId, updates);
      showToast(`Task ${targetTask.taskCode} status updated to ${newStatus.replace('_', ' ')}.`);

      // Update selected drawer task if open
      if (selectedTaskDetail && selectedTaskDetail.id === taskId) {
        setSelectedTaskDetail({
          ...selectedTaskDetail,
          ...updates
        });
      }
    } catch (err) {
      console.error('Error changing status:', err);
      showToast('Error updating status.');
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId: string) => {
    try {
      await removeTask(taskId);
      if (selectedTaskDetail?.id === taskId) {
        setSelectedTaskDetail(null);
      }
      showToast('Task removed from workspace.');
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast('Failed to delete task.');
    }
  };

  // Batch Status Change Handler
  const handleBatchStatusChange = async (taskIds: string[], newStatus: TaskStatus) => {
    try {
      await Promise.all(taskIds.map(id => updateTaskPartial(id, { status: newStatus })));
      showToast(`Status ${taskIds.length} tugas berhasil diubah ke ${newStatus.replace('_', ' ')}.`);
    } catch (err) {
      console.error('Batch status error:', err);
      showToast('Gagal mengubah status tugas masal.');
    }
  };

  // Batch Delete Tasks Handler
  const handleBatchDelete = async (taskIds: string[]) => {
    try {
      await Promise.all(taskIds.map(id => removeTask(id)));
      if (selectedTaskDetail && taskIds.includes(selectedTaskDetail.id)) {
        setSelectedTaskDetail(null);
      }
      showToast(`${taskIds.length} tugas berhasil dihapus.`);
    } catch (err) {
      console.error('Batch delete error:', err);
      showToast('Gagal menghapus beberapa tugas.');
    }
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search match
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchCode = task.taskCode.toLowerCase().includes(query);
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchRequester = (task.requester || '').toLowerCase().includes(query);
        const matchAssignee = (task.assignedUserName || '').toLowerCase().includes(query);
        const matchBrief = (task.designBrief || '').toLowerCase().includes(query);
        if (!matchCode && !matchTitle && !matchRequester && !matchAssignee && !matchBrief) {
          return false;
        }
      }

      // Project match
      if (filters.projectId && task.projectId !== filters.projectId) {
        return false;
      }

      // Category match
      if (filters.categoryId && task.categoryId !== filters.categoryId) {
        return false;
      }

      // Priority match
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Status match
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Assignee match
      if (filters.assignedUserId && task.assignedUserId !== filters.assignedUserId) {
        return false;
      }

      // StepProcessMenu filter
      if (activeWorkflowStep) {
        const stepDef = WORKFLOW_STEPS.find(s => s.id === activeWorkflowStep);
        if (stepDef && !stepDef.statuses.includes(task.status)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters, activeWorkflowStep]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Professional Login Gate: Require user to login with credentials provided by Manager
  if (!currentProfile && !currentUser) {
    return (
      <LoginPage
        users={users}
        onLoginSuccess={(profile) => {
          setCurrentProfile(profile);
          showToast(`Selamat datang kembali, ${profile?.name || 'User'}!`);
        }}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500 selection:text-white ${
      isDarkTheme ? 'bg-stone-950 text-stone-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Navigation Bar with Theme Controls & Full Auth */}
      <Navbar
        currentUser={currentUser}
        currentProfile={currentProfile}
        connectionHealthy={connectionHealthy}
        unreadCount={unreadNotificationsCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenUsers={() => setIsUserManagerOpen(true)}
        onOpenReset={() => setIsResetModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onSignOut={handleSignOut}
        onSeedData={handleSeedInitialData}
        isSeeding={isSeeding}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Infographic 5-Step Workflow Process Menu (Visual Theme Core) */}
        <StepProcessMenu
          tasks={tasks}
          activeStepId={activeWorkflowStep}
          onSelectStep={(stepId) => {
            setActiveWorkflowStep(prev => prev === stepId ? null : stepId);
          }}
          isDarkTheme={isDarkTheme}
        />

        {/* Pipeline Metrics Overview */}
        <MetricsBar
          tasks={tasks}
          activeStatusFilter={filters.status}
          onSelectStatusFilter={(status) => {
            setFilters(prev => ({ ...prev, status }));
            if (activeWorkflowStep) setActiveWorkflowStep(null);
          }}
          isDarkTheme={isDarkTheme}
        />

        {/* Graphic Designer Workload & Completion Overview (Infographic 4-Column Timeline) */}
        <DesignerWorkloadSection
          tasks={tasks}
          users={users}
          selectedUserId={filters.assignedUserId}
          activeStatusFilter={filters.status}
          showOverdueOnly={filters.showOverdueOnly}
          onFilterDesignerAndStatus={(userId, status, overdue) => {
            setFilters(prev => ({
              ...prev,
              assignedUserId: userId,
              status: status !== undefined ? status : '',
              showOverdueOnly: overdue !== undefined ? overdue : false
            }));
            if (activeWorkflowStep) setActiveWorkflowStep(null);

            // Smoothly scroll directly to the targeted task list / board
            setTimeout(() => {
              const el = document.getElementById('tasks-view-container');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
          isDarkTheme={isDarkTheme}
        />

        {/* Task View Section Anchor with smooth scroll margin */}
        <div id="tasks-view-container" className="scroll-mt-4">
          {/* Filters and View Controls */}
          <TaskFilters
            filters={filters}
            setFilters={setFilters}
            projects={projects}
            categories={categories}
            users={users}
            currentProfile={currentProfile}
            totalResults={filteredTasks.length}
            tasksToExport={filteredTasks}
            onOpenReport={() => setIsReportModalOpen(true)}
            isDarkTheme={isDarkTheme}
          />

          {/* Content View: Kanban or Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-3" />
              <span>Synchronizing creative pipeline from Firestore...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border p-8 text-center my-6 ${
              isDarkTheme ? 'bg-stone-900/40 border-stone-800/80' : 'bg-white border-slate-200'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold mb-1 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                No matching creative tasks found
              </h3>
              <p className={`text-xs max-w-md mb-5 leading-relaxed ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
                {tasks.length === 0 
                  ? 'Your workspace is ready. Populate with sample creative campaigns or add your first task brief.'
                  : 'Try adjusting your search criteria, clearing project/status filters, or creating a new task.'
                }
              </p>
              <div className="flex items-center gap-3">
                {tasks.length === 0 && (
                  <button
                    onClick={handleSeedInitialData}
                    disabled={isSeeding}
                    className={`px-4 py-2 border text-xs font-semibold rounded-lg transition ${
                      isDarkTheme ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    Load Sample Work
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create First Task
                </button>
              </div>
            </div>
          ) : filters.viewMode === 'kanban' ? (
            <TaskKanban
              tasks={filteredTasks}
              projects={projects}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onQuickStatusChange={handleStatusChange}
              onNewTaskWithStatus={(status) => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              isDarkTheme={isDarkTheme}
            />
          ) : filters.viewMode === 'calendar' ? (
            <TaskCalendar
              tasks={filteredTasks}
              projects={projects}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onAddTaskWithDeadline={handleAddTaskWithDeadline}
              isDarkTheme={isDarkTheme}
            />
          ) : (
            <TaskTable
              tasks={filteredTasks}
              projects={projects}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onQuickStatusChange={handleStatusChange}
              onBatchStatusChange={handleBatchStatusChange}
              onBatchDelete={handleBatchDelete}
              isDarkTheme={isDarkTheme}
            />
          )}
        </div>

      </main>

      {/* Studio Analytics & Performance Metrics Modal */}
      <StudioAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        tasks={tasks}
        projects={projects}
        users={users}
        isDarkTheme={isDarkTheme}
      />

      {/* Studio Executive Production Report & Printable Manifest Modal */}
      <StudioReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        tasks={filteredTasks}
        projects={projects}
        users={users}
        isDarkTheme={isDarkTheme}
      />

      {/* User Access & Team Management Modal (Controlled by Manager) */}
      <UserManagerModal
        isOpen={isUserManagerOpen}
        onClose={() => setIsUserManagerOpen(false)}
        users={users}
        tasks={tasks}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        onRegisterAuthUser={handleRegisterAuthUser}
        onResetUserPassword={async (userId, newPassword) => {
          await resetUserPasswordAsManager(userId, newPassword);
          showToast('Kata sandi pengguna berhasil diubah & disimpan.');
        }}
        currentUserRole={currentProfile?.role || 'MANAGER'}
        isDarkTheme={isDarkTheme}
      />

      {/* Change Password Modal for logged-in users */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userName={currentProfile?.name}
        isDarkTheme={isDarkTheme}
      />

      {/* Firebase Authentication Modal (Username & Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          if (profile) {
            setCurrentProfile(profile);
            localStorage.setItem('at_current_user_id', profile.id);
            showToast(`Selamat datang @${profile.username || profile.name} (${profile.role})`);
          }
        }}
        isDarkTheme={isDarkTheme}
      />

      {/* Reset Simulation Data to 0 Modal */}
      <ResetStudioModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
        currentTaskCount={tasks.length}
        currentProjectCount={projects.length}
        isDarkTheme={isDarkTheme}
      />

      {/* Task Detail Drawer / Modal */}
      <TaskDetailDrawer
        task={selectedTaskDetail}
        projects={projects}
        isOpen={Boolean(selectedTaskDetail)}
        onClose={() => setSelectedTaskDetail(null)}
        onEdit={(task) => {
          setSelectedTaskDetail(null);
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={handleDeleteTask}
        onDuplicate={handleDuplicateTask}
        onStatusChange={handleStatusChange}
        onUpdateTask={async (taskId, updates) => {
          await updateTaskPartial(taskId, updates);
        }}
        currentProfile={currentProfile}
        isDarkTheme={isDarkTheme}
      />

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={async (task) => {
          await saveTask(task);
          showToast(`Task ${task.taskCode} saved successfully.`);
        }}
        editingTask={editingTask}
        projects={projects}
        categories={categories}
        users={users}
        totalTasksCount={tasks.length}
        isDarkTheme={isDarkTheme}
      />

      {/* Project & Category Workspace Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        categories={categories}
        onProjectsUpdated={() => showToast('Configuration updated in Firestore.')}
        isDarkTheme={isDarkTheme}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          showToast('All notifications marked as read.');
        }}
        isDarkTheme={isDarkTheme}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 text-xs px-4 py-2.5 rounded-xl border shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
          isDarkTheme ? 'bg-stone-900 text-stone-100 border-amber-500/40' : 'bg-white text-slate-900 border-slate-200 shadow-lg ring-1 ring-slate-900/5'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
