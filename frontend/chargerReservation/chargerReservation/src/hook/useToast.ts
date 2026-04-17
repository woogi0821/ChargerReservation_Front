import { useState, useCallback, useRef } from "react";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// Toast.tsx 와 동일한 타입 — variant 종류를 4가지로 제한
type ToastVariant = "success" | "error" | "warning" | "info";

// Toast.tsx 와 동일한 타입 — 위치를 6가지로 제한
type ToastPosition =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

// hook 내부에서 관리할 토스트 상태의 구조
interface ToastState {
  isVisible: boolean;   // 현재 토스트가 보이는지 여부
  message: string;      // 토스트에 표시할 메시지
  variant: ToastVariant;
  position: ToastPosition;
}

// showToast 호출 시 선택적으로 넘길 수 있는 옵션
interface ShowToastOptions {
  variant?: ToastVariant;
  position?: ToastPosition;
  // 자동으로 닫힐 시간 (ms 단위)
  // 기본값 3000 = 3초 후 자동 닫힘
  // 0 으로 설정하면 자동 닫힘 없음 (수동으로만 닫힘)
  duration?: number;
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export const useToast = () => {

  // ── 상태 ──────────────────────────────────

  // 토스트의 현재 상태를 하나의 객체로 관리
  // 초기값: 숨김 상태 / 빈 메시지 / info / top-right
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: "",
    variant: "info",
    position: "bottom-center",
  });

  // ── 타이머 ────────────────────────────────

  // 자동 닫힘 타이머를 저장하는 ref
  //
  // useRef 를 쓰는 이유:
  // useState 와 달리 값이 바뀌어도 리렌더링이 발생하지 않음
  // 타이머 ID는 화면에 표시할 필요가 없고 내부 관리용이라 ref 가 적합함
  //
  // ReturnType<typeof setTimeout> 을 쓰는 이유:
  // 브라우저(number)와 Node.js(Timeout 객체) 환경에서
  // setTimeout 의 반환 타입이 다르기 때문에
  // 환경에 상관없이 타입이 자동으로 맞춰지도록 ReturnType 을 사용
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 닫기 함수 ─────────────────────────────

  // 토스트를 숨기는 함수
  //
  // useCallback 을 쓰는 이유:
  // 컴포넌트가 리렌더링될 때마다 함수가 새로 만들어지는 것을 방지함
  // 아래 showToast 의 의존성 배열에 hideToast 가 들어가기 때문에
  // hideToast 가 매번 새로 만들어지면 showToast 도 매번 새로 만들어져서
  // 불필요한 재생성이 연쇄적으로 발생함 → useCallback 으로 방지
  const hideToast = useCallback(() => {
    // isVisible 만 false 로 바꾸고 나머지 상태는 유지
    // (메시지가 사라지는 애니메이션 중에도 내용이 보여야 하기 때문)
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []); // 의존성 없음 — 최초 한 번만 생성

  // ── 보이기 함수 ───────────────────────────

  const showToast = useCallback(
    (message: string, options: ShowToastOptions = {}) => {
      // 옵션에서 값을 꺼내고 없으면 기본값 사용
      const { variant = "info", position = "bottom-center", duration = 3000 } = options;

      // 이전 타이머가 남아있으면 먼저 제거
      // 예) 토스트가 떠 있는 중에 또 showToast 를 호출하면
      //     이전 타이머가 남아서 새 토스트가 예상보다 빨리 닫힐 수 있음
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 새 메시지와 옵션으로 상태 업데이트 → Toast 컴포넌트가 리렌더링되며 표시됨
      setToast({ isVisible: true, message, variant, position });

      // duration 이 0 이면 자동 닫힘 없음
      // 0 보다 크면 duration ms 후에 hideToast 실행
      if (duration > 0) {
        timerRef.current = setTimeout(hideToast, duration);
      }
    },
    [hideToast] // hideToast 가 바뀌면 showToast 도 새로 생성
  );

  // ── 편의 메서드 ───────────────────────────

  // showToast(message, { variant: "success" }) 를 매번 쓰기 번거로우니
  // variant 가 고정된 단축 함수를 제공
  //
  // Omit<ShowToastOptions, "variant"> 를 쓰는 이유:
  // variant 는 이미 각 함수에서 고정으로 넣어주기 때문에
  // 외부에서 variant 를 또 넘기지 못하도록 타입에서 제거

  const success = useCallback(
    (message: string, options?: Omit<ShowToastOptions, "variant">) =>
      showToast(message, { ...options, variant: "success" }),
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: Omit<ShowToastOptions, "variant">) =>
      showToast(message, { ...options, variant: "error" }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: Omit<ShowToastOptions, "variant">) =>
      showToast(message, { ...options, variant: "warning" }),
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: Omit<ShowToastOptions, "variant">) =>
      showToast(message, { ...options, variant: "info" }),
    [showToast]
  );

  // ── 반환 ──────────────────────────────────

  // hook 을 사용하는 컴포넌트에서 필요한 것들만 꺼내 쓸 수 있도록 반환
  //
  // 사용 예시:
  // const { toast, hideToast, success, error } = useToast();
  //
  // success("저장되었습니다.");
  // error("오류가 발생했습니다.", { position: "top-center" });
  // error("오류가 발생했습니다.", { duration: 0 }); // 수동으로만 닫힘
  //
  // <Toast
  //   variant={toast.variant}
  //   position={toast.position}
  //   isVisible={toast.isVisible}
  //   onClose={hideToast}
  // >
  //   {toast.message}
  // </Toast>
  return {
    toast,       // 현재 토스트 상태 (Toast 컴포넌트에 그대로 전달)
    showToast,   // 직접 variant 를 지정하고 싶을 때
    hideToast,   // 수동으로 닫을 때 (Toast 의 onClose 에 전달)
    success,     // 단축 메서드
    error,       // 단축 메서드
    warning,     // 단축 메서드
    info,        // 단축 메서드
  };
};