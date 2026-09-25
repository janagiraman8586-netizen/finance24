'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { BarChart3, Plus } from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

interface BudgetCategoryDetail {
  id: number;
  category_id: number;
  allocated_amount: number;
  used_amount: number;
  remaining_amount: number;
  percentage_used: number;
  category?: CategoryItem;
}

interface BudgetDetails {
  id: number;
  user_id: number;
  month: number;
  year: number;
  total_amount: number;
  total_used: number;
  total_remaining: number;
  percentage_used: number;
  status: 'On Track' | 'Caution' | 'Over Budget';
  categories: BudgetCategoryDetail[];
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function BudgetPage() {
  const [budgetDetails, setBudgetDetails] = useState<BudgetDetails | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState('45000');
  const [allocations, setAllocations] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchBudget();
    fetchCategories();
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgetDetails(res.data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      const expenseCats = (res.data || []).filter((c: CategoryItem) => c.type === 'expense');
      setCategories(expenseCats);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleAllocationChange = (catId: number, val: string) => {
    setAllocations({ ...allocations, [catId]: val });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const category_budgets = Object.entries(allocations)
      .filter(([_, val]) => parseFloat(val) > 0)
      .map(([catId, val]) => ({
        category_id: parseInt(catId),
        allocated_amount: parseFloat(val),
      }));

    try {
      await api.post('/budgets', {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        total_amount: parseFloat(totalAmount),
        category_budgets,
      });
      setIsModalOpen(false);
      fetchBudget();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      alert(apiErr.response?.data?.detail || 'Failed to save budget');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Budget Management</h1>
          <p className="text-xs text-slate-400 mt-1">Set spending thresholds per category and prevent overspending</p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Set Monthly Budget</span>
        </Button>
      </div>

      {budgetDetails ? (
        <>
          {/* Budget Top Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-xs text-slate-400 font-semibold">Total Target Budget</div>
              <div className="text-2xl font-bold text-slate-100 mt-2">
                ₹{budgetDetails.total_amount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Period: {budgetDetails.month}/{budgetDetails.year}</div>
            </Card>

            <Card>
              <div className="text-xs text-slate-400 font-semibold">Total Used</div>
              <div className="text-2xl font-bold text-red-400 mt-2">
                ₹{budgetDetails.total_used.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{budgetDetails.percentage_used.toFixed(1)}% utilized</div>
            </Card>

            <Card>
              <div className="text-xs text-slate-400 font-semibold">Remaining Pool</div>
              <div className="text-2xl font-bold text-emerald-400 mt-2">
                ₹{budgetDetails.total_remaining.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Available for remaining days</div>
            </Card>

            <Card>
              <div className="text-xs text-slate-400 font-semibold">Budget Health</div>
              <div className="mt-3">
                <Badge variant={budgetDetails.status === 'On Track' ? 'success' : 'danger'}>
                  {budgetDetails.status}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Category Progress Bars */}
          <Card title="Category Allocations & Real-Time Spending">
            <div className="space-y-6 pt-2">
              {budgetDetails.categories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">
                      {cat.category?.icon || '📁'} {cat.category?.name || 'Category'}
                    </span>
                    <span className="text-slate-400">
                      ₹{cat.used_amount.toLocaleString('en-IN')} / ₹{cat.allocated_amount.toLocaleString('en-IN')} ({cat.percentage_used.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        cat.percentage_used > 100
                          ? 'bg-red-500'
                          : cat.percentage_used > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, cat.percentage_used)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {budgetDetails.categories.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No category allocations added to this budget.
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Monthly Budget Configured</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
            Setting up a budget allows you to allocate money into categories and track spending limits in real time.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Budget</Button>
        </Card>
      )}

      {/* Budget Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Monthly Budget">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Total Monthly Budget Pool (₹)"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="50000"
            required
          />

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Allocate Budget per Category
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-300 font-medium w-1/2">
                    {cat.icon} {cat.name}
                  </span>
                  <Input
                    type="number"
                    placeholder="Allocated ₹"
                    value={allocations[cat.id] || ''}
                    onChange={(e) => handleAllocationChange(cat.id, e.target.value)}
                    className="w-1/2"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full mt-4">Save Budget Configuration</Button>
        </form>
      </Modal>
    </div>
  );
}
