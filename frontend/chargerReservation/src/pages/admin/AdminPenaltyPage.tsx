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

const AdminPenaltyPage = () => {
  const { setToastMessage } = useAuthStore(); // ✅ 추가

  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      // ✅ 추가
      setToastMessage("패널티가 취소되었습니다");
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  return (
    <AdminLayout>

      <AdminPageHeader title="패널티 관리" />

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-1 h-4 bg-blue-700" />
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide">패널티 목록</h2>
          <span className="text-xs text-gray-400">총 {penalties.length}건</span>
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
              ) : penalties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-300">
                    패널티 내역이 없습니다
                  </td>
                </tr>
              ) : (
                penalties.map((penalty) => {
                  const style = penaltyStatusStyles[penalty.status]
                    ?? { label: penalty.status, badge: "bg-gray-100 text-gray-500" };
                  return (
                    <tr key={penalty.penaltyId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{penalty.penaltyId}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{penalty.memberId}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.carNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.reason}</td>
                      <td className="px-5 py-3 text-gray-600">{penalty.nudgeCount}회</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {penalty.insertTime?.slice(0, 10)}
                      </td>
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