// 목적: 로그인 백엔드 컨트롤러와 통신할 함수 작성

import common from "../common/commonservice";
import type { IMember } from "../types/IMember";

// 백엔드 TokenDto와 일치하는 인터페이스 (없다면 types에 추가 권장)
export interface IToken {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  name: string;
  memberGrade: string;
}

// 1. 로그인 함수(post 사용(보안))
const login = (data:IMember) => { 
  return common.post<IToken>("/member/login", data);
}


// 2. 로그아웃 함수
// const logout = () => { 
//   return common.post("/auth/logout");
// }

// 3. 회원가입 함수(post)
// const register = (data:IAuth) => { 
//   return common.post("/auth/register", data);
// }

// 4. 기타) 새로고침 대응(내가 로그인 했는지 백엔드에 물어보는 함수)
const me = () => { 
  return common.get("/me");
}


const AuthService = { login, me };

export default AuthService;