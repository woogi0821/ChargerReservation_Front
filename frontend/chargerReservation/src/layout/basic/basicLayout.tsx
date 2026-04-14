import { Outlet, Link } from 'react-router-dom';
import type { NotificationResponseDto } from '../../services/notificationService';
import { useEffect, useState } from 'react';
import notificationService from '../../services/notificationService';

/**
 * 🏗️ 웹사이트 전체 페이지의 공통 뼈대 (헤더 + 컨텐츠 + 푸터)
 */
const MainLayout = () => {
    const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
    const [isNotiOpen, setIsNotiOpen] = useState(false);

    // 1. 페이지 로드 시 알림 목록 가져오기
    useEffect(() => {
        const fetchNotis = async () => {
            try {
                const data = await notificationService.getMyNotifications();
                setNotifications(data);
            } catch (err) {
                console.error("알림 로드 실패:", err);
            }
        };
        fetchNotis();
    }, []);

    // 2. 알림 읽음 처리 함수
    const handleRead = async (notiId: number, targetUrl: string) => {
        try {
            await notificationService.readNotification(notiId);
            // 상태 업데이트 (화면에서 즉시 읽음 처리)
            setNotifications(prev => 
                prev.map(n => n.notiId === notiId ? { ...n, isRead: 'Y' } : n)
            );
            // 필요 시 targetUrl로 이동 로직 추가 가능
        } catch (err) {
            console.error("읽음 처리 실패:", err);
        }
    };

    // 안 읽은 알림 개수
    const unreadCount = notifications.filter(n => n.isRead === 'N').length;
    return (
        <div className="wrapper">
            {/* 1. 상단 공통 헤더 */}
            <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
                <nav>
                    <Link to="/">🏠 홈</Link> | 
                    <Link to="/search"> 🔍 충전소 찾기</Link> | 
                    <Link to="/kiosk"> 🤖 키오스크(모킹)</Link>
                </nav>

                {/* 🔔 알림 아이콘 영역 추가 */}
                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setIsNotiOpen(!isNotiOpen)}
                        style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative' }}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                backgroundColor: 'red', color: 'white', borderRadius: '50%',
                                padding: '2px 6px', fontSize: '10px'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* 알림 드롭다운 */}
                    {isNotiOpen && (
                        <div style={{
                            position: 'absolute', right: 0, top: '35px', width: '300px',
                            backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '400px', overflowY: 'auto'
                        }}>
                            <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>최근 알림</div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>알림이 없습니다.</div>
                            ) : (
                                notifications.map(noti => (
                                    <div 
                                        key={noti.notiId} 
                                        onClick={() => handleRead(noti.notiId, noti.targetUrl)}
                                        style={{
                                            padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer',
                                            backgroundColor: noti.isRead === 'N' ? '#f0f7ff' : 'white'
                                        }}
                                    >
                                        <div style={{ fontSize: '12px', color: '#007bff', fontWeight: 'bold' }}>{noti.notiType}</div>
                                        <div style={{ fontSize: '14px', margin: '4px 0' }}>{noti.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{noti.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* 2. 가변 컨텐츠 영역 (URL에 따라 바뀌는 페이지가 여기에 렌더링됨) */}
            <main style={{ padding: '40px', minHeight: '600px' }}>
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