import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AppNotification } from '../types';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    await fetchNotifs();
  };

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    await fetchNotifs();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        aria-label={`Notifications: ${unreadCount} unread`}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">Activity Notifications</h3>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Mark read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <span>No notifications yet.</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 ${
                      !n.read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {n.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : n.type === 'alert' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-semibold truncate">{n.title}</strong>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 ml-2"></span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
