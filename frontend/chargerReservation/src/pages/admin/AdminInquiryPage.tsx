import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface Inquiry {
  inquiryId: number;
  memberId: number;
  statId: string;
  chargerId: string;
  category: string;
  title: string;
  content: string;
  status: string;
  answerContent: string | null;
  answerAt: string | null;
  insertTime: string;
}

// ─────────────────────────────────────────────
// 상태별 스타일
// ─────────────────────────────────────────────

const inquiryStatusStyles: { [key: string]: { label: string; badge: string } } = {
  PENDING:  { label: "미답변", badge: "bg-orange-50 text-orange-600" },
  ANSWERED: { label: "답변완료", badge: "bg-green-50 text-green-600" },
};

// ─────────────────────────────────────────────
// 권한 체크
// ─────────────────────────────────────────────

const canAnswerInquiry = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "INQUIRY" || adminPart === "ALL";
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminInquiryPage = () => {

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answerContent, setAnswerContent] = useState("");

  const hasAnswerPermission = canAnswerInquiry();

  // ── 문의 목록 조회 ───────────────────────────

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:8080/api/admin/inquiries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // ── 답변 모달 열기 ───────────────────────────

  const onOpenAnswerModal = (inquiry: Inquiry) => {
    if (!hasAnswerPermission) return;
    setSelectedInquiry(inquiry);
    setAnswerContent(inquiry.answerContent ?? "");
  };

  // ── 답변 등록 ────────────────────────────────

  const onSubmitAnswer = async () => {
    if (!selectedInquiry || !answerContent.trim()) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/inquiries/${selectedInquiry.inquiryId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ answerContent }),
        }
      );
      if (!response.ok) return;
      setSelectedInquiry(null);
      setAnswerContent("");
      fetchInquiries();
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  return (
    <AdminLayout adminName="홍길동">

      <AdminPageHeader title="문의 관리" />

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">문의 목록</h2>
            <span className="text-xs text-gray-400">총 {inquiries.length}건</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              미답변 {inquiries.filter(i => i.status === "PENDING").length}건
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              답변완료 {inquiries.filter(i => i.status === "ANSWERED").length}건
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-16">번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-28">카테고리</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">제목</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">회원 ID</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-28">작성일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-300">
                    불러오는 중...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-300">
                    등록된 문의가 없습니다
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => {
                  const style = inquiryStatusStyles[inquiry.status]
                    ?? { label: inquiry.status, badge: "bg-gray-100 text-gray-500" };
                  return (
                    <tr key={inquiry.inquiryId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{inquiry.inquiryId}</td>
                      <td className="px-5 py-3 text-gray-600">{inquiry.category}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{inquiry.title}</td>
                      <td className="px-5 py-3 text-gray-600">{inquiry.memberId}</td>
                      <td className="px-5 py-3 text-gray-500">{inquiry.insertTime?.slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => onOpenAnswerModal(inquiry)}
                          disabled={!hasAnswerPermission}
                          className={`text-xs transition-colors
                            ${hasAnswerPermission
                              ? "text-blue-500 hover:text-blue-700"
                              : "text-gray-300 cursor-not-allowed"
                            }`}
                        >
                          {inquiry.status === "ANSWERED" ? "답변보기" : "답변하기"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 답변 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setSelectedInquiry(null)}>
          <div className="bg-white w-full max-w-lg mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">문의 상세</h3>
              </div>
              <button onClick={() => setSelectedInquiry(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* 문의 정보 */}
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-24 text-xs text-gray-400">카테고리</span>
                <span className="text-sm text-gray-700">{selectedInquiry.category}</span>
              </div>
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-24 text-xs text-gray-400">제목</span>
                <span className="text-sm text-gray-700">{selectedInquiry.title}</span>
              </div>
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-24 text-xs text-gray-400">충전소 ID</span>
                <span className="text-sm text-gray-700">{selectedInquiry.statId ?? "-"}</span>
              </div>
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-24 text-xs text-gray-400">충전기 ID</span>
                <span className="text-sm text-gray-700">{selectedInquiry.chargerId ?? "-"}</span>
              </div>
              <div className="border-b border-gray-50 pb-3">
                <p className="text-xs text-gray-400 mb-1">문의 내용</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedInquiry.content}</p>
              </div>

              {/* 답변 입력 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">
                  답변 내용
                  {selectedInquiry.status === "ANSWERED" && (
                    <span className="ml-2 text-green-500">답변완료</span>
                  )}
                </label>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  disabled={selectedInquiry.status === "ANSWERED"}
                  placeholder={selectedInquiry.status === "ANSWERED" ? "" : "답변 내용을 입력하세요"}
                  rows={4}
                  className={`w-full border border-gray-200 outline-none p-3 text-sm leading-relaxed resize-none
                    ${selectedInquiry.status === "ANSWERED"
                      ? "text-gray-500 bg-gray-50"
                      : "text-gray-700 focus:border-blue-700 placeholder:text-gray-300"
                    }`}
                />
              </div>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              {selectedInquiry.status === "PENDING" && (
                <button
                  onClick={onSubmitAnswer}
                  className="flex-1 py-2 text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors"
                >
                  답변 등록
                </button>
              )}
              <button
                onClick={() => setSelectedInquiry(null)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminInquiryPage;