import common from "../common/commonservice";
import type { IAuth } from "../types/IAuth";
import type { IMember } from "../types/IMember";

export interface IToken {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  name: string;
  memberGrade: string;
  memberId: number | null;
  adminId: number | null;
  adminRole: string | null;
  adminPart: string | null;
}

// 로그인 함수
const login = (data: IMember) => {
  return common.post<IToken>("/member/login", data);
}

// 로그아웃 함수
const logout = () => {
  return common.post("/member/logout");
}

// 회원가입 함수
const register = (data: IAuth) => {
  return common.post("/member/join", data);
}

const AuthService = { login, logout, register };

export default AuthService;