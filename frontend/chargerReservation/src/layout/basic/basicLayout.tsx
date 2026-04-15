import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import Modal from '../../components/common/Modal';
import AuthModalContainer from '../../pages/member/Auth/AuthModalContainer';
import { useEffect } from 'react';

/**
 * 🏗️ 웹사이트 전체 페이지의 공통 뼈대 (헤더 + 컨텐츠 + 푸터)
 */
const BasicLayout = () => {
    
    const { loggedIn, login, logout, activeModal, setActiveModal, closeModal } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const recoverAuth = async () => {
            // URL에 토큰 정보가 있는지 먼저 확인 (소셜 로그인용)
            const params = new URLSearchParams(location.search);
            const tokenFromUrl = params.get("accessToken");
            const gradeFromUrl = params.get("memberGrade") || params.get("role") || "N";

            // 소셜 로그인 성공시
            if (tokenFromUrl && !loggedIn) {
                localStorage.setItem("accessToken", tokenFromUrl);
                login(gradeFromUrl);

                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 10); 
                return;
            }


            // 기존 세션 복구 로직
            const hasAccessToken = localStorage.getItem("accessToken"); 
            if (loggedIn && !hasAccessToken) {
                try {
                    // 2. 여기서 Silent Refresh API를 호출합니다.
                    // const response = await AuthService.refresh(); 
                    // const { accessToken, memberGrade } = response.data;
                    
                    // 3. 성공 시 다시 로그인 처리 (메모리 보충)
                    // login(memberGrade); 
                    // localStorage.setItem("accessToken", accessToken);
                } catch (error) {
                    console.error("세션 복구 실패:", error);
                    logout();
                }
            }
        };

        recoverAuth();
    }, [location.search, loggedIn, login, navigate]);


    return (
        <div className="w-full min-h-screen flex flex-col">
            {/* 1. 상단 공통 헤더 */}
            <Modal
                isOpen={activeModal !== "NONE"}
                onClose={closeModal}
                title=""
            >
                <AuthModalContainer
                activeModal={activeModal as any}
                setActiveModal={setActiveModal}
                handleCloseModal={closeModal}
                />
            </Modal>
            
            {/* 1. 상단 공통 헤더 */}
            <Header />

            {/* 2. 가변 컨텐츠 영역 (URL에 따라 바뀌는 페이지가 여기에 렌더링됨) */}
            <main className="flex-1 w-full pt-[80px]" >
                <Outlet /> 
            </main>

            {/* 3. 하단 공통 푸터 */}
            <footer style={{ padding: '20px', borderTop: '1px solid #ccc', textAlign: 'center' }}>
                <p>© 2026 EV-Charger Reservation Project Team</p>
            </footer>
        </div>
    );
};

export default BasicLayout;