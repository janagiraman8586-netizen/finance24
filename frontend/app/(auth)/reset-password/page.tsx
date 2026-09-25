'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setIsSuccess(true);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 text-center mb-1">Set New Password</h2>
      <p className="text-xs text-slate-400 text-center mb-6">Choose a strong password for your account</p>

      {isSuccess ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg text-center">
          Password updated successfully! You can now{' '}
          <Link href="/login" className="underline font-bold">sign in</Link>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">Update Password</Button>
        </form>
      )}
    </div>
  );
}
