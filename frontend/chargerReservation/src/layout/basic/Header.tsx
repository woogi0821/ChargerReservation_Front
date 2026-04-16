import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const Header = () => {
  const { loggedIn, setActiveModal } = useAuthStore();
  const { handleLogout } = useLogout();
  const navigate = useNavigate();

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[80px] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

        {/* 로고 */}
        <button
          onClick={() => navigate('/')}
          className="text-xl font-black text-[#3B82F6] tracking-tight hover:opacity-80 transition-opacity"
        >
          ⚡ CHAEVI
        </button>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate('/stations')}
            className="text-sm font-semibold text-gray-600 hover:text-[#3B82F6] transition-colors"
          >
            충전소 찾기
          </button>
          {loggedIn && (
            <button
              onClick={() => navigate('/reservations')}
              className="text-sm font-semibold text-gray-600 hover:text-[#3B82F6] transition-colors"
            >
              내 예약
            </button>
          )}
        </nav>

        {/* 우측 메뉴 영역 */}
        <div className="flex items-center gap-4">
          {loggedIn ? (
            <>
              <a 
                href="/mypage" 
                className="px-5 py-3 text-zinc-700 text-[1.05rem] font-semibold transition-colors hover:text-[#3B82F6]"
              >
                마이페이지
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModal('LOGIN')}
              >
                로그인
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveModal('REGISTER')}
              >
                회원가입
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
