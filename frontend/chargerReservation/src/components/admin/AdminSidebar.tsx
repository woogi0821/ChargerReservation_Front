import type { HTMLAttributes } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
}

interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  adminName?: string;
  onLogout?: () => void;
}

// 전체 메뉴 목록
const ALL_MENU_ITEMS: MenuItem[] = [
  { label: "대시보드",    path: "/admin" },
  { label: "회원 관리",   path: "/admin/member" },
  { label: "충전기 관리", path: "/admin/charger" },
  { label: "예약 관리",   path: "/admin/reservation" },
  { label: "공지사항",    path: "/admin/notice" },
  { label: "패널티 관리", path: "/admin/penalty" },
  { label: "문의 관리",   path: "/admin/inquiry" },
];

// 회원관리 접근 가능한 파트 체크
// SUPER 역할이거나 MEMBER 파트만 회원관리 메뉴 표시
const canAccessMember = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "MEMBER";
};

export const AdminSidebar = ({
  adminName = "관리자",
  onLogout,
  className = "",
  ...props
}: AdminSidebarProps) => {

  const navigate = useNavigate();
  const location = useLocation();

  // 파트에 따라 메뉴 필터링
  // 회원관리는 SUPER 또는 MEMBER 파트만 표시
  const MENU_ITEMS = ALL_MENU_ITEMS.filter((item) => {
    if (item.path === "/admin/member") {
      return canAccessMember();
    }
    return true;
  });

  return (
    <aside
      className={`
        w-48 min-h-screen bg-white border-r border-gray-200
        flex flex-col
        ${className}
      `}
      {...props}
    >
      {/* 상단 — 로고 영역 */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-1 h-5 bg-blue-700" />
        <span className="text-sm font-semibold tracking-widest text-gray-800 uppercase">
          Admin
        </span>
      </div>

      {/* 중간 — 메뉴 목록 */}
      <nav className="flex-1 py-4">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full text-left px-5 py-3 text-sm tracking-wide
                transition-colors border-l-2
                ${isActive
                  ? "text-blue-700 border-l-blue-700 bg-blue-50 font-medium"
                  : "text-gray-400 border-l-transparent hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 하단 — 관리자 정보 + 로그아웃 */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 tracking-wide mb-2">
          {adminName}
        </p>
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-blue-700 tracking-wide transition-colors"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
};