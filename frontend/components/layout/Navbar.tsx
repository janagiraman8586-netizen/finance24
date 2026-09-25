'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  LogOut,
  User,
  Shield,
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  Sparkles,
  CheckCircle2,
  Menu
} from 'lucide-react';
import { api } from '@/services/api';

interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [notifsRes, unreadRes] = await Promise.all([
        api.get('/notifications?limit=10').catch(() => ({ data: [] })),
        api.get('/notifications/unread-count').catch(() => ({ data: { unread_count: 0 } }))
      ]);
      setNotifications(notifsRes?.data || []);
      setUnreadCount(unreadRes?.data?.unread_count || 0);
    } catch (e) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    globalThis.location.href = '/login';
  };

  const toggleMobileMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      case 'budget_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'savings_completed':
        return <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'large_expense':
        return <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const isAdmin = user?.roles?.some((r: string) => r.toLowerCase() === 'admin');

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & welcome text */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-200">
            FINANCE24 <span className="text-slate-500 font-normal">|</span>{' '}
            <span className="text-blue-400 font-medium">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.username || 'Personal Account')}
            </span>
          </h2>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {isAdmin && (
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Mode</span>
          </span>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-200">System Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-7 h-7 text-slate-600" />
                    <p>All caught up! No active alerts or notices.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                      className={`p-3 text-xs flex gap-3 transition-colors cursor-pointer hover:bg-slate-800/40 ${
                        notif.is_read ? 'opacity-60' : 'bg-blue-950/15'
                      }`}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-slate-300 leading-snug">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill & Logout */}
        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/30 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {user?.first_name ? user.first_name[0] : (user?.username ? user.username[0].toUpperCase() : <User className="w-4 h-4" />)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[120px]">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.username || 'User')}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                {user?.email || 'Logged in'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
