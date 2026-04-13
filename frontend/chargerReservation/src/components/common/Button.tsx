import type { ButtonHTMLAttributes, ReactNode } from "react";

// HTML 기본 속성 상속받기
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger"; // 성격
  size?: "sm" | "md" | "lg";                 // 크기
  children: ReactNode;                       // 원칙 2: 구멍 뚫기
}

export default function Button({ 
  variant = "primary", 
  size = "md", 
  children, 
  className, 
  ...props 
}: ButtonProps) {
  
  // 디자인 가이드 컬러 적용
  const baseStyles = "font-bold rounded-xl transition-all flex items-center justify-center";
  
  const variants = {
    primary: "bg-[#3B82F6] text-white hover:bg-[#1D4ED8] shadow-md",
    outline: "border-2 border-[#DBEAFE] text-[#3B82F6] bg-white hover:bg-[#F5F8FF]",
    danger: "bg-[#EF4444] text-white hover:bg-[#B91C1C]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props} // onClick, disabled 등을 자동으로 전달
    >
      {children}
    </button>
  );
}
