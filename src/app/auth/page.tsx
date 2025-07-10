"use client";
import Link from 'next/link';
import { PageTransition } from '@/components';
import AnimatedButton from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <motion.h1 
            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            アカウント
          </motion.h1>
          
          <motion.div 
            className="flex flex-col gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatedButton size="lg" className="w-full" onClick={() => router.push("/auth/login") }>
              <span className="text-white font-bold">ログイン</span>
            </AnimatedButton>
            
            <AnimatedButton size="lg" className="w-full" onClick={() => router.push("/auth/signup") }>
              <span className="text-white font-bold">新規会員登録</span>
            </AnimatedButton>
          </motion.div>
          
          <motion.div 
            className="mt-6 text-center text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              ← トップページに戻る
            </Link>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
} 