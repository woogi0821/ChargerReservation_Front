export interface IMember {
  // 회원 정보 (기본키 및 계정 정보)
  loginId: string;
  loginPw: string;
  name?: string;
  phone?: string;

  // 상태 및 권한
  status?: string;               // 예: 'ACTIVE', 'INACTIVE' 등
  memberGrade?: string;          // 예: 'ADMIN', 'USER' 등

  // 소셜 로그인 관련
  provider?: 'LOCAL' | 'KAKAO' | 'GOOGLE'; // String 대신 Union 타입을 쓰면 더 안전합니다.
  providerId?: string;          // 소셜 로그인이 아닐 경우 없을 수 있으므로 Optional 처리

  // 운영 관련
  penaltyCount?: number;         // Integer -> number
  suspendedUntil?: string;      // LocalDateTime은 JSON 변환 시 보통 ISO string으로 넘어옵니다.
}