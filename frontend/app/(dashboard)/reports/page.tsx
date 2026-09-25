'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, FileText, Printer, Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { api } from '@/services/api';

interface CategoryBreakdown {
  category: string;
  icon?: string;
  amount: number;
  percentage: number;
}

interface PeriodReport {
  period: string;
  start_date: string;
  end_date: string;
  total_income: number;
  total_expenses: number;
  net_cashflow: number;
  savings_rate: number;
  categories: CategoryBreakdown[];
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [report, setReport] = useState<PeriodReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/summary?period=${period}`);
      setReport(res.data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`${api.defaults.baseURL}/reports/monthly?format=csv`, '_blank');
  };

  const handleExportExcel = () => {
    window.open(`${api.defaults.baseURL}/reports/monthly?format=excel`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financial Reports & Statements</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-period cash-flow analysis, category breakdown, and multi-format exports</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} size="sm" variant="secondary" className="gap-1.5 text-slate-300">
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </Button>
          <Button onClick={handleExportCSV} size="sm" variant="secondary" className="gap-1.5 text-slate-300">
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </Button>
          <Button onClick={handleExportExcel} size="sm" className="gap-1.5">
            <Download className="w-4 h-4" />
            <span>Excel Export</span>
          </Button>
        </div>
      </div>

      {/* Period Selection Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              period === p
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {p} Statement
          </button>
        ))}
      </div>

      {/* Report Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card-hover border-emerald-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Gross Income</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              ₹{report.total_income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 capitalize">{period} inflow</div>
          </Card>

          <Card className="glass-card-hover border-red-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Expenses</span>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400 mt-2">
              ₹{report.total_expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 capitalize">{period} expenditure</div>
          </Card>

          <Card className="glass-card-hover border-blue-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Net Cash Flow</span>
              <Wallet className="w-4 h-4 text-blue-400" />
            </div>
            <div className={`text-2xl font-bold mt-2 ${report.net_cashflow >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              ₹{report.net_cashflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Surplus / Deficit</div>
          </Card>

          <Card className="glass-card-hover border-purple-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Savings Efficiency</span>
              <Badge variant={report.savings_rate >= 20 ? 'success' : 'warning'}>
                {report.savings_rate >= 20 ? 'Healthy' : 'Low'}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-purple-300 mt-2">
              {report.savings_rate}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Calculated savings rate</div>
          </Card>
        </div>
      )}

      {/* Category Breakdown Table */}
      <Card title="Category Expense Breakdown" subtitle="Detailed breakdown of spending across categories for this period">
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Share (%)</th>
                <th className="pb-3 font-semibold">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 font-medium text-slate-200 flex items-center gap-2">
                    <span>{cat.icon || '📁'}</span>
                    <span>{cat.category}</span>
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-200">
                    ₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    {cat.percentage}%
                  </td>
                  <td className="py-3 w-48">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {(!report || report.categories.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No expense records found for this selected timeframe.
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
