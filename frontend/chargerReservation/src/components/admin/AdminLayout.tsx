import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  adminName?: string;
}

export const AdminLayout = ({
  children,
  adminName = "관리자",
}: AdminLayoutProps) => {

  const navigate = useNavigate();

  // ✅ 수정 — localStorage 전체 삭제 후 메인으로 이동
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

    </div>
  );
};