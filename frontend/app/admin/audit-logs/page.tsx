'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card';

interface AuditLogItem {
  id: number;
  admin_id?: number;
  action: string;
  resource?: string;
  description?: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.logs || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable administrative action audit trails and security event logs</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Admin ID</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Resource</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 font-mono text-blue-400">Admin #{log.admin_id}</td>
                  <td className="py-3 uppercase font-semibold text-amber-400">{log.action}</td>
                  <td className="py-3 text-slate-300">{log.resource}</td>
                  <td className="py-3 text-slate-400">{log.description || 'N/A'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No admin audit logs generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
