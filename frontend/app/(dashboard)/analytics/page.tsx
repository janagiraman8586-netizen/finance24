'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

interface SummaryData {
  total_income: number;
  total_expenses: number;
  total_savings: number;
  savings_rate: number;
  financial_health?: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

interface MonthlyItem {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savings_rate: number;
}

interface CategoryItem {
  name: string;
  icon?: string;
  amount: number;
  percentage: number;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [sRes, mRes, cRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/monthly'),
        api.get('/analytics/categories')
      ]);
      setSummary(sRes.data);
      setMonthly(mRes.data.months || []);
      setCategories(cRes.data.categories || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Financial Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Deep-dive insights into spending velocity, savings trends, and financial health</p>
      </div>

      {/* Health Indicator Banner */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Financial Health Rating</span>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Score: <span className="text-emerald-400">{summary?.financial_health || 'Good'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Your current savings rate is <span className="text-slate-200 font-semibold">{summary?.savings_rate || 0}%</span>. You are saving ₹{(summary?.total_savings || 0).toLocaleString()} this month.
            </p>
          </div>
          <Badge size="md" variant={summary?.financial_health === 'Excellent' ? 'success' : 'info'}>
            {summary?.financial_health || 'Good Standing'}
          </Badge>
        </div>
      </Card>

      {/* Monthly Savings Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Savings Trend over 12 Months">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly Cashflow Breakdown">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category Analysis Table */}
      <Card title="Spending Breakdown by Category">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Total Spent</th>
                <th className="pb-3 font-semibold text-right">Percentage of Expenses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">
                    {cat.icon || '📁'} {cat.name}
                  </td>
                  <td className="py-3 text-slate-300">
                    ₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right font-bold text-blue-400">
                    {cat.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No expense category data recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
