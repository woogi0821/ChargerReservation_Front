import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";

interface InquiryDto {
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

const FAQ_LIST = [
  {
    cat: "reserve",
    catLabel: "예약",
    q: "예약 취소는 어떻게 하나요?",
    a: "내 예약 페이지에서 예약 취소가 가능합니다. 충전 시작 30분 전까지는 무료로 취소할 수 있으며, 이후 취소 시에는 예약 수수료가 발생할 수 있습니다.",
  },
  {
    cat: "reserve",
    catLabel: "예약",
    q: "예약 시간에 늦으면 어떻게 되나요?",
    a: "예약 시간 이후 15분이 지나면 예약이 자동으로 취소됩니다. 늦을 것 같은 경우 미리 예약 시간을 변경하거나 취소 후 재예약하시길 권장합니다.",
  },
  {
    cat: "charge",
    catLabel: "충전",
    q: "급속 충전과 완속 충전의 차이가 뭔가요?",
    a: "급속 충전은 50kW~200kW 출력으로 약 20~40분 내 80%까지 충전 가능합니다. 완속 충전은 7kW 출력으로 완전 충전까지 6~8시간이 소요되지만 요금이 저렴합니다.",
  },
  {
    cat: "charge",
    catLabel: "충전",
    q: "충전 중에 오류가 발생했어요. 어떻게 해야 하나요?",
    a: "충전 커넥터를 분리 후 재연결해주세요. 오류가 지속되면 1:1 문의로 접수해주시면 빠르게 처리해드립니다.",
  },
  {
    cat: "account",
    catLabel: "계정",
    q: "비밀번호를 잊어버렸어요.",
    a: "로그인 화면 하단의 비밀번호 찾기를 클릭하세요. 가입 시 등록한 이메일 주소를 입력하면 재설정 링크가 발송됩니다.",
  },
  {
    cat: "account",
    catLabel: "계정",
    q: "회원 탈퇴는 어떻게 하나요?",
    a: "마이페이지 → 프로필 수정 → 하단 회원 탈퇴 버튼을 통해 탈퇴하실 수 있습니다. 탈퇴 시 예약 중인 내역은 자동 취소되고 잔여 포인트는 즉시 소멸됩니다.",
  },
];

const FAQ_CATS = [
  { value: "all",     label: "전체" },
  { value: "reserve", label: "예약" },
  { value: "charge",  label: "충전" },
  { value: "account", label: "계정" },
];

const CATEGORY_OPTIONS = [
  "예약 문의",
  "충전 오류",
  "계정 문의",
  "기타",
];

const catTagColor: Record<string, string> = {
  reserve: "bg-blue-50 text-blue-600",
  charge:  "bg-green-50 text-green-600",
  account: "bg-purple-50 text-purple-600",
};

const SupportPage = () => {
  const { loggedIn, setActiveModal } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"faq" | "inquiry">("faq");
  const [faqCat, setFaqCat] = useState("all");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [category, setCategory] = useState("예약 문의");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [openInquiryIdx, setOpenInquiryIdx] = useState<number | null>(null);

  const token = localStorage.getItem("accessToken");
  const memberId = localStorage.getItem("memberId")
    || localStorage.getItem("adminId")
    || "";

  const fetchInquiries = async () => {
    if (!loggedIn || !memberId) return;
    setIsLoadingInquiries(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/inquiries?memberId=${memberId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error("문의 목록 조회 실패", error);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (loggedIn && activeTab === "inquiry") {
      fetchInquiries();
    }
  }, [loggedIn, activeTab]);

  const onSubmitInquiry = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요!");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8080/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: Number(memberId),
          category,
          title,
          content,
          statId: "",
          chargerId: "",
        }),
      });
      if (!response.ok) return;
      setTitle("");
      setContent("");
      setCategory("예약 문의");
      fetchInquiries();
      alert("문의가 접수되었습니다! 빠르게 답변드리겠습니다 😊");
    } catch (error) {
      console.error("문의 작성 실패", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteInquiry = async (inquiryId: number) => {
    if (!window.confirm("문의를 삭제하시겠습니까?")) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/inquiries/${inquiryId}?memberId=${memberId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      setOpenInquiryIdx(null);
      fetchInquiries();
      alert("문의가 삭제되었습니다");
    } catch (error) {
      console.error("문의 삭제 실패", error);
    }
  };

  const filteredFaq = faqCat === "all"
    ? FAQ_LIST
    : FAQ_LIST.filter((f) => f.cat === faqCat);

  return (
    // ✅ 수정 — pt-24 로 헤더 가림 방지 (모바일/데스크탑 공통)
    <div className="min-h-screen bg-[#F0F4FF] font-['Noto_Sans_KR'] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">

        {/* ✅ 수정 — 타이틀 모바일 크기 조정 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">💬 고객센터</h1>
          <p className="text-[#64748B] mt-1 text-xs sm:text-sm">궁금한 점이 있으시면 언제든지 문의해주세요</p>
        </div>

        {/* ✅ 수정 — 탭 버튼 flex-1 로 꽉 채우기 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2
              ${activeTab === "faq"
                ? "text-[#1D4ED8] border-[#1D4ED8]"
                : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
          >
            ❓ FAQ
          </button>
          <button
            onClick={() => setActiveTab("inquiry")}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2
              ${activeTab === "inquiry"
                ? "text-[#1D4ED8] border-[#1D4ED8]"
                : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
          >
            ✉️ 1:1 문의
          </button>
        </div>

        {/* FAQ 탭 */}
        {activeTab === "faq" && (
          <div>
            <div className="flex gap-2 flex-wrap mb-5 sm:mb-6">
              {FAQ_CATS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setFaqCat(cat.value); setOpenFaqIdx(null); }}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors
                    ${faqCat === cat.value
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-white text-[#64748B] border border-[#DBEAFE] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {filteredFaq.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#DBEAFE] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                    className="w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-4 text-left hover:bg-[#F8FAFF] transition-colors"
                  >
                    <span className={`px-2 py-0.5 text-xs rounded font-medium shrink-0 ${catTagColor[faq.cat]}`}>
                      {faq.catLabel}
                    </span>
                    <span className="flex-1 text-xs sm:text-sm font-medium text-[#0F172A]">
                      {faq.q}
                    </span>
                    <span className={`text-gray-400 text-xs transition-transform duration-200 shrink-0 ${openFaqIdx === i ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  </button>
                  {openFaqIdx === i && (
                    <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1:1 문의 탭 */}
        {activeTab === "inquiry" && (
          <div>
            {!loggedIn ? (
              <div className="bg-white rounded-2xl border border-[#DBEAFE] p-8 sm:p-12 flex flex-col items-center gap-4 text-center">
                <div className="text-4xl sm:text-5xl">🔐</div>
                <h3 className="text-base sm:text-lg font-black text-[#0F172A]">로그인이 필요한 서비스입니다</h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  1:1 문의는 로그인 후 이용하실 수 있습니다.
                  <br />
                  로그인 후 문의를 남겨주시면 빠르게 답변드리겠습니다.
                </p>
                <button
                  onClick={() => setActiveModal("LOGIN")}
                  className="mt-2 px-8 py-3 bg-[#1D4ED8] text-white text-sm font-bold rounded-xl hover:bg-[#1e40af] transition-colors"
                >
                  로그인하기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-6">

                {/* ✅ 수정 — 패딩 모바일 조정 */}
                <div className="bg-white rounded-2xl border border-[#DBEAFE] p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A] mb-4 sm:mb-5">✉️ 문의 작성</h3>

                  <div className="mb-4">
                    <label className="block text-xs text-[#64748B] font-medium mb-2">문의 유형</label>
                    <div className="flex gap-2 flex-wrap">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border
                            ${category === cat
                              ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                              : "bg-white text-[#64748B] border-[#DBEAFE] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-[#64748B] font-medium mb-2">제목</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="문의 제목을 입력해주세요"
                      className="w-full px-4 py-3 text-sm border border-[#DBEAFE] rounded-xl focus:border-[#1D4ED8] outline-none placeholder:text-gray-300"
                    />
                  </div>

                  <div className="mb-5 sm:mb-6">
                    <label className="block text-xs text-[#64748B] font-medium mb-2">내용</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="문의 내용을 자세히 입력해주세요&#10;(충전소명, 날짜, 시간 등을 포함하면 더 빠른 답변이 가능합니다)"
                      rows={5}
                      className="w-full px-4 py-3 text-sm border border-[#DBEAFE] rounded-xl focus:border-[#1D4ED8] outline-none placeholder:text-gray-300 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={onSubmitInquiry}
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className={`w-full py-3 text-sm font-bold rounded-xl transition-colors
                      ${isSubmitting || !title.trim() || !content.trim()
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-[#1D4ED8] text-white hover:bg-[#1e40af]"
                      }`}
                  >
                    {isSubmitting ? "접수 중..." : "문의 접수하기"}
                  </button>
                </div>

                {/* ✅ 수정 — 패딩 모바일 조정 */}
                <div className="bg-white rounded-2xl border border-[#DBEAFE] p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A] mb-4 sm:mb-5">📋 내 문의 내역</h3>

                  {isLoadingInquiries ? (
                    <div className="text-center py-8 text-sm text-gray-300">불러오는 중...</div>
                  ) : inquiries.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[#94A3B8]">
                      아직 문의 내역이 없습니다
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {inquiries.map((inquiry, i) => (
                        <div
                          key={inquiry.inquiryId}
                          className="border border-[#F1F5F9] rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenInquiryIdx(openInquiryIdx === i ? null : i)}
                            className="w-full flex items-center gap-2 px-3 sm:px-4 py-3 text-left hover:bg-[#F8FAFF] transition-colors"
                          >
                            <span className={`px-2 py-0.5 text-xs rounded font-medium shrink-0
                              ${inquiry.status === "ANSWERED"
                                ? "bg-green-50 text-green-600"
                                : "bg-orange-50 text-orange-500"
                              }`}>
                              {inquiry.status === "ANSWERED" ? "답변완료" : "답변대기"}
                            </span>
                            {/* ✅ 수정 — 모바일에서 카테고리 숨김 */}
                            <span className="hidden sm:inline text-xs text-[#94A3B8] shrink-0">{inquiry.category}</span>
                            <span className="flex-1 text-xs sm:text-sm font-medium text-[#0F172A] truncate min-w-0">
                              {inquiry.title}
                            </span>
                            <span className="text-xs text-[#94A3B8] shrink-0">
                              {inquiry.insertTime?.slice(0, 10)}
                            </span>
                            <span className={`text-gray-400 text-xs transition-transform duration-200 shrink-0 ${openInquiryIdx === i ? "rotate-180" : ""}`}>
                              ▾
                            </span>
                          </button>

                          {openInquiryIdx === i && (
                            <div className="px-3 sm:px-4 pb-4 border-t border-[#F1F5F9] pt-3 space-y-3">
                              <div className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                                {inquiry.content}
                              </div>
                              {inquiry.answerContent && (
                                <div className="bg-[#F8FAFF] rounded-xl p-3 border border-[#DBEAFE]">
                                  <p className="text-xs text-[#1D4ED8] font-medium mb-1">💬 답변</p>
                                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                                    {inquiry.answerContent}
                                  </p>
                                </div>
                              )}
                              {inquiry.status === "PENDING" && (
                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={() => onDeleteInquiry(inquiry.inquiryId)}
                                    className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    문의 삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;