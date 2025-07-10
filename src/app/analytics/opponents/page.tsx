import { Suspense } from "react";
import { getOpponentsData } from "@/lib/analytics";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import OpponentsClient from "@/app/analytics/opponents/OpponentsClient";
import { LoadingSpinner } from '@/components';

export default async function OpponentsPage() {
  // サーバーサイドでデータを取得
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">👥</div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
            <p className="text-gray-600 mb-6">対戦相手データを表示するにはログインしてください。</p>
          </div>
        </div>
      </main>
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return (
      <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">👥</div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">認証エラー</h1>
            <p className="text-gray-600 mb-6">トークンが無効です。再度ログインしてください。</p>
          </div>
        </div>
      </main>
    );
  }

  try {
    const data = await getOpponentsData(decoded.userId);
    
    return (
      <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
        <OpponentsClient initialData={data} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching opponents data:', error);
    return (
      <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">👥</div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">データの取得に失敗しました。</p>
          </div>
        </div>
      </main>
    );
  }
} 