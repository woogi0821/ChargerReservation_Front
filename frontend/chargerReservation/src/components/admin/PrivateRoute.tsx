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
  // 임시 — localStorage 에서 토큰 꺼내서 확인
  // 실제 구현 시 JWT 토큰의 role 필드 확인으로 교체
  const token = localStorage.getItem("adminToken");
  return !!token;
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