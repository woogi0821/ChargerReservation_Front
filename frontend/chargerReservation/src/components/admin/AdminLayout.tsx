import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Toast } from "../common/Toast";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  adminName?: string;
}

export const AdminLayout = ({
  children,
}: AdminLayoutProps) => {

  const navigate = useNavigate();
  const { toastMessage, setToastMessage } = useAuthStore();

  const adminName = localStorage.getItem("adminName") ?? "관리자";

  // ✅ 추가 — 3초 후 자동 제거
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* 사이드바 — 좌측 고정 */}
      <AdminSidebar
        adminName={adminName}
        onLogout={onLogout}
      />

      {/* 페이지 내용 영역 */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>

      {/* ✅ 추가 — 토스트 메시지 */}
      <Toast
        variant="success"
        position="bottom-center"
        isVisible={!!toastMessage}
        onClose={() => setToastMessage(null)}
      >
        {toastMessage ?? ""}
      </Toast>

    </div>
  );
};