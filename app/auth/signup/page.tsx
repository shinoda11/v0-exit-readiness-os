'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { YohackSymbol } from '@/components/layout/yohack-symbol';
import { Mail } from 'lucide-react';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-linen px-4">
        <div className="w-full max-w-sm space-y-6">
          <Card className="p-8 border-0 shadow-sm text-center">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
              style={{ backgroundColor: 'rgba(200, 184, 154, 0.2)' }}
            >
              <Mail className="w-8 h-8 text-brand-gold" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-brand-night">
              確認メールを送信しました
            </h2>
            <p className="text-sm text-brand-bronze mb-4">
              {email} に確認リンクを送信しました。メール内のリンクをクリックして登録を完了してください。
            </p>
            <Link href="/auth/login" className="text-sm text-brand-gold underline">
              ログイン画面に戻る
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-linen px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <YohackSymbol size={40} />
          </div>
          <h1 className="text-2xl font-bold text-brand-night tracking-tight">YOHACK</h1>
          <p className="text-sm text-brand-bronze">新規登録</p>
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
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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
              {loading ? '登録中...' : 'アカウントを作成'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-brand-bronze">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/auth/login" className="text-brand-gold underline">
            ログイン
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
