import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

// 문의 관리 페이지
// 현재는 임시 화면 — 백엔드 API 연동 후 구현 예정
// 회의록 확정사항 : 증빙자료 첨부 방식으로 이의신청 처리
const AdminInquiryPage = () => {
  return (
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      <AdminPageHeader title="문의 관리" />

      {/* 문의 목록 */}
      <div className="bg-white border border-gray-100 shadow-sm">

        {/* 섹션 헤더 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          {/* 블루 포인트 라인 — 팀 시안 컬러 통일 */}
          <div className="w-1 h-4 bg-blue-700" />
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
            문의 목록
          </h2>
        </div>

        {/* 테이블 헤더 — 나중에 구현할 컬럼 구조 미리 잡아둠 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-16">번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-28">카테고리</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">제목</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">작성자</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-28">작성일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {/* 준비 중 안내 */}
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-gray-300">
                  백엔드 연동 후 구현 예정입니다
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
};

export default AdminInquiryPage;