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
    <header className="bg-bg-secondary border-b border-border-color shadow-sm sticky top-0 z-20">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <button
              onClick={() => router.push("/home")}
              className="text-xl font-bold text-text-primary hover:text-primary transition-colors duration-200"
            >
              Cromin Note
            </button>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => router.push("/home")}
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              ホーム
            </button>
            <button
              onClick={() => router.push("/notes/my")}
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              マイノート
            </button>
            <button
              onClick={() => router.push("/notes")}
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              みんなのノート
            </button>
            <button
              onClick={() => router.push("/analytics")}
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              分析
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              設定
            </button>
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-3">
            {/* 新規作成ボタン */}
            <button
              onClick={() => router.push("/notes/new")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
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
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ドロップダウンメニュー */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-bg-secondary rounded-lg shadow-lg border border-border-color py-2 z-30">
                  <div className="px-4 py-2 border-b border-border-color">
                    <p className="text-sm font-medium text-text-primary">{user.nickname || 'ユーザー'}</p>
                    <p className="text-xs text-text-secondary">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors duration-200"
                  >
                    設定
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors duration-200"
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
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors duration-200 mobile-menu-toggle rounded-lg hover:bg-gray-100"
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
            className="md:hidden mt-3 pt-3 border-t border-border-color" 
            ref={mobileMenuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1">
              {/* ナビゲーションメニュー */}
              <button
                onClick={() => handleNavigation("/home")}
                className="w-full text-left px-3 py-3 text-text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-3"
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">ホーム</span>
              </button>
              <button
                onClick={() => handleNavigation("/notes/my")}
                className="w-full text-left px-3 py-3 text-text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-3"
              >
                <span className="text-lg">📖</span>
                <span className="font-medium">マイノート</span>
              </button>
              <button
                onClick={() => handleNavigation("/notes")}
                className="w-full text-left px-3 py-3 text-text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-3"
              >
                <span className="text-lg">📝</span>
                <span className="font-medium">みんなのノート</span>
              </button>
              <button
                onClick={() => handleNavigation("/analytics")}
                className="w-full text-left px-3 py-3 text-text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-3"
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">成績分析</span>
              </button>
              <button
                onClick={() => handleNavigation("/settings")}
                className="w-full text-left px-3 py-3 text-text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-3"
              >
                <span className="text-lg">⚙️</span>
                <span className="font-medium">設定</span>
              </button>

              {/* アクション */}
              <div className="border-t border-border-color pt-3 mt-3">
                <button
                  onClick={() => handleNavigation("/notes/new")}
                  className="w-full text-left px-3 py-3 text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                >
                  <span className="text-lg">➕</span>
                  <span>新規ノート作成</span>
                </button>
              </div>

              {/* アカウント */}
              <div className="border-t border-border-color pt-3 mt-3">
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm font-medium text-text-primary">{user.nickname || 'ユーザー'}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-danger hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-3"
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