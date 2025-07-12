"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PageTransition, AnimatedButton, Button, LoadingSpinner } from '../../../components';
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";

function AuthErrorPageInner() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'エラーが発生しました。';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  // メール再送信処理
  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);
    setResendError(null);
    setResendMessage(null);

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
        setResendMessage(data.message);
      } else {
        setResendError(data.message);
      }
    } catch (error: any) {
      console.error('Resend email error:', error);
      setResendError('メール再送信に失敗しました。');
    } finally {
      setResendLoading(false);
    }
  };

  // メール確認エラーかどうかを判定
  const isEmailVerificationError = message.includes('無効な確認リンク') || 
                                  message.includes('メールアドレスの確認が完了していません');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md text-center">
        <motion.div 
          className="text-6xl mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          ❌
        </motion.div>
        
        <motion.h1 
          className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          エラーが発生しました
        </motion.h1>
        
        <motion.p 
          className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {message}
        </motion.p>

        {/* メール再送信フォーム */}
        {isEmailVerificationError && (
          <motion.div 
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
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

            {/* 再送信エラーメッセージ */}
            {resendError && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                {resendError}
              </div>
            )}

            {/* 再送信成功メッセージ */}
            {resendMessage && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-600">
                {resendMessage}
              </div>
            )}
          </motion.div>
        )}
        
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AnimatedButton size="lg" className="w-full" onClick={() => router.push("/auth") }>
            <span className="text-white font-bold">アカウント選択に戻る</span>
          </AnimatedButton>
          
          <AnimatedButton size="lg" className="w-full" onClick={() => router.push("/") }>
            <span className="text-white font-bold">トップページに戻る</span>
          </AnimatedButton>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <AuthErrorPageInner />
      </Suspense>
    </PageTransition>
  );
} 