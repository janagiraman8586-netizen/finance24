'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, TrendingDown, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { toSafeISODate, formatCurrency, formatDate, floatVal } from '@/utils/formatters';

interface CategoryItem {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

interface ExpenseItem {
  id: number;
  amount: number | string;
  description?: string;
  payment_method?: string;
  date: string;
  category?: CategoryItem;
  category_id?: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    payment_method: 'UPI',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses?limit=100');
      setExpenses(res.data.items || []);
    } catch (err: unknown) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories').catch(() => api.get('/admin/categories')).catch(() => ({ data: [] }));
      const all = res.data || [];
      const expenseOnly = all.filter((c: CategoryItem) => c.type === 'expense');
      setCategories(expenseOnly.length > 0 ? expenseOnly : all);
      if (all.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: String(all[0].id) }));
      }
    } catch (err: unknown) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleOpenModal = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({
      amount: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      description: '',
      payment_method: 'UPI',
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const applyPreset = (desc: string, categoryKeyword: string, amount: string, method = 'UPI') => {
    const matched = categories.find(c => c.name.toLowerCase().includes(categoryKeyword.toLowerCase())) || categories[0];
    setFormData(prev => ({
      ...prev,
      description: desc,
      category_id: matched ? String(matched.id) : prev.category_id,
      amount: prev.amount || amount,
      payment_method: method
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/expenses', {
        amount: parsedAmount,
        category_id: formData.category_id ? parseInt(formData.category_id) : (categories[0]?.id || 1),
        description: formData.description || 'Expense entry',
        payment_method: formData.payment_method || 'UPI',
        date: toSafeISODate(formData.date),
      });

      setSuccessMessage('Expense recorded successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 900);

      setFormData({
        amount: '',
        category_id: categories.length > 0 ? String(categories[0].id) : '',
        description: '',
        payment_method: 'UPI',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Failed to record expense. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete expense record');
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + floatVal(item.amount), 0);
  const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </span>
            <span>Expense Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Classify and control personal and operational daily spending</p>
        </div>

        <Button onClick={handleOpenModal} className="gap-2 bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40">
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Outflows Tracked</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{expenses.length} expense transactions</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Average Expense / Item</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {formatCurrency(avgExpense)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Average per registered checkout</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Latest Payment Method</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2">
            {expenses.length > 0 ? (expenses[0].payment_method || 'UPI') : 'None'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Most frequent payment route</p>
        </Card>
      </div>

      {/* Expense Records Card */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-200">Expense Ledger</h2>
          <span className="text-xs text-slate-400">{expenses.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-medium text-slate-200">{exp.description || 'General purchase'}</td>
                  <td className="py-3 text-slate-300">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[11px]">
                      {exp.category?.icon || '📦'} {exp.category?.name || 'Expense'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{exp.payment_method || 'UPI'}</td>
                  <td className="py-3 text-slate-400">{formatDate(exp.date)}</td>
                  <td className="py-3 text-right font-bold text-rose-400">
                    -{formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-xl">
                        🛒
                      </div>
                      <h3 className="font-semibold text-slate-200">No expenses recorded</h3>
                      <p className="text-xs text-slate-400">
                        Record everyday groceries, coffee, utility bills, and shopping to maintain your budget.
                      </p>
                      <Button size="sm" onClick={handleOpenModal} className="mt-2 bg-rose-600 hover:bg-rose-500">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Log First Expense</span>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Expense">
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
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Common Presets</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('Weekly Groceries & Vegetables', 'Food', '2450', 'UPI')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              🛒 Groceries
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Fiber Broadband Internet Bill', 'Utilities', '1199', 'Credit Card')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              ⚡ WiFi Bill
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Petrol & Vehicle Refuel', 'Transport', '1500', 'Credit Card')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              ⛽ Petrol / Gas
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Weekend Restaurant Dinner', 'Food', '1850', 'UPI')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              🍽️ Dining
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
            placeholder="0.00"
            required
            autoFocus
          />

          <Input
            label="Description / Merchant"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Reliance Fresh, Amazon, Shell fuel..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '📁'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          <Input
            label="Expense Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white"
          >
            {submitting ? 'Recording...' : 'Save Expense Entry'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
