"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/database";
import PageTransition from "@/components/PageTransition";
import AnimatedButton from "@/components/AnimatedButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        router.replace('/auth');
        return;
      }
      const json = await res.json();
      setUser(json.user);
      setProfile(json.profile);
      setNickname(json.profile?.nickname || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname })
      });
      if (!res.ok) throw new Error('プロフィール更新APIエラー');
      setMessage('プロフィールを更新しました。');
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('プロフィールの更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!user) return null;

  return (
    <PageTransition>
      <main className="max-w-2xl mx-auto p-8">
        <motion.h1 
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          プロフィール編集
        </motion.h1>
        
        <motion.div 
          className="mb-6 p-4 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-2">
            <span className="font-bold">メールアドレス:</span> {user.email}
          </div>
          <div className="mb-2">
            <span className="font-bold">ユーザーID:</span> {user.id}
          </div>
          <div>
                            <span className="font-bold">登録日:</span> {new Date(user.createdAt).toLocaleDateString('ja-JP')}
          </div>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-2">
              ニックネーム
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="ニックネームを入力"
              maxLength={50}
            />
            <p className="text-sm text-gray-500 mt-1">
              ノート投稿時に表示される名前です。空欄の場合は「匿名」と表示されます。
            </p>
          </div>

          {message && (
            <motion.div 
              className={`p-3 rounded ${message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.div>
          )}

          <div className="flex gap-4 pt-4">
            <AnimatedButton
              type="submit"
              disabled={submitting}
            >
              {submitting ? <LoadingSpinner size="sm" /> : '更新'}
            </AnimatedButton>
            <AnimatedButton
              type="button"
              onClick={() => router.back()}
            >
              戻る
            </AnimatedButton>
          </div>
        </motion.form>
      </main>
    </PageTransition>
  );
} 