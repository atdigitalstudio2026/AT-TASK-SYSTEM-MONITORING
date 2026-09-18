/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { NotificationItem } from '../types';
import { markNotificationAsRead } from '../firebase';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  isDarkTheme?: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  isDarkTheme = false
}) => {
  if (!isOpen) return null;

  const handleRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full max-w-md border-l h-full flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isDarkTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors ${
          isDarkTheme ? 'border-stone-800 bg-stone-950' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h2 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
              Workflow Activity & Alerts
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {notifications.some(n => !n.read) && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-amber-600 hover:text-amber-500 font-medium px-2 py-1 rounded transition flex items-center gap-1"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isDarkTheme ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map(n => {
            const isRevision = n.type === 'revision';
            const isApproval = n.type === 'approval';

            return (
              <div
                key={n.id}
                onClick={() => !n.read && handleRead(n.id)}
                className={`p-3.5 rounded-xl border text-xs transition cursor-pointer ${
                  n.read
                    ? isDarkTheme 
                      ? 'bg-stone-950/40 border-stone-800/60 opacity-70' 
                      : 'bg-slate-50/70 border-slate-200/70 opacity-75 text-slate-600'
                    : isDarkTheme 
                      ? 'bg-stone-950 border-stone-800 shadow-xs ring-1 ring-amber-500/20' 
                      : 'bg-white border-slate-200 shadow-xs ring-1 ring-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className={`flex items-center gap-1.5 font-semibold ${isDarkTheme ? 'text-stone-200' : 'text-slate-800'}`}>
                    {isRevision ? (
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : isApproval ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span>{n.title}</span>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                </div>

                <p className={`text-[11px] leading-relaxed mb-2 ${isDarkTheme ? 'text-stone-400' : 'text-slate-600'}`}>
                  {n.message}
                </p>

                <div className={`flex items-center justify-between text-[10px] ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                  {!n.read && (
                    <span className="text-amber-600 font-semibold hover:underline">
                      Mark as read
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className={`py-16 text-center text-xs ${isDarkTheme ? 'text-stone-500' : 'text-slate-400'}`}>
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>No notifications in this feed yet.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
