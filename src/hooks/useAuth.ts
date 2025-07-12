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

  // ローカルストレージからユーザー情報を復元
  const restoreUserFromStorage = () => {
    try {
      const cachedUser = localStorage.getItem('cachedUser');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        // キャッシュの有効期限をチェック（24時間）
        const cachedAt = localStorage.getItem('userCachedAt');
        if (cachedAt && Date.now() - parseInt(cachedAt) < 24 * 60 * 60 * 1000) {
          return user;
        }
      }
    } catch (error) {
      console.error('Failed to restore user from storage:', error);
    }
    return null;
  };

  // ユーザー情報をローカルストレージにキャッシュ
  const cacheUser = (user: User) => {
    try {
      localStorage.setItem('cachedUser', JSON.stringify(user));
      localStorage.setItem('userCachedAt', Date.now().toString());
    } catch (error) {
      console.error('Failed to cache user:', error);
    }
  };

  // ユーザー情報取得
  const fetchUser = async (retryCount = 0) => {
    console.log('fetchUser - function called, retry:', retryCount);
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
        const user = data.user;
        cacheUser(user);
        setAuthState({
          user: user,
          loading: false,
          error: null
        });
      } else {
        console.log('fetchUser - failed, removing token and setting null state');
        // トークンが無効な場合は削除
        localStorage.removeItem('token');
        localStorage.removeItem('cachedUser');
        localStorage.removeItem('userCachedAt');
        setAuthState({
          user: null,
          loading: false,
          error: data.message
        });
      }
    } catch (error) {
      console.error('fetchUser error:', error);
      
      // リトライ機能（最大3回）
      if (retryCount < 3) {
        console.log(`fetchUser - retrying (${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchUser(retryCount + 1);
        }, 1000 * (retryCount + 1)); // 指数バックオフ
        return;
      }
      
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
        
        // ユーザー情報をキャッシュ
        cacheUser(data.user);
        
        // ログイン成功後にユーザー情報を即座に設定
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        
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

      // トークンとキャッシュを削除
      localStorage.removeItem('token');
      localStorage.removeItem('cachedUser');
      localStorage.removeItem('userCachedAt');

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
    
    // まずキャッシュから復元を試行
    const cachedUser = restoreUserFromStorage();
    if (cachedUser) {
      console.log('useAuth - restoring from cache');
      setAuthState({
        user: cachedUser,
        loading: false,
        error: null
      });
    }
    
    // その後、APIで最新情報を取得
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