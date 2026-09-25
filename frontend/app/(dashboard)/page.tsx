'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Activity,
  PieChart as PieIcon,
  Target,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { toSafeISODate, formatCurrency, formatDate, floatVal } from '@/utils/formatters';

interface SummaryData {
  total_income: number;
  total_expenses: number;
  total_savings: number;
  savings_rate: number;
  average_daily_spending: number;
  top_income_source?: string;
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

interface TransactionItem {
  id: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  payment_method?: string;
  date: string;
  amount: number | string;
}

interface BudgetData {
  id: number;
  month: number;
  year: number;
  total_amount: number;
  total_used: number;
  total_remaining: number;
  percentage_used: number;
  status: string;
}

interface SavingsGoalItem {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  percentage_completed: number;
  days_remaining: number;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Modal from Dashboard
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({
    description: '',
    type: 'expense',
    amount: '',
    payment_method: 'UPI',
    date: new Date().toISOString().split('T')[0]
  });
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, monthRes, catRes, txRes, budgetRes, savingsRes] = await Promise.all([
        api.get('/analytics/summary').catch(() => ({ data: null })),
        api.get('/analytics/monthly').catch(() => ({ data: { months: [] } })),
        api.get('/analytics/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/transactions?limit=8').catch(() => ({ data: { items: [] } })),
        api.get('/budgets').catch(() => ({ data: null })),
        api.get('/savings').catch(() => ({ data: [] }))
      ]);

      setSummary(sumRes?.data || {
        total_income: 0,
        total_expenses: 0,
        total_savings: 0,
        savings_rate: 0,
        average_daily_spending: 0,
        financial_health: 'Good'
      });
      setMonthly(monthRes?.data?.months || []);
      setCategories(catRes?.data?.categories || []);
      setTransactions(txRes?.data?.items || []);
      setBudget(budgetRes?.data || null);
      setSavingsGoals(savingsRes?.data || []);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(quickForm.amount);
    if (isNaN(amt) || amt <= 0) return;

    setQuickSubmitting(true);
    try {
      await api.post('/transactions', {
        description: quickForm.description || 'Quick Transaction',
        type: quickForm.type,
        amount: amt,
        category_id: 1,
        payment_method: quickForm.payment_method,
        date: toSafeISODate(quickForm.date),
      });
      setIsQuickAddOpen(false);
      setQuickForm({
        description: '',
        type: 'expense',
        amount: '',
        payment_method: 'UPI',
        date: new Date().toISOString().split('T')[0]
      });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to log quick transaction. Please verify your connection.');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'];

  const totalIncome = summary?.total_income || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = user?.first_name || user?.username || 'Finance Member';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-900/60 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900/60 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900/60 rounded-xl lg:col-span-2"></div>
          <div className="h-80 bg-slate-900/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Live Date & Health Score */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 font-medium">Live Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            {greeting}, <span className="text-blue-400">{userName}</span> 👋
          </h1>
          <p className="text-xs text-slate-400">
            Here is your financial portfolio summary, budget velocity, and monthly tracking at a glance.
          </p>
        </div>

        {/* Quick Actions & Health Metric */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Health Score</span>
              <span className="text-xs font-bold text-emerald-400">
                {savingsRate >= 20 ? '88/100 • Excellent' : savingsRate >= 0 ? '72/100 • Stable' : '45/100 • Attention'}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setIsQuickAddOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards (Prompt 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/40 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Income</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {formatCurrency(totalIncome)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-400">Revenue Stream</span>
            <Link href="/income" className="text-emerald-400 hover:underline flex items-center gap-0.5">
              <span>View details</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-slate-900/40 relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Expenses</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-400">Daily Avg: {formatCurrency(summary?.average_daily_spending || (totalExpenses / 30))}</span>
            <Link href="/expenses" className="text-rose-400 hover:underline flex items-center gap-0.5">
              <span>View details</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Net Savings */}
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900/40 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Net Savings & Balance</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold mt-2 ${netSavings >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
            {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-400">Savings Rate:</span>
            <span className={`font-semibold ${savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {savingsRate}%
            </span>
          </div>
        </Card>

        {/* Budget Status */}
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-900/40 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Budget Allocation</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {budget ? formatCurrency(budget.total_remaining) : formatCurrency(Math.max(0, totalIncome - totalExpenses))}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-400">{budget ? `${budget.percentage_used}% spent` : 'Monthly limit'}</span>
            <Link href="/budget" className="text-amber-400 hover:underline flex items-center gap-0.5">
              <span>Manage</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Middle Row: Spending & Revenue Trends + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Income vs Expense Trends */}
        <Card className="lg:col-span-2 border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Monthly Cash Flow Trends (Last 6 Months)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Comparison between total incoming revenue and expenditures</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val: any) => [formatCurrency(val), '']}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                <Activity className="w-8 h-8 text-slate-600" />
                <p>Not enough historical transaction data yet to plot trends.</p>
                <Link href="/transactions">
                  <Button size="sm" variant="secondary" className="text-xs">Add First Transaction</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Category Breakdown (Donut + Progress) */}
        <Card className="border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                <span>Spending by Category</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Distribution across primary categories</p>
            </div>
            <Link href="/analytics" className="text-xs text-blue-400 hover:underline">
              Full Analytics
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      formatter={(val: any) => [formatCurrency(val), 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top 4 Categories List */}
              <div className="space-y-2 text-xs">
                {categories.slice(0, 4).map((cat, idx) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span>{cat.name}</span>
                      </span>
                      <span className="font-semibold text-slate-100">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, cat.percentage || 10)}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <PieIcon className="w-8 h-8 text-slate-600" />
              <p>No expense categories logged yet.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Row: Recent Transactions + Goals / Budget Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (Prompt 2) */}
        <Card className="lg:col-span-2 border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Recent Transactions</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Last 8 logged transactions on your ledger</p>
            </div>
            <Link href="/transactions">
              <Button size="sm" variant="secondary" className="gap-1 text-xs text-blue-400">
                <span>View All ({transactions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.slice(0, 6).map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{tx.description}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-400">{tx.payment_method || 'Cash'}</td>
                      <td className="py-2.5 text-slate-400">{formatDate(tx.date)}</td>
                      <td className={`py-2.5 text-right font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No recent transactions to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Savings Goals & Target Progress Widget (Prompt 2 & 17) */}
        <Card className="border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Savings Goals Progress</span>
              </h2>
              <Link href="/savings" className="text-xs text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            {savingsGoals.length > 0 ? (
              <div className="space-y-4 text-xs">
                {savingsGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{goal.title}</span>
                      <span className="text-emerald-400 font-bold">{goal.percentage_completed}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, goal.percentage_completed)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Saved: {formatCurrency(goal.current_amount)}</span>
                      <span>Target: {formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center space-y-3">
                <PiggyBank className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-semibold text-slate-200">No Active Savings Goals</h4>
                <p className="text-[11px] text-slate-400">
                  Create a goal for an emergency fund, new laptop, or vacation trip.
                </p>
                <Link href="/savings">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                    Create Savings Goal
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 text-[11px] text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Budget Velocity:</strong> You are pacing at <strong>{savingsRate}%</strong> savings rate for this cycle.
            </span>
          </div>
        </Card>
      </div>

      {/* Quick Add Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Quick Record Transaction"
      >
        <form onSubmit={handleQuickAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuickForm({ ...quickForm, type: 'expense' })}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${quickForm.type === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickForm({ ...quickForm, type: 'income' })}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${quickForm.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Income</span>
              </button>
            </div>
          </div>

          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={quickForm.amount}
            onChange={(e) => setQuickForm({ ...quickForm, amount: e.target.value })}
            placeholder="0.00"
            required
            autoFocus
          />

          <Input
            label="Description"
            value={quickForm.description}
            onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
            placeholder="e.g. Swiggy food delivery, Metro pass..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment Method</label>
              <select
                value={quickForm.payment_method}
                onChange={(e) => setQuickForm({ ...quickForm, payment_method: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={quickForm.date}
              onChange={(e) => setQuickForm({ ...quickForm, date: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={quickSubmitting}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white"
          >
            {quickSubmitting ? 'Logging...' : 'Save Record'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
