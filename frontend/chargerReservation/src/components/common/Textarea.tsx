import { useId, forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean; // 글자 수 표시 여부
  maxLength?: number;  // 최대 글자 수
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCount, maxLength, className = "", id, value, ...props }, ref) => {
    
    const generatedId = useId();
    const finalId = id || generatedId;

    // 1. 기본 스타일 (Scrollbar 디자인 추가)
    // resize-none: 사용자가 임의로 크기를 조절해 레이아웃을 깨뜨리는 것을 방지
    const baseStyle = `
      w-full border-2 rounded-xl p-4 transition-all outline-none 
      focus:ring-2 min-h-[140px] resize-none
      placeholder:text-zinc-400
      disabled:bg-zinc-100 disabled:cursor-not-allowed
      scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent
    `;

    // 2. 상태별 색상 (Dictionary Pattern)
    const statusStyle = error 
      ? "border-red-500 focus:ring-red-100" 
      : "border-zinc-200 focus:border-green-500 focus:ring-green-100";

    // 현재 글자 수 계산 (controlled/uncontrolled 대응)
    const currentCount = String(value || "").length;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {/* 상단 라벨 영역 */}
        {label && (
          <label htmlFor={finalId} className="text-sm font-bold text-zinc-700 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <textarea 
            id={finalId}
            ref={ref}
            maxLength={maxLength}
            value={value}
            className={`${baseStyle} ${statusStyle}`} 
            {...props} 
          />
          
          {/* 3. 글자 수 카운터 (오른쪽 하단 배치) */}
          {showCount && maxLength && (
            <div className="absolute bottom-3 right-4 text-[11px] font-medium text-zinc-400 pointer-events-none">
              <span className={currentCount >= maxLength ? "text-red-500" : ""}>
                {currentCount}
              </span>
              /{maxLength}
            </div>
          )}
        </div>

        {/* 하단 메시지 영역 (Error 혹은 Helper Text) */}
        {(error || helperText) && (
          <span className={`text-xs ml-1 font-medium ${error ? "text-red-500" : "text-zinc-500"}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";