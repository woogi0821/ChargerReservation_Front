import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface AdminLayoutProps {
  // 레이아웃 안에 들어갈 페이지 내용
  // children으로 구멍을 뚫어두어 어떤 페이지든 감쌀 수 있게 함
  children: ReactNode;

  // 현재 로그인한 관리자 이름
  adminName?: string;
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export const AdminLayout = ({
  children,
  adminName = "관리자",
}: AdminLayoutProps) => {

  // useNavigate : 로그아웃 시 페이지 이동에 사용
  const navigate = useNavigate();

  // 로그아웃 처리
  // localStorage 에서 토큰 삭제 후 로그인 페이지로 이동
  // 나중에 실제 JWT 연동 시 서버 토큰 무효화 로직 추가 필요
  const onLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
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