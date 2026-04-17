import axios from "axios";
import type { SmsRequest, SmsResponse } from "../types/sms";

// 🎯 백엔드 서버 주소 (나중에 실제 IP로 변경)
const API_URL = "http://localhost:8080/api/sms";

export const sendPenaltySms = async (data: SmsRequest): Promise<SmsResponse> => {
    // 외부와 대화하는 창구
  try {
    const response = await axios.post(`${API_URL}/send-penalty`, data);
    return response.data;
  } catch (error) {
    console.error("SMS 전송 중 오류 발생:", error);
    return {
      success: false,
      message: "서버 통신 실패"
    };
  }
};