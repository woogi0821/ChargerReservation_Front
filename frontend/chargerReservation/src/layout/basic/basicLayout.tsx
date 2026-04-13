import { Outlet, Link } from 'react-router-dom';

/**
 * 🏗️ 웹사이트 전체 페이지의 공통 뼈대 (헤더 + 컨텐츠 + 푸터)
 */
const MainLayout = () => {
    return (
        <div className="wrapper">
            {/* 1. 상단 공통 헤더 */}
            <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
                <nav>
                    <Link to="/">🏠 홈</Link> | 
                    <Link to="/search"> 🔍 충전소 찾기</Link> | 
                    <Link to="/kiosk"> 🤖 키오스크(모킹)</Link>
                </nav>
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