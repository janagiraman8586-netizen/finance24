'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Lightbulb,
  FileSpreadsheet
} from 'lucide-react';
import { toSafeISODate, formatCurrency, formatDate, floatVal } from '@/utils/formatters';

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
  notes?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description' | 'id'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
  const [viewingTx, setViewingTx] = useState<TransactionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    description: '',
    type: 'expense',
    amount: '',
    category_id: '',
    payment_method: 'UPI',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [debouncedSearch, typeFilter, categoryFilter, paymentMethodFilter, startDate, endDate, sortBy, sortOrder, page, limit]);

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
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;

      const res = await api.get(url);
      setTransactions(res.data.items || []);
      setTotalCount(res.data.total || 0);
      setSelectedIds([]);
    } catch (err: unknown) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormError('');
    setFormData({
      description: '',
      type: 'expense',
      amount: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      payment_method: paymentMethods.length > 0 ? paymentMethods[0].name : 'UPI',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const applyTemplate = (desc: string, type: 'income' | 'expense', amount: string, categoryName: string, method = 'UPI') => {
    const matchedCategory = categories.find(c => c.name.toLowerCase().includes(categoryName.toLowerCase())) || categories[0];
    setFormData({
      description: desc,
      type,
      amount,
      category_id: matchedCategory ? String(matchedCategory.id) : '',
      payment_method: method,
      date: new Date().toISOString().split('T')[0],
      notes: 'Logged via quick preset template',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: TransactionItem) => {
    setEditingTx(tx);
    setFormError('');
    setFormData({
      description: tx.description,
      type: tx.type,
      amount: String(tx.amount),
      category_id: tx.category_id ? String(tx.category_id) : '',
      payment_method: tx.payment_method || 'UPI',
      date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: tx.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        description: formData.description || 'Transaction',
        type: formData.type,
        amount: amt,
        category_id: formData.category_id ? parseInt(formData.category_id) : (categories[0]?.id || 1),
        payment_method: formData.payment_method,
        date: toSafeISODate(formData.date),
      };

      if (editingTx) {
        await api.put(`/transactions/${editingTx.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      setIsModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setFormError(typeof detail === 'string' ? detail : 'Failed to save transaction. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete transaction');
    }
  };

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(transactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected transaction(s)?`)) return;

    try {
      await Promise.all(selectedIds.map(id => api.delete(`/transactions/${id}`)));
      setSelectedIds([]);
      fetchTransactions();
    } catch (err) {
      alert('Error during bulk deletion. Some records may not have been deleted.');
      fetchTransactions();
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const csvRows: string[] = ['ID,Description,Type,Category,Payment Method,Date,Amount'];
    const itemsToExport = selectedIds.length > 0
      ? transactions.filter(t => selectedIds.includes(t.id))
      : transactions;

    itemsToExport.forEach(tx => {
      const cat = categories.find(c => c.id === tx.category_id)?.name || 'General';
      csvRows.push(
        `"${tx.id}","${tx.description.replace(/"/g, '""')}","${tx.type}","${cat}","${tx.payment_method || 'Cash'}","${tx.date}","${tx.amount}"`
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Date Range Presets
  const setQuickDateRange = (preset: 'today' | 'this_month' | 'last_30' | 'this_year' | 'all') => {
    const today = new Date();
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const str = today.toISOString().split('T')[0];
      setStartDate(str);
      setEndDate(str);
    } else if (preset === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'last_30') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(thirtyDaysAgo);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'this_year') {
      setStartDate(`${today.getFullYear()}-01-01`);
      setEndDate(`${today.getFullYear()}-12-31`);
    }
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    setPaymentMethodFilter('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch || typeFilter || categoryFilter || paymentMethodFilter || startDate || endDate || minAmount || maxAmount
  );

  // Client-side amount filtering for min/max if present
  const displayedTransactions = useMemo(() => {
    let list = transactions;
    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) list = list.filter(t => floatVal(t.amount) >= min);
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) list = list.filter(t => floatVal(t.amount) <= max);
    }
    return list;
  }, [transactions, minAmount, maxAmount]);

  // Totals for visible summary bar
  const visibleIncome = displayedTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + floatVal(t.amount), 0);
  const visibleExpenses = displayedTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + floatVal(t.amount), 0);
  const visibleNet = visibleIncome - visibleExpenses;

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleSort = (column: 'date' | 'amount' | 'description' | 'id') => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>Transaction Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {totalCount} Total Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, sort, bulk-manage, and analyze income & expense activity in real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              size="sm"
              variant="danger"
              className="gap-1.5 shadow-lg shadow-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </Button>
          )}

          <Button onClick={handleExportCSV} size="sm" variant="secondary" className="gap-1.5 text-slate-300">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Main Ledger Card */}
      <Card className="border-slate-800">
        {/* Search, Filter Bar & Quick Ranges */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Real-time search with clear icon */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by description, merchant, or notes..."
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Type Select */}
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Quick Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon || '📁'} {c.name}
                </option>
              ))}
            </select>

            {/* Toggle Advanced Filters Button */}
            <Button
              size="sm"
              variant={isAdvancedFiltersOpen ? 'primary' : 'secondary'}
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className="gap-1.5 text-xs shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] text-slate-500 mr-1">Timeframe:</span>
            <button
              onClick={() => setQuickDateRange('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${!startDate && !endDate ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setQuickDateRange('today')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setQuickDateRange('this_month')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => setQuickDateRange('last_30')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setQuickDateRange('this_year')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              This Year
            </button>
          </div>

          {/* Collapsible Advanced Filters Section */}
          {isAdvancedFiltersOpen && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 mt-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800/80">
                <span>Advanced Range & Payment Filtering</span>
                <button
                  onClick={handleClearAllFilters}
                  className="text-blue-400 hover:text-blue-300 text-[11px]"
                >
                  Reset All Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Payment Methods</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.name}>{pm.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Amount Range (₹)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] text-slate-500">Active filters:</span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 border border-slate-700 text-slate-300">
                  Search: "{debouncedSearch}"
                  <button onClick={() => setSearch('')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  Type: {typeFilter}
                  <button onClick={() => setTypeFilter('')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  Category: {categories.find(c => String(c.id) === categoryFilter)?.name || categoryFilter}
                  <button onClick={() => setCategoryFilter('')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {paymentMethodFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 border border-slate-700 text-slate-300">
                  Method: {paymentMethodFilter}
                  <button onClick={() => setPaymentMethodFilter('')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  Dates: {startDate || 'Start'} to {endDate || 'Now'}
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minAmount || maxAmount) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  Amount: ₹{minAmount || '0'} - ₹{maxAmount || '∞'}
                  <button onClick={() => { setMinAmount(''); setMaxAmount(''); }} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleClearAllFilters}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/40">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={displayedTransactions.length > 0 && selectedIds.length === displayedTransactions.length}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th
                  className="py-3 px-2 font-semibold cursor-pointer select-none hover:text-slate-200 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    {sortBy === 'id' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />) : <ArrowUpDown className="w-3 h-3 text-slate-600" />}
                  </div>
                </th>
                <th
                  className="py-3 px-2 font-semibold cursor-pointer select-none hover:text-slate-200 transition-colors"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center gap-1">
                    <span>Description</span>
                    {sortBy === 'description' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />) : <ArrowUpDown className="w-3 h-3 text-slate-600" />}
                  </div>
                </th>
                <th className="py-3 px-2 font-semibold">Category</th>
                <th className="py-3 px-2 font-semibold">Payment</th>
                <th
                  className="py-3 px-2 font-semibold cursor-pointer select-none hover:text-slate-200 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {sortBy === 'date' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />) : <ArrowUpDown className="w-3 h-3 text-slate-600" />}
                  </div>
                </th>
                <th className="py-3 px-2 font-semibold">Status</th>
                <th
                  className="py-3 px-3 font-semibold text-right cursor-pointer select-none hover:text-slate-200 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    {sortBy === 'amount' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />) : <ArrowUpDown className="w-3 h-3 text-slate-600" />}
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedTransactions.map((tx, idx) => {
                const isSelected = selectedIds.includes(tx.id);
                const categoryObj = categories.find(c => c.id === tx.category_id);
                const isIncome = tx.type === 'income';

                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors ${isSelected ? 'bg-blue-950/20' : idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/20'} hover:bg-slate-800/40`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tx.id)}
                        className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">#{tx.id}</td>
                    <td className="py-3 px-2 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span>{tx.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-[11px]">
                        <span>{categoryObj?.icon || (isIncome ? '💰' : '📦')}</span>
                        <span>{categoryObj?.name || (isIncome ? 'General Income' : 'Expense')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-[11px]">{tx.payment_method || 'Cash'}</td>
                    <td className="py-3 px-2 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-bold text-[13px] ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingTx(tx)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Comprehensive Engaging Empty State (Prompt 1) */}
              {displayedTransactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-12 px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                      {/* Engaging Illustration & Floating Badges */}
                      <div className="relative inline-block mx-auto">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/30 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center shadow-2xl shadow-blue-900/20 mx-auto">
                          <FileSpreadsheet className="w-10 h-10 text-blue-400" />
                        </div>
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full font-bold text-[10px] animate-bounce">
                          ₹0.00
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-100">
                          {hasActiveFilters ? 'No Matching Records Found' : 'Your Financial Ledger is Empty'}
                        </h2>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          {hasActiveFilters
                            ? 'Try clearing active search filters or selecting a wider date range to see your entries.'
                            : 'Start by tracking your daily expenses, monthly salary, or investments to unlock real-time financial health analytics.'}
                        </p>
                      </div>

                      {hasActiveFilters ? (
                        <Button onClick={handleClearAllFilters} variant="secondary" size="sm">
                          Clear All Filters
                        </Button>
                      ) : (
                        <div className="space-y-6">
                          <Button
                            onClick={handleOpenAdd}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/30 px-6 py-2.5 font-semibold text-xs"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            <span>Add Your First Transaction</span>
                          </Button>

                          {/* Quick Tutorial Onboarding Steps */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left pt-4 border-t border-slate-800/80">
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                              <span className="text-blue-400 font-bold text-[10px] block uppercase tracking-wider">Step 1</span>
                              <h4 className="text-xs font-semibold text-slate-200">Set Categories</h4>
                              <p className="text-[11px] text-slate-400">Classify groceries, bills, and fun spending.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                              <span className="text-emerald-400 font-bold text-[10px] block uppercase tracking-wider">Step 2</span>
                              <h4 className="text-xs font-semibold text-slate-200">Log Daily Cash</h4>
                              <p className="text-[11px] text-slate-400">Record cash, UPI, cards, and bank payouts.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                              <span className="text-purple-400 font-bold text-[10px] block uppercase tracking-wider">Step 3</span>
                              <h4 className="text-xs font-semibold text-slate-200">Set Budgets</h4>
                              <p className="text-[11px] text-slate-400">Establish limits to prevent overspending.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                              <span className="text-amber-400 font-bold text-[10px] block uppercase tracking-wider">Step 4</span>
                              <h4 className="text-xs font-semibold text-slate-200">Watch Savings</h4>
                              <p className="text-[11px] text-slate-400">Achieve your financial goals effortlessly.</p>
                            </div>
                          </div>

                          {/* Sample Transaction Quick Presets */}
                          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/20 via-slate-900/50 to-indigo-950/20 border border-slate-800 text-left space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>Try One-Click Sample Presets:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => applyTemplate('Monthly Salary Deposit', 'income', '75000', 'Salary', 'Bank Transfer')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                              >
                                <span>💼 Salary Credit: +₹75,000</span>
                              </button>
                              <button
                                onClick={() => applyTemplate('Supermarket & Grocery Restock', 'expense', '3450', 'Food', 'UPI')}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                              >
                                <span>🛒 Groceries: -₹3,450</span>
                              </button>
                              <button
                                onClick={() => applyTemplate('Fiber Internet & Electricity Bill', 'expense', '1850', 'Utilities', 'Credit Card')}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                              >
                                <span>⚡ Electricity & WiFi: -₹1,850</span>
                              </button>
                              <button
                                onClick={() => applyTemplate('Nifty Index Fund SIP', 'expense', '10000', 'Investments', 'Bank Transfer')}
                                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                              >
                                <span>📈 Index SIP: -₹10,000</span>
                              </button>
                            </div>
                          </div>

                          {/* Financial Best Practice Tips */}
                          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              <strong>Pro Tip:</strong> Aim for the <strong>50-30-20 rule</strong> (50% on essentials, 30% on discretionary wants, 20% on investments & debt relief).
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Summary Row & Pagination (Prompt 4) */}
        {displayedTransactions.length > 0 && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            {/* Total Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
              <div className="flex items-center justify-between px-2">
                <span className="text-slate-400">Total Filtered Income:</span>
                <span className="font-bold text-emerald-400">+{formatCurrency(visibleIncome)}</span>
              </div>
              <div className="flex items-center justify-between px-2 sm:border-l sm:border-r sm:border-slate-800">
                <span className="text-slate-400">Total Filtered Expenses:</span>
                <span className="font-bold text-rose-400">-{formatCurrency(visibleExpenses)}</span>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-slate-400">Net Visible Balance:</span>
                <span className={`font-bold ${visibleNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {visibleNet >= 0 ? '+' : ''}{formatCurrency(visibleNet)}
                </span>
              </div>
            </div>

            {/* Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-200">{(page - 1) * limit + 1}</strong> to{' '}
                  <strong className="text-slate-200">{Math.min(page * limit, totalCount)}</strong> of{' '}
                  <strong className="text-slate-200">{totalCount}</strong> entries
                </span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="ml-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs"
                >
                  <option value={10}>10 / page</option>
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 font-medium">
                  Page {page} of {totalPages}
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
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? `Edit Transaction #${editingTx.id}` : 'Record New Transaction'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        {/* Quick presets inside modal */}
        {!editingTx && (
          <div className="mb-4">
            <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyTemplate('Salary Paycheck', 'income', '65000', 'Salary')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                💼 Salary
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Weekly Groceries', 'expense', '2500', 'Food')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                🛒 Groceries
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Restaurant & Dining Out', 'expense', '1200', 'Food')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                🍽️ Dining
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Electricity & Utilities', 'expense', '1450', 'Utilities')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ⚡ Utilities
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${formData.type === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${formData.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
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
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
            autoFocus
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Swiggy, Netflix, Salary, Metro..."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.name}>{pm.name}</option>
                  ))
                ) : (
                  <>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <Input
            label="Transaction Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes / Tag (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add optional notes, tags, or invoice references..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white"
          >
            {submitting ? 'Saving Record...' : editingTx ? 'Save Changes' : 'Confirm Transaction'}
          </Button>
        </form>
      </Modal>

      {/* Transaction Details Viewer Modal */}
      {viewingTx && (
        <Modal
          isOpen={Boolean(viewingTx)}
          onClose={() => setViewingTx(null)}
          title={`Receipt Breakdown • Transaction #${viewingTx.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <span className="text-slate-400 text-[11px] block">Amount Transacted</span>
              <div className={`text-2xl font-bold ${viewingTx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                {viewingTx.type === 'income' ? '+' : '-'}{formatCurrency(viewingTx.amount)}
              </div>
              <Badge variant={viewingTx.type === 'income' ? 'success' : 'danger'}>
                {viewingTx.type.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">Description</span>
                <span className="font-semibold text-slate-200">{viewingTx.description}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Payment Method</span>
                <span className="font-semibold text-slate-200">{viewingTx.payment_method || 'Cash'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Category</span>
                <span className="font-semibold text-slate-200">
                  {categories.find(c => c.id === viewingTx.category_id)?.name || 'General'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Execution Date</span>
                <span className="font-semibold text-slate-200">{formatDate(viewingTx.date)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const tx = viewingTx;
                  setViewingTx(null);
                  handleOpenEdit(tx);
                }}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                <span>Edit</span>
              </Button>
              <Button size="sm" onClick={() => setViewingTx(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
