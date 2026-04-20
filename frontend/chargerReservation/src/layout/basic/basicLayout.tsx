import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import Modal from '../../components/common/Modal';
import AuthModalContainer from '../../pages/member/Auth/AuthModalContainer';
import { Toast } from '../../components/common/Toast';
import { useEffect } from 'react';
import axios from 'axios';

const MainLayout = () => {
    const { loggedIn, login, logout, accessToken, activeModal, setActiveModal, closeModal, toastMessage, setToastMessage } = useAuthStore();
    const location = useLocation();

    const isStationsPage = location.pathname === "/stations";

    // ✅ 추가 — 토스트 3초 후 자동 제거
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        const restoreToken = async () => {
            if (accessToken) return;
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
                logout();
            }
        };

        restoreToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="w-full min-h-screen flex flex-col">
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

            {!isStationsPage && <Header />}

            <main className={`flex-1 w-full ${isStationsPage ? "" : "pt-[80px]"}`}>
                <Outlet />
            </main>

            {/* ✅ 추가 — 토스트 메시지 */}
            <Toast
                variant="success"
                position="bottom-center"
                isVisible={!!toastMessage}
                onClose={() => setToastMessage(null)}
            >
                {toastMessage ?? ""}
            </Toast>
        </div>
    );
};

export default MainLayout;