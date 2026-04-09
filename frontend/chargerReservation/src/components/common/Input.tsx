import { forwardRef, type InputHTMLAttributes } from "react";

// 1. 속성 확장: helperText와 success 상태 등을 추가 고려해볼 수 있습니다.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string; // 에러는 아니지만 안내 문구가 필요할 때
  sizeVariant?: "sm" | "md" | "lg";
}

// forwardRef로 감싸서 외부(Page)에서 이 input의 DOM에 접근할 수 있게 합니다.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, sizeVariant = "md", className = "", id, ...props }, ref) => {
    
    // 2. 기본 뼈대: placeholder 색상(placeholder:text-zinc-400) 등을 추가해 디테일을 잡습니다.
    const baseStyle = `
      w-full border-2 rounded-xl transition-all outline-none 
      focus:ring-2 placeholder:text-zinc-400
      disabled:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400
      read-only:bg-zinc-50 read-only:border-zinc-200
    `;

    // 3. 상태별 색상 (Dictionary Pattern)
    const statusStyle = error
      ? "border-red-500 focus:ring-red-100" // 에러 시 빨간 테두리
      : "border-zinc-200 focus:border-green-500 focus:ring-green-100"; // 정상 시 초록 테두리

    // 4. 크기 규격
    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-5 py-4 text-lg",
    };

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {/* Label 영역 */}
        {label && (
          <label htmlFor={id} className="text-sm font-bold text-zinc-700 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input 본체 (ref 전달 필수) */}
        <input
          id={id}
          ref={ref}
          className={`${baseStyle} ${statusStyle} ${sizeStyles[sizeVariant]}`}
          {...props}
        />

        {/* 하단 메시지 영역 (Error 우선순위) */}
        {(error || helperText) && (
          <span className={`text-xs ml-1 font-medium ${error ? "text-red-500" : "text-zinc-500"}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

// 디버깅 시 컴포넌트 이름을 명확히 확인하기 위함
Input.displayName = "Input";
