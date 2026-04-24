import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { useAuthStore } from "../../store/useAuthStore";

interface Reservation {
  reservationId: number;
  memberId: number;
  chargerId: string;
  carNumber: string;
  startTime: string;
  endTime: string;
  actualEndTime: string | null;
  status: string;
}

interface FilterTab {
  value: string;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { value: "all",       label: "전체"   },
  { value: "RESERVED",  label: "예정"   },
  { value: "CHARGING",  label: "진행중" },
  { value: "COMPLETED", label: "완료"   },
  { value: "CANCELED",  label: "취소"   },
  { value: "NO_SHOW",   label: "노쇼"   },
];

const reservationStatusStyles: { [key: string]: { label: string; badge: string } } = {
  RESERVED:  { label: "예정",   badge: "bg-blue-50 text-blue-600"     },
  CHARGING:  { label: "진행중", badge: "bg-green-50 text-green-600"   },
  COMPLETED: { label: "완료",   badge: "bg-gray-100 text-gray-500"    },
  CANCELED:  { label: "취소",   badge: "bg-red-50 text-red-500"       },
  NO_SHOW:   { label: "노쇼",   badge: "bg-orange-50 text-orange-600" },
};

const canEditReservation = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "RESERVATION" || adminPart === "ALL";
};

const PAGE_SIZE = 10;

const AdminReservationPage = () => {
  const { setToastMessage } = useAuthStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  // ✅ 추가 — 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);

  const hasEditPermission = canEditReservation();

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/api/admin/reservations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
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

  // ✅ 필터 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortOrder]);

  const onForceCancel = async (reservationId: number) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 강제 취소하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
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
      if (!response.ok) return;
      fetchReservations();
      setToastMessage("예약이 강제취소 되었습니다");
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  // ✅ 추가 — 예약 삭제
  const onDeleteReservation = async (reservationId: number) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 삭제하시겠습니까? 삭제 후 복구가 불가능합니다.")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/reservations/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      fetchReservations();
      setToastMessage("예약이 삭제되었습니다");
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  // 필터 + 정렬 적용
  const filteredReservations = (
    activeFilter === "all"
      ? reservations
      : reservations.filter((r) => r.status === activeFilter)
  ).sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  // ✅ 페이지네이션 계산
  const totalPages = Math.ceil(filteredReservations.length / PAGE_SIZE);
  const pagedReservations = filteredReservations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <AdminLayout>

      <AdminPageHeader title="예약 관리" />

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">예약 목록</h2>
            <span className="text-xs text-gray-400">총 {filteredReservations.length}건</span>
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="text-xs text-gray-500 border-b border-gray-300 focus:border-blue-700 outline-none bg-transparent py-2 pr-1 cursor-pointer transition-colors"
          >
            <option value="desc">최신순</option>
            <option value="asc">오래된순</option>
          </select>
        </div>

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
              ) : pagedReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-300">
                    해당 상태의 예약이 없습니다
                  </td>
                </tr>
              ) : (
                pagedReservations.map((reservation) => {
                  const style = reservationStatusStyles[reservation.status]
                    ?? { label: reservation.status, badge: "bg-gray-100 text-gray-500" };
                  return (
                    <tr key={reservation.reservationId} className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors">
                      <td className="px-5 py-3 text-gray-400">{reservation.reservationId}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{reservation.memberId}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.chargerId}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.carNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.startTime?.slice(0, 10)}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.endTime?.slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {/* 강제취소 — RESERVED / CHARGING 만 */}
                          {(reservation.status === "RESERVED" || reservation.status === "CHARGING") && (
                            <button
                              onClick={() => onForceCancel(reservation.reservationId)}
                              disabled={!hasEditPermission}
                              className={`text-xs transition-colors
                                ${hasEditPermission
                                  ? "text-orange-500 hover:text-orange-700"
                                  : "text-gray-300 cursor-not-allowed"
                                }`}
                            >
                              강제취소
                            </button>
                          )}
                          {/* ✅ 추가 — 삭제 (CANCELED / NO_SHOW / COMPLETED 만) */}
                          {(reservation.status === "CANCELED" || reservation.status === "NO_SHOW" || reservation.status === "COMPLETED") && (
                            <button
                              onClick={() => onDeleteReservation(reservation.reservationId)}
                              disabled={!hasEditPermission}
                              className={`text-xs transition-colors
                                ${hasEditPermission
                                  ? "text-red-500 hover:text-red-700"
                                  : "text-gray-300 cursor-not-allowed"
                                }`}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ 추가 — 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-5 py-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors
                  ${currentPage === page
                    ? "bg-blue-700 text-white"
                    : "text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </div>

    </AdminLayout>
  );
};

export default AdminReservationPage;