"use client";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition, Button } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // ログイン済みならホームページへリダイレクト
  useEffect(() => {
    if (!loading && user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/home");
    }
  }, [shouldRedirect]);

  // ローディング中は何も表示しない
  if (loading) {
    return null;
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Image src="/icon.png" alt="卓球アイコン" width={48} height={48} className="animate-bounce" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cromin Note
                </h1>
              </div>
              {!loading && !user && (
                <div className="flex items-center space-x-3">
                  <Button 
                    color="gray" 
                    size="sm" 
                    onClick={() => router.push("/auth/login")}
                    className="hidden sm:block"
                  >
                    ログイン
                  </Button>
                  <Button 
                    color="blue" 
                    size="sm" 
                    onClick={() => router.push("/auth/signup")}
                  >
                    無料で始める
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ヒーローセクション */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* メインアイコン */}
            <div className="relative mb-12">
              <Image src="/icon.png" alt="卓球アイコン" width={160} height={160} className="mx-auto animate-bounce" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            
            {/* メインタイトル */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              クロミンプレイヤーのための
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                次世代ノート管理
              </span>
            </h1>
            
            {/* サブタイトル */}
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              練習記録、試合結果、技術メモを種別ごとに整理。
              <br />
              データ分析で成長を可視化し、仲間と共有してレベルアップ。
            </p>
            
            {/* CTAボタン */}
            {!loading && user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  color="blue" 
                  size="lg" 
                  onClick={() => router.push("/home")}
                  className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🏠 ホームに戻る
                </Button>
                <Button 
                  color="green" 
                  size="lg" 
                  onClick={() => router.push("/notes/new")}
                  className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ✏️ ノート作成
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  color="blue" 
                  size="lg" 
                  onClick={() => router.push("/auth/signup")}
                  className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🚀 無料で始める
                </Button>
                <Button 
                  color="gray" 
                  size="lg" 
                  onClick={() => router.push("/auth/login")}
                  className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🔑 ログイン
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                3ステップで始められる
              </h2>
              <p className="text-lg text-gray-600">
                簡単な手順で、すぐに使い始められます
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* ステップ1 */}
              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">アカウント作成</h3>
                <p className="text-gray-600 mb-4">
                  メールアドレスとニックネームで簡単登録。
                  確認メールでアカウントを有効化します。
                </p>
                <div className="text-4xl mb-4">📧</div>
              </div>
              
              {/* ステップ2 */}
              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ノート作成</h3>
                <p className="text-gray-600 mb-4">
                  種別を選んでノートを作成。
                  練習内容や試合結果を記録します。
                </p>
                <div className="text-4xl mb-4">📝</div>
              </div>
              
              {/* ステップ3 */}
              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">記録・共有</h3>
                <p className="text-gray-600 mb-4">
                  練習内容を記録し、必要に応じて公開。
                  仲間と共有してレベルアップ。
                </p>
                <div className="text-4xl mb-4">🚀</div>
              </div>
            </div>
          </div>
        </section>

        {/* 機能紹介セクション */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                主な機能
              </h2>
              <p className="text-lg text-gray-600">
                クロミンプレイヤーに特化した機能
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 機能1 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">種別別管理</h3>
                <p className="text-sm text-gray-600">
                  練習記録、試合結果、技術メモを整理
                </p>
              </div>

              {/* 機能2 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="text-3xl mb-4">👥</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">対戦記録</h3>
                <p className="text-sm text-gray-600">
                  過去の対戦記録と分析
                </p>
              </div>

              {/* 機能3 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">共有設定</h3>
                <p className="text-sm text-gray-600">
                  他のプレイヤーと共有可能
                </p>
              </div>

              {/* 機能4 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">成績分析</h3>
                <p className="text-sm text-gray-600">
                  自分の成長を可視化
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              今すぐ始めて、レベルアップを実感しよう
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              無料で始められて、すぐに効果を実感できます
            </p>
            {!loading && !user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  color="white" 
                  size="lg" 
                  onClick={() => router.push("/auth/signup")}
                  className="w-full sm:w-auto px-8 py-4 text-lg font-bold"
                >
                  🚀 無料で始める
                </Button>
                <Button 
                  color="transparent" 
                  size="lg" 
                  onClick={() => router.push("/auth/login")}
                  className="w-full sm:w-auto px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  🔑 ログイン
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* フッター */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Image src="/icon.png" alt="卓球アイコン" width={48} height={48} />
                <h3 className="text-xl font-bold">Cromin Note</h3>
              </div>
              <div className="text-gray-400 text-sm">
                &copy; 2024 Cromin Note. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </PageTransition>
  );
}
