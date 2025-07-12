"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  color?: "blue" | "red";
}

export default function AnimatedButton({
  children,
  onClick,
  type = "button",
  size = "md",
  disabled = false,
  className = "",
  color = "blue"
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-[36px]",
    md: "px-6 py-3 text-base min-h-[44px]",
    lg: "px-8 py-4 text-lg min-h-[52px]"
  };
  
  const colorClass = color === "red"
    ? "bg-danger text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-danger/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    : "bg-primary text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${colorClass} ${sizeClasses[size]} ${className} flex items-center justify-center`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
} 