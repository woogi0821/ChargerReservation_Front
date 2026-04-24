export interface NotificationResponseDto {
  notiId: number;      // 알림 고유 ID
  title: string;       // 알림 제목
  message: string;     // 알림 상세 내용
  targetUrl: string;   // 클릭 시 이동할 페이지 주소
  isRead: 'Y' | 'N';   // 읽음 여부 ('Y': 읽음, 'N': 안 읽음)
  createdAt: string;   // 알림 생성 일시 (ISO String)
  notiType: 'RESERVATION' | 'PENALTY' | 'NOSHOW' | string;
}
