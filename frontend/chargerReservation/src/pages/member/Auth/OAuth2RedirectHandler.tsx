import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";

const OAuth2RedirectHandler = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuthStore();

  useEffect(() => {
    const params      = new URLSearchParams(location.search);
    const token       = params.get("accessToken");
    const memberGrade = params.get("memberGrade") || params.get("role") || "N";

    if (token) {
      // AT는 메모리(Zustand)에만 저장 — RT는 httpOnly 쿠키로 자동 처리
      login(memberGrade, token);
      navigate("/", { replace: true });
    } else {
      alert("소셜 로그인에 실패했습니다.");
      navigate("/");
    }
  }, [location, navigate, login]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500 font-semibold">로그인 처리 중입니다...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
