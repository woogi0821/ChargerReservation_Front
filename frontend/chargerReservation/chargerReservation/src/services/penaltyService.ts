import api from "./api";

// 패널티 부여 데이터 타입 정의
interface PenaltyRequest {
  reservationId: number;
  reason: string;
}

// ✅ 관리자가 수동으로 패널티를 부여하고 문자를 보내는 함수
export const sendManualPenalty = async (data: PenaltyRequest) => {
  try {
    // 백엔드 SmsController의 @PostMapping("/send-penalty") 호출
    const response = await api.post("/sms/send-penalty", data);
    return response.data; // { success: true, message: "..." }
  } catch (error: any) {
    // 백엔드에서 throw한 에러 메시지를 그대로 전달
    throw error.response?.data || { message: "통신 중 오류가 발생했습니다." };
  }
};

// ✅ 마이페이지용: 특정 회원의 패널티 내역 조회
export const getMyPenaltyHistory = async (memberId: string) => {
  const response = await api.get(`/penalties/member/${memberId}`);
  return response.data;
};