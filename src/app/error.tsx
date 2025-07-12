"use client";
import { PageTransition, Button } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // エラーをログに記録
    console.error('Global error:', error);
  }, [error]);

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl mb-4">💥</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。
          </p>
          
          <div className="space-y-3">
            <Button 
              fullWidth 
              color="blue" 
              size="lg" 
              onClick={() => reset()}
            >
              <span className="text-white font-bold">再試行</span>
            </Button>
            
            <Button 
              fullWidth 
              color="gray" 
              size="md" 
              onClick={() => router.push("/home")}
            >
              <span className="text-gray-700 font-bold">ホームに戻る</span>
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left max-w-md mx-auto">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                エラー詳細（開発モード）
              </summary>
              <pre className="mt-2 p-3 bg-gray-800 text-green-400 text-xs rounded overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
      </main>
    </PageTransition>
  );
} 