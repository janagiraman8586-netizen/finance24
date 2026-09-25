'use client';

import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Users, Receipt, ShieldAlert, Activity } from 'lucide-react';

interface AdminStats {
  user_statistics?: {
    total_users: number;
    active_users: number;
    inactive_users: number;
  };
  financial_statistics?: {
    total_platform_income: number;
    total_platform_expenses: number;
    total_volume: number;
  };
  platform_statistics?: {
    total_transactions: number;
    system_health: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/statistics');
      setStats(res.data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span>Admin Portal Overview</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Platform-wide statistics, user controls, and system monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {stats?.user_statistics?.total_users || 0}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {stats?.user_statistics?.active_users || 0} active user accounts
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Total Transactions Logged</span>
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {stats?.platform_statistics?.total_transactions || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all active ledgers</div>
        </Card>

        <Card>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Platform Volume</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            ₹{(stats?.financial_statistics?.total_volume || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total transaction throughput</div>
        </Card>

        <Card>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>System Status</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2">
            {stats?.platform_statistics?.system_health || 'Optimal'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">FastAPI Backend Operational</div>
        </Card>
      </div>
    </div>
  );
}
