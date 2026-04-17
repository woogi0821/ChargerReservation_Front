import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// ── JWT 디코더 (라이브러리 없이 브라우저 네이티브로 처리) ─────────────────────
const decodeJwt = (token: string): Record<string, unknown> => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

// ── Axios 인스턴스 ─────────────────────────────────────────────────────────────
const common = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // RT 쿠키 자동 전송
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 요청 인터셉터 ──────────────────────────────────────────────────────────────
// AT를 메모리(Zustand)에서 꺼내서 Authorization + X-MemberId 헤더에 자동 주입
common.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    // JWT 클레임에서 memberId 추출 → X-MemberId 헤더로 주입
    const decoded = decodeJwt(token);
    const memberId = decoded.memberId;
    if (memberId !== undefined) {
      config.headers["X-MemberId"] = String(memberId);
    }
  }

  return config;
});

// ── 응답 인터셉터 ──────────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// AT 갱신 완료 후 대기 중이던 요청들을 재실행
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

common.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인 자체 실패는 별도 처리
    if (originalRequest?.url?.includes("/member/login")) {
      return Promise.reject(error);
    }

    // 401: AT 만료 → refresh 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 이미 refresh 중이면 완료될 때까지 대기
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(common(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // RT는 httpOnly 쿠키로 자동 전송 — body 불필요
        const res = await axios.post(
          "http://localhost:8080/api/member/refresh",
          {},
          { withCredentials: true }
        );

        const { accessToken, memberGrade } = res.data;
        useAuthStore.getState().login(memberGrade, accessToken);

        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        const decoded = decodeJwt(accessToken);
        if (decoded.memberId !== undefined) {
          originalRequest.headers["X-MemberId"] = String(decoded.memberId);
        }

        return common(originalRequest);
      } catch {
        // refresh 실패 → 로그아웃
        useAuthStore.getState().logout();
        window.location.href = "/";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    const msg = error.response?.data?.message || "오류가 발생했습니다.";
    alert("[서버 오류] : " + msg);
    return Promise.reject(error);
  }
);

export default common;
