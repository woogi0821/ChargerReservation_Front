import axios from "axios";

// react <-> springboot : json 객체(통신)
// 목적: 리액트와 벡엔드를 통신하기 위한 설정 파일

const common = axios.create({
  baseURL: "http://localhost:8080/api", // 벡엔드주소
  withCredentials: true,
  headers: {
    "Content-Type": "application/json", // 통신할 문서종류(json)
  },
});

common.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 공통 벡엔드 요청(axios) 인터셉터 (옵션)

// 공통 응답 인터셉터 (옵션) : 리액트에서 벡엔드랑 통신시 에러나면 여기서 모두 처리됩니다.
common.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401) {
      if (originalRequest.url.includes("/member/login")) {
        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
        return Promise.reject(error); // ⬅️ 여기서 끝내야 밑으로 안 내려감!
      }

      // 토큰 만료로 인한 재발급 시도
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const res = await axios.post('http://localhost:8080/api/member/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest); 
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }

    const msg = error.response?.data?.message || "오류가 발생했습니다.";
    alert("[서버 오류] : " + msg);
    return Promise.reject(error);
  }
);

// 로그인용 요청(Requset)인터셉터 추가 필요

export default common;