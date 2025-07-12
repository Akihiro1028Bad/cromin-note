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
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  const colorClass = color === "red"
    ? "bg-red-600 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
    : "bg-blue-600 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60 disabled:cursor-not-allowed";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${colorClass} transition-colors duration-200 ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
} 