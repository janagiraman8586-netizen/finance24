'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ShieldAlert } from 'lucide-react';

interface TransactionItem {
  id: number;
  user_id: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  amount: number | string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [suspicious, setSuspicious] = useState<TransactionItem[]>([]);

  useEffect(() => {
    fetchAdminTx();
  }, []);

  const fetchAdminTx = async () => {
    try {
      const [txRes, suspRes] = await Promise.all([
        api.get('/admin/transactions'),
        api.get('/admin/transactions/suspicious')
      ]);
      setTransactions(txRes.data.items || []);
      setSuspicious(suspRes.data.items || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Transaction Auditing & Monitoring</h1>
        <p className="text-xs text-slate-400 mt-1">Audit platform ledger activity and flagged high-value transactions</p>
      </div>

      {/* Flagged Transactions Alert Banner */}
      {suspicious.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">Flagged Large Transactions (&gt; ₹25,000)</h4>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                System detected {suspicious.length} transaction(s) requiring potential security review.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card title="System-Wide Ledger">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">User ID</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono text-slate-400">User #{tx.user_id}</td>
                  <td className="py-3 font-medium text-slate-200">{tx.description}</td>
                  <td className="py-3">
                    <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                      {tx.type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-3 text-right font-bold text-slate-100">
                    ₹{floatVal(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

function floatVal(val: number | string): number {
  return typeof val === 'number' ? val : parseFloat(val || '0');
}
