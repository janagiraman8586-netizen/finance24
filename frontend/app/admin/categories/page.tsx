'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Trash2 } from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('🏷️');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/admin/categories?name=${encodeURIComponent(name)}&type=${type}&icon=${encodeURIComponent(icon)}`);
      setIsModalOpen(false);
      setName('');
      fetchCategories();
    } catch {
      alert('Failed to add category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Category Management</h1>
          <p className="text-xs text-slate-400 mt-1">Configure global income and expense category options</p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Icon</th>
                <th className="pb-3 font-semibold">Category Name</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-lg">{c.icon || '📁'}</td>
                  <td className="py-3 font-semibold text-slate-200">{c.name}</td>
                  <td className="py-3 capitalize text-blue-400 font-mono">{c.type}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="p-1 text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <Input label="Emoji / Icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
          <Button type="submit" className="w-full mt-2">Save Category</Button>
        </form>
      </Modal>
    </div>
  );
}
