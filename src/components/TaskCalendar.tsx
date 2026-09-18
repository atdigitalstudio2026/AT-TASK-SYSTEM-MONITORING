/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search,
  Sparkles,
  History,
  CalendarDays,
  ArrowRight,
  RotateCcw,
  X
} from 'lucide-react';
import { Task, Project, TaskStatus } from '../types';

interface TaskCalendarProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onAddTaskWithDeadline?: (dateStr: string) => void;
  isDarkTheme?: boolean;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  projects,
  onSelectTask,
  onAddTaskWithDeadline,
  isDarkTheme = false
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showUnscheduled, setShowUnscheduled] = useState<boolean>(false);
  const [selectedHighlightDate, setSelectedHighlightDate] = useState<string | null>(null);
  const [dateSearchInput, setDateSearchInput] = useState<string>('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0 - 11

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedHighlightDate(todayKey);
  };

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Check if viewing past or future months
  const isPastMonth = (currentYear * 12 + currentMonth) < (today.getFullYear() * 12 + today.getMonth());
  const isFutureMonth = (currentYear * 12 + currentMonth) > (today.getFullYear() * 12 + today.getMonth());
  const isCurrentMonthNow = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  // Jump to specific month
  const handleMonthChange = (monthIdx: number) => {
    setCurrentDate(new Date(currentYear, monthIdx, 1));
  };

  // Jump to specific year
  const handleYearChange = (yearNum: number) => {
    setCurrentDate(new Date(yearNum, currentMonth, 1));
  };

  // Jump directly to an exact date from datepicker input (YYYY-MM-DD)
  const handleDirectDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedVal = e.target.value;
    if (!pickedVal) return;
    const parts = pickedVal.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      setCurrentDate(new Date(y, m, d));
      setSelectedHighlightDate(pickedVal);
    }
  };

  // Available year list dynamically generated from current year and tasks
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const thisY = today.getFullYear();
    for (let y = thisY - 3; y <= thisY + 5; y++) {
      yearsSet.add(y);
    }
    tasks.forEach(t => {
      if (t.deadline) {
        const match = t.deadline.match(/^(\d{4})/);
        if (match) yearsSet.add(parseInt(match[1], 10));
      }
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [tasks, today]);

  // Distinct months that actually contain scheduled tasks
  const monthsWithTasks = useMemo(() => {
    const counts: Record<string, { year: number; month: number; count: number }> = {};
    tasks.forEach(t => {
      if (t.deadline) {
        const match = t.deadline.match(/^(\d{4})-(\d{2})/);
        if (match) {
          const y = parseInt(match[1], 10);
          const m = parseInt(match[2], 10) - 1;
          const key = `${y}-${m}`;
          if (!counts[key]) counts[key] = { year: y, month: m, count: 0 };
          counts[key].count++;
        }
      }
    });
    return Object.values(counts).sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
  }, [tasks]);

  // Group tasks by deadline date key
  const { tasksByDate, unscheduledTasks, monthStats } = useMemo(() => {
    const map: Record<string, Task[]> = {};
    const unscheduled: Task[] = [];
    let completedCount = 0;
    let overdueCount = 0;
    let inProgressCount = 0;

    tasks.forEach(t => {
      if (t.deadline) {
        const dateMatch = t.deadline.match(/^\d{4}-\d{2}-\d{2}/);
        const key = dateMatch ? dateMatch[0] : t.deadline.slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(t);

        // Stats for current month
        if (key.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)) {
          if (t.status === 'COMPLETED' || t.status === 'APPROVED') {
            completedCount++;
          } else {
            inProgressCount++;
            if (key < todayKey) {
              overdueCount++;
            }
          }
        }
      } else {
        unscheduled.push(t);
      }
    });

    return {
      tasksByDate: map,
      unscheduledTasks: unscheduled,
      monthStats: { completedCount, overdueCount, inProgressCount }
    };
  }, [tasks, currentYear, currentMonth, todayKey]);

  // Matching tasks based on quick date/keyword search
  const searchResults = useMemo(() => {
    if (!dateSearchInput.trim()) return [];
    const query = dateSearchInput.toLowerCase().trim();
    return tasks.filter(t => {
      const matchDeadline = t.deadline?.toLowerCase().includes(query);
      const matchCode = t.taskCode?.toLowerCase().includes(query);
      const matchTitle = t.title?.toLowerCase().includes(query);
      return matchDeadline || matchCode || matchTitle;
    }).slice(0, 5);
  }, [tasks, dateSearchInput]);

  // Calendar matrix calculation
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      tasks: Task[];
    }[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYearNum = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dKey = formatDateKey(prevYearNum, prevMonthIdx, dayNum);
      cells.push({
        dateKey: dKey,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dKey === todayKey,
        tasks: tasksByDate[dKey] || []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dKey = formatDateKey(currentYear, currentMonth, d);
      cells.push({
        dateKey: dKey,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dKey === todayKey,
        tasks: tasksByDate[dKey] || []
      });
    }

    // Next month padding to fill complete grid
    const remaining = 42 - cells.length;
    if (remaining > 0 && remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYearNum = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dKey = formatDateKey(nextYearNum, nextMonthIdx, d);
        cells.push({
          dateKey: dKey,
          dayNumber: d,
          isCurrentMonth: false,
          isToday: dKey === todayKey,
          tasks: tasksByDate[dKey] || []
        });
      }
    }

    return cells;
  }, [currentYear, currentMonth, tasksByDate, todayKey]);

  // Status Styling Helper
  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
      case 'ASSIGNED':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
      case 'REVISION':
        return 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'APPROVED':
        return 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-stone-800 dark:text-stone-300';
    }
  };

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-xs mb-8 transition-colors ${
      isDarkTheme ? 'bg-stone-900 border-stone-800' : 'bg-white border-slate-200'
    }`}>
      {/* 1. Primary Calendar Header & Title Bar */}
      <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDarkTheme ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-base font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Kalender Deadline Studio
              </h2>

              {/* Time Horizon Pill */}
              {isCurrentMonthNow && (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Bulan Berjalan
                </span>
              )}
              {isPastMonth && (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 border border-slate-300 dark:border-stone-700 flex items-center gap-1">
                  <History className="w-3 h-3 text-slate-500" /> Data Riwayat Masa Lalu
                </span>
              )}
              {isFutureMonth && (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-blue-500" /> Deadline Bulan Mendatang
                </span>
              )}
            </div>
            <p className={`text-xs ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
              Navigasi tenggat waktu karya desain kreatif berdasarkan tanggal, bulan, dan tahun
            </p>
          </div>
        </div>

        {/* Quick Month Metrics & Today Jump */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-3 text-xs pr-2 border-r border-slate-200 dark:border-stone-800">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <strong>{monthStats.inProgressCount}</strong> Berjalan
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <strong>{monthStats.completedCount}</strong> Selesai
            </span>
            {monthStats.overdueCount > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <strong>{monthStats.overdueCount}</strong> Overdue
              </span>
            )}
          </div>

          <button
            onClick={goToToday}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
              isCurrentMonthNow
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : isDarkTheme 
                  ? 'border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200' 
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
            }`}
            title="Kembali ke Bulan & Hari Ini"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Hari Ini</span>
          </button>

          {/* Unscheduled toggle button */}
          {unscheduledTasks.length > 0 && (
            <button
              onClick={() => setShowUnscheduled(prev => !prev)}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                showUnscheduled 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : isDarkTheme 
                    ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' 
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tanpa Deadline</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                showUnscheduled ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {unscheduledTasks.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Date / Month / Year Search Toolbar */}
      <div className={`p-3.5 sm:px-5 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDarkTheme ? 'bg-stone-900 border-stone-800' : 'bg-amber-50/30 border-slate-200'
      }`}>
        {/* Month & Year Selectors with Arrows */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Month */}
          <button
            onClick={goToPrevMonth}
            title="Bulan Sebelumnya"
            className={`p-1.5 rounded-lg border transition ${
              isDarkTheme ? 'border-stone-700 text-stone-300 hover:bg-stone-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Month Dropdown Selector */}
          <select
            value={currentMonth}
            onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
              isDarkTheme 
                ? 'bg-stone-950 border-stone-700 text-white focus:border-amber-500' 
                : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-2xs'
            }`}
          >
            {monthNames.map((mName, idx) => (
              <option key={mName} value={idx}>
                {mName}
              </option>
            ))}
          </select>

          {/* Year Dropdown Selector */}
          <select
            value={currentYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer font-mono ${
              isDarkTheme 
                ? 'bg-stone-950 border-stone-700 text-amber-400 focus:border-amber-500' 
                : 'bg-white border-slate-300 text-amber-700 focus:border-amber-500 shadow-2xs'
            }`}
          >
            {availableYears.map(yr => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Next Month */}
          <button
            onClick={goToNextMonth}
            title="Bulan Berikutnya"
            className={`p-1.5 rounded-lg border transition ${
              isDarkTheme ? 'border-stone-700 text-stone-300 hover:bg-stone-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Exact Date Jump & Keyword Search */}
        <div className="flex items-center gap-2 flex-wrap flex-1 sm:flex-initial justify-end">
          {/* Direct Date Picker */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`text-[11px] font-bold hidden md:inline ${isDarkTheme ? 'text-stone-400' : 'text-slate-500'}`}>
              Lompat ke Tanggal:
            </span>
            <input
              type="date"
              title="Pilih tanggal spesifik untuk langsung melihat kalender dan tugas pada tanggal tersebut"
              onChange={handleDirectDatePick}
              className={`px-2.5 py-1.5 text-xs rounded-xl border transition font-mono ${
                isDarkTheme 
                  ? 'bg-stone-950 border-stone-700 text-white' 
                  : 'bg-white border-slate-300 text-slate-800 shadow-2xs'
              }`}
            />
          </div>

          {/* Quick Filter/Search input within calendar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deadline / kode..."
              value={dateSearchInput}
              onChange={(e) => setDateSearchInput(e.target.value)}
              className={`pl-8 pr-7 py-1.5 text-xs rounded-xl border transition w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                isDarkTheme 
                  ? 'bg-stone-950 border-stone-800 text-stone-200 placeholder-stone-500 focus:border-amber-500' 
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500 shadow-2xs'
              }`}
            />
            {dateSearchInput && (
              <button
                onClick={() => setDateSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className={`absolute right-0 top-full mt-1.5 w-72 rounded-xl border shadow-xl z-30 p-2 space-y-1 animate-in fade-in ${
                isDarkTheme ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                  Hasil Pencarian Deadline:
                </div>
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.deadline) {
                        const parts = item.deadline.split('-');
                        if (parts.length >= 2) {
                          setCurrentDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
                          setSelectedHighlightDate(item.deadline.slice(0, 10));
                        }
                      }
                      setDateSearchInput('');
                    }}
                    className={`p-2 rounded-lg cursor-pointer text-xs transition flex flex-col gap-0.5 ${
                      isDarkTheme ? 'hover:bg-stone-800' : 'hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-600 font-mono text-[11px]">{item.taskCode}</span>
                      <span className="text-[10.5px] font-mono text-slate-500">{item.deadline}</span>
                    </div>
                    <div className="truncate text-slate-600 dark:text-stone-300 text-[11px]">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Quick Chips: Months with Scheduled Deadlines */}
      {monthsWithTasks.length > 0 && (
        <div className={`px-4 sm:px-5 py-2 border-b flex items-center gap-2 overflow-x-auto text-xs ${
          isDarkTheme ? 'bg-stone-950/60 border-stone-800' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <span className="text-[10.5px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-amber-500" />
            Bulan dengan Deadline:
          </span>

          <div className="flex items-center gap-1.5 flex-nowrap">
            {monthsWithTasks.map(item => {
              const isActive = item.year === currentYear && item.month === currentMonth;
              const label = `${monthNames[item.month].slice(0, 3)} ${item.year}`;

              return (
                <button
                  key={`${item.year}-${item.month}`}
                  onClick={() => {
                    setCurrentDate(new Date(item.year, item.month, 1));
                    setSelectedHighlightDate(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition shrink-0 flex items-center gap-1 ${
                    isActive
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : isDarkTheme
                        ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1 py-0.2 rounded-full text-[9px] font-mono ${
                    isActive ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Unscheduled Tasks Bar (Collapsible) */}
      {showUnscheduled && unscheduledTasks.length > 0 && (
        <div className={`p-4 border-b animate-in slide-in-from-top-2 ${
          isDarkTheme ? 'bg-amber-950/20 border-amber-900/40 text-stone-200' : 'bg-amber-50/60 border-amber-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Tugas Belum Dijadwalkan (Tanpa Tanggal Deadline)
            </h3>
            <span className="text-[11px] text-slate-400">
              Klik kartu tugas untuk mengatur tanggal tenggat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {unscheduledTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`p-2.5 rounded-xl border cursor-pointer transition shadow-2xs ${
                  isDarkTheme 
                    ? 'bg-stone-900 border-stone-800 hover:border-amber-500/50' 
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-[10.5px] font-bold text-amber-600">
                    {task.taskCode}
                  </span>
                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold border ${getStatusStyle(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs font-bold truncate">
                  {task.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {task.projectName || 'Tanpa Proyek'} • {task.assignedUserName || 'Belum Ditugaskan'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Weekday Header */}
      <div className={`grid grid-cols-7 border-b text-center text-xs font-bold ${
        isDarkTheme ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-slate-100/80 border-slate-200 text-slate-600'
      }`}>
        {dayNames.map((d, i) => (
          <div key={d} className={`py-2.5 px-2 ${i >= 5 ? 'text-rose-500 font-extrabold' : ''}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 6. Calendar Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-stone-800">
        {calendarCells.map((cell, idx) => {
          const isOverdueDay = cell.dateKey < todayKey;
          const isHighlighted = cell.dateKey === selectedHighlightDate;

          return (
            <div
              key={cell.dateKey + idx}
              className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 flex flex-col justify-between transition group relative ${
                isHighlighted
                  ? (isDarkTheme ? 'bg-amber-950/40 ring-2 ring-amber-500' : 'bg-amber-100/60 ring-2 ring-amber-500')
                  : !cell.isCurrentMonth 
                    ? (isDarkTheme ? 'bg-stone-950/30 text-stone-600' : 'bg-slate-50/40 text-slate-300')
                    : cell.isToday 
                      ? (isDarkTheme ? 'bg-amber-950/15' : 'bg-amber-50/40')
                      : (isDarkTheme ? 'bg-stone-900/60' : 'bg-white')
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  cell.isToday
                    ? 'bg-amber-500 text-white font-black shadow-xs'
                    : isHighlighted
                      ? 'bg-amber-600 text-white font-bold'
                      : cell.isCurrentMonth
                        ? (isDarkTheme ? 'text-stone-300' : 'text-slate-700')
                        : (isDarkTheme ? 'text-stone-600' : 'text-slate-300')
                }`}>
                  {cell.dayNumber}
                </span>

                {/* Quick Add Task with this deadline */}
                {onAddTaskWithDeadline && (
                  <button
                    onClick={() => onAddTaskWithDeadline(cell.dateKey)}
                    title={`Tambah tugas deadline ${cell.dateKey}`}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tasks List for Date */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {cell.tasks.slice(0, 3).map(task => {
                  const isTaskCompleted = task.status === 'COMPLETED' || task.status === 'APPROVED';
                  const isOverdue = !isTaskCompleted && isOverdueDay;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      title={`${task.taskCode}: ${task.title} (${task.status})`}
                      className={`p-1 sm:p-1.5 rounded-lg border text-[10.5px] cursor-pointer transition shadow-2xs flex flex-col gap-0.5 ${
                        isOverdue
                          ? 'border-rose-400 bg-rose-50/80 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
                          : isDarkTheme
                            ? 'bg-stone-850 border-stone-700/80 text-stone-200 hover:border-amber-500/50'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-[9.5px] text-amber-600 truncate">
                          {task.taskCode}
                        </span>
                        {task.priority === 'URGENT' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Urgent" />
                        )}
                      </div>
                      <div className="font-semibold truncate text-[10px] leading-tight">
                        {task.title}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span className="truncate">{task.assignedUserName || 'Unassigned'}</span>
                        <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold border ${getStatusStyle(task.status)}`}>
                          {task.status === 'IN_PROGRESS' ? '02. In Prog' : task.status === 'UNDER_REVIEW' ? '03. QC' : task.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {cell.tasks.length > 3 && (
                  <button
                    onClick={() => onSelectTask(cell.tasks[3])}
                    className="w-full text-center text-[9.5px] font-bold text-amber-600 hover:underline py-0.5"
                  >
                    +{cell.tasks.length - 3} lagi
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7. Calendar Footer Legend & Navigation Summary */}
      <div className={`p-3.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
        isDarkTheme ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <span className="font-bold text-slate-600 dark:text-stone-300">Indikator:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Hari Ini
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Selesai / Approved
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue (Terlewat)
          </span>
        </div>

        <div className="text-[11px] font-medium flex items-center gap-2">
          <span>Menampilkan: <strong>{monthNames[currentMonth]} {currentYear}</strong></span>
          <span>•</span>
          <span><strong className="font-mono text-amber-600">{calendarCells.reduce((acc, c) => acc + c.tasks.length, 0)}</strong> tugas di bulan ini</span>
        </div>
      </div>
    </div>
  );
};
