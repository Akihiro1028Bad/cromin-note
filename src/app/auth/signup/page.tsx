"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageTransition, LoadingSpinner, Button } from '@/components';
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);
  const router = useRouter();

  // メールサインアップ
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // 基本的なバリデーション
    if (!email || !nickname || !password || !confirmPassword) {
      setError('すべての項目を入力してください。');
      setLoading(false);
      return;
    }

    // ニックネームのバリデーション
    if (nickname.trim().length < 2) {
      setError('ニックネームは2文字以上で入力してください。');
      setLoading(false);
      return;
    }

    if (nickname.trim().length > 20) {
      setError('ニックネームは20文字以下で入力してください。');
      setLoading(false);
      return;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('有効なメールアドレスを入力してください。');
      setLoading(false);
      return;
    }

    // パスワード確認
    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      setLoading(false);
      return;
    }

    // パスワード強度チェック
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          nickname: nickname.trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail('');
        setNickname('');
        setPassword('');
        setConfirmPassword('');
        
        // メール確認が必要な場合は再送信フォームを表示
        if (data.message.includes('確認メールを送信しました')) {
          setShowResendForm(true);
        }
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError('新規登録に失敗しました。');
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
              <h1 className="text-lg font-bold text-gray-900 ml-2">新規会員登録</h1>
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
              <p className="text-gray-600">新しいアカウントを作成してください</p>
            </div>

            {/* フォーム */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  ニックネーム <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nickname"
                  placeholder="あなたのニックネーム"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={2}
                  maxLength={20}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">2文字以上20文字以下で入力してください</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
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
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="6文字以上で入力"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
                    <span className="ml-2">登録中...</span>
                  </div>
                ) : (
                  '新規登録'
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
                すでにアカウントをお持ちの方は
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                  ログイン
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
} 