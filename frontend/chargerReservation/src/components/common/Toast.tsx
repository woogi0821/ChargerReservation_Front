import type { ReactNode, HTMLAttributes } from "react";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// Toast의 종류를 4가지로 제한
// 이 타입 외의 문자열은 TypeScript가 컴파일 에러로 잡아줌
type ToastVariant = "success" | "error" | "warning" | "info";

// Toast가 화면 어느 위치에 나타날지 6가지로 제한
type ToastPosition =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

// ─────────────────────────────────────────────
// Props 인터페이스
// ─────────────────────────────────────────────

// HTMLAttributes<HTMLDivElement> 를 extends 하는 이유:
// onClick, className, style, id 같은 HTML 기본 속성들을
// 일일이 props에 선언하지 않아도 자동으로 사용할 수 있게 상속받음
//
// Omit<..., "children"> 을 쓰는 이유:
// HTMLAttributes 안에도 children이 정의되어 있는데
// 우리가 아래에서 children: ReactNode 로 직접 재정의할 것이기 때문에
// 충돌을 막기 위해 부모 타입에서 children만 제거함
interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  // 토스트 종류 (기본값: "info")
  variant?: ToastVariant;

  // 토스트 위치 (기본값: "bottom-center")
  // 시안 기준 하단 중앙 고정
  position?: ToastPosition;

  // 토스트 표시 여부 - Boolean이므로 필수 규칙에 따라 is 접두사 사용
  isVisible?: boolean;

  // 닫기(X) 버튼 표시 여부 - Boolean이므로 필수 규칙에 따라 has 접두사 사용
  hasCloseButton?: boolean;

  // 토스트 안에 들어갈 내용
  // children을 ReactNode로 받아서 문자열뿐 아니라
  // <strong>저장 완료</strong> 같은 JSX도 넣을 수 있게 함
  children: ReactNode;

  // 닫기 버튼 클릭 또는 자동 닫힘 시 실행할 함수
  // 이벤트 함수이므로 필수 규칙에 따라 on 접두사 사용
  onClose?: () => void;
}

// ─────────────────────────────────────────────
// 스타일 상수
// ─────────────────────────────────────────────

// variant별 Tailwind CSS 클래스를 딕셔너리(객체)로 관리
// 시안 기준:
// - 알약형 (rounded-full)
// - 어두운 배경 + 흰 텍스트
// - success → primary-dark (#1D4ED8)
// - error   → red (#EF4444)
// - warning → amber
// - info    → dark (#0F172A)
//
// Record<ToastVariant, ...> 타입은 ToastVariant의 4가지 키가 모두 존재해야 함
// 하나라도 빠지면 TypeScript 에러 → 실수 방지
const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; iconPath: string }
> = {
  success: {
    // 시안의 primary-dark 색상 — 성공
    container: "bg-[#1D4ED8] text-white",
    icon: "text-white",
    // SVG path 데이터 (체크 원형 아이콘)
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    // 시안의 red 색상 — 실패 / 에러
    container: "bg-[#EF4444] text-white",
    icon: "text-white",
    // SVG path 데이터 (X 원형 아이콘)
    iconPath:
      "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    // 경고 — amber 계열
    container: "bg-[#F59E0B] text-white",
    icon: "text-white",
    // SVG path 데이터 (삼각형 경고 아이콘)
    iconPath:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  info: {
    // 안내 — 시안의 어두운 텍스트색 (#0F172A)
    container: "bg-[#0F172A] text-white",
    icon: "text-white",
    // SVG path 데이터 (i 원형 아이콘)
    iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

// position별 Tailwind CSS 위치 클래스를 딕셔너리로 관리
// 시안 기준 기본값은 bottom-center
const positionStyles: Record<ToastPosition, string> = {
  "top-right":     "top-8 right-8",
  "top-center":    "top-8 left-1/2 -translate-x-1/2",
  "top-left":      "top-8 left-8",
  "bottom-right":  "bottom-8 right-8",
  "bottom-center": "bottom-8 left-1/2 -translate-x-1/2",
  "bottom-left":   "bottom-8 left-8",
};

// 모든 variant에 공통으로 적용되는 뼈대 스타일
// 시안 기준:
// - rounded-full  : 알약형
// - px-6 py-3     : 시안의 padding:11px 22px 과 유사
// - shadow-lg     : 시안의 box-shadow 와 유사
// - transition    : isVisible 변경 시 부드러운 애니메이션
// - whitespace-nowrap : 시안처럼 한 줄로 유지
const baseStyle =
  "fixed z-50 flex items-center gap-2 px-6 py-3 rounded-full shadow-lg font-bold text-sm whitespace-nowrap transition-all duration-300";

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export const Toast = ({
  variant = "info",           // 기본값: info
  position = "bottom-center", // 기본값: 하단 중앙 (시안 기준)
  isVisible = true,           // 기본값: 보임
  hasCloseButton = false,     // 시안에는 닫기버튼 없음 — 기본값 false
  children,
  onClose,
  className = "",
  // ...props: 위에서 명시한 props 외에 전달된 나머지 HTML 속성들
  // 예) id="my-toast" style={{ marginTop: 10 }} 등을 그대로 div에 전달
  ...props
}: ToastProps) => {

  // variant에 해당하는 스타일 객체를 꺼내옴
  const { container, icon, iconPath } = variantStyles[variant];

  // 최종 className 조합
  // 1) baseStyle      : 공통 뼈대 (알약형 등)
  // 2) container      : variant별 배경색 + 텍스트색
  // 3) positionStyles : position별 위치
  // 4) 애니메이션     : isVisible이 true면 보임, false면 아래로 사라짐
  //                     시안처럼 아래에서 올라오는 애니메이션
  // 5) className      : 외부에서 추가로 전달한 클래스 (확장 가능)
  const combinedClassName = `
    ${baseStyle}
    ${container}
    ${positionStyles[position]}
    ${
      isVisible
        ? "opacity-100 translate-y-0"                    // 보이는 상태
        : "opacity-0 translate-y-4 pointer-events-none"  // 숨김 상태 — 아래로 사라짐
    }
    ${className}
  `;

  return (
    // role="alert"      : 스크린리더가 토스트 내용을 자동으로 읽어줌 (접근성)
    // aria-live="polite": 현재 읽고 있는 내용이 끝난 후 알림 (접근성)
    // {...props}        : id, style 등 외부에서 넘긴 나머지 속성 전달
    <div role="alert" aria-live="polite" className={combinedClassName} {...props}>

      {/* 아이콘 영역 */}
      {/* aria-hidden="true": 아이콘은 장식용이라 스크린리더가 읽지 않도록 숨김 */}
      <svg
        className={`w-4 h-4 shrink-0 ${icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {/* variant에 따라 iconPath가 달라져서 아이콘 모양이 바뀜 */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPath}
        />
      </svg>

      {/* 메시지 영역 */}
      {/* children으로 구멍을 뚫어뒀기 때문에 */}
      {/* 문자열이든 JSX든 자유롭게 넣을 수 있음 */}
      <span>{children}</span>

      {/* 닫기 버튼 */}
      {/* hasCloseButton이 false면 아예 렌더링하지 않음 */}
      {/* 시안 기준 기본값 false — 자동으로만 닫힘 */}
      {hasCloseButton && (
        <button
          onClick={onClose}
          aria-label="닫기"
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};