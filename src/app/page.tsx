"use client";
import { useAuth } from "@/hooks/useAuth";
import PageTransition from "@/components/PageTransition";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ログイン済みならダッシュボードへリダイレクト
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10" style={{ backgroundColor: '#ffffff' }}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Cromin Note</h1>
              {!loading && !user && (
                <button
                  onClick={() => router.push("/auth")}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-6">
          {/* ヒーローセクション */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              クロミンプレイヤーのための<br />
              <span className="text-blue-600">ノート管理サービス</span>
            </h2>
            <p className="text-gray-600 mb-6">
              練習記録、試合結果、技術メモを<br />
              種別ごとに整理して記録
            </p>
          </div>

          {/* クイックアクション */}
          {!loading && user ? (
            <div className="space-y-3 mb-8">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                ダッシュボード
              </button>
              <button
                onClick={() => router.push("/notes/new")}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                ノート投稿
              </button>
              <button
                onClick={() => router.push("/notes")}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                みんなのノート
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              <button
                onClick={() => router.push("/auth")}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                無料で始める
              </button>
            </div>
          )}

          {/* 機能紹介 */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">主な機能</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-semibold text-gray-900">種別別ノート管理</div>
                  <div className="text-sm text-gray-600">練習記録、試合結果、技術メモを整理</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="font-semibold text-gray-900">対戦相手データベース</div>
                  <div className="text-sm text-gray-600">過去の対戦記録と分析</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="font-semibold text-gray-900">公開・非公開設定</div>
                  <div className="text-sm text-gray-600">他のプレイヤーと共有可能</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-semibold text-gray-900">成績分析</div>
                  <div className="text-sm text-gray-600">自分の成長を可視化</div>
                </div>
              </div>
            </div>
          </div>

          {/* 使い方 */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">使い方</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-gray-900">アカウント作成</div>
                  <div className="text-sm text-gray-600">メールアドレスとパスワードで簡単登録</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-gray-900">ノート作成</div>
                  <div className="text-sm text-gray-600">種別を選んでノートを作成</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-semibold text-gray-900">記録・共有</div>
                  <div className="text-sm text-gray-600">練習内容を記録し、必要に応じて公開</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
