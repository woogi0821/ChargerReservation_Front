// src/hooks/useLogout.ts
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthService from "../services/AuthService";

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout API 에러:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      logout(); 
      navigate("/", { replace: true });
    }
  };

  return { handleLogout };
};