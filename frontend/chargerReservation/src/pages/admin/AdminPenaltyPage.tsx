import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

// 패널티 관리 페이지
// 현재는 임시 화면 — 백엔드 API 연동 후 구현 예정
const AdminPenaltyPage = () => {
  return (
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      <AdminPageHeader title="패널티 관리" />

      {/* 패널티 목록 */}
      <div className="bg-white border border-gray-100 shadow-sm">

        {/* 섹션 헤더 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          {/* 블루 포인트 라인 — 팀 시안 컬러 통일 */}
          <div className="w-1 h-4 bg-blue-700" />
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
            패널티 목록
          </h2>
        </div>

        {/* 준비 중 안내 */}
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-gray-300 tracking-wide">
            백엔드 연동 후 구현 예정입니다
          </p>
        </div>
      </div>

    </AdminLayout>
  );
};

export default AdminPenaltyPage;