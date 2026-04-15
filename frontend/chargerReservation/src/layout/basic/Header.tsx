import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { useEffect, useState } from 'react';
import type { NotificationResponseDto } from '../../services/notificationService';
import notificationService from '../../services/notificationService';

const Header = () => {
  const { loggedIn, logout, setActiveModal } = useAuthStore();
  const navigate = useNavigate();

  // --- 알림 관련 상태 추가 ---
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  // [3단계] 실시간 알림 데이터 가져오기 : 로그인 상태일 때만 실행
  useEffect(() => {
    if (loggedIn) {
      const fetchNotis = async () => {
        try {
          const response = await notificationService.getMyNotifications();
          console.log("🛠️ 백엔드에서 온 날것의 데이터:", response); // 👈 F12 콘솔에서 이 모양을 꼭 보세요!

        // 1. response 자체가 배열인 경우
        if (Array.isArray(response)) {
          setNotifications(response);
        } 
        // 2. response.data가 배열인 경우 (Axios나 공통 응답 객체 사용 시)
        else if (response && Array.isArray((response as any).data)) {
          setNotifications((response as any).data);
        }
        // 3. 만약 데이터가 없거나 다른 모양이면 빈 배열로 초기화 (에러 방지)
        else {
          console.warn("⚠️ 데이터 형식이 배열이 아닙니다. 빈 배열로 설정합니다.");
          setNotifications([]);
        }
      } catch (error) {
        console.error("❌ 알림 로드 중 진짜 에러 발생:", error);
        setNotifications([]); // 에러 시에도 빈 배열을 넣어 화면 터짐 방지
      }
    };
    fetchNotis();
  }
}, [loggedIn]);

  // [4단계 예정] 알림 클릭 핸들러
  const handleNotiClick = async (noti: NotificationResponseDto) => {
    try {
      if (noti.isRead === 'N') {
        await notificationService.readNotification(noti.notiId);
        setNotifications(prev => 
          prev.map(n => n.notiId === noti.notiId ? { ...n, isRead: 'Y' } : n)
        );
      }
      setIsNotiOpen(false);
      navigate(noti.targetUrl); // 해당 페이지로 이동
    } catch (error) {
      console.error("알림 처리 에러:", error);
    }
  };

  const unreadCount = Array.isArray(notifications) 
  ? notifications.filter(n => n.isRead === 'N').length 
  : 0;

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
            {/* 🔔 알림 아이콘 추가 */}
              <div className="relative mr-2">
                <button 
                  onClick={() => setIsNotiOpen(!isNotiOpen)}
                  className="relative p-2.5 text-zinc-600 hover:bg-[#3B82F6]/10 rounded-full transition-all active:scale-90"
                >
                  <span className="text-2xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 알림 드롭다운 디자인 */}
                {isNotiOpen && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center">
                      <span className="font-bold text-zinc-800">새로운 알림</span>
                      <span className="text-xs text-[#3B82F6] font-medium">최신순</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-zinc-400 text-sm">알림이 없습니다.</div>
                      ) : (
                        notifications.map(noti => (
                          <div 
                            key={noti.notiId}
                            onClick={() => handleNotiClick(noti)}
                            className={`p-4 border-b border-zinc-50 cursor-pointer transition-colors hover:bg-zinc-50 ${noti.isRead === 'N' ? 'bg-blue-50/40' : 'white'}`}
                          >
                            <p className={`text-sm font-bold mb-1 ${noti.isRead === 'N' ? 'text-[#3B82F6]' : 'text-zinc-700'}`}>
                              {noti.title}
                            </p>
                            <p className="text-xs text-zinc-500 leading-snug">{noti.message}</p>
                            <p className="text-[10px] text-zinc-400 mt-2">{noti.createdAt}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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