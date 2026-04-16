import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChargerMain } from "../pages/mock/KioskPage";
import AdminMemberPage from "../pages/admin/AdminMemberPage";
import AdminChargerPage from "../pages/admin/AdminChargerPage";
import AdminReservationPage from "../pages/admin/AdminReservationPage";
import AdminNoticePage from "../pages/admin/AdminNoticePage";
import { ReservationPage } from "../pages/reservation/ReservationPage";
import { MyReservationPage } from "../pages/reservation/MyReservationPage";
import { HomePage } from "../pages/home/HomePage";
import Home from "../components/common/Home";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminPenaltyPage from "../pages/admin/AdminPenaltyPage";
import AdminInquiryPage from "../pages/admin/AdminInquiryPage";
import OAuth2RedirectHandler from "../pages/member/Auth/OAuth2RedirectHandler";
import BasicLayout from "../layout/basic/basicLayout";
import Stations from "../pages/station/Stations";
import ProtectedRoute from "../common/ProtectedRoute";
import MyPage from "../pages/member/MyPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            1. 일반 사용자 영역 (헤더 포함)
           ========================================== */}
        <Route element={<BasicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/reservations" element={<MyPage />} />
        </Route>

        {/* 메인 홈 — ChargeNow 디자인 시안 기반 */}
        <Route path="/" element={<HomePage />} />

        {/* 예약하기 — 충전소 찾기에서 충전기 선택 후 진입 */}
        <Route path="/reservation" element={<ReservationPage />} />
        {/* 소셜 로그인 콜백 */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* 내 예약 — 예약 목록 조회 및 취소 */}
        <Route path="/reservations" element={<MyReservationPage />} />

        {/* SMS 테스트 페이지 (기존 유지) */}
        <Route path="/test-sms" element={<Home />} />

        {/* ==========================================
            2. 독립 영역 (키오스크 — 헤더 없음)
           ========================================== */}
        <Route path="/kiosk" element={<ChargerMain />} />

        {/* ==========================================
            3. 관리자 영역 (ProtectedRoute)
           ========================================== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/member" element={<AdminMemberPage />} />
          <Route path="/admin/charger" element={<AdminChargerPage />} />
          <Route path="/admin/reservation" element={<AdminReservationPage />} />
          <Route path="/admin/notice" element={<AdminNoticePage />} />
          <Route path="/admin/penalty" element={<AdminPenaltyPage />} />
          <Route path="/admin/inquiry" element={<AdminInquiryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
