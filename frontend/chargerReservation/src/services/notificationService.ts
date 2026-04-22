import api from "./api";

// 데이터 구조 정의 (백엔드 DTO와 맞춤)
export interface NotificationResponseDto {
  notiId: number;
  title: string;
  message: string;
  notiType: string;
  targetUrl: string;
  isRead: string;
  createdAt: string;
}

const NOTI_API_URL = "/notifications";

const notificationService = {
  // 1. 내 알림 목록 가져오기
  getMyNotifications: async (): Promise<NotificationResponseDto[]> => {
    const response = await api.get(NOTI_API_URL);
    return response.data;
  },

  // 2. 알림 읽음 처리하기
  readNotification: async (notiId: number): Promise<void> => {
    await api.patch(`${NOTI_API_URL}/${notiId}/read`);
  }
};

export default notificationService;