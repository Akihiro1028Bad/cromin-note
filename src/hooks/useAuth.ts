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
    console.log('fetchUser - function called');
    try {
      const token = localStorage.getItem('token');
      console.log('fetchUser - token:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('fetchUser - no token, setting null state');
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
        return;
      }

      console.log('fetchUser - making API call');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('fetchUser - response:', data);

      if (data.success) {
        console.log('fetchUser - success, setting user state');
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
      } else {
        console.log('fetchUser - failed, removing token and setting null state');
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
        
        // 認証状態の更新を確実にするため、少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
    console.log('useAuth - current authState:', authState);
    fetchUser();
  }, []); // 空の依存関係配列で一度だけ実行

  // トークン変更時の監視
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (!token && authState.user) {
        // トークンが削除された場合、ユーザー状態をリセット
        setAuthState(prev => ({
          ...prev,
          user: null,
          loading: false,
          error: null
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // authState.userを依存関係から削除

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    refetch: fetchUser
  };
}; 