export interface IMember {
  // 회원 정보 (기본키 및 계정 정보)
  loginId: string;
  loginPw: string;
  email?: string;
  name?: string;
  phone?: string;
  status?: string;
  memberGrade?: string;
  provider?: 'LOCAL' | 'KAKAO' | 'GOOGLE';
  providerId?: string;
  penaltyCount?: number;
  suspendedUntil?: string;
}