import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface Reservation {
  reservationId: number;
  memberId: number;
  chargerId: string;
  carNumber: string;
  startTime: string;
  endTime: string;
  actualEndTime: string | null;
  status: "RESERVED" | "CHARGING" | "COMPLETED" | "CANCELED" | "NOSHOW";
}

interface FilterTab {
  value: Reservation["status"] | "all";
  label: string;
}

// ─────────────────────────────────────────────
// 필터 탭 목록
// ─────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = [
  { value: "all",       label: "전체"   },
  { value: "RESERVED",  label: "예정"   },
  { value: "CHARGING",  label: "진행중" },
  { value: "COMPLETED", label: "완료"   },
  { value: "CANCELED",  label: "취소"   },
  { value: "NOSHOW",    label: "노쇼"   },
];

// ─────────────────────────────────────────────
// 상태별 스타일 딕셔너리
// ─────────────────────────────────────────────

const reservationStatusStyles: {
  [key in "RESERVED" | "CHARGING" | "COMPLETED" | "CANCELED" | "NOSHOW"]: {
    label: string;
    badge: string;
  };
} = {
  RESERVED:  { label: "예정",   badge: "bg-blue-50 text-blue-600"     },
  CHARGING:  { label: "진행중", badge: "bg-green-50 text-green-600"   },
  COMPLETED: { label: "완료",   badge: "bg-gray-100 text-gray-500"    },
  CANCELED:  { label: "취소",   badge: "bg-red-50 text-red-500"       },
  NOSHOW:    { label: "노쇼",   badge: "bg-orange-50 text-orange-600" },
};

// ─────────────────────────────────────────────
// 권한 체크
// SUPER 또는 RESERVATION 파트만 강제취소 가능
// ─────────────────────────────────────────────

const canEditReservation = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "RESERVATION" || adminPart === "ALL";
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminReservationPage = () => {

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab["value"]>("all");
  const [isLoading, setIsLoading] = useState(true);

  // 수정 권한 여부
  const hasEditPermission = canEditReservation();

  // ── 예약 목록 조회 ───────────────────────────

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:8080/api/admin/reservations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("예약 목록 조회 실패");
        return;
      }

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // ── 예약 강제 취소 ───────────────────────────

  const onForceCancel = async (reservationId: number) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 강제 취소하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/reservations/${reservationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("예약 강제취소 실패");
        return;
      }

      // 취소 성공 시 목록 새로고침
      fetchReservations();
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  // ── 필터링 ─────────────────────────────────

  const filteredReservations = activeFilter === "all"
    ? reservations
    : reservations.filter((r) => r.status === activeFilter);

  return (
    <AdminLayout adminName="홍길동">

      <AdminPageHeader title="예약 관리" />

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">예약 목록</h2>
            <span className="text-xs text-gray-400">총 {filteredReservations.length}건</span>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex border-b border-gray-100">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-5 py-3 text-xs tracking-wide transition-colors border-b-2
                ${activeFilter === tab.value
                  ? "text-blue-700 border-b-blue-700 font-medium"
                  : "text-gray-400 border-b-transparent hover:text-gray-600"
                }`}
            >
              {tab.label}
              <span className="ml-1 text-gray-300">
                {tab.value === "all"
                  ? reservations.length
                  : reservations.filter((r) => r.status === tab.value).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* 예약 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">예약번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">회원 ID</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전기 ID</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">차량번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">시작시간</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">종료시간</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-300">
                    불러오는 중...
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-300">
                    해당 상태의 예약이 없습니다
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => {
                  const style = reservationStatusStyles[reservation.status];
                  return (
                    <tr key={reservation.reservationId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{reservation.reservationId}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{reservation.memberId}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.chargerId}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.carNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.startTime?.slice(0, 10)}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.endTime?.slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>

                      {/* 강제취소 버튼 — RESERVED / CHARGING 상태일 때만 표시 */}
                      <td className="px-5 py-3">
                        {(reservation.status === "RESERVED" || reservation.status === "CHARGING") && (
                          <button
                            onClick={() => onForceCancel(reservation.reservationId)}
                            disabled={!hasEditPermission}
                            className={`text-xs transition-colors
                              ${hasEditPermission
                                ? "text-red-500 hover:text-red-700"
                                : "text-gray-300 cursor-not-allowed"
                              }`}
                          >
                            강제취소
                          </button>
                        )}
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

export default AdminReservationPage;