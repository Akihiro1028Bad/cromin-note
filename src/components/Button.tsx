"use client";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "green" | "purple" | "red" | "gray" | "white" | "transparent";
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  type = "button",
  size = "md",
  color = "blue",
  disabled = false,
  className = "",
  fullWidth = false
}: ButtonProps) {
  const baseClasses = "font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] flex items-center justify-center active:scale-95";
  
  const colorClasses = {
    blue: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:bg-blue-800",
    green: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:bg-green-800",
    purple: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:bg-purple-800",
    red: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:bg-red-800",
    gray: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:bg-gray-800",
    white: "bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:bg-gray-200 border border-gray-300",
    transparent: "bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-900 focus:ring-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:bg-gray-100"
  };

  const sizeClasses = {
    sm: "px-4 py-3 text-sm min-h-[44px]",
    md: "px-6 py-4 text-base min-h-[52px]",
    lg: "px-8 py-5 text-lg min-h-[60px]",
    xl: "px-10 py-6 text-xl min-h-[68px]"
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none active:scale-100" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
} 