// src/types/sms.ts
export interface SmsRequest {
  receiver: string;  // 받는 사람 전화번호 (예: 01012345678)
  userName: string;  // 사용자 이름
  reason: string;    // 제한 사유 (예: 어제 노쇼)
  restrictUntil: string; // 제한 시간 (예: 오늘 23:59)
}

export interface SmsResponse {
  success: boolean;
  message: String;
  groupId?: string; // 솔라피에서 주는 그룹 ID (성공 확인용)
}