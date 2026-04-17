import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

interface Notice {
  noticeId: number;
  title: string;
  content: string;
  writerId: string;
  fixYn: string;
  deleteYn: string;
  insertTime: string;
}

interface NoticeForm {
  title: string;
  content: string;
  fixYn: string;
}

const EMPTY_FORM: NoticeForm = {
  title: "",
  content: "",
  fixYn: "N",
};

// ✅ 수정 — SUPER 또는 INQUIRY 파트 허용
const canEditNotice = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "INQUIRY";
};

const AdminNoticePage = () => {

  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"write" | "edit" | null>(null);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const [detailNotice, setDetailNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState<NoticeForm>(EMPTY_FORM);

  const hasEditPermission = canEditNotice();

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/api/admin/notices", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

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
      fixYn: notice.fixYn,
    });
    setEditNotice(notice);
    setModalMode("edit");
  };

  const onAddNotice = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/api/admin/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) return;
      fetchNotices();
      onCloseModal();
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  const onEditNotice = async () => {
    if (!editNotice || !form.title.trim() || !form.content.trim()) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/notices/${editNotice.noticeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!response.ok) return;
      fetchNotices();
      onCloseModal();
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  const onDeleteNotice = async (noticeId: number) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/notices/${noticeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      fetchNotices();
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    불러오는 중...
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    등록된 공지사항이 없습니다
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.noticeId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400">{notice.noticeId}</td>
                    <td className="px-5 py-3 cursor-pointer" onClick={() => setDetailNotice(notice)}>
                      <div className="flex items-center gap-2">
                        {notice.fixYn === "Y" && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 font-medium rounded-sm">고정</span>
                        )}
                        <span className="text-gray-700 font-medium hover:text-blue-700 transition-colors">
                          {notice.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{notice.writerId}</td>
                    <td className="px-5 py-3 text-gray-500">{notice.insertTime?.slice(0, 10)}</td>
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
                          onClick={() => onDeleteNotice(notice.noticeId)}
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
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setDetailNotice(null)}>
          <div className="bg-white w-full max-w-lg mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">공지 상세</h3>
              </div>
              <button onClick={() => setDetailNotice(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                {detailNotice.fixYn === "Y" && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 font-medium rounded-sm">고정</span>
                )}
                <h4 className="text-base font-semibold text-gray-800">{detailNotice.title}</h4>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {detailNotice.writerId} · {detailNotice.insertTime?.slice(0, 10)}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{detailNotice.content}</p>
            </div>
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
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={onCloseModal}>
          <div className="bg-white w-full max-w-lg mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">
                  {modalMode === "write" ? "공지 작성" : "공지 수정"}
                </h3>
              </div>
              <button onClick={onCloseModal}
                className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
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
                  id="fixYn"
                  checked={form.fixYn === "Y"}
                  onChange={(e) => setForm((prev) => ({ ...prev, fixYn: e.target.checked ? "Y" : "N" }))}
                  className="accent-blue-700"
                />
                <label htmlFor="fixYn" className="text-xs text-gray-500 cursor-pointer">
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