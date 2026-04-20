import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { useEffect, useState } from 'react';
import notificationService from '../../services/notificationService';
import type { NotificationResponseDto } from '../../types/notification';
import { Badge } from '../../components/common/badge';

const Header = () => {
  const { loggedIn, logout, setActiveModal, setToastMessage } = useAuthStore();
  const navigate = useNavigate();

  const adminRole = localStorage.getItem("adminRole");
  const isAdmin = !!adminRole;

  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.isRead === 'N').length;

  // ✅ 수정 — 관리자일 때 알림 API 호출 안 함
  useEffect(() => {
    if (loggedIn && !isAdmin) {
      const fetchNotis = async () => {
        try {
          const response = await notificationService.getMyNotifications();
          if (Array.isArray(response)) {
            setNotifications(response as NotificationResponseDto[]);
          } else if (response && Array.isArray((response as any).data)) {
            setNotifications((response as any).data as NotificationResponseDto[]);
          }
        } catch (error) {
          console.error("알림 로딩 실패:", error);
        }
      };
      fetchNotis();
    }
  }, [loggedIn]);

  const handleNotiClick = async (noti: NotificationResponseDto) => {
    try {
      if (noti.isRead === 'N') {
        await notificationService.readNotification(noti.notiId);
        setNotifications(prev =>
          prev.map(n => n.notiId === noti.notiId ? { ...n, isRead: 'Y' } : n)
        );
      }
      setIsNotiOpen(false);
      // /reservations 는 마이페이지 내 예약 탭으로 이동
      if (noti.targetUrl === "/reservations" || noti.targetUrl.startsWith("/reservations")) {
        navigate("/mypage", { state: { tab: "reservations" } });
      } else {
        navigate(noti.targetUrl);
      }
    } catch (error) {
      console.error("알림 처리 에러:", error);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout API 에러:", error);
    } finally {
      logout();
      setToastMessage("로그아웃 되었습니다 👋");
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-[88px] bg-gradient-to-b from-[#E0F2FE]/60 via-[#F0F9FF]/80 to-white/95 backdrop-blur-sm border-b border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1440px] mx-auto h-full px-10 flex items-center justify-between">

        <a href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85 active:scale-[0.98]">
          <span className="text-3xl text-[#3B82F6]">⚡</span>
          <h1 className="text-[#3B82F6] text-2xl font-[900] tracking-[-0.02em] font-['Nunito']">
            ChargeNow
          </h1>
        </a>

        <nav className="flex items-center gap-1">
          <a href="/" className="px-5 py-2.5 rounded-full bg-[#3B82F6]/10 text-[#191919] text-[1rem] font-bold transition-all hover:bg-[#3B82F6]/20">
            홈
          </a>
          <a href="/stations" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#191919]">
            충전소 찾기
          </a>
          <a href="/notices" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#3B82F6]">
            공지사항
          </a>
          <a href="/support" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#191919]">
            고객센터
          </a>
          {loggedIn && isAdmin && (
            <a href="/admin" className="px-5 py-2.5 text-white text-[1rem] font-bold bg-[#1D4ED8] rounded-full transition-all hover:bg-[#1e40af] ml-2">
              관리자
            </a>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {loggedIn ? (
            <>
              {/* ✅ 수정 — 관리자일 때 알림 버튼 숨김 */}
              {!isAdmin && (
                <div className="relative mr-2">
                  <button
                    onClick={() => setIsNotiOpen(!isNotiOpen)}
                    className="p-2 text-zinc-600 hover:text-[#3B82F6] transition-colors relative"
                  >
                    <span className="text-2xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1">
                        <Badge variant="danger" size="sm" className="px-1.5 min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                          {unreadCount}
                        </Badge>
                      </span>
                    )}
                  </button>
                  {isNotiOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden">
                    </div>
                  )}
                </div>
              )}
              <a href="/mypage" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#3B82F6]">
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