'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2 } from 'lucide-react';

interface IncomeItem {
  id: number;
  amount: number | string;
  source: string;
  description?: string;
  date: string;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
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
    try {
      const res = await api.get('/income?limit=50');
      setIncomes(res.data.items || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/income', {
        amount: parseFloat(formData.amount),
        source: formData.source,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
      });
      setIsModalOpen(false);
      setFormData({ amount: '', source: 'Salary', description: '', date: new Date().toISOString().split('T')[0] });
      fetchIncome();
    } catch {
      alert('Failed to log income');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this income entry?')) return;
    try {
      await api.delete(`/income/${id}`);
      fetchIncome();
    } catch {
      alert('Failed to delete income record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Income Management</h1>
          <p className="text-xs text-slate-400 mt-1">Track incoming revenues from salaries, freelance projects, and investments</p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="gap-2 border-emerald-500/30 text-emerald-400">
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </Button>
      </div>

      <Card>
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
                  <td className="py-3 font-semibold text-emerald-400">💰 {inc.source}</td>
                  <td className="py-3 text-slate-200">{inc.description || 'N/A'}</td>
                  <td className="py-3 text-slate-400">{new Date(inc.date).toLocaleDateString()}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    +₹{floatVal(inc.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete(inc.id)} className="p-1 text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {incomes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No income entries found. Click Add Income to register incoming revenue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Income">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Income Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Business">Business</option>
              <option value="Investments">Investments</option>
              <option value="Other Income">Other Income</option>
            </select>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Monthly software salary..."
            required
          />

          <Input
            label="Date Received"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Button type="submit" className="w-full mt-2">Save Income Entry</Button>
        </form>
      </Modal>
    </div>
  );
}

function floatVal(val: number | string): number {
  return typeof val === 'number' ? val : parseFloat(val || '0');
}
