'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit2,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

interface PaymentMethodItem {
  id: number;
  name: string;
}

interface TransactionItem {
  id: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  category_id?: number;
  payment_method?: string;
  date: string;
  amount: number | string;
  status?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  
  // Filters & Pagination
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  const [loading, setLoading] = useState(true);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    type: 'expense',
    amount: '',
    category_id: '',
    payment_method: 'UPI',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, paymentMethodFilter, startDate, endDate, sortBy, sortOrder, page]);

  const fetchMetadata = async () => {
    try {
      const [catRes, pmRes] = await Promise.all([
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/payment-methods').catch(() => ({ data: [] }))
      ]);
      setCategories(catRes.data || []);
      setPaymentMethods(pmRes.data || []);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      let url = `/transactions?skip=${skip}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (categoryFilter) url += `&category_id=${categoryFilter}`;
      if (paymentMethodFilter) url += `&payment_method=${encodeURIComponent(paymentMethodFilter)}`;
      if (startDate) url += `&start_date=${startDate}T00:00:00`;
      if (endDate) url += `&end_date=${endDate}T23:59:59`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setTransactions(res.data.items || []);
      setTotalCount(res.data.total || 0);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormData({
      description: '',
      type: 'expense',
      amount: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      payment_method: paymentMethods.length > 0 ? paymentMethods[0].name : 'Cash',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: TransactionItem) => {
    setEditingTx(tx);
    setFormData({
      description: tx.description,
      type: tx.type,
      amount: String(tx.amount),
      category_id: tx.category_id ? String(tx.category_id) : '',
      payment_method: tx.payment_method || 'Cash',
      date: tx.date.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        description: formData.description,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id ? parseInt(formData.category_id) : (categories[0]?.id || 1),
        payment_method: formData.payment_method,
        date: new Date(formData.date).toISOString()
      };

      if (editingTx) {
        await api.put(`/transactions/${editingTx.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      setIsModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch {
      alert('Failed to delete transaction');
    }
  };

  const handleExportCSV = () => {
    window.open(`${api.defaults.baseURL}/reports/export/transactions?format=csv`, '_blank');
  };

  const handleExportExcel = () => {
    window.open(`${api.defaults.baseURL}/reports/export/transactions?format=excel`, '_blank');
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Transaction Management</h1>
          <p className="text-xs text-slate-400 mt-1">Search, filter, sort, edit, and export all financial records</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} size="sm" variant="secondary" className="gap-1 text-slate-300">
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </Button>
          <Button onClick={handleExportExcel} size="sm" variant="secondary" className="gap-1 text-slate-300">
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </Button>
          <Button onClick={handleOpenAdd} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      <Card>
        {/* Search & Comprehensive Filters Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword..."
              className="pl-9 text-xs"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types (Income/Expense)</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon || '📁'} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Payment Methods</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.name}>
                  {pm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              title="Start Date"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              title="End Date"
            />
          </div>
        </form>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">ID</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Payment Method</th>
                <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => {
                  setSortBy('date');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="pb-3 font-semibold text-right cursor-pointer select-none" onClick={() => {
                  setSortBy('amount');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-500">#{tx.id}</td>
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
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match your current search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{transactions.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(page * limit, totalCount)}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalCount}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'Edit Transaction' : 'Record New Transaction'}
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  formData.type === 'expense'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
            <Input
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Supermarket Grocery, Client Payment"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Amount (₹)</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Date</label>
              <Input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '📁'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTx ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function floatVal(val: number | string): number {
  return typeof val === 'number' ? val : parseFloat(val || '0');
}
