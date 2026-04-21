import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

interface DashboardStats {
  totalMembers: number;
  todayReservations: number;
  totalStations: number;
  brokenChargers: number;
  pendingInquiries: number;
}

interface RecentReservation {
  reservationId: number;
  memberId: number;
  chargerId: string;
  startTime: string;
  status: string;
}

interface RecentNotice {
  noticeId: number;
  title: string;
  fixYn: string;
  insertTime: string;
}

interface RecentInquiry {
  inquiryId: number;
  memberId: number;
  category: string;
  title: string;
  status: string;
  insertTime: string;
}

interface RecentPenalty {
  penaltyId: number;
  memberId: number;
  reason: string;
  status: string;
  insertTime: string;
}

const reservationStatusStyles: { [key: string]: { label: string; badge: string } } = {
  RESERVED:  { label: "예정",   badge: "bg-blue-50 text-blue-600"     },
  CHARGING:  { label: "진행중", badge: "bg-green-50 text-green-600"   },
  COMPLETED: { label: "완료",   badge: "bg-gray-100 text-gray-500"    },
  CANCELED:  { label: "취소",   badge: "bg-red-50 text-red-500"       },
  NO_SHOW:   { label: "노쇼",   badge: "bg-orange-50 text-orange-600" },
};

const penaltyStatusStyles: { [key: string]: { label: string; badge: string } } = {
  ACTIVE:   { label: "활성", badge: "bg-red-50 text-red-600"    },
  CLEARED:  { label: "해제", badge: "bg-gray-100 text-gray-500" },
  CANCELED: { label: "취소", badge: "bg-blue-50 text-blue-500"  },
};

const inquiryStatusStyles: { [key: string]: { label: string; badge: string } } = {
  PENDING:  { label: "미답변",   badge: "bg-orange-50 text-orange-600" },
  ANSWERED: { label: "답변완료", badge: "bg-green-50 text-green-600"   },
};

const AdminDashboardPage = () => {

  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [recentNotices, setRecentNotices] = useState<RecentNotice[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [recentPenalties, setRecentPenalties] = useState<RecentPenalty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const fetchDashboard = async () => {
    try {
      const [statsRes, reservationRes, noticeRes, inquiryRes, penaltyRes] =
        await Promise.all([
          fetch("http://localhost:8080/api/admin/dashboard",    { headers }),
          fetch("http://localhost:8080/api/admin/reservations", { headers }),
          fetch("http://localhost:8080/api/admin/notices",      { headers }),
          fetch("http://localhost:8080/api/admin/inquiries",    { headers }),
          fetch("http://localhost:8080/api/admin/penalties",    { headers }),
        ]);

      if (statsRes.ok) setStats(await statsRes.json());

      if (reservationRes.ok) {
        const data = await reservationRes.json();
        const list = Array.isArray(data) ? data : data.content ?? [];
        setRecentReservations(list.slice(0, 5));
      }
      if (noticeRes.ok) {
        const data = await noticeRes.json();
        const list = Array.isArray(data) ? data : data.content ?? [];
        setRecentNotices(list.slice(0, 5));
      }
      if (inquiryRes.ok) {
        const data = await inquiryRes.json();
        const list = Array.isArray(data) ? data : data.content ?? [];
        setRecentInquiries(list.slice(0, 5));
      }
      if (penaltyRes.ok) {
        const data = await penaltyRes.json();
        const list = Array.isArray(data) ? data : data.content ?? [];
        setRecentPenalties(list.slice(0, 5));
      }

    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ✅ 개선 — 아이콘 / 색상 / 경로 추가
  const statCards = [
    {
      label: "총 회원수",
      value: stats?.totalMembers?.toLocaleString() ?? "-",
      unit: "명",
      icon: "👥",
      color: "text-[#1D4ED8]",
      bg: "bg-[#EFF6FF]",
      border: "border-[#BFDBFE]",
      path: "/admin/member",
    },
    {
      label: "오늘 예약",
      value: stats?.todayReservations?.toString() ?? "-",
      unit: "건",
      icon: "📅",
      color: "text-[#059669]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
      path: "/admin/reservation",
    },
    {
      label: "총 충전소",
      value: stats?.totalStations?.toLocaleString() ?? "-",
      unit: "개소",
      icon: "🗺️",
      color: "text-[#7C3AED]",
      bg: "bg-[#F5F3FF]",
      border: "border-[#DDD6FE]",
      path: "/admin/charger",
    },
    {
      label: "고장 충전기",
      value: stats?.brokenChargers?.toLocaleString() ?? "-",
      unit: "대",
      icon: "⚠️",
      color: "text-[#DC2626]",
      bg: "bg-[#FEF2F2]",
      border: "border-[#FECACA]",
      path: "/admin/charger",
    },
    {
      label: "미답변 문의",
      value: stats?.pendingInquiries?.toString() ?? "-",
      unit: "건",
      icon: "💬",
      color: "text-[#D97706]",
      bg: "bg-[#FFFBEB]",
      border: "border-[#FDE68A]",
      path: "/admin/inquiry",
    },
  ];

  return (
    <AdminLayout>

      <AdminPageHeader title="대시보드" />

      {/* ✅ 개선된 통계 카드 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.path)}
            className={`bg-white border ${card.border} p-5 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium tracking-wide">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center text-lg`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${card.color}`}>{card.value}</span>
              <span className="text-xs text-gray-400">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 예약 + 최근 공지 */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* 최근 예약 */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/admin/reservation")}
          >
            <span className="text-base">📅</span>
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">최근 예약</h2>
            <span className="text-xs text-gray-400">최근 5건</span>
            <span className="ml-auto text-xs text-blue-500">전체보기 →</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">회원 ID</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">충전기 ID</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">시작시간</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-gray-300">불러오는 중...</td></tr>
              ) : recentReservations.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-gray-300">예약이 없습니다</td></tr>
              ) : (
                recentReservations.map((r) => {
                  const style = reservationStatusStyles[r.status]
                    ?? { label: r.status, badge: "bg-gray-100 text-gray-500" };
                  return (
                    <tr
                      key={r.reservationId}
                      onClick={() => navigate("/admin/reservation")}
                      className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3 text-gray-700 font-medium">{r.memberId}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{r.chargerId}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{r.startTime?.slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 최근 공지 */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/admin/notice")}
          >
            <span className="text-base">📢</span>
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">최근 공지</h2>
            <span className="text-xs text-gray-400">최근 5건</span>
            <span className="ml-auto text-xs text-blue-500">전체보기 →</span>
          </div>
          <ul>
            {isLoading ? (
              <li className="px-5 py-6 text-center text-sm text-gray-300">불러오는 중...</li>
            ) : recentNotices.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-gray-300">공지가 없습니다</li>
            ) : (
              recentNotices.map((notice) => (
                <li
                  key={notice.noticeId}
                  onClick={() => navigate("/admin/notice")}
                  className="flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {notice.fixYn === "Y" && (
                      <span className="shrink-0 px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 font-medium rounded-full">고정</span>
                    )}
                    <span className="text-sm text-gray-700 truncate">{notice.title}</span>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 ml-3">
                    {notice.insertTime?.slice(0, 10)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* 최근 문의 + 최근 패널티 */}
      <div className="grid grid-cols-2 gap-4">

        {/* 최근 문의 */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/admin/inquiry")}
          >
            <span className="text-base">💬</span>
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">최근 문의</h2>
            <span className="text-xs text-gray-400">최근 5건</span>
            <span className="ml-auto text-xs text-blue-500">전체보기 →</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">카테고리</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">제목</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-gray-300">불러오는 중...</td></tr>
              ) : recentInquiries.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-gray-300">문의가 없습니다</td></tr>
              ) : (
                recentInquiries.map((inquiry) => {
                  const style = inquiryStatusStyles[inquiry.status]
                    ?? { label: inquiry.status, badge: "bg-gray-100 text-gray-500" };
                  return (
                    <tr
                      key={inquiry.inquiryId}
                      onClick={() => navigate("/admin/inquiry")}
                      className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3 text-gray-500 text-xs">{inquiry.category}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium text-xs truncate max-w-32">{inquiry.title}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 최근 패널티 */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/admin/penalty")}
          >
            <span className="text-base">🚫</span>
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">최근 패널티</h2>
            <span className="text-xs text-gray-400">최근 5건</span>
            <span className="ml-auto text-xs text-blue-500">전체보기 →</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">회원 ID</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">사유</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-gray-300">불러오는 중...</td></tr>
              ) : recentPenalties.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-gray-300">패널티가 없습니다</td></tr>
              ) : (
                recentPenalties.map((penalty) => {
                  const style = penaltyStatusStyles[penalty.status]
                    ?? { label: penalty.status, badge: "bg-gray-100 text-gray-500" };
                  return (
                    <tr
                      key={penalty.penaltyId}
                      onClick={() => navigate("/admin/penalty")}
                      className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3 text-gray-700 font-medium">{penalty.memberId}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs truncate max-w-32">{penalty.reason}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
};

export default AdminDashboardPage;