import axios from "axios";

// ✅ 스프링 부트 서버와의 통신을 위한 기본 설정
const api = axios.create({
  baseURL: "http://localhost:8080/api", // 스프링 부트 서버 주소 (포트 확인!)
  headers: {
    "Content-Type": "application/json",
  },
});
// ✅ 추가: 모든 API 요청 전에 실행되는 인터셉터
api.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰을 가져옵니다 (저장된 키 이름이 "accessToken"인지 확인하세요!)
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      // 서버가 인식할 수 있게 'Bearer '를 붙여서 헤더에 주입
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;