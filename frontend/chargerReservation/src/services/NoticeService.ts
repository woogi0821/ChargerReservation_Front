import axios from 'axios';

export interface NoticeResponseDto {
  noticeId: number;
  title: string;
  content: string;
  writerId: string;
  fixYn: 'Y' | 'N';
  insertTime: string;
  updateTime: string;
  formattedDate: string;
  new: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
  totalNumber?: number; // 전체 게시글 수
  page?: number;        // 전체 페이지 수
}

const API_BASE_URL = 'http://localhost:8080/api/notices';

export const noticeService = {
  getCustomerNotices: async (currentPage: number): Promise<ApiResponse<NoticeResponseDto[]>> => {
    try {
      // page 파라미터와 캐시 방지용 t 파라미터를 함께 전송
      const response = await axios.get<ApiResponse<NoticeResponseDto[]>>(
        `${API_BASE_URL}?page=${currentPage}&t=${Date.now()}`
      );
      return response.data;
    } catch (error) {
      console.error("공지사항 호출 에러:", error);
      return {
        success: false,
        message: "데이터 로드 실패",
        result: []
      };
    }
  }
};