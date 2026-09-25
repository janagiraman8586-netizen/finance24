'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Bell } from 'lucide-react';

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data.items || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">System Notifications</h1>
        <p className="text-xs text-slate-400 mt-1">Monitor budget alerts, large transaction flags, and system dispatches</p>
      </div>

      <Card>
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
              <Bell className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-200">{n.type}</div>
                <div className="text-xs text-slate-400 mt-0.5">{n.message}</div>
                <div className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No system notifications registered.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
