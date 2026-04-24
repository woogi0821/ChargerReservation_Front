import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { useAuthStore } from "../../store/useAuthStore";

interface Penalty {
  penaltyId: number;
  memberId: string;
  reservationId: number;
  carNumber: string;
  reason: string;
  nudgeCount: number;
  status: string;
  notiSentYn: string;
  insertTime: string;
}

const penaltyStatusStyles: { [key: string]: { label: string; badge: string } } = {
  ACTIVE:   { label: "적용중", badge: "bg-red-50 text-red-600"    },
  CLEARED:  { label: "만료",   badge: "bg-gray-100 text-gray-400" },
  CANCELED: { label: "취소됨", badge: "bg-blue-50 text-blue-600"  },
};

const canEditPenalty = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "PENALTY";
};

const PAGE_SIZE = 10;

const AdminPenaltyPage = () => {
  const { setToastMessage } = useAuthStore();

  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  // ✅ 추가 — 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);

  const hasEditPermission = canEditPenalty();

  const fetchPenalties = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/api/admin/penalties", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setPenalties(data);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  // ✅ 정렬 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder]);

  const onCancelPenalty = async (penaltyId: number) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 패널티를 취소하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/penalties/${penaltyId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      fetchPenalties();
      setToastMessage("패널티가 취소되었습니다");
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  // ✅ 추가 — 패널티 삭제
  const onDeletePenalty = async (penaltyId: number) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 삭제하시겠습니까? 삭제 후 복구가 불가능합니다.")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/penalties/${penaltyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      fetchPenalties();
      setToastMessage("패널티가 삭제되었습니다");
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  // 정렬 적용
  const sortedPenalties = [...penalties].sort((a, b) => {
    const timeA = new Date(a.insertTime).getTime();
    const timeB = new Date(b.insertTime).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  // ✅ 페이지네이션 계산
  const totalPages = Math.ceil(sortedPenalties.length / PAGE_SIZE);
  const pagedPenalties = sortedPenalties.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <AdminLayout>

      <AdminPageHeader title="패널티 관리" />

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">패널티 목록</h2>
            <span className="text-xs text-gray-400">총 {sortedPenalties.length}건</span>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">회원 ID</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">차량번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">사유</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">독촉횟수</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">등록일</th>
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
              ) : pagedPenalties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-300">
                    패널티 내역이 없습니다
                  </td>
                </tr>
              ) : (
                pagedPenalties.map((penalty) => {
                  const style = penaltyStatusStyles[penalty.status]
                    ?? { label: penalty.status, badge: "bg-gray-100 text-gray-500" };
                  return (
                    <tr key={penalty.penaltyId} className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors">
                      <td className="px-5 py-3 text-gray-400">{penalty.penaltyId}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{penalty.memberId}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.carNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.reason}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.nudgeCount}회</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {penalty.insertTime?.slice(0, 10)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {/* 취소 — ACTIVE 만 */}
                          {penalty.status === "ACTIVE" && (
                            <button
                              onClick={() => onCancelPenalty(penalty.penaltyId)}
                              disabled={!hasEditPermission}
                              className={`text-xs transition-colors
                                ${hasEditPermission
                                  ? "text-orange-500 hover:text-orange-700"
                                  : "text-gray-300 cursor-not-allowed"
                                }`}
                            >
                              취소
                            </button>
                          )}
                          {/* ✅ 추가 — 삭제 (CANCELED / CLEARED 만) */}
                          {(penalty.status === "CANCELED" || penalty.status === "CLEARED") && (
                            <button
                              onClick={() => onDeletePenalty(penalty.penaltyId)}
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

export default AdminPenaltyPage;