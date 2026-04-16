import { useId, forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * CheckBoxProps 정의
 * 1. 기본 input 태그의 속성 중 'type'은 체크박스 전용이므로 제외(Omit)하고 상속받습니다.
 * 2. variant: 체크박스의 포인트 컬러를 결정합니다.
 * 3. children: 체크박스 옆에 표시될 텍스트나 레이블 요소입니다.
 */
interface CheckBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: "primary" | "danger";
  children?: ReactNode;
}

// forwardRef를 적용하여 React Hook Form 등 외부 라이브러리와의 호환성을 높였습니다.
export const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  ({ variant = "primary", children, className = "", id, disabled, ...props }, ref) => {
    
    // id가 없을 경우를 대비해 고유한 ID를 생성합니다. (Label 연결 보장)
    const generatedId = useId();
    const finalId = id || generatedId;

    // 1. 기본 뼈대 스타일 + 체크 아이콘 스타일 통합
    const baseStyle = `
      w-6 h-6 border-2 rounded-md transition-all cursor-pointer
      appearance-none flex-shrink-0 relative
      focus:ring-2 focus:ring-offset-1 focus:outline-none
      checked:after:content-['✓']
      checked:after:absolute
      checked:after:inset-0
      checked:after:flex
      checked:after:items-center
      checked:after:justify-center
      checked:after:text-white
      checked:after:text-sm
      checked:after:font-bold
    `;

    // 2. 용도(Variant) 딕셔너리 (프로젝트 테마 컬러: green)
    const variantStyles = {
      primary: "border-zinc-300 checked:bg-green-500 checked:border-green-500 focus:ring-green-200 group-hover:border-green-400",
      danger: "border-red-200 checked:bg-red-500 checked:border-red-500 focus:ring-red-200 group-hover:border-red-400",
    };

    // 3. 상태(Disabled 등)에 따른 배경색 처리
    const statusStyle = "bg-white disabled:bg-zinc-100 disabled:border-zinc-200 disabled:cursor-not-allowed";

    // 4. 최종 클래스명 조립
    const combinedInputClassName = `${baseStyle} ${statusStyle} ${variantStyles[variant]} ${className}`;

    return (
      <label 
        htmlFor={finalId} 
        className="inline-flex items-center gap-3 cursor-pointer group select-none py-1 w-fit"
      >
        <input
          id={finalId}
          ref={ref} // 상속받은 ref 연결
          type="checkbox"
          disabled={disabled}
          className={combinedInputClassName}
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

// 컴포넌트 이름 설정 (forwardRef 사용 시 권장)
CheckBox.displayName = "CheckBox";