'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  History,
  Download,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface SavingsGoalItem {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'active' | 'completed' | 'abandoned';
  percentage_completed: number;
  days_remaining: number;
}

interface SavingsTxItem {
  id: number;
  savings_goal_id: number;
  amount: number;
  type: string;
  date: string;
}

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [selectedGoal, setSelectedGoal] = useState<SavingsGoalItem | null>(null);
  const [goalTransactions, setGoalTransactions] = useState<SavingsTxItem[]>([]);
  const [txType, setTxType] = useState<'add' | 'withdraw'>('add');
  const [amount, setAmount] = useState('');

  const [goalForm, setGoalForm] = useState({
    title: '',
    target_amount: '',
    target_date: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/savings');
      setGoals(res.data || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/savings', {
        title: goalForm.title,
        target_amount: parseFloat(goalForm.target_amount),
        target_date: new Date(goalForm.target_date).toISOString(),
      });
      setIsCreateModalOpen(false);
      setGoalForm({ title: '', target_amount: '', target_date: new Date().toISOString().split('T')[0] });
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create savings goal');
    }
  };

  const handleOpenEdit = (goal: SavingsGoalItem) => {
    setSelectedGoal(goal);
    setGoalForm({
      title: goal.title,
      target_amount: String(goal.target_amount),
      target_date: goal.target_date.split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateGoal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      await api.put(`/savings/${selectedGoal.id}`, {
        title: goalForm.title,
        target_amount: parseFloat(goalForm.target_amount),
        target_date: new Date(goalForm.target_date).toISOString(),
      });
      setIsEditModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update goal');
    }
  };

  const handleTxSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      const endpoint = txType === 'add' ? `/savings/${selectedGoal.id}/add` : `/savings/${selectedGoal.id}/withdraw`;
      await api.post(endpoint, { amount: parseFloat(amount) });
      setIsTxModalOpen(false);
      setAmount('');
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Transaction failed');
    }
  };

  const handleOpenHistory = async (goal: SavingsGoalItem) => {
    setSelectedGoal(goal);
    try {
      const res = await api.get(`/savings/${goal.id}/transactions`);
      setGoalTransactions(res.data || []);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await api.delete(`/savings/${id}`);
      fetchGoals();
    } catch {
      alert('Failed to delete goal');
    }
  };

  const handleExportCSV = () => {
    window.open(`${api.defaults.baseURL}/reports/export/savings`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Savings Goals & Reserves</h1>
          <p className="text-xs text-slate-400 mt-1">Set target milestones for emergency funds, capital purchases, and investments</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} size="sm" variant="secondary" className="gap-1 text-slate-300">
            <Download className="w-4 h-4" />
            <span>Export Goals</span>
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>New Savings Goal</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const remainingAmount = Math.max(0, goal.target_amount - goal.current_amount);
          return (
            <Card key={goal.id} className="glass-card-hover flex flex-col justify-between border-slate-800">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm">{goal.title}</h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Target: {new Date(goal.target_date).toLocaleDateString()} ({goal.days_remaining}d left)</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant={goal.status === 'completed' ? 'success' : 'info'}>
                    {goal.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="mt-4 mb-2">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold text-purple-300">
                      ₹{goal.current_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target: ₹{goal.target_amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        goal.percentage_completed >= 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, goal.percentage_completed)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] mt-1.5 font-medium">
                    <span className="text-slate-400">
                      Remaining: <strong className="text-slate-200">₹{remainingAmount.toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="text-purple-400 font-semibold">
                      {goal.percentage_completed.toFixed(1)}% achieved
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setTxType('add');
                      setIsTxModalOpen(true);
                    }}
                    size="sm"
                    variant="secondary"
                    className="gap-1 text-xs"
                    disabled={goal.status === 'completed'}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deposit</span>
                  </Button>

                  <Button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setTxType('withdraw');
                      setIsTxModalOpen(true);
                    }}
                    size="sm"
                    variant="secondary"
                    className="gap-1 text-xs"
                    disabled={goal.current_amount <= 0}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                    <span>Withdraw</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenHistory(goal)}
                    className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded transition-colors"
                    title="Transaction History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(goal)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                    title="Edit Goal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <Card className="col-span-full py-12 text-center text-slate-500">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">No Savings Goals Defined Yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Set target amounts for your goals and track every deposit and withdrawal.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>Create Your First Goal</Button>
          </Card>
        )}
      </div>

      {/* Create Goal Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Title"
            value={goalForm.title}
            onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            placeholder="New Laptop / Emergency Fund / Vacation..."
            required
          />
          <Input
            label="Target Amount (₹)"
            type="number"
            value={goalForm.target_amount}
            onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
            placeholder="100000"
            required
          />
          <Input
            label="Target Date"
            type="date"
            value={goalForm.target_date}
            onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
            required
          />
          <Button type="submit" className="w-full mt-2">Create Goal</Button>
        </form>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Goal: ${selectedGoal?.title}`}>
        <form onSubmit={handleUpdateGoal} className="space-y-4">
          <Input
            label="Goal Title"
            value={goalForm.title}
            onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            required
          />
          <Input
            label="Target Amount (₹)"
            type="number"
            value={goalForm.target_amount}
            onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
            required
          />
          <Input
            label="Target Date"
            type="date"
            value={goalForm.target_date}
            onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
            required
          />
          <Button type="submit" className="w-full mt-2">Update Goal</Button>
        </form>
      </Modal>

      {/* Deposit / Withdraw Modal */}
      <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title={`${txType === 'add' ? 'Deposit to' : 'Withdraw from'} ${selectedGoal?.title}`}>
        <form onSubmit={handleTxSubmit} className="space-y-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000.00"
            required
          />
          <Button type="submit" className="w-full mt-2">
            Confirm {txType === 'add' ? 'Deposit' : 'Withdrawal'}
          </Button>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Savings Ledger: ${selectedGoal?.title}`}
      >
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 pr-1">
          {goalTransactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {tx.type === 'deposit' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-semibold text-slate-200 capitalize">{tx.type}</span>
                  <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                </div>
              </div>
              <span className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {goalTransactions.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">
              No deposit or withdrawal records yet.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
