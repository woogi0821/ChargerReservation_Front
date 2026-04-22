// 로그인 상태 확인
// => 어드민이면 -> 요청한 페이지 보여줌
// -> 아니면 -> 로그인 페이지로 이동

import { Navigate } from "react-router-dom";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface PrivateRouteProps {
  // 보호할 페이지 컴포넌트
  children: React.ReactNode;
}

// ─────────────────────────────────────────────
// 어드민 로그인 여부 확인 함수
// 나중에 API 연결 시 토큰 검증 로직으로 교체
// ─────────────────────────────────────────────

const getIsAdmin = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  return !!adminRole && adminRole.trim() !== "";
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAdmin = getIsAdmin();

  // 어드민이 아니면 로그인 페이지로 리다이렉트
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // 어드민이면 요청한 페이지 정상 렌더링
  return <>{children}</>;
};