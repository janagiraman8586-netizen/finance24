'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  AlertCircle
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
  CartesianGrid
} from 'recharts';

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
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, monthRes, catRes, txRes, budgetRes, savingsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/monthly'),
        api.get('/analytics/categories'),
        api.get('/transactions?limit=5'),
        api.get('/budgets').catch(() => ({ data: null })),
        api.get('/savings').catch(() => ({ data: [] }))
      ]);

      setSummary(sumRes.data);
      setMonthly(monthRes.data.months || []);
      setCategories(catRes.data.categories || []);
      setTransactions(txRes.data.items || []);
      setBudget(budgetRes.data);
      setSavingsGoals(savingsRes.data || []);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-800 rounded-xl lg:col-span-2"></div>
          <div className="h-72 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const balance = (summary?.total_income || 0) - (summary?.total_expenses || 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financial Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time overview of your income, expenses, budget, and savings health</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => globalThis.location.href = '/income'} size="sm" variant="secondary" className="gap-1">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Income</span>
          </Button>
          <Button onClick={() => globalThis.location.href = '/expenses'} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Button>
          <Button onClick={() => globalThis.location.href = '/savings'} size="sm" variant="ghost" className="gap-1 text-purple-400 hover:text-purple-300">
            <Target className="w-4 h-4" />
            <span>Savings Goal</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover border-blue-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Balance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
              <Activity className="w-3 h-3 text-blue-400" />
              <span>Net balance available</span>
            </div>
          </div>
        </Card>

        <Card className="glass-card-hover border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400">₹{(summary?.total_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400/80">
              <ArrowUpRight className="w-3 h-3" />
              <span>Top source: {summary?.top_income_source || 'Salary'}</span>
            </div>
          </div>
        </Card>

        <Card className="glass-card-hover border-red-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-400">₹{(summary?.total_expenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-red-400/80">
              <ArrowDownLeft className="w-3 h-3" />
              <span>Avg daily: ₹{summary?.average_daily_spending || 0}/day</span>
            </div>
          </div>
        </Card>

        <Card className="glass-card-hover border-purple-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Savings & Health</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-300">₹{(summary?.total_savings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <div className="text-[11px] text-slate-400">Savings rate: {summary?.savings_rate || 0}%</div>
            </div>
            <Badge variant={summary?.financial_health === 'Excellent' ? 'success' : 'warning'}>
              {summary?.financial_health || 'Good'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Budget & Savings Progress Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Budget Summary */}
        <Card title="Monthly Budget Allocation" subtitle="Track your spending against your set monthly budget">
          {budget ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Spent: <strong className="text-slate-200">₹{budget.total_used.toLocaleString('en-IN')}</strong></span>
                <span className="text-slate-400">Budget: <strong className="text-slate-200">₹{budget.total_amount.toLocaleString('en-IN')}</strong></span>
                <span className="text-slate-400">Remaining: <strong className={budget.total_remaining < 0 ? 'text-red-400' : 'text-emerald-400'}>₹{budget.total_remaining.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budget.percentage_used > 100 ? 'bg-red-500' : budget.percentage_used > 80 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, budget.percentage_used)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Usage: <strong>{budget.percentage_used.toFixed(1)}%</strong></span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  budget.percentage_used > 100 ? 'bg-red-500/20 text-red-400' : budget.percentage_used > 80 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {budget.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <PieIcon className="w-6 h-6 text-slate-600" />
              <span>No monthly budget created yet.</span>
              <Button size="sm" variant="secondary" onClick={() => globalThis.location.href = '/budget'}>
                Create Budget
              </Button>
            </div>
          )}
        </Card>

        {/* Savings Goal Tracker */}
        <Card title="Savings Goals Progress" subtitle="Milestones towards your targeted financial goals">
          {savingsGoals.length > 0 ? (
            <div className="space-y-4 pt-2">
              {savingsGoals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{goal.title}</span>
                    <span className="text-purple-400 font-bold">₹{goal.current_amount.toLocaleString('en-IN')} / ₹{goal.target_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, goal.percentage_completed)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{goal.percentage_completed.toFixed(1)}% achieved</span>
                    <span>{goal.days_remaining} days left</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Target className="w-6 h-6 text-slate-600" />
              <span>No savings goals set.</span>
              <Button size="sm" variant="secondary" onClick={() => globalThis.location.href = '/savings'}>
                Create Goal
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card title="Income vs Expenses (Monthly)" className="lg:col-span-2">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Expense Distribution Pie Chart */}
        <Card title="Expenses by Category">
          {categories.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No expense categories recorded yet
            </div>
          )}
        </Card>
      </div>

      {/* Monthly Financial Trend Line Chart */}
      <Card title="Financial Trend & Cash Flow" subtitle="Monthly trend of Income, Expenses, and Net Savings">
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Transactions Section */}
      <Card
        title="Recent Transactions Ledger"
        subtitle="Showing latest financial transactions across all payment methods"
        action={
          <Button onClick={() => globalThis.location.href = '/transactions'} size="sm" variant="ghost">
            View All &rarr;
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Payment Method</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-medium text-slate-200">{tx.description}</td>
                  <td className="py-3">
                    <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                      {tx.type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-400">{tx.payment_method || 'Cash'}</td>
                  <td className="py-3 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={`py-3 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{floatVal(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No transactions recorded. Click Add Income or Add Expense to start tracking.
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

function floatVal(val: number | string): number {
  return typeof val === 'number' ? val : parseFloat(val || '0');
}
