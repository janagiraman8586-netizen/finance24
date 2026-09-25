'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { UserCheck, UserX, Trash2 } from 'lucide-react';

interface UserItem {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = !user.is_active;
    const actionText = newStatus ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${actionText} user ${user.username}?`)) return;

    try {
      await api.put(`/admin/users/${user.id}/status`, { is_active: newStatus, reason: `Admin ${actionText}` });
      fetchUsers();
    } catch {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Permanently delete this user account and associated data?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch {
      alert('Failed to delete user');
    }
  };

  const filtered = users.filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
        <p className="text-xs text-slate-400 mt-1">Audit accounts, manage roles, activate/deactivate access</p>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by username or email..."
            className="w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Roles</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-slate-100">{u.username}</td>
                  <td className="py-3 text-slate-400">{u.email}</td>
                  <td className="py-3">
                    <span className="text-[11px] text-blue-400 font-mono">{(u.roles || []).join(', ')}</span>
                  </td>
                  <td className="py-3">
                    <Badge variant={u.is_active ? 'success' : 'danger'}>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleToggleStatus(u)}
                        size="sm"
                        variant={u.is_active ? 'secondary' : 'primary'}
                        className="text-xs py-1"
                      >
                        {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>{u.is_active ? 'Deactivate' : 'Activate'}</span>
                      </Button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1 text-slate-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
