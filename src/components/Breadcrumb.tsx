"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-gray-900 font-medium">
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// パスに基づいてパンくずを自動生成するフック
export function useBreadcrumb() {
  const pathname = usePathname();
  
  const generateBreadcrumb = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumb: BreadcrumbItem[] = [
      { label: "ホーム", href: "/dashboard", icon: "🏠" }
    ];

    if (segments.length === 0) {
      return breadcrumb;
    }

    // ノート関連のパンくず
    if (segments[0] === 'notes') {
      breadcrumb.push({ label: "ノート", href: "/notes", icon: "📝" });
      
      if (segments[1] && segments[1] !== 'new') {
        if (segments[2] === 'edit') {
          breadcrumb.push({ label: "詳細", href: `/notes/${segments[1]}`, icon: "👁️" });
          breadcrumb.push({ label: "編集", icon: "✏️" });
        } else {
          breadcrumb.push({ label: "詳細", icon: "👁️" });
        }
      } else if (segments[1] === 'new') {
        breadcrumb.push({ label: "新規作成", icon: "➕" });
      }
    }
    
    // その他のページ
    else if (segments[0] === 'dashboard') {
      breadcrumb.push({ label: "ダッシュボード", icon: "📊" });
    }
    else if (segments[0] === 'mypage') {
      breadcrumb.push({ label: "マイページ", icon: "👤" });
    }
    else if (segments[0] === 'analytics') {
      breadcrumb.push({ label: "成績分析", icon: "📈" });
    }
    else if (segments[0] === 'profile') {
      breadcrumb.push({ label: "プロフィール", icon: "⚙️" });
    }
    else if (segments[0] === 'auth') {
      breadcrumb.push({ label: "認証", icon: "🔐" });
    }

    return breadcrumb;
  };

  return generateBreadcrumb();
} 