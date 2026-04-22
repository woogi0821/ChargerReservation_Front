import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import Modal from '../common/Modal'; 
import AuthModalContainer from '../../pages/member/Auth/AuthModalContainer';

const GNB = () => {
  const { loggedIn, logout, activeModal, setActiveModal, closeModal } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    try {
      await AuthService.logout();
    } finally {
      logout();
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // 데스크탑 메뉴 스타일
  const menuBtnClass = (path: string) => `
    relative flex flex-col items-center justify-center gap-1 w-full h-[72px]
    transition-all duration-200 group
    ${isActive(path)
      ? 'text-blue-600'
      : 'text-zinc-500 hover:text-blue-500'
    }
  `;

  // 모바일 하단 바 아이템 스타일
  const mobileTabClass = (path: string) => `
    flex flex-col items-center justify-center gap-1 flex-1 h-full
    transition-all duration-200
    ${isActive(path) ? 'text-blue-600' : 'text-zinc-400'}
  `;

  return (
    <>
      {/* --- 1. 데스크탑 사이드바 (기존 유지) --- */}
      <aside className="hidden md:flex w-[80px] h-full
        bg-white/80 backdrop-blur-xl border-r border-zinc-200/60
        shadow-[2px_0_20px_rgba(0,0,0,0.04)]
        flex-col items-center py-6 shrink-0 z-[60]">

        <a href="/" className="mb-8 flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
            <span className="text-white text-lg">⚡</span>
          </div>
          <span className="text-[10px] font-extrabold text-blue-600">Charge</span>
        </a>

        <nav className="flex flex-col w-full border-t pt-2">
          <a href="/" className={menuBtnClass('/')}>🏠<span className="text-[11px]">홈</span></a>
          <a href="/stations" className={menuBtnClass('/stations')}>📍<span className="text-[11px]">충전소</span></a>
          <a href="/notices" className={menuBtnClass('/notices')}>📣<span className="text-[11px]">공지</span></a>
          <a href="/support" className={menuBtnClass('/support')}>🎧<span className="text-[11px]">상담</span></a>
        </nav>

        <div className="mt-auto flex flex-col w-full items-center pt-3">
          {loggedIn ? (
            <>
              <a href="/mypage" className={menuBtnClass('/mypage')}>👤<span className="text-[11px]">MY</span></a>
              <button onClick={handleLogout} className="w-full h-[60px] text-zinc-400 hover:text-red-500">
                ⎋<span className="text-[10px]">로그아웃</span>
              </button>
            </>
          ) : (
            <button onClick={() => setActiveModal("LOGIN")} className="w-full h-[80px] text-zinc-500 hover:text-blue-600">
              🔑<span className="text-[11px]">로그인</span>
            </button>
          )}
        </div>
      </aside>

      {/* --- 2. 모바일 하단 탭 바 (추가됨) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[65px] bg-white/90 backdrop-blur-lg border-t border-zinc-100 flex items-center justify-around z-[100] pb-safe">
        <a href="/" className={mobileTabClass('/')}>
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">홈</span>
        </a>
        <a href="/stations" className={mobileTabClass('/stations')}>
          <span className="text-xl">📍</span>
          <span className="text-[10px] font-medium">충전소</span>
        </a>
        <a href="/notices" className={mobileTabClass('/notices')}>
          <span className="text-xl">📣</span>
          <span className="text-[10px] font-medium">공지</span>
        </a>
        {loggedIn ? (
          <a href="/mypage" className={mobileTabClass('/mypage')}>
            <span className="text-xl">👤</span>
            <span className="text-[10px] font-medium">MY</span>
          </a>
        ) : (
          <button onClick={() => setActiveModal("LOGIN")} className={mobileTabClass('')}>
            <span className="text-xl">🔑</span>
            <span className="text-[10px] font-medium">로그인</span>
          </button>
        )}
      </nav>

      {/* --- 3. 공통 모달 (기존 유지) --- */}
      <Modal isOpen={activeModal !== "NONE"} onClose={closeModal} title="">
        <AuthModalContainer 
          activeModal={activeModal as any} 
          setActiveModal={setActiveModal} 
          handleCloseModal={closeModal} 
        />
      </Modal>
    </>
  );
};

export default GNB;