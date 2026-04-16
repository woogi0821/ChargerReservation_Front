import axios from "axios";

// ✅ 스프링 부트 서버와의 통신을 위한 기본 설정
const api = axios.create({
  baseURL: "http://localhost:8080/api", // 스프링 부트 서버 주소 (포트 확인!)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;