'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { YohackSymbol } from '@/components/layout/yohack-symbol';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError('メールアドレスまたはパスワードが正しくありません');
      setLoading(false);
      return;
    }

    router.push('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-linen px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <YohackSymbol size={40} />
          </div>
          <h1 className="text-2xl font-bold text-brand-night tracking-tight">YOHACK</h1>
          <p className="text-sm text-brand-bronze">ログイン</p>
        </div>

        <Card className="p-6 border-0 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-brand-stone">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-brand-stone">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full text-white bg-brand-gold"
              disabled={loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-brand-bronze">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/signup" className="text-brand-gold underline">
            新規登録
          </Link>
        </p>

        <p className="text-center">
          <Link href="/" className="text-xs text-brand-bronze hover:text-brand-stone transition-colors">
            ← トップに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
