import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { useLogout } from '../../hook/useLogout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { NotificationResponseDto } from '../../services/notificationService';
import notificationService from '../../services/notificationService';

const Header = () => {
  const { loggedIn, setActiveModal } = useAuthStore();
  const { handleLogout } = useLogout();
  const navigate = useNavigate();

  // ── 알림 상태 ────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  // 로그인 상태일 때만 알림 조회
  useEffect(() => {
    if (!loggedIn) {
      setNotifications([]);
      return;
    }
    const fetchNotis = async () => {
      try {
        const response = await notificationService.getMyNotifications();
        if (Array.isArray(response)) {
          setNotifications(response);
        } else if (response && Array.isArray((response as any).data)) {
          setNotifications((response as any).data);
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
      }
    };
    fetchNotis();
  }, [loggedIn]);

  // 알림 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotiClick = async (noti: NotificationResponseDto) => {
    try {
      if (noti.isRead === 'N') {
        await notificationService.readNotification(noti.notiId);
        setNotifications(prev =>
          prev.map(n => n.notiId === noti.notiId ? { ...n, isRead: 'Y' } : n)
        );
      }
      setIsNotiOpen(false);
      navigate(noti.targetUrl);
    } catch (error) {
      console.error('알림 처리 에러:', error);
    }
  };

  const unreadCount = notifications.filter(n => n.isRead === 'N').length;

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

        {/* 우측 액션 */}
        <div className="flex items-center gap-3">

          {/* 알림 벨 (로그인 시만) */}
          {loggedIn && (
            <div ref={notiRef} className="relative">
              <button
                onClick={() => setIsNotiOpen(prev => !prev)}
                className="relative p-2 text-gray-500 hover:text-[#3B82F6] transition-colors"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* 알림 드롭다운 */}
              {isNotiOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-black text-gray-800">알림</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-8">알림이 없습니다.</p>
                    ) : (
                      notifications.map(noti => (
                        <button
                          key={noti.notiId}
                          onClick={() => handleNotiClick(noti)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                            noti.isRead === 'N' ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed">{noti.message}</p>
                          {noti.isRead === 'N' && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-blue-500">● 새 알림</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 로그인 / 로그아웃 */}
          {loggedIn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/mypage')}
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
