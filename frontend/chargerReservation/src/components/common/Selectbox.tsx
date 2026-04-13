import { useId, forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  sizeVariant?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, sizeVariant = "md", children, className = "", id, disabled, ...props }, ref) => {
    
    const generatedId = useId();
    const finalId = id || generatedId;

    // 1. 기본 뼈대 (pr-10 또는 pr-12를 주어 텍스트가 화살표와 겹치지 않게 합니다.)
    const baseStyle = `
      w-full border-2 rounded-xl transition-all outline-none appearance-none bg-white cursor-pointer 
      focus:ring-2 disabled:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400
    `;

    // 2. 상태별 색상
    const statusStyle = error
      ? "border-red-500 focus:ring-red-100"
      : "border-zinc-200 focus:border-green-500 focus:ring-green-100";

    // 3. 크기 규격 (우측 패딩을 넉넉히 주어 화살표 공간 확보)
    const sizeStyles = {
      sm: "px-3 pr-10 py-2 text-sm",
      md: "px-4 pr-12 py-3 text-base",
      lg: "px-5 pr-14 py-4 text-lg",
    };

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label htmlFor={finalId} className="text-sm font-bold text-zinc-700 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative group">
          <select
            id={finalId}
            ref={ref}
            disabled={disabled}
            className={`${baseStyle} ${statusStyle} ${sizeStyles[sizeVariant]}`}
            {...props}
          >
            {children}
          </select>
          
          {/* 4. 커스텀 화살표 아이콘 보완: 
              - pointer-events-none은 필수 (클릭 이벤트가 select로 전달되게 함)
              - disabled 상태일 때 화살표 색상도 함께 연하게 처리 
          */}
          <div className={`
            absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors
            ${disabled ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-600"}
          `}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <span className="text-xs text-red-500 ml-1 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";