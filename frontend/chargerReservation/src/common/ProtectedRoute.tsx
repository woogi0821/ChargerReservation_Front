import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

// 관리자 여부 판단 (로그인 상태이고 등급이 'Y'인 경우)
const ProtectedRoute = () => {
  const { loggedIn, memberGrade } = useAuthStore();
  const isAdmin = loggedIn && memberGrade === "Y";

  useEffect(() => {
    if (isAdmin) return;

    const timer = setTimeout(() => {
      if (!loggedIn) {
        alert("로그인이 필요한 페이지입니다.");
      } else if (memberGrade !== "Y") {
        alert("관리자 권한이 없습니다.");
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [isAdmin, loggedIn, memberGrade]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
