'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 text-center mb-1">Reset Password</h2>
      <p className="text-xs text-slate-400 text-center mb-6">Enter your email to receive recovery instructions</p>

      {isSubmitted ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg text-center">
          If an account exists with {email}, password reset instructions have been sent.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <Button type="submit" className="w-full">Send Recovery Email</Button>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-slate-400">
        Back to{' '}
        <Link href="/login" className="text-blue-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
