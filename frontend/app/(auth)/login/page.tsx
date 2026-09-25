'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { authService } from '../../../services/auth.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('user@example.com');
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
      setError(apiErr.response?.data?.detail || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 text-center mb-1">Welcome Back</h2>
      <p className="text-xs text-slate-400 text-center mb-6">Sign in to manage your financial portfolio</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
          {error}
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

      <div className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-400 font-semibold hover:underline">
          Create Account
        </Link>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        <p className="font-semibold mb-1 text-slate-400">Demo Credentials:</p>
        <p>User: user@example.com / Password123!</p>
        <p>Admin: admin@example.com / Admin123!</p>
      </div>
    </div>
  );
}
