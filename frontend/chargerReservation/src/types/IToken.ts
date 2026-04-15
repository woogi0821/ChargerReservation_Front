// 목적: 로그인 응답 토큰 인터페이스
export interface IToken {
    grantType: string;
    accessToken: string;
    refreshToken: string;
    memberId: number | null;
    memberGrade: string;
    adminId: number | null;
    adminRole: string | null;
    adminPart: string | null;
}