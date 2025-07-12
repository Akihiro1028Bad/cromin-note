import { LoadingSpinner } from '@/components';

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    </main>
  );
} 