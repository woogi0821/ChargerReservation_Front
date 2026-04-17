import { useId, forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ children, className = "", id, disabled, ...props }, ref) => {
    
    const generatedId = useId();
    const finalId = id || generatedId;

    // 1. 기본 뼈대: 라디오는 무조건 둥글어야 하므로 rounded-full 고정
    const baseStyle = `
      w-5 h-5 border-2 rounded-full transition-all cursor-pointer 
      appearance-none flex-shrink-0 relative outline-none
    `;

    // 2. 상태 및 색상: 체크 시 파란색 배경 + 포커스 링 (디자인 시안 primary: #3B82F6)
    const statusStyle = `
      border-[#DBEAFE] bg-white
      checked:bg-[#3B82F6] checked:border-[#3B82F6]
      focus:ring-2 focus:ring-[rgba(59,130,246,0.15)] focus:ring-offset-1
      disabled:bg-zinc-100 disabled:border-zinc-200 disabled:cursor-not-allowed
    `;
    
    // 3. 중앙 점(Dot) 스타일: 
    // after 요소를 사용해 흰색 점을 만듭니다. translate-x-1/2 방식으로 완벽한 중앙 정렬을 잡습니다.
    const dotStyle = `
      checked:after:content-[''] 
      checked:after:absolute 
      checked:after:w-2 
      checked:after:h-2 
      checked:after:bg-white 
      checked:after:rounded-full 
      checked:after:top-1/2 
      checked:after:left-1/2 
      checked:after:-translate-x-1/2 
      checked:after:-translate-y-1/2
      checked:after:transition-transform
    `;

    return (
      <label 
        htmlFor={finalId} 
        className="inline-flex items-center gap-3 cursor-pointer group select-none py-1 w-fit"
      >
        <input 
          id={finalId}
          ref={ref}
          type="radio" 
          disabled={disabled}
          className={`${baseStyle} ${statusStyle} ${dotStyle} ${className}`} 
          {...props} 
        />
        {children && (
          <span className={`
            text-zinc-700 font-medium transition-colors
            group-hover:text-zinc-900
            ${disabled ? "text-zinc-400 cursor-not-allowed" : ""}
          `}>
            {children}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";