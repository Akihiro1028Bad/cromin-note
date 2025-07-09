"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import AnimatedButton from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'エラーが発生しました。';
  const router = useRouter();

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md text-center">
          <motion.div 
            className="text-6xl mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            ❌
          </motion.div>
          
          <motion.h1 
            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            エラーが発生しました
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {message}
          </motion.p>
          
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <AnimatedButton size="lg" className="w-full" onClick={() => router.push("/auth") }>
              <span className="text-white font-bold">アカウント選択に戻る</span>
            </AnimatedButton>
            
            <AnimatedButton size="lg" className="w-full" onClick={() => router.push("/") }>
              <span className="text-white font-bold">トップページに戻る</span>
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
} 