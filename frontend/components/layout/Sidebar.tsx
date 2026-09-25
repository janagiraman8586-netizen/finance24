'use client';

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
  History
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const userNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Expenses', href: '/expenses', icon: TrendingDown },
    { name: 'Income', href: '/income', icon: TrendingUp },
    { name: 'Budget', href: '/budget', icon: PieChart },
    { name: 'Savings Goals', href: '/savings', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Overview', href: '/admin', icon: Shield },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Transactions Audit', href: '/admin/transactions', icon: Receipt },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  const isAdmin = user?.roles?.includes('admin');

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-lg">
            ₹
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-wide">FINANCE APP</h1>
            <p className="text-[10px] text-slate-400">Enterprise Money Ledger</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
            Main Ledger
          </div>
          <nav className="space-y-1">
            {userNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400/80 mb-2 px-2 flex items-center justify-between">
              <span>Admin Portal</span>
              <Shield className="w-3 h-3 text-purple-400" />
            </div>
            <nav className="space-y-1">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
