import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isPinned: boolean;
}

interface NoticeForm {
  title: string;
  content: string;
  isPinned: boolean;
}

const INITIAL_NOTICES: Notice[] = [
  { id: "n001", title: "시스템 점검 안내",           content: "2026년 4월 1일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.",      author: "홍길동", createdAt: "2026.03.30", isPinned: true  },
  { id: "n002", title: "충전 요금 변경 안내",         content: "2026년 4월부터 급속 충전 요금이 일부 조정됩니다.",                   author: "홍길동", createdAt: "2026.03.28", isPinned: true  },
  { id: "n003", title: "신규 충전소 오픈 안내",       content: "강남 코엑스점이 새롭게 오픈했습니다. 많은 이용 부탁드립니다.",       author: "홍길동", createdAt: "2026.03.25", isPinned: false },
  { id: "n004", title: "앱 업데이트 안내 (v2.1.0)",  content: "예약 시스템 개선 및 버그 수정이 포함된 업데이트가 배포되었습니다.", author: "홍길동", createdAt: "2026.03.20", isPinned: false },
  { id: "n005", title: "이벤트 안내 — 첫 충전 무료", content: "신규 회원 가입 후 첫 충전 시 1회 무료 혜택을 드립니다.",            author: "홍길동", createdAt: "2026.03.15", isPinned: false },
];

const EMPTY_FORM: NoticeForm = {
  title: "",
  content: "",
  isPinned: false,
};

// 공지사항 수정 권한 체크
// SUPER 만 공지 작성/수정/삭제 가능
const canEditNotice = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  return adminRole === "SUPER";
};

const AdminNoticePage = () => {

  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [modalMode, setModalMode] = useState<"write" | "edit" | null>(null);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const [detailNotice, setDetailNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState<NoticeForm>(EMPTY_FORM);

  // 수정 권한 여부
  const hasEditPermission = canEditNotice();

  const onCloseModal = () => {
    setModalMode(null);
    setEditNotice(null);
    setForm(EMPTY_FORM);
  };

  const onOpenWriteModal = () => {
    if (!hasEditPermission) return;
    setForm(EMPTY_FORM);
    setEditNotice(null);
    setModalMode("write");
  };

  const onOpenEditModal = (notice: Notice) => {
    if (!hasEditPermission) return;
    setForm({
      title: notice.title,
      content: notice.content,
      isPinned: notice.isPinned,
    });
    setEditNotice(notice);
    setModalMode("edit");
  };

  const onAddNotice = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const newNotice: Notice = {
      id: "n" + String(notices.length + 1).padStart(3, "0"),
      title: form.title,
      content: form.content,
      author: "홍길동",
      createdAt: new Date().toLocaleDateString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit"
      }).replace(/\. /g, ".").replace(".", ".").slice(0, 10),
      isPinned: form.isPinned,
    };
    setNotices((prev) => [newNotice, ...prev]);
    onCloseModal();
  };

  const onEditNotice = () => {
    if (!editNotice || !form.title.trim() || !form.content.trim()) return;
    setNotices((prev) =>
      prev.map((n) =>
        n.id === editNotice.id
          ? { ...n, title: form.title, content: form.content, isPinned: form.isPinned }
          : n
      )
    );
    onCloseModal();
  };

  const onDeleteNotice = (id: string) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AdminLayout adminName="홍길동">

      <AdminPageHeader title="공지사항" />

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">공지 목록</h2>
            <span className="text-xs text-gray-400">총 {notices.length}건</span>
          </div>

          {/* 공지 작성 버튼 — SUPER 만 가능 */}
          <button
            onClick={onOpenWriteModal}
            disabled={!hasEditPermission}
            className={`px-4 py-2 text-xs transition-colors
              ${hasEditPermission
                ? "text-white bg-blue-700 hover:bg-blue-800"
                : "text-gray-300 bg-gray-100 cursor-not-allowed"
              }`}
          >
            + 공지 작성
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-16">번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">제목</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">작성자</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-28">작성일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    등록된 공지사항이 없습니다
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400">{notice.id}</td>
                    <td className="px-5 py-3 cursor-pointer" onClick={() => setDetailNotice(notice)}>
                      <div className="flex items-center gap-2">
                        {notice.isPinned && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 font-medium rounded-sm">고정</span>
                        )}
                        <span className="text-gray-700 font-medium hover:text-blue-700 transition-colors">
                          {notice.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{notice.author}</td>
                    <td className="px-5 py-3 text-gray-500">{notice.createdAt}</td>

                    {/* 수정 / 삭제 버튼 — SUPER 만 가능 */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenEditModal(notice)}
                          disabled={!hasEditPermission}
                          className={`text-xs transition-colors
                            ${hasEditPermission
                              ? "text-blue-500 hover:text-blue-700"
                              : "text-gray-300 cursor-not-allowed"
                            }`}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => onDeleteNotice(notice.id)}
                          disabled={!hasEditPermission}
                          className={`text-xs transition-colors
                            ${hasEditPermission
                              ? "text-red-500 hover:text-red-700"
                              : "text-gray-300 cursor-not-allowed"
                            }`}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 공지 상세 보기 모달 */}
      {detailNotice && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setDetailNotice(null)}>
          <div className="bg-white w-full max-w-lg mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">공지 상세</h3>
              </div>
              <button onClick={() => setDetailNotice(null)} className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                {detailNotice.isPinned && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 font-medium rounded-sm">고정</span>
                )}
                <h4 className="text-base font-semibold text-gray-800">{detailNotice.title}</h4>
              </div>
              <p className="text-xs text-gray-400 mb-4">{detailNotice.author} · {detailNotice.createdAt}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{detailNotice.content}</p>
            </div>

            {/* 상세 모달 하단 버튼 — SUPER 만 수정 가능 */}
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => { setDetailNotice(null); onOpenEditModal(detailNotice); }}
                disabled={!hasEditPermission}
                className={`flex-1 py-2 text-sm border transition-colors
                  ${hasEditPermission
                    ? "text-blue-600 border-blue-200 hover:bg-blue-50"
                    : "text-gray-300 border-gray-200 cursor-not-allowed"
                  }`}
              >
                수정
              </button>
              <button
                onClick={() => setDetailNotice(null)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 작성 / 수정 모달 */}
      {modalMode !== null && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onCloseModal}>
          <div className="bg-white w-full max-w-lg mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">
                  {modalMode === "write" ? "공지 작성" : "공지 수정"}
                </h3>
              </div>
              <button onClick={onCloseModal} className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">제목</label>
                <input
                  type="text"
                  placeholder={modalMode === "write" ? "공지 제목을 입력하세요" : ""}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700 placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">내용</label>
                <textarea
                  placeholder={modalMode === "write" ? "공지 내용을 입력하세요" : ""}
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full border border-gray-200 focus:border-blue-700 outline-none p-3 text-sm text-gray-700 placeholder:text-gray-300 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={form.isPinned}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                  className="accent-blue-700"
                />
                <label htmlFor="isPinned" className="text-xs text-gray-500 cursor-pointer">
                  상단 고정 공지로 설정
                </label>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={modalMode === "write" ? onAddNotice : onEditNotice}
                className="flex-1 py-2 text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                {modalMode === "write" ? "작성 완료" : "수정 완료"}
              </button>
              <button
                onClick={onCloseModal}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminNoticePage;