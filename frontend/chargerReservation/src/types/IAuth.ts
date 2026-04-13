// 목적: IAuth(회원객체, Member) 인터페이스 작성 파일
export interface IAuth {
  memberId?: number;
  loginId: string;
  loginPw?: string;
  email: string;
  name: string;
  phone?: string;
  status: string;
  memberGrade: string;
}
