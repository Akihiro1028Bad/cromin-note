"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, Button } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // ログイン済みならダッシュボードへリダイレクト
  useEffect(() => {
    if (!loading && user) {
      setShouldRedirect(true);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/dashboard");
    }
  }, [shouldRedirect, router]);

  // ローディング中は何も表示しない
  if (loading) {
    return null;
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Cromin Note</h1>
              {!loading && !user && (
                <Button fullWidth color="blue" size="md" onClick={() => router.push("/auth")}>ログイン</Button>
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
              <Button fullWidth color="blue" size="lg" onClick={() => router.push("/dashboard")}>ダッシュボード</Button>
              <Button fullWidth color="green" size="lg" onClick={() => router.push("/notes/new")}>ノート投稿</Button>
              <Button fullWidth color="purple" size="lg" onClick={() => router.push("/notes")}>みんなのノート</Button>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              <Button fullWidth color="blue" size="lg" onClick={() => router.push("/auth")}>無料で始める</Button>
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
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">使い方</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-gray-900">アカウント作成</div>
                  <div className="text-sm text-gray-600">メールアドレスとパスワードで簡単登録</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-gray-900">ノート作成</div>
                  <div className="text-sm text-gray-600">種別を選んでノートを作成</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
