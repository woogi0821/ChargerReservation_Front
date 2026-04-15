import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { useLogout } from '../../hook/useLogout';

const Header = () => {
  const { loggedIn, setActiveModal } = useAuthStore();
  const { handleLogout } = useLogout();

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-[88px] bg-gradient-to-b from-[#E0F2FE]/60 via-[#F0F9FF]/80 to-white/95 backdrop-blur-sm border-b border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1440px] mx-auto h-full px-10 flex items-center justify-between">
        
        {/* 로고 영역 */}
        <a href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85 active:scale-[0.98]">
          <span className="text-3xl text-[#3B82F6]">⚡</span>
          <h1 className="text-[#3B82F6] text-2xl font-[900] tracking-[-0.02em] font-['Nunito']">
            ChargeNow
          </h1>
        </a>

        {/* 중앙 네비게이션 */}
        <nav className="flex items-center gap-2">
          <a href="/" className="px-6 py-3 rounded-full bg-[#3B82F6]/10 text-[#191919] text-[1.05rem] font-bold transition-all hover:bg-[#3B82F6]/20">홈</a>
          <a href="/stations" className="px-6 py-3 text-zinc-700 text-[1.05rem] font-semibold transition-colors hover:text-[#191919]">충전소 찾기</a>
          <a href="/" className="px-6 py-3 text-zinc-700 text-[1.05rem] font-semibold transition-colors hover:text-[#191919]">고객센터</a>
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
              </a>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleLogout}
                className="px-4 py-2 shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              size="md" 
              onClick={() => setActiveModal("LOGIN")}
              className="px-10 py-4 shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;