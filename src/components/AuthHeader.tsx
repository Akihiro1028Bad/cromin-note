"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthHeader() {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  // PC表示時のみ表示（モバイルでは非表示）
  return (
    <header className="hidden md:block w-full border-b bg-white shadow-sm z-20 sticky top-0" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg text-blue-700 hover:text-blue-800 transition-colors">
            Cromin Note
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <Link 
                  href="/dashboard" 
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  ダッシュボード
                </Link>
                <Link 
                  href="/notes" 
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  みんなのノート
                </Link>
                <Link 
                  href="/mypage" 
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  マイページ
                </Link>
                <Link 
                  href="/analytics" 
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  成績分析
                </Link>
                <Link 
                  href="/profile" 
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  プロフィール
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                ログイン/新規登録
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 