// 목적: 공유 저장소 플로그인 용도로 사용하는 인터페이스
// 내용: 1) 로그인 유무변수  2) 로그인함수(true)  3) 로그아웃함수(false)
export interface IAuthState {
    loggedIn: boolean|null;
    memberGrade: string | null;

    login: (grade: string)=> void;
    logout: ()=> void;
}