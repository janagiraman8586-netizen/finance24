'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, TrendingUp, Calendar, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { toSafeISODate, formatCurrency, formatDate, floatVal } from '@/utils/formatters';

interface IncomeItem {
  id: number;
  amount: number | string;
  source: string;
  description?: string;
  date: string;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    source: 'Salary',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await api.get('/income?limit=100');
      setIncomes(res.data.items || []);
    } catch (err: any) {
      console.error('Failed to fetch income records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({
      amount: '',
      source: 'Salary',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const applyPreset = (source: string, desc: string, defaultAmount: string) => {
    setFormData((prev) => ({
      ...prev,
      source,
      description: desc,
      amount: prev.amount || defaultAmount
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid income amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/income', {
        amount: parsedAmount,
        source: formData.source || 'Salary',
        description: formData.description || 'Income credit',
        date: toSafeISODate(formData.date),
      });

      setSuccessMessage('Income entry logged successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 900);

      setFormData({ amount: '', source: 'Salary', description: '', date: new Date().toISOString().split('T')[0] });
      fetchIncome();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : (err?.message || 'Failed to log income. Please ensure you are logged in.');
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this income entry?')) return;
    try {
      await api.delete(`/income/${id}`);
      fetchIncome();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete income record');
    }
  };

  const totalIncome = incomes.reduce((sum, item) => sum + floatVal(item.amount), 0);
  const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span>Income Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track incoming revenues from salaries, freelance projects, and investments</p>
        </div>

        <Button onClick={handleOpenModal} className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30">
          <Plus className="w-4 h-4" />
          <span>Add New Income</span>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Income Tracked</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{incomes.length} recorded entries</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Average Income / Entry</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {formatCurrency(avgIncome)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Calculated across all sources</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Top Source</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">
            {incomes.length > 0 ? incomes[0].source : 'None'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Most recent logged income</p>
        </Card>
      </div>

      {/* Income Records Card */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-200">Recent Income Ledger</h2>
          <span className="text-xs text-slate-400">{incomes.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Source</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-emerald-400">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                      💰 {inc.source}
                    </span>
                  </td>
                  <td className="py-3 text-slate-200">{inc.description || '—'}</td>
                  <td className="py-3 text-slate-400">{formatDate(inc.date)}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    +{formatCurrency(inc.amount)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(inc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {incomes.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                        💵
                      </div>
                      <h3 className="font-semibold text-slate-200">No income logged yet</h3>
                      <p className="text-xs text-slate-400">
                        Start recording your salaries, client payments, dividends, or other revenue streams.
                      </p>
                      <Button size="sm" onClick={handleOpenModal} className="mt-2 bg-emerald-600 hover:bg-emerald-500">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Log First Income</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal with Quick Presets and Validation */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Income">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Quick Presets</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('Salary', 'Monthly software engineer salary', '75000')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              💼 Full-time Salary
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Freelance', 'Client web design project', '25000')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              💻 Freelance Project
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Investments', 'Dividend payout / Stock returns', '8500')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              📈 Investment Returns
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Business', 'E-commerce sales revenue', '40000')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              🏪 Business Income
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="e.g. 50000"
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Income Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Salary">Salary (Full-time / Part-time)</option>
              <option value="Freelance">Freelance & Consulting</option>
              <option value="Business">Business & Sales Revenue</option>
              <option value="Investments">Investments & Dividends</option>
              <option value="Rental">Rental Property Income</option>
              <option value="Bonus">Bonus & Incentives</option>
              <option value="Other Income">Other Income</option>
            </select>
          </div>

          <Input
            label="Description / Client / Company"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Acme Corp monthly salary"
          />

          <Input
            label="Date Received"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {submitting ? 'Saving...' : 'Save Income Entry'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
