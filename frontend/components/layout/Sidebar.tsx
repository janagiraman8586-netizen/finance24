'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Receipt,
  PieChart,
  Target,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Users,
  FolderTree,
  Bell,
  History,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Listen for custom mobile toggle event from Navbar
  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const ledgerNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Expenses', href: '/expenses', icon: TrendingDown, color: 'text-rose-400' },
    { name: 'Income', href: '/income', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  const planningNav = [
    { name: 'Budget Limits', href: '/budget', icon: PieChart },
    { name: 'Savings Goals', href: '/savings', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: 'Insights' },
    { name: 'Reports & Export', href: '/reports', icon: FileText },
  ];

  const systemNav = [
    { name: 'Preferences', href: '/settings', icon: Settings },
  ];

  const adminNav = [
    { name: 'Admin Overview', href: '/admin', icon: Shield },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Audit Transactions', href: '/admin/transactions', icon: Receipt },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Broadcasts', href: '/admin/notifications', icon: Bell },
    { name: 'Security Logs', href: '/admin/audit-logs', icon: History },
  ];

  const isAdmin = user?.roles?.some((r: string) => r.toLowerCase() === 'admin');

  const renderNavGroup = (title: string, items: typeof ledgerNav) => (
    <div className="space-y-1">
      {!isCollapsed && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3 block">
          {title}
        </span>
      )}
      <nav className="space-y-1">
        {items.map((item: any) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm shadow-blue-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-400' : (item.color || 'text-slate-400')}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}

              {!isCollapsed && item.badge && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 lg:z-auto bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-blue-900/30 shrink-0">
              ₹
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <h1 className="font-bold text-slate-100 text-sm tracking-wide">FINANCE24</h1>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Smart Ledger</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                </p>
              </div>
            )}
          </Link>

          {/* Collapse/Expand Toggle on Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Sections (Prompt 3) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {renderNavGroup('Main Ledger', ledgerNav)}
          {renderNavGroup('Planning & Analytics', planningNav)}
          {renderNavGroup('Settings', systemNav)}

          {isAdmin && (
            <div className="pt-2 border-t border-slate-800/80">
              {renderNavGroup('Admin Portal', adminNav)}
            </div>
          )}
        </div>

        {/* Bottom Profile Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.first_name ? user.first_name[0] : (user?.username ? user.username[0].toUpperCase() : 'U')}
                </div>
                <div className="truncate text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {user?.first_name || user?.username || 'Finance Member'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isAdmin ? 'Administrator' : 'Standard User'}
                  </p>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
