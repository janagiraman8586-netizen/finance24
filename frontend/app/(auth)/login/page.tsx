'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { authService } from '../../../services/auth.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface ApiError {
  message?: string;
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('kpraman8586@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      globalThis.location.href = '/';
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.response?.data?.detail) {
        setError(apiErr.response.data.detail);
      } else if (apiErr.message === 'Network Error' || !apiErr.response) {
        setError('Cannot reach server. If the backend is waking up, please wait ~20 seconds and click Sign In again.');
      } else {
        setError('Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setCredentials = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError('');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 text-center mb-1">Welcome Back</h2>
      <p className="text-xs text-slate-400 text-center mb-6">Sign in to manage your financial portfolio</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-400 hover:underline">
              Forgot?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
        <p className="font-semibold mb-2 text-slate-300">Quick Sign In Accounts (Click to Fill):</p>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setCredentials('kpraman8586@gmail.com', 'Password123!')}
            className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 flex justify-between items-center transition"
          >
            <span className="text-blue-400 font-medium">kpraman8586@gmail.com</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Owner / Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setCredentials('user@example.com', 'Password123!')}
            className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800/50 hover:bg-slate-700/50 border border-slate-750 flex justify-between items-center transition text-slate-400"
          >
            <span>user@example.com</span>
            <span className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">Demo User</span>
          </button>
          <button
            type="button"
            onClick={() => setCredentials('admin@example.com', 'Admin123!')}
            className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800/50 hover:bg-slate-700/50 border border-slate-750 flex justify-between items-center transition text-slate-400"
          >
            <span>admin@example.com</span>
            <span className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">Demo Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
