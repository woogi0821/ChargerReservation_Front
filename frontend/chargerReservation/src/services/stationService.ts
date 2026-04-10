import axios from 'axios';

// 1. 여기서 변수를 선언해야 아래 함수들이 가져다 쓸 수 있습니다.
const API_BASE_URL = 'http://localhost:8080/api/stations';

export const stationService = {
  /**
   * 1. 주변 충전소 상세 정보 가져오기 (사이드바 목록용 - 20개씩)
   * 인수를 3개(lat, lng, pageNum) 받도록 확실히 정의했습니다.
   */
  getStationsAround: async (lat: number, lng: number, pageNum: number = 0) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/around`, {
        params: { 
          lat, 
          lng, 
          page: pageNum // 자바 백엔드의 @RequestParam("page")와 연결
        }
      });
      return response.data; 
    } catch (error) {
      console.error("사이드바 목록 로드 실패:", error);
      return [];
    }
  },

  /**
   * 2. 지도 마커 전용 데이터 가져오기 (지도용 - 100개)
   */
  getMarkersOnly: async (lat: number, lng: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/markers`, {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error("지도 마커 로드 실패:", error);
      return [];
    }
  }
};
  /**
   * 3. 특정 충전소 상세 정보 (@GetMapping("/{statId}"))
   * 리스트에서 클릭했을 때 더 자세한 정보를 가져올 때 사용
   */
  getStationDetail: async (statId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${statId}`);
      return response.data;
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
      return null;
    }
  };