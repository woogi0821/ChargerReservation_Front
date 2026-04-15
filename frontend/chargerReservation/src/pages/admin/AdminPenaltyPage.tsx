import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminLayout } from "../../components/admin/AdminLayout";
// ✅ 팀원들의 컴포넌트 import
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

const AdminPenaltyPage = () => {
  const [reservations, setReservations] = useState<any[]>([]);

  // 🎯 핵심: 선택된 예약 정보를 담을 상태 (State)
  const [selectedRes, setSelectedRes] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 데이터 로드 (2단계 내용)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/reservations/admin/all");
      setReservations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. 패널티 버튼 클릭 핸들러
  const handlePenaltyClick = (res: any) => {
    setSelectedRes(res); // 어떤 예약을 선택했는지 기억!
    setIsModalOpen(true); // 모달 열기
  };
  // 4단계: 실제 패널티 처리 API 호출
  const handleConfirmPenalty = async () => {
    if (!selectedRes) return;

    try {
      // 1단계에서 만든 서비스 함수 호출
      const response = await api.post("/sms/send-penalty", {
        reservationId: selectedRes.id,
        reason: "충전소 장기 점유로 인한 패널티 부여",
      });

      if (response.data.success) {
        alert("✅ 패널티 처리가 완료되었습니다.");

        // 2. 모달 닫기
        setIsModalOpen(false);

        // 3. 목록 새로고침 (상태가 바뀌었으니 화면을 다시 그림)
        fetchData();
      }
    } catch (error: any) {
      console.error("발송 에러:", error);
      alert("❌ 실패: " + (error.response?.data?.message || "서버 오류 발생"));
    }
  };

 return (
  <AdminLayout adminName="홍길동">
    <AdminPageHeader title="패널티 관리" />
    
    <div className="bg-white border border-gray-100 shadow-sm">
      {/* ✅ 1. 테이블 태그를 반드시 넣어줘야 합니다! */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">예약 ID</th>
            <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">사용자명</th>
            <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {/* ✅ 2. 맵핑된 내용은 <tbody> 안에 들어가야 합니다 */}
          {reservations.map((res) => (
            <tr key={res.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3">{res.id}</td>
              <td className="px-5 py-3">{res.memberName}</td>
              <td className="px-5 py-3">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={res.isAlertSent === "Y"}
                  onClick={() => handlePenaltyClick(res)}
                >
                  {res.isAlertSent === "Y" ? "발송 완료" : "패널티 발송"}
                </Button>
              </td>
            </tr>
          ))}
          
          {/* 만약 데이터가 없을 때의 처리 (팀원 코드 응용) */}
          {reservations.length === 0 && (
            <tr>
              <td colSpan={3} className="px-5 py-10 text-center text-gray-300">
                패널티 대상 예약이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
      {/* =====================================================
          STEP 3 핵심: 통제권 부여 모달
          ===================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="패널티 문자 발송 확인"
      >
        <div className="flex flex-col gap-4">
          {selectedRes && (
            <div className="bg-blue-50 p-4 rounded-xl text-sm">
              <p>
                <strong>대상자:</strong> {selectedRes.memberName} 님
              </p>
              <p>
                <strong>예약번호:</strong> {selectedRes.id}
              </p>
              <p className="text-red-600 mt-2 font-bold">
                ⚠️ 확인을 누르면 사용자에게 패널티 안내 문자가 즉시 발송됩니다.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleConfirmPenalty}
            >
              문자 발송 확정
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminPenaltyPage;
