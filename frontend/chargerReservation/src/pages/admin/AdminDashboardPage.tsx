import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  unit: string;
}

// noshow 추가 — AdminReservationPage 와 동일하게 맞춤
interface RecentReservation {
  id: string;
  userName: string;
  stationName: string;
  chargerType: string;
  time: string;
  status: "upcoming" | "ongoing" | "done" | "cancel" | "noshow";
}

interface RecentNotice {
  id: string;
  title: string;
  createdAt: string;
  isPinned: boolean;
}

// ─────────────────────────────────────────────
// 임시 데이터 (나중에 API 연결 시 교체)
// ─────────────────────────────────────────────

const STAT_CARDS: StatCard[] = [
  { label: "총 회원수",   value: "1,284", unit: "명"   },
  { label: "오늘 예약",   value: "38",    unit: "건"   },
  { label: "총 충전소",   value: "5",     unit: "개소" },
  { label: "고장 충전기", value: "2",     unit: "대"   },
];

const RECENT_RESERVATIONS: RecentReservation[] = [
  { id: "r001", userName: "김민준", stationName: "강남 테헤란로점",     chargerType: "급속 50kW",  time: "14:00", status: "upcoming" },
  { id: "r002", userName: "이서연", stationName: "송파 잠실점",         chargerType: "급속 100kW", time: "13:00", status: "ongoing"  },
  { id: "r003", userName: "박지훈", stationName: "마포 홍대점",         chargerType: "완속 7kW",   time: "12:00", status: "done"     },
  { id: "r004", userName: "최수아", stationName: "서초 반포점",         chargerType: "급속 50kW",  time: "11:00", status: "cancel"   },
  { id: "r005", userName: "정우성", stationName: "영등포 타임스퀘어점", chargerType: "급속 100kW", time: "10:00", status: "done"     },
];

const RECENT_NOTICES: RecentNotice[] = [
  { id: "n001", title: "시스템 점검 안내",           createdAt: "2026.03.30", isPinned: true  },
  { id: "n002", title: "충전 요금 변경 안내",         createdAt: "2026.03.28", isPinned: true  },
  { id: "n003", title: "신규 충전소 오픈 안내",       createdAt: "2026.03.25", isPinned: false },
  { id: "n004", title: "앱 업데이트 안내 (v2.1.0)",  createdAt: "2026.03.20", isPinned: false },
  { id: "n005", title: "이벤트 안내 — 첫 충전 무료", createdAt: "2026.03.15", isPinned: false },
];

// ─────────────────────────────────────────────
// 예약 상태 스타일 딕셔너리
// noshow 추가 — AdminReservationPage 와 동일하게 맞춤
// ─────────────────────────────────────────────

const reservationStatusStyles: {
  [key in "upcoming" | "ongoing" | "done" | "cancel" | "noshow"]: {
    label: string;
    badge: string;
  };
} = {
  upcoming: { label: "예정",   badge: "bg-blue-50 text-blue-600"     },
  ongoing:  { label: "진행중", badge: "bg-green-50 text-green-600"   },
  done:     { label: "완료",   badge: "bg-gray-100 text-gray-500"    },
  cancel:   { label: "취소",   badge: "bg-red-50 text-red-500"       },
  noshow:   { label: "노쇼",   badge: "bg-orange-50 text-orange-600" },
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminDashboardPage = () => {
  return (
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      <AdminPageHeader title="대시보드" />

      {/* ── 통계 카드 영역 ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 p-6 shadow-sm"
          >
            <p className="text-xs text-gray-400 tracking-wide mb-3">
              {card.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-gray-800">
                {card.value}
              </span>
              <span className="text-xs text-gray-400">
                {card.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 하단 섹션 — 최근 예약 + 최근 공지 ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* ── 최근 예약 목록 ── */}
        <div className="bg-white border border-gray-100 shadow-sm">

          {/* 섹션 헤더 */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
              최근 예약
            </h2>
            <span className="text-xs text-gray-400">
              최근 5건
            </span>
          </div>

          {/* 예약 목록 */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">회원명</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">시간</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_RESERVATIONS.map((r) => {
                const style = reservationStatusStyles[r.status];
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-700 font-medium">{r.userName}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{r.stationName}</td>
                    <td className="px-5 py-3 text-gray-500">{r.time}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                        {style.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── 최근 공지사항 ── */}
        <div className="bg-white border border-gray-100 shadow-sm">

          {/* 섹션 헤더 */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
              최근 공지
            </h2>
            <span className="text-xs text-gray-400">
              최근 5건
            </span>
          </div>

          {/* 공지 목록 */}
          <ul>
            {RECENT_NOTICES.map((notice) => (
              <li
                key={notice.id}
                className="flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {notice.isPinned && (
                    <span className="shrink-0 px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 font-medium rounded-sm">
                      고정
                    </span>
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {notice.title}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-gray-400 ml-3">
                  {notice.createdAt}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </AdminLayout>
  );
};

export default AdminDashboardPage;