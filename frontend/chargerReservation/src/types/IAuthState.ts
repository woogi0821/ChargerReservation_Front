// 목적: 공유 저장소 플로그인 용도로 사용하는 인터페이스
// 내용: 1) 로그인 유무변수  2) 로그인함수(true)  3) 로그아웃함수(false)
export interface IAuthState {
    loggedIn: boolean|null;
    memberGrade: string | null;
    activeModal: string;
    // AT는 메모리에만 저장 (XSS 방지 — localStorage 사용 금지)
    accessToken: string | null;
    // ✅ 추가 — 토스트 메시지
    toastMessage: string | null;
    login: (grade: string, token: string) => void;
    logout: ()=> void;
    setAccessToken: (token: string | null) => void;
    setActiveModal: (state: any) => void;
    closeModal: () => void;
    // ✅ 추가
    setToastMessage: (msg: string | null) => void;
}