import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChargerMain } from "../pages/mock/KioskPage";
import AdminMemberPage from "../pages/admin/AdminMemberPage";
import AdminChargerPage from "../pages/admin/AdminChargerPage";
import AdminReservationPage from "../pages/admin/AdminReservationPage";
import AdminNoticePage from "../pages/admin/AdminNoticePage";
import { ReservationPage } from "../pages/reservation/ReservationPage";
import { HomePage } from "../pages/home/HomePage";
import Home from "../components/common/Home";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminPenaltyPage from "../pages/admin/AdminPenaltyPage";
import AdminInquiryPage from "../pages/admin/AdminInquiryPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import OAuth2RedirectHandler from "../pages/member/Auth/OAuth2RedirectHandler";
import MainLayout from "../layout/basic/basicLayout";
import Stations from "../pages/station/Stations";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            1. 일반 사용자 영역
           ========================================== */}

        {/* 메인 홈 — ChargeNow 디자인 시안 기반 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* 헤더가 필요한 페이지 여기에 넣으세요 */}
        </Route>

        {/* 소셜 회원가입 */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* 예약 페이지 */}
        <Route path="/reservation" element={<ReservationPage />} />

        {/* SMS 테스트 페이지 (기존 유지) */}
        <Route path="/test-sms" element={<Home />} />

        {/* ==========================================
                    2. 독립 영역 (키오스크 및 테스트/관리자)
                   ========================================== */}
        <Route path="kiosk" element={<ChargerMain />} />

        {/* 관리자 로그인 */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* 관리자 페이지들 (팀장님 기존 코드 유지) */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/member" element={<AdminMemberPage />} />
        <Route path="/admin/charger" element={<AdminChargerPage />} />
        <Route path="/admin/reservation" element={<AdminReservationPage />} />
        <Route path="/admin/notice" element={<AdminNoticePage />} />
        <Route path="/admin/penalty" element={<AdminPenaltyPage />} />
        <Route path="/admin/inquiry" element={<AdminInquiryPage />} />

        <Route path="/stations" element={<Stations />} />
      </Routes>
    </BrowserRouter>
  );
};
