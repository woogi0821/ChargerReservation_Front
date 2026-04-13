import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/stations';

export const stationService = {
  /**
   * 1. 주변 충전소 목록 (사이드바용 - 페이징 처리)
   */
  getStationsAround: async (lat: number, lng: number, pageNum: number = 0) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/around`, {
        params: { lat, lng, page: pageNum }
      });
      return response.data; 
    } catch (error) {
      console.error("사이드바 목록 로드 실패:", error);
      return [];
    }
  },

  /**
   * 2. 지도 마커 전용 데이터
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
  },

/**
 * 3. 특정 충전소 상세 정보 (@GetMapping("/{statId}"))
 */
getStationDetail: async (statId: string, type: string = "급속", userLat?: number, userLng?: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${statId}`, {
      params: { 
        type, 
        userLat, 
        userLng 
      }
    });
    return response.data; // 백엔드에서 생성한 StationDto 반환
  } catch (error) {
    console.error("상세 정보 로드 실패:", error);
    return null;
  }
}
};