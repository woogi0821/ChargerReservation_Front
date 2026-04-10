import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface Penalty {
  penaltyId: number;
  memberId: string;
  reservationId: number;
  carNumber: string;
  reason: string;
  nudgeCount: number;
  status: "ACTIVE" | "CLEARED" | "CANCELED";
  notiSentYn: string;
  insertTime: string;
}

// ─────────────────────────────────────────────
// 상태별 스타일 딕셔너리
// ─────────────────────────────────────────────

const penaltyStatusStyles: {
  [key in "ACTIVE" | "CLEARED" | "CANCELED"]: {
    label: string;
    badge: string;
  };
} = {
  ACTIVE:   { label: "적용중", badge: "bg-red-50 text-red-600"    },
  CLEARED:  { label: "만료",   badge: "bg-gray-100 text-gray-400" },
  CANCELED: { label: "취소됨", badge: "bg-blue-50 text-blue-600"  },
};

// ─────────────────────────────────────────────
// 권한 체크
// SUPER 또는 INQUIRY 파트만 취소 가능
// ─────────────────────────────────────────────

const canEditPenalty = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "INQUIRY";
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminPenaltyPage = () => {

  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 수정 권한 여부
  const hasEditPermission = canEditPenalty();

  // ── 패널티 목록 조회 ───────────────────────

  const fetchPenalties = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:8080/api/admin/penalties", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("패널티 목록 조회 실패");
        return;
      }

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

  // ── 패널티 취소 처리 ───────────────────────

  const onCancelPenalty = async (penaltyId: number) => {
    if (!window.confirm("정말 패널티를 취소하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("adminToken");
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

      if (!response.ok) {
        console.error("패널티 취소 실패");
        return;
      }

      // 취소 성공 시 목록 새로고침
      fetchPenalties();
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  return (
    <AdminLayout adminName="홍길동">

      <AdminPageHeader title="패널티 관리" />

      <div className="bg-white border border-gray-100 shadow-sm">

        {/* 섹션 헤더 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-1 h-4 bg-blue-700" />
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
            패널티 목록
          </h2>
          <span className="text-xs text-gray-400">
            총 {penalties.length}건
          </span>
        </div>

        {/* 패널티 테이블 */}
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
              ) : penalties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-300">
                    패널티 내역이 없습니다
                  </td>
                </tr>
              ) : (
                penalties.map((penalty) => {
                  const style = penaltyStatusStyles[penalty.status];
                  return (
                    <tr
                      key={penalty.penaltyId}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-400">{penalty.penaltyId}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{penalty.memberId}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.carNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.reason}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.nudgeCount}회</td>

                      {/* 상태 뱃지 */}
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-gray-500">
                        {penalty.insertTime?.slice(0, 10)}
                      </td>

                      {/* 취소 버튼 — ACTIVE 상태일 때만 표시 / 권한 없으면 비활성화 */}
                      <td className="px-5 py-3">
                        {penalty.status === "ACTIVE" && (
                          <button
                            onClick={() => onCancelPenalty(penalty.penaltyId)}
                            disabled={!hasEditPermission}
                            className={`text-xs transition-colors
                              ${hasEditPermission
                                ? "text-red-500 hover:text-red-700"
                                : "text-gray-300 cursor-not-allowed"
                              }`}
                          >
                            취소
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

export default AdminPenaltyPage;