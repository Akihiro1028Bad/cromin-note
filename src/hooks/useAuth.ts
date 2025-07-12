import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  nickname?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // ユーザー情報取得
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('fetchUser - token:', token ? 'exists' : 'not found');
      
      if (!token) {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('fetchUser - response:', data);

      if (data.success) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
      } else {
        // トークンが無効な場合は削除
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          loading: false,
          error: data.message
        });
      }
    } catch (error) {
      console.error('fetchUser error:', error);
      setAuthState({
        user: null,
        loading: false,
        error: '認証状態の確認に失敗しました。'
      });
    }
  };

  // ログイン
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('login - response:', data);

      if (data.success) {
        // トークンをlocalStorageに保存
        localStorage.setItem('token', data.token);
        console.log('login - token saved to localStorage');
        
        // ログイン成功後にユーザー情報を即座に設定
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        
        // 認証状態の変更を確実にするため、少し待ってからユーザー情報を再取得
        setTimeout(() => {
          fetchUser();
        }, 100);
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('login error:', error);
      return { success: false, message: 'ログインに失敗しました。' };
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // トークンを削除
      localStorage.removeItem('token');

      setAuthState({
        user: null,
        loading: false,
        error: null
      });

      return { success: true, message: 'ログアウトしました。' };
    } catch (error) {
      return { success: false, message: 'ログアウトに失敗しました。' };
    }
  };

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    console.log('useAuth - useEffect triggered');
    fetchUser();
  }, []);

  // トークン変更時の監視
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (!token && authState.user) {
        // トークンが削除された場合、ユーザー状態をリセット
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authState.user]);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    refetch: fetchUser
  };
}; 