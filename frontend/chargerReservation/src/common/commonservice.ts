import axios from "axios";

// react <-> springboot : json 객체(통신)
// 목적: 리액트와 벡엔드를 통신하기 위한 설정 파일

const common = axios.create({
  baseURL: "http://localhost:8080/api", // 벡엔드주소
  headers: {
    "Content-Type": "application/json", // 통신할 문서종류(json)
  },
});

// 공통 벡엔드 요청(axios) 인터셉터 (옵션)

// 공통 응답 인터셉터 (옵션) : 리액트에서 벡엔드랑 통신시 에러나면 여기서 모두 처리됩니다.
common.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error);
    const msg = error.response?.data?.message || "오류가 발생했습니다. 관리자에게 문의하세요";
    alert("[서버 오류] : " + msg);

    return Promise.reject(error);
  }
);
// 로그인용 요청(Requset)인터셉터 추가 필요

export default common;