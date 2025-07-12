"use client";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "red" | "gray";
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
  const baseClasses = "font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const colorClasses = {
    blue: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    green: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    purple: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    red: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    gray: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

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