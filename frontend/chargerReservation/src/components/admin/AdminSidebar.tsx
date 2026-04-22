import type { HTMLAttributes } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../../hook/useLogout";

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  adminName?: string;
  onLogout?: () => void;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { label: "대시보드",    path: "/admin",             icon: "📊" },
  { label: "회원 관리",   path: "/admin/member",       icon: "👥" },
  { label: "충전기 관리", path: "/admin/charger",      icon: "⚡" },
  { label: "예약 관리",   path: "/admin/reservation",  icon: "📅" },
  { label: "공지사항",    path: "/admin/notice",       icon: "📢" },
  { label: "패널티 관리", path: "/admin/penalty",      icon: "🚫" },
  { label: "문의 관리",   path: "/admin/inquiry",      icon: "💬" },
  { label: "관리자 관리", path: "/admin/managers",     icon: "🔑" },
];

const getAdminRole = () => localStorage.getItem("adminRole");
const getAdminPart = () => localStorage.getItem("adminPart");
const isSuperRole  = () => getAdminRole() === "SUPER";

export const AdminSidebar = ({
  adminName = "관리자",
  onLogout,
  className = "",
  ...props
}: AdminSidebarProps) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useLogout();

  const MENU_ITEMS = ALL_MENU_ITEMS.filter((item) => {
    switch (item.path) {
      case "/admin/member":
        return isSuperRole()
            || getAdminPart() === "MEMBER"
            || getAdminPart() === "ALL";
      case "/admin/managers":
        return isSuperRole();
      default:
        return true;
    }
  });

  const adminRole = getAdminRole();
  const adminPart = getAdminPart();

  return (
    <aside
      className={`
        w-52 min-h-screen bg-white border-r border-gray-100
        flex flex-col shadow-sm
        ${className}
      `}
      {...props}
    >
      {/* ✅ 로고 — 메인페이지랑 동일한 스타일 + 클릭 시 메인 이동 */}
      <div
        className="flex items-center gap-2 px-5 py-5 border-b border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <span className="text-2xl text-[#3B82F6]">⚡</span>
        <span className="text-[#3B82F6] text-lg font-[900] tracking-[-0.02em] font-['Nunito']">
          ChargeNow
        </span>
      </div>

      {/* 관리자 정보 */}
      <div className="px-5 py-4 border-b border-gray-100 bg-[#F8FAFF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {adminName?.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{adminName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium
                ${adminRole === "SUPER"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-500"
                }`}>
                {adminRole ?? "MANAGER"}
              </span>
              {adminPart && (
                <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-blue-50 text-blue-600">
                  {adminPart}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 목록 */}
      <nav className="flex-1 py-3">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full text-left px-4 py-2.5 text-sm
                transition-all flex items-center gap-2.5
                ${isActive
                  ? "text-[#1D4ED8] bg-[#EFF6FF] font-semibold border-r-2 border-[#1D4ED8]"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 하단 버튼 */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] rounded-lg transition-colors flex items-center gap-2"
        >
          <span>🏠</span>
          <span>메인으로</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>🚪</span>
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};