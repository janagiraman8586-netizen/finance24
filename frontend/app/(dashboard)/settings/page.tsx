'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { User, Lock, FolderTree, CreditCard, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';

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

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', icon: '🏷️' });
  const [newPaymentMethod, setNewPaymentMethod] = useState({ name: '' });

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catRes, pmRes] = await Promise.all([
        api.get('/categories'),
        api.get('/payment-methods')
      ]);
      setCategories(catRes.data || []);
      setPaymentMethods(pmRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMsg('');
    try {
      const res = await api.put('/auth/profile', profile);
      if (setUser) {
        setUser(res.data);
      }
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    setLoadingPassword(true);
    setPasswordMsg('');
    try {
      await api.put('/auth/change-password', passwordForm);
      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    try {
      await api.post('/categories', newCategory);
      setNewCategory({ name: '', type: 'expense', icon: '🏷️' });
      fetchMetadata();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchMetadata();
    } catch {
      alert('Failed to delete category');
    }
  };

  const handleAddPaymentMethod = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPaymentMethod.name.trim()) return;
    try {
      await api.post('/payment-methods', newPaymentMethod);
      setNewPaymentMethod({ name: '' });
      fetchMetadata();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add payment method');
    }
  };

  const handleDeletePaymentMethod = async (id: number) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      await api.delete(`/payment-methods/${id}`);
      fetchMetadata();
    } catch {
      alert('Failed to delete payment method');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Account & System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage user credentials, profile information, categories, and payment methods</p>
      </div>

      {/* User Profile */}
      <Card title="User Profile Details" subtitle="Update basic information displayed in transactions and reports">
        <form className="space-y-4 pt-2" onSubmit={handleProfileSubmit}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/30 text-white flex items-center justify-center font-bold text-lg shadow-inner">
              {profile.first_name ? profile.first_name[0].toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">{user?.username} ({user?.email})</div>
              <div className="text-xs text-slate-400">Assigned Roles: {(user?.roles || []).join(', ')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />
            <Input
              label="Last Name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            />
          </div>

          <Input
            label="Username"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="sm" isLoading={loadingProfile}>Save Profile Changes</Button>
            {profileMsg && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {profileMsg}
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Security & Password */}
      <Card title="Security & Password" subtitle="Update account password and credentials">
        <form className="space-y-4 pt-2" onSubmit={handlePasswordSubmit}>
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            required
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              required
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              required
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="secondary" size="sm" className="gap-2" isLoading={loadingPassword}>
              <Lock className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </Button>
            {passwordMsg && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {passwordMsg}
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Category Management */}
      <Card title="Category Management" subtitle="Manage income and expense categories">
        <div className="space-y-4 pt-2">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Category Name..."
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="flex-1"
            />
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <Input
              placeholder="Icon emoji (🍔)"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              className="w-24 text-center"
            />
            <Button type="submit" size="sm" className="gap-1 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </Button>
          </form>

          {/* List Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span>{cat.icon || '📁'}</span>
                  <span className="text-slate-200 font-medium">{cat.name}</span>
                  <Badge variant={cat.type === 'income' ? 'success' : 'danger'}>
                    {cat.type}
                  </Badge>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Payment Method Management */}
      <Card title="Payment Methods" subtitle="Manage accepted payment channels">
        <div className="space-y-4 pt-2">
          {/* Add Payment Method Form */}
          <form onSubmit={handleAddPaymentMethod} className="flex gap-2">
            <Input
              placeholder="Payment Method Name (e.g., Apple Pay, PayPal)..."
              value={newPaymentMethod.name}
              onChange={(e) => setNewPaymentMethod({ name: e.target.value })}
              className="flex-1"
            />
            <Button type="submit" size="sm" className="gap-1 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Add Method</span>
            </Button>
          </form>

          {/* List Payment Methods */}
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>{pm.name}</span>
                <button
                  onClick={() => handleDeletePaymentMethod(pm.id)}
                  className="text-slate-500 hover:text-red-400 ml-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
