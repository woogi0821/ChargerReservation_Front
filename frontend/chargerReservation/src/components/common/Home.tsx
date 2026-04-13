// src/components/common/Home.tsx
import Modal from "./Modal";
import Button from "./Button";
import { useModal } from "../../hook/useModal";
import { sendPenaltySms } from "../../services/smsService"; // 🎯 추가

export default function Home() {
  const { isOpen, open, close } = useModal();

  const userData = {
    name: "홍길동",
    phone: "01034441086", // 실제 테스트 시 본인 번호(나중에 DB에서 가져오는 형태로 변경)
    penaltyReason: "어제 노쇼(No-Show)",
    restrictUntil: "오늘 23:59"
  };

// 🎯 문자 발송함수
  const handleConfirm = async () => {
    try {
      // 1. 서버에 데이터를 보냅니다.
      const result = await sendPenaltySms({
        receiver: userData.phone,
        userName: userData.name,
        reason: userData.penaltyReason,
        restrictUntil: userData.restrictUntil,
      });

      // 2. 성공했을 때 (서버 응답이 200 OK인 경우)
      if (result.success) {
        alert("패널티 처리가 완료되었습니다.");
        close(); // 모달 닫기
      } else {
        // 서버에서 success: false로 응답을 준 경우
        alert("처리 실패: " + result.message);
      }
    } catch (error: any) {
      // 3. 네트워크 에러나 서버에서 에러(400, 500)를 던졌을 때 잡는 곳
      // 백엔드 PenaltyService에서 throw한 메시지를 여기서 출력합니다.
      const errorMessage = error.response?.data?.message || "서버 통신 중 오류가 발생했습니다.";
      alert("에러 발생: " + errorMessage);
      console.error("Penalty Error:", error);
    }
  };

  return (
    <div className="p-10 flex flex-col items-center gap-5">
      <h1 className="text-2xl font-black text-[#0F172A]">패널티 시스템 테스트</h1>
      
      <Button size="lg" variant="danger" onClick={open}>
        이용 제한 안내 발송 테스트
      </Button>
      
      <Modal isOpen={isOpen} onClose={close} title="이용 제한 알림">
        <div className="flex flex-col gap-6 text-center">
          <p className="text-[#1E293B]">
            <span className="font-bold">{userData.name}</span>님에게 <br/>
            패널티 안내 문자를 발송하시겠습니까?
          </p>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={close}>취소</Button>
            {/* 🎯 확인 버튼 클릭 시 문자 발송 실행 */}
            <Button variant="primary" className="flex-1" onClick={handleConfirm}>발송</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
