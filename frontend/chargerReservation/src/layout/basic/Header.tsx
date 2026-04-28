import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { useEffect, useState, useRef } from 'react';
import notificationService from '../../services/notificationService';
import type { NotificationResponseDto } from '../../types/notification';
import { Badge } from '../../components/common/badge';

const Header = () => {
  const { loggedIn, logout, setActiveModal, setToastMessage } = useAuthStore();
  const navigate = useNavigate();

  const adminRole = localStorage.getItem("adminRole");
  const adminName = localStorage.getItem("adminName");
  const memberName = localStorage.getItem("memberName");
  const isAdmin = loggedIn && !!adminRole;

  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.isRead === 'N').length;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const displayName = isAdmin ? (adminName ?? "관리자") : (memberName ?? "");

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

      const loginId = localStorage.getItem("loginId");
      if (!loginId) {
        console.warn("loginId가 없어 SSE 연결을 건너뜁니다.");
        return;
      }
      const eventSource = new EventSource(
        `http://localhost:8080/api/notifications/subscribe?loginId=${loginId}`
      );

      eventSource.onopen = () => {
        console.log("✅ 실시간 알림 서버와 연결되었습니다!");
      };

      eventSource.addEventListener("notification", (event) => {
        try {
          const newNoti = JSON.parse(event.data);
          console.log("🔔 실시간 알림 도착:", newNoti);
          setNotifications((prev) => [newNoti, ...prev]);
        } catch (err) {
          console.error("알림 파싱 에러:", err);
        }
      });

      eventSource.onerror = (error) => {
        console.error("❌ SSE 연결 에러:", error);
        eventSource.close();
      };

      return () => {
        console.log("🔌 SSE 연결을 안전하게 종료합니다.");
        eventSource.close();
      };
    }
  }, [loggedIn, isAdmin]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleNotiClick = async (noti: NotificationResponseDto) => {
    try {
      if (noti.isRead === 'N') {
        await notificationService.readNotification(noti.notiId);
        setNotifications(prev =>
          prev.map(n => n.notiId === noti.notiId ? { ...n, isRead: 'Y' } : n)
        );
      }
      setIsNotiOpen(false);
      if (noti.notiType === "RESERVATION") {
        navigate("/mypage", { state: { tab: "reservations" } });
      } else if (noti.notiType === "PENALTY" || noti.notiType === "NOSHOW") {
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

      localStorage.removeItem("memberId");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminPart");
      localStorage.removeItem("adminName");
      localStorage.removeItem("memberName");
      localStorage.removeItem("loginId");
      localStorage.removeItem("accessToken");

      logout();
      setToastMessage("로그아웃 되었습니다 👋");
      navigate("/");
    }
  };

  const handleMobileNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1440px] mx-auto h-[88px] px-4 sm:px-10 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85 active:scale-[0.98]">
            <span className="text-3xl text-[#3B82F6]">⚡</span>
            <h1 className="text-[#3B82F6] text-2xl font-[900] tracking-[-0.02em] font-['Nunito']">ChargeNow</h1>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            <a href="/" className="px-5 py-2.5 rounded-full bg-[#3B82F6]/10 text-[#191919] text-[1rem] font-bold transition-all hover:bg-[#3B82F6]/20">홈</a>
            <a href="/stations" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#191919]">충전소 찾기</a>
            <a href="/notices" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#3B82F6]">공지사항</a>
            <a href="/support" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#191919]">고객센터</a>
            {loggedIn && isAdmin && (
              <div className="relative ml-2">
                <a href="/admin" className="px-5 py-2.5 text-[#4338CA] text-[1rem] font-bold bg-[#EEF2FF] border-[1.5px] border-[#6366F1] rounded-full transition-all hover:bg-[#E0E7FF]">관리자</a>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              </div>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {loggedIn ? (
              <>
                {!isAdmin && (
                  <div className="relative mr-2">
                    <button onClick={() => setIsNotiOpen(!isNotiOpen)} className="p-2 text-zinc-600 hover:text-[#3B82F6] transition-colors relative">
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
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-[100]">
                        <div className="px-5 py-4 border-b border-zinc-50 bg-zinc-50/50 flex justify-between items-center">
                          <span className="font-bold text-zinc-800">알림</span>
                          <span className="text-xs text-zinc-400">최근 30일</span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((noti) => (
                              <div
                                key={noti.notiId}
                                onClick={() => handleNotiClick(noti)}
                                className={`px-5 py-4 border-b border-zinc-50 cursor-pointer transition-colors hover:bg-blue-50/50 ${noti.isRead === "N" ? "bg-blue-50/20" : "bg-white"}`}
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    {noti.isRead === "N" && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                                    <span className={`text-sm ${noti.isRead === "N" ? "font-bold text-zinc-900" : "text-zinc-600"}`}>{noti.title}</span>
                                  </div>
                                  <p className="text-sm text-zinc-500 leading-relaxed">{noti.message}</p>
                                  <span className="text-[11px] text-zinc-400 mt-1">방금 전</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-5 py-10 text-center">
                              <span className="text-3xl mb-2 block">🔔</span>
                              <p className="text-sm text-zinc-400">새로운 알림이 없습니다.</p>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-zinc-50/30 text-center border-t border-zinc-50">
                          <button onClick={() => { setIsNotiOpen(false); navigate("/mypage"); }} className="text-xs text-zinc-500 hover:text-[#3B82F6] font-medium">
                            모든 알림 보기
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <a href="/mypage" className="px-5 py-2.5 text-zinc-700 text-[1rem] font-semibold transition-colors hover:text-[#3B82F6]">마이페이지</a>
                <Button variant="primary" size="md" onClick={handleLogout} className="px-4 py-2 shadow-lg hover:-translate-y-0.5 active:translate-y-0">로그아웃</Button>
              </>
            ) : (
              <Button variant="primary" size="md" onClick={() => setActiveModal("LOGIN")} className="px-10 py-4 shadow-lg hover:-translate-y-0.5 active:translate-y-0">로그인</Button>
            )}
          </div>

          {/* ✅ 수정 — 종모양 + 햄버거 나란히 배치 */}
          <div className="lg:hidden flex items-center gap-2">
            {loggedIn && !isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setIsNotiOpen(!isNotiOpen)}
                  className="p-2 text-zinc-600 hover:text-[#3B82F6] transition-colors relative"
                >
                  <span className="text-2xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* ✅ 모바일 알림 드롭다운 */}
                {isNotiOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-[100]">
                    <div className="px-5 py-4 border-b border-zinc-50 bg-zinc-50/50 flex justify-between items-center">
                      <span className="font-bold text-zinc-800">알림</span>
                      <span className="text-xs text-zinc-400">최근 30일</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((noti) => (
                          <div
                            key={noti.notiId}
                            onClick={() => handleNotiClick(noti)}
                            className={`px-5 py-4 border-b border-zinc-50 cursor-pointer transition-colors hover:bg-blue-50/50 ${noti.isRead === "N" ? "bg-blue-50/20" : "bg-white"}`}
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {noti.isRead === "N" && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                                <span className={`text-sm ${noti.isRead === "N" ? "font-bold text-zinc-900" : "text-zinc-600"}`}>{noti.title}</span>
                              </div>
                              <p className="text-sm text-zinc-500 leading-relaxed">{noti.message}</p>
                              <span className="text-[11px] text-zinc-400 mt-1">방금 전</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-10 text-center">
                          <span className="text-3xl mb-2 block">🔔</span>
                          <p className="text-sm text-zinc-400">새로운 알림이 없습니다.</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-zinc-50/30 text-center border-t border-zinc-50">
                      <button
                        onClick={() => { setIsNotiOpen(false); navigate("/mypage"); }}
                        className="text-xs text-zinc-500 hover:text-[#3B82F6] font-medium"
                      >
                        모든 알림 보기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="w-5 h-0.5 bg-zinc-600 rounded-full block" />
              <span className="w-5 h-0.5 bg-zinc-600 rounded-full block" />
              <span className="w-5 h-0.5 bg-zinc-600 rounded-full block" />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 z-[70] h-full w-72 bg-white shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-[#3B82F6]">⚡</span>
            <span className="text-[#3B82F6] text-lg font-[900] font-['Nunito']">ChargeNow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-zinc-500">✕</button>
        </div>

        {loggedIn && (
          <div className="px-5 py-4 bg-[#F8FAFF] border-b border-zinc-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {displayName?.slice(0, 1) ?? "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{displayName}님</p>
              <p className="text-xs text-[#64748B]">{isAdmin ? "관리자 계정" : "일반 회원"}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 py-2 overflow-y-auto">
          <button onClick={() => handleMobileNav("/")} className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-zinc-700 font-semibold hover:bg-[#F8FAFF] hover:text-[#1D4ED8] transition-colors border-b border-zinc-50">
            <span className="text-lg">🏠</span><span>홈</span>
          </button>
          <button onClick={() => handleMobileNav("/stations")} className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-zinc-700 font-semibold hover:bg-[#F8FAFF] hover:text-[#1D4ED8] transition-colors border-b border-zinc-50">
            <span className="text-lg">⚡</span><span>충전소 찾기</span>
          </button>
          <button onClick={() => handleMobileNav("/notices")} className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-zinc-700 font-semibold hover:bg-[#F8FAFF] hover:text-[#1D4ED8] transition-colors border-b border-zinc-50">
            <span className="text-lg">📢</span><span>공지사항</span>
          </button>
          <button onClick={() => handleMobileNav("/support")} className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-zinc-700 font-semibold hover:bg-[#F8FAFF] hover:text-[#1D4ED8] transition-colors border-b border-zinc-50">
            <span className="text-lg">💬</span><span>고객센터</span>
          </button>
          {loggedIn && !isAdmin && (
            <button onClick={() => handleMobileNav("/mypage")} className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-zinc-700 font-semibold hover:bg-[#F8FAFF] hover:text-[#1D4ED8] transition-colors border-b border-zinc-50">
              <span className="text-lg">👤</span><span>마이페이지</span>
            </button>
          )}
          {loggedIn && isAdmin && (
            <button onClick={() => handleMobileNav("/admin")} className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-[#4338CA] font-bold hover:bg-[#EEF2FF] transition-colors border-b border-zinc-50">
              <span className="text-lg">🔑</span><span>관리자</span>
            </button>
          )}
        </nav>

        <div className="px-5 py-5 border-t border-zinc-100">
          {loggedIn ? (
            <button onClick={handleLogout} className="w-full py-3 bg-[#1D4ED8] text-white font-semibold rounded-xl hover:bg-[#1e40af] transition-colors">로그아웃</button>
          ) : (
            <button onClick={() => { setActiveModal("LOGIN"); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-[#1D4ED8] text-white font-semibold rounded-xl hover:bg-[#1e40af] transition-colors">로그인</button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;