import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import Modal from '../../components/common/Modal';
import AuthModalContainer from '../../pages/member/Auth/AuthModalContainer';
import { useEffect } from 'react';
import axios from 'axios';

/**
 * 🏗️ 웹사이트 전체 페이지의 공통 뼈대 (헤더 + 컨텐츠 + 푸터)
 */
const MainLayout = () => {

    const { loggedIn, login, logout, accessToken, activeModal, setActiveModal, closeModal } = useAuthStore();
    const location = useLocation();

    // 새로고침 시 AT가 메모리에서 사라지므로 RT 쿠키로 무음 갱신
    useEffect(() => {
        const restoreToken = async () => {
            // 이미 AT가 메모리에 있으면 스킵
            if (accessToken) return;
            // loggedIn(localStorage)이 true인데 AT가 없으면 → refresh로 복구
            if (!loggedIn) return;

            try {
                const res = await axios.post(
                    "http://localhost:8080/api/member/refresh",
                    {},
                    { withCredentials: true }
                );
                const { accessToken: newToken, memberGrade } = res.data;
                login(memberGrade, newToken);
            } catch {
                // RT도 만료된 경우 → 로그아웃 처리
                logout();
            }
        };

        restoreToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


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

export default MainLayout;