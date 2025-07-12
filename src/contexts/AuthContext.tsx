"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  updateUser: (user: User) => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // ローカルストレージからユーザー情報を復元
  const restoreUserFromStorage = () => {
    try {
      const cachedUser = localStorage.getItem('cachedUser');
      const cachedAt = localStorage.getItem('userCachedAt');
      
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        // キャッシュの有効期限をチェック（24時間）
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

  // ユーザー情報更新
  const updateUser = (updatedUser: User) => {
    cacheUser(updatedUser);
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  // ユーザー情報取得
  const fetchUser = async (retryCount = 0): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      
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

      if (data.success) {
        const user = data.user;
        cacheUser(user);
        setAuthState({
          user: user,
          loading: false,
          error: null
        });
      } else {
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
        setTimeout(() => {
          fetchUser(retryCount + 1);
        }, 1000 * (retryCount + 1));
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

      if (data.success) {
        // トークンをlocalStorageに保存
        localStorage.setItem('token', data.token);
        
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
    const initializeAuth = async () => {
      // まずキャッシュから復元を試行
      const cachedUser = restoreUserFromStorage();
      const token = localStorage.getItem('token');
      
      if (cachedUser && token) {
        setAuthState({
          user: cachedUser,
          loading: false,
          error: null
        });
        
        // キャッシュから復元した場合は、バックグラウンドで最新情報を取得
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          
          if (data.success) {
            const user = data.user;
            cacheUser(user);
            setAuthState(prev => ({
              ...prev,
              user: user
            }));
          } else {
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
          console.error('background fetch error:', error);
          // バックグラウンドエラーは無視（キャッシュされたユーザー情報を維持）
        }
      } else if (token) {
        // キャッシュがないがトークンがある場合はAPI呼び出し
        fetchUser();
      } else {
        // トークンもキャッシュもない場合は未認証状態
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    };

    // 初期化を即座に実行
    initializeAuth();
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    refetch: fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 