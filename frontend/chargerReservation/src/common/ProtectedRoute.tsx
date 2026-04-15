import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // 스토어 경로 확인 필요
import { useEffect, useRef } from "react";

// 관리자 여부 판단 (로그인 상태이고 등급이 'Y'인 경우)
const ProtectedRoute = () => {
  const { loggedIn, memberGrade } = useAuthStore();
  const isAdmin = loggedIn && memberGrade === "Y";

  const hasAlerted = useRef(false);

  useEffect(() => {
    if (!isAdmin && !hasAlerted.current) {
      alert("관리자 권한이 없습니다.");
      hasAlerted.current = true;
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
