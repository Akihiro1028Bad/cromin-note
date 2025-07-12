"use client";
import { PageTransition, Button } from '@/components';
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl mb-4">😵</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ページが見つかりません</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
          
          <div className="space-y-3">
            <Button 
              fullWidth 
              color="blue" 
              size="lg" 
              onClick={() => router.push("/home")}
            >
              <span className="text-white font-bold">ホームに戻る</span>
            </Button>
            
            <Button 
              fullWidth 
              color="gray" 
              size="md" 
              onClick={() => router.back()}
            >
              <span className="text-gray-700 font-bold">前のページに戻る</span>
            </Button>
          </div>
        </div>
      </main>
    </PageTransition>
  );
} 