"use client";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
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
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] flex items-center justify-center";
  
  const colorClasses = {
    blue: "bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    green: "bg-success text-white hover:bg-green-700 focus:ring-success/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    purple: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    red: "bg-danger text-white hover:bg-red-700 focus:ring-danger/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    gray: "bg-secondary text-text-primary hover:bg-gray-700 hover:text-white focus:ring-secondary/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    white: "bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    transparent: "bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-900 focus:ring-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-2 text-base min-h-[44px]",
    lg: "px-6 py-3 text-lg min-h-[52px]"
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none" : "";

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