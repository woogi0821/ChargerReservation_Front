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
    } catch (error) {
      console.error("Logout API 에러:", error);
    } finally {
      logout();
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const menuBtnClass = (path: string) => `
    relative flex flex-col items-center justify-center gap-1 w-full h-[72px]
    transition-all duration-200 group
    ${isActive(path)
      ? 'text-blue-600'
      : 'text-zinc-500 hover:text-blue-500'
    }
  `;

  return (
    <>
      <aside className="w-[80px] h-full
        bg-white/80 backdrop-blur-xl border-r border-zinc-200/60
        shadow-[2px_0_20px_rgba(0,0,0,0.04)]
        flex flex-col items-center py-6 shrink-0 z-[60]">

        {/* Logo */}
        <a href="/" className="mb-8 flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <span className="text-white text-lg">⚡</span>
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 tracking-tight">
            Charge
          </span>
        </a>

        {/* Nav */}
        <nav className="flex flex-col w-full border-t border-zinc-100 pt-2">
          {/* 홈 */}
          <a href="/" className={menuBtnClass('/')}>
            {/* ✅ 파란색 왼쪽 막대 삭제됨 */}
            <span className="text-xl group-hover:scale-110 transition">🏠</span>
            <span className="text-[11px] font-medium">홈</span>
          </a>

          {/* 충전소 찾기 */}
          <a href="/stations" className={menuBtnClass('/stations')}>
            {/* ✅ 파란색 왼쪽 막대 삭제됨 */}
            <span className="text-xl group-hover:scale-110 transition">📍</span>
            <span className="text-[11px] font-medium">충전소</span>
          </a>

          {/* 고객센터 */}
          <a href="/support" className={menuBtnClass('/support')}>
            {/* ✅ 파란색 왼쪽 막대 삭제됨 */}
            <span className="text-xl group-hover:scale-110 transition">🎧</span>
            <span className="text-[11px] font-medium">고객센터</span>
          </a>
        </nav>

        {/* Bottom */}
        <div className="mt-auto flex flex-col w-full items-center border-t border-zinc-100 pt-3">
          {loggedIn ? (
            <>
              <a href="/mypage" className={menuBtnClass('/mypage')}>
                {/* ✅ 파란색 왼쪽 막대 삭제됨 */}
                <span className="text-xl group-hover:scale-110 transition">👤</span>
                <span className="text-[11px] font-medium">MY</span>
              </a>

              <button
                onClick={handleLogout}
                className="w-full h-[60px] flex flex-col items-center justify-center
                text-zinc-400 hover:text-red-500 transition-all group"
              >
                <span className="text-lg group-hover:scale-110 transition">⎋</span>
                <span className="text-[10px]">로그아웃</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveModal("LOGIN")}
              className="w-full h-[80px] flex flex-col items-center justify-center gap-1
              text-zinc-500 hover:text-blue-600 hover:bg-blue-50/60
              transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
                <span className="text-lg">🔑</span>
              </div>
              <span className="text-[11px] font-medium">로그인</span>
            </button>
          )}
        </div>
      </aside>

      {/* Auth Modal */}
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