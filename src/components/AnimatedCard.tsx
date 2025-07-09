"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
  variant?: "default" | "energetic" | "success" | "warning" | "danger";
}

export default function AnimatedCard({ 
  children, 
  index = 0, 
  className = "",
  variant = "default"
}: AnimatedCardProps) {
  const baseClasses = "simple-card p-6 relative overflow-hidden";
  
  const variantClasses = {
    default: "border-blue-200",
    energetic: "border-blue-200",
    success: "border-blue-200",
    warning: "border-blue-200",
    danger: "border-blue-200"
  };

  const variantGradients = {
    default: "from-white to-blue-50",
    energetic: "from-white to-blue-50",
    success: "from-white to-blue-50",
    warning: "from-white to-blue-50",
    danger: "from-white to-blue-50"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${variantGradients[variant]})`,
        backdropFilter: "blur(15px)"
      }}
    >
      {/* グラデーションボーダー */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 opacity-30" />
      
      {/* 内側のコンテンツ */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* 光沢効果 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 opacity-60" />
      
      {/* パルス効果（エネルギッシュバリアントのみ） */}
      {variant === 'energetic' && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(255, 107, 53, 0.4)",
              "0 0 0 8px rgba(255, 107, 53, 0)",
              "0 0 0 0 rgba(255, 107, 53, 0)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </motion.div>
  );
} 