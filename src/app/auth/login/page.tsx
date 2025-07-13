"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageTransition, LoadingSpinner, Button } from '@/components';
import { useAuth } from '@/hooks';
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // URLパラメータの処理
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setMessage('メールアドレスの確認が完了しました。ログインしてください。');
    }
  }, [searchParams]);

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await login(email, password);

      if (result.success) {
        setMessage(result.message);
        // ログイン成功時は即座にホームページにリダイレクト
        router.replace('/home');
      } else {
        setError(result.message);
        // メール未確認エラーの場合は再送信フォームを表示
        if (result.message.includes('メールアドレスの確認が完了していません')) {
          setShowResendForm(true);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // メール再送信処理
  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setShowResendForm(false);
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      console.error('Resend email error:', error);
      setError('メール再送信に失敗しました。');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900 ml-2">ログイン</h1>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-6">
          <div className="max-w-sm mx-auto">
            {/* アイコン */}
            <div className="text-center mb-6">
              <Image src="/icon.png" alt="卓球アイコン" width={96} height={96} className="mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cromin Note</h2>
              <p className="text-gray-600">アカウントにログインしてください</p>
            </div>

            {/* ログインフォーム */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                color="blue"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">ログイン中...</span>
                  </div>
                ) : (
                  'ログイン'
                )}
              </Button>
            </form>

            {/* メール再送信フォーム */}
            {showResendForm && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">メール確認が必要です</h3>
                <p className="text-sm text-blue-700 mb-3">
                  確認メールが届いていない場合は、再送信してください。
                </p>
                <form onSubmit={handleResendEmail} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="メールアドレスを入力"
                    className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={resendLoading}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    color="blue"
                    size="sm"
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">送信中...</span>
                      </div>
                    ) : (
                      '確認メールを再送信'
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* エラーメッセージ */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* 成功メッセージ */}
            {message && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              </div>
            )}

            {/* リンク */}
            <div className="mt-6 space-y-3 text-center">
              <div className="text-sm text-gray-600">
                アカウントをお持ちでない方は
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                  新規会員登録
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
} 