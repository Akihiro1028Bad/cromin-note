"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function AuthHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // メニュー外クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('Click outside detected, target:', event.target);
      console.log('Mobile menu ref:', mobileMenuRef.current);
      console.log('Account menu ref:', accountMenuRef.current);
      
      // ハンバーガーメニューボタン自体のクリックは無視
      const target = event.target as Element;
      if (target.closest('button[aria-label*="メニュー"]') || target.closest('.mobile-menu-toggle')) {
        console.log('Ignoring click on menu button');
        return;
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        console.log('Closing mobile menu due to outside click');
        setIsMobileMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        console.log('Closing account menu due to outside click');
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // 空の依存関係配列で一度だけ実行

  // モバイルメニューの状態変更をログ出力
  useEffect(() => {
    console.log('Mobile menu state changed to:', isMobileMenuOpen);
    console.log('Mobile menu ref exists:', !!mobileMenuRef.current);
  }, [isMobileMenuOpen]);

  // ユーザーがログインしていない場合は何も表示しない
  if (!user) return null;

  // メニュー切り替え時の自動閉じる機能
  const handleMobileMenuToggle = () => {
    console.log('Mobile menu toggle clicked, current state:', isMobileMenuOpen);
    const newState = !isMobileMenuOpen;
    console.log('Setting new state to:', newState);
    setIsMobileMenuOpen(newState);
    if (isAccountMenuOpen) {
      setIsAccountMenuOpen(false);
    }
  };

  const handleAccountMenuToggle = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <button
              onClick={() => router.push("/home")}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Cromin Note
            </button>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => router.push("/home")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              ホーム
            </button>
            <button
              onClick={() => router.push("/notes")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              ノート
            </button>
            <button
              onClick={() => router.push("/analytics")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              分析
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              設定
            </button>
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-3">
            {/* 新規作成ボタン */}
            <button
              onClick={() => router.push("/notes/new")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </button>

            {/* ユーザーアバター */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={handleAccountMenuToggle}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ドロップダウンメニュー */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.nickname || 'ユーザー'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    設定
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobileMenuToggle();
              }}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors mobile-menu-toggle"
              aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            >
              {isMobileMenuOpen ? (
                // 閉じるアイコン（X）
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // 開くアイコン（ハンバーガー）
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* モバイルナビゲーション */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden mt-3 pt-3 border-t border-gray-200" 
            ref={mobileMenuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1">
              {/* ナビゲーションメニュー */}
              <button
                onClick={() => handleNavigation("/home")}
                className="w-full text-left px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">ホーム</span>
              </button>
              <button
                onClick={() => handleNavigation("/notes")}
                className="w-full text-left px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <span className="text-lg">📝</span>
                <span className="font-medium">みんなのノート</span>
              </button>
              <button
                onClick={() => handleNavigation("/analytics")}
                className="w-full text-left px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">成績分析</span>
              </button>
              <button
                onClick={() => handleNavigation("/settings")}
                className="w-full text-left px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <span className="text-lg">⚙️</span>
                <span className="font-medium">設定</span>
              </button>

              {/* アクション */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <button
                  onClick={() => handleNavigation("/notes/new")}
                  className="w-full text-left px-3 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3 font-medium"
                >
                  <span className="text-lg">➕</span>
                  <span>新規ノート作成</span>
                </button>
              </div>

              {/* アカウント */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">{user.nickname || 'ユーザー'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">🚪</span>
                  <span>ログアウト</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 