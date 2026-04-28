import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import { Badge } from "../../components/common/badge";
import type { BadgeVariant } from "../../components/common/badge";
import type { IMember } from "../../types/IMember";
import type { MyReservationItem, ReservationStatus } from "../../types/reservation";
import common from "../../common/commonservice";
import reservationService from "../../services/reservationService";
import { useFormik } from "formik";
import { updateValidation } from "../../validation/memberValidation";
import { useModal } from "../../hook/useModal";
import { useToast } from "../../hook/useToast";

// ─────────────────────────────────────────
// 타입
// ─────────────────────────────────────────
type PageTab = "reservations" | "inquiries";

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

// ─────────────────────────────────────────
// 예약 상태 설정
// ─────────────────────────────────────────
const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; variant: BadgeVariant; accent: string }
> = {
  RESERVED  : { label: "예약 완료",  variant: "blue",      accent: "#3B82F6" },
  CHARGING  : { label: "⚡ 충전 중", variant: "primary",   accent: "#00C4A1" },
  DONE      : { label: "완료",       variant: "secondary", accent: "#94A3B8" },
  CANCELLED : { label: "취소됨",     variant: "outline",   accent: "#94A3B8" },
  NO_SHOW   : { label: "노쇼",       variant: "danger",    accent: "#EF4444" },
};

type ReservTab = "upcoming" | "ongoing" | "done";
const RESERV_TABS: { key: ReservTab; label: string }[] = [
  { key: "upcoming", label: "예정된 예약" },
  { key: "ongoing",  label: "진행 중"    },
  { key: "done",     label: "완료된 예약" },
];
const TAB_FILTER: Record<ReservTab, ReservationStatus[]> = {
  upcoming : ["RESERVED"],
  ongoing  : ["CHARGING"],
  done     : ["DONE", "CANCELLED", "NO_SHOW"],
};

// ─────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

const formatPhone = (phone: string | undefined) => {
  if (!phone) return "";
  const c = phone.replace(/\D/g, "");
  const m = c.match(/^(\d{3})(\d{3,4})(\d{4})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : phone;
};

// ─────────────────────────────────────────
// 예약 카드
// ─────────────────────────────────────────
interface ReservationCardProps {
  item: MyReservationItem;
  onCancelClick: (item: MyReservationItem) => void;
}

function ReservationCard({ item, onCancelClick }: ReservationCardProps) {
  const cfg = STATUS_CONFIG[item.status];
  const canCancel = item.status === "RESERVED";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ background: cfg.accent }} />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Badge variant={cfg.variant} size="sm" className="mb-2">{cfg.label}</Badge>
              <h3 className="font-black text-slate-800 text-base leading-tight mb-0.5 truncate">{item.stationName}</h3>
              <p className="text-xs text-slate-400 mb-3">📍 {item.stationAddress}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{item.chargerType === "RAPID" ? "⚡ 급속" : "🔌 완속"}</span>
                <span>🚗 {item.carNumber}</span>
                <span>🕐 {fmtDateTime(item.startTime)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                #{item.chargerId.slice(-4)}
              </span>
              {canCancel && (
                <button
                  onClick={() => onCancelClick(item)}
                  className="text-xs font-bold text-red-500 border border-red-100 bg-white px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  취소
                </button>
              )}
              {item.status === "DONE" && item.actualEndTime && (
                <span className="text-xs text-slate-400">완료 {fmtDateTime(item.actualEndTime)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 예약 빈 상태
// ─────────────────────────────────────────
function ReservEmpty({ tab }: { tab: ReservTab }) {
  const navigate = useNavigate();
  const msg: Record<ReservTab, { icon: string; text: string }> = {
    upcoming : { icon: "📅", text: "예정된 예약이 없어요.\n충전소를 찾아서 예약해보세요!" },
    ongoing  : { icon: "⚡", text: "현재 진행 중인 충전이 없어요." },
    done     : { icon: "✅", text: "완료된 예약 내역이 없어요." },
  };
  const { icon, text } = msg[tab];
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4">
      <div className="text-5xl">{icon}</div>
      <p className="text-slate-400 text-sm font-medium text-center whitespace-pre-line">{text}</p>
      {tab === "upcoming" && (
        <Button variant="primary" size="sm" onClick={() => navigate("/stations")}>충전소 찾기</Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
const MyPage = () => {
  const location = useLocation();
  const initialTab = (location.state as { tab?: PageTab } | null)?.tab ?? "reservations";
  const [pageTab, setPageTab]     = useState<PageTab>(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo]   = useState<IMember | null>(null);

  // 예약 관련
  const [reservations, setReservations] = useState<MyReservationItem[]>([]);
  const [reservTab, setReservTab]       = useState<ReservTab>("upcoming");
  const [reservLoaded, setReservLoaded] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<MyReservationItem | null>(null);

  // 문의 관련
  const [inquiries, setInquiries]               = useState<InquiryDto[]>([]);
  const [inquiryLoaded, setInquiryLoaded]       = useState(false);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [openInquiryIdx, setOpenInquiryIdx]     = useState<number | null>(null);

  const cancelModal = useModal();
  const { toast, hideToast, success: toastSuccess, error: toastError } = useToast();

  const token    = localStorage.getItem("accessToken");
  const memberId = localStorage.getItem("memberId") || "";

  // ── 회원 정보 조회 ───────────────────────
  useEffect(() => {
    common.get<IMember>("/member/me").then((res) => {
      setUserInfo(res.data);
    }).catch((err) => console.error("회원 정보 로딩 실패:", err));
  }, []);

  // ── 예약 목록 조회 (첫 진입 시 1회) ─────
  useEffect(() => {
    if (pageTab !== "reservations" || reservLoaded) return;
    reservationService.getMyReservation()
      .then((data) => {
        setReservations(Array.isArray(data) ? data : []);
        setReservLoaded(true);
      })
      .catch((err) => {
        console.error("예약 목록 로딩 실패:", err);
        setReservLoaded(true);
      });
  }, [pageTab, reservLoaded]);

  // ── 문의 목록 조회 (첫 진입 시 1회) ─────
  useEffect(() => {
    if (pageTab !== "inquiries" || inquiryLoaded) return;
    if (!memberId) return;
    setIsLoadingInquiries(true);
    fetch(`http://localhost:8080/api/inquiries?memberId=${memberId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setInquiries(data);
        setInquiryLoaded(true);
      })
      .catch((err) => console.error("문의 목록 로딩 실패:", err))
      .finally(() => setIsLoadingInquiries(false));
  }, [pageTab, inquiryLoaded]);

  // ── 프로필 수정 폼 ───────────────────────
  const formik = useFormik({
    initialValues: {
      loginId  : userInfo?.loginId || "",
      email    : userInfo?.email   || "",
      name     : userInfo?.name    || "",
      phone    : userInfo?.phone   || "",
      loginPw  : "",
      confirmPw: "",
    },
    validationSchema: updateValidation,
    validateOnBlur: true,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const res = await common.put("/member/me", values);
        if (res.status === 200) {
          toastSuccess("회원 정보가 수정되었습니다.");
          setIsEditing(false);
          setUserInfo((prev) => prev ? { ...prev, ...values } : null);
        }
      } catch {
        toastError("수정에 실패했습니다. 다시 시도해 주세요.");
      }
    },
  });

  // ── 예약 취소 ────────────────────────────
  const handleCancelClick = (item: MyReservationItem) => {
    setCancelTarget(item);
    cancelModal.open();
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    cancelModal.close();
    try {
      await reservationService.cancelReservation(cancelTarget.id);
      setReservations((prev) =>
        prev.map((r) => r.id === cancelTarget.id ? { ...r, status: "CANCELLED" } : r)
      );
      toastSuccess("예약이 취소되었습니다.");
    } catch {
      toastError("취소 처리 중 오류가 발생했습니다.");
    } finally {
      setCancelTarget(null);
    }
  };

  const filtered = reservations.filter((r) => TAB_FILTER[reservTab].includes(r.status));
  const tabCount = (key: ReservTab) => reservations.filter((r) => TAB_FILTER[key].includes(r.status)).length;

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── 프로필 카드 (항상 표시) ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white">
              👦
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-extrabold text-slate-800">{userInfo.name}</h2>
                <span className={`px-2 py-1 text-[10px] rounded font-bold uppercase tracking-tighter ${
                  userInfo.memberGrade === "Y" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                }`}>
                  {userInfo.memberGrade === "Y" ? "Admin" : "User"}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{userInfo.email}</p>
              <p className="text-slate-400 text-sm">{formatPhone(userInfo.phone)}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "수정 취소" : "프로필 수정"}
          </Button>
        </div>

        {/* ── 프로필 수정 폼 (버튼 눌렀을 때만 펼침) ─────────────────────── */}
        {isEditing && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full" />
              계정 정보 수정
            </h3>
            <input type="text"     name="username" value={formik.values.loginId} readOnly autoComplete="username"         style={{ display: "none" }} />
            <input type="password" name="password"                               readOnly autoComplete="current-password" style={{ display: "none" }} />
            <form id="profileForm" onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input label="아이디"           id="loginId"   name="loginId"   value={formik.values.loginId}   readOnly autoComplete="username" />
                <Input label="이메일"           id="email"     name="email"     value={formik.values.email}     readOnly autoComplete="email" />
                <Input label="이름"             id="name"      name="name"      value={formik.values.name}      onChange={formik.handleChange} onBlur={formik.handleBlur} autoComplete="name"         error={formik.touched.name    ? formik.errors.name    : undefined} />
                <Input label="전화번호"         id="phone"     name="phone"     value={formik.values.phone}     onChange={formik.handleChange} onBlur={formik.handleBlur} autoComplete="tel"          error={formik.touched.phone   ? formik.errors.phone   : undefined} placeholder="01000000000 (- 제외)" />
                <Input label="새 비밀번호"      type="password" id="loginPw"   name="loginPw"   value={formik.values.loginPw}   onChange={formik.handleChange} onBlur={formik.handleBlur} autoComplete="new-password" error={formik.touched.loginPw   ? formik.errors.loginPw   : undefined} placeholder="8~15자 (영문, 숫자, 특수문자)" />
                <Input label="새 비밀번호 확인" type="password" id="confirmPw" name="confirmPw" value={formik.values.confirmPw} onChange={formik.handleChange} onBlur={formik.handleBlur} autoComplete="new-password" error={formik.touched.confirmPw ? formik.errors.confirmPw : undefined} placeholder="비밀번호를 다시 입력하세요" />
              </div>
            </form>
            <div className="border-t border-slate-100 mt-8 mb-6" />
            <div className="flex flex-col md:flex-row justify-end gap-4">
              <Button
                type="button"
                variant="danger"
                className="px-8 py-4 rounded-2xl"
                onClick={() => { if (window.confirm("정말 탈퇴하시겠습니까?")) console.log("탈퇴"); }}
              >
                회원 탈퇴
              </Button>
              <Button type="submit" form="profileForm" className="px-12 py-4 rounded-2xl shadow-lg shadow-blue-100">
                저장
              </Button>
            </div>
          </div>
        )}

        {/* ── 페이지 탭 ───────────────────────────────────────────────────── */}
        <div className="flex border-b-2 border-slate-100">
          {([
            { key: "reservations", label: "내 예약" },
            { key: "inquiries",    label: "내 문의" },
          ] as { key: PageTab; label: string }[]).map(({ key, label }) => {
            const isActive = pageTab === key;
            return (
              <button
                key={key}
                onClick={() => setPageTab(key)}
                className={[
                  "px-6 py-3 text-sm font-bold border-b-2 -mb-0.5 transition-all",
                  isActive
                    ? "text-[#3B82F6] border-[#3B82F6]"
                    : "text-slate-400 border-transparent hover:text-slate-600",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── 탭 1: 내 예약 ──────────────────────────────────────────────── */}
        {pageTab === "reservations" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex border-b border-slate-100 mb-5">
              {RESERV_TABS.map((tab) => {
                const count    = tabCount(tab.key);
                const isActive = reservTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setReservTab(tab.key)}
                    className={[
                      "flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all",
                      isActive
                        ? "text-[#3B82F6] border-[#3B82F6]"
                        : "text-slate-400 border-transparent hover:text-slate-600",
                    ].join(" ")}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`text-[0.65rem] font-black px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-[#3B82F6] text-white" : "bg-blue-50 text-blue-400"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {!reservLoaded ? (
              <div className="flex justify-center items-center py-14">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.length === 0
                  ? <ReservEmpty tab={reservTab} />
                  : filtered.map((item) => (
                      <ReservationCard key={item.id} item={item} onCancelClick={handleCancelClick} />
                    ))
                }
              </div>
            )}
          </div>
        )}

        {/* ── 탭 2: 내 문의 ──────────────────────────────────────────────── */}
        {pageTab === "inquiries" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h3 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-2 h-5 bg-blue-500 rounded-full" />
              내 문의 내역
            </h3>
            {isLoadingInquiries ? (
              <div className="flex justify-center items-center py-14">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="text-5xl">💬</div>
                <p className="text-slate-400 text-sm">문의 내역이 없습니다.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/support"}>
                  문의하러 가기
                </Button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50">
                {inquiries.map((inq, idx) => {
                  const isOpen = openInquiryIdx === idx;
                  return (
                    <div key={inq.inquiryId} className="py-4">
                      <button
                        onClick={() => setOpenInquiryIdx(isOpen ? null : idx)}
                        className="w-full flex items-start justify-between gap-3 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              inq.status === "답변완료"
                                ? "bg-green-50 text-green-600 border-green-100"
                                : "bg-amber-50 text-amber-500 border-amber-100"
                            }`}>
                              {inq.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{inq.category}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-700 truncate">{inq.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(inq.insertTime).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        <span className="text-slate-300 text-lg mt-1 flex-shrink-0">{isOpen ? "▲" : "▼"}</span>
                      </button>

                      {isOpen && (
                        <div className="mt-3 space-y-3">
                          {/* 문의 내용 */}
                          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-100">
                            {inq.content}
                          </div>
                          {/* 답변 */}
                          {inq.answerContent ? (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                              <p className="text-[11px] font-bold text-blue-400 mb-1.5">💬 관리자 답변</p>
                              <p className="text-sm text-blue-700 leading-relaxed">{inq.answerContent}</p>
                              {inq.answerAt && (
                                <p className="text-[10px] text-blue-300 mt-2 text-right">
                                  {new Date(inq.answerAt).toLocaleString("ko-KR")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-2">아직 답변이 등록되지 않았습니다.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── 예약 취소 확인 모달 ─────────────────────────────────────────── */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={cancelModal.close}
        title="예약 취소"
      >
        <p className="text-slate-600 text-sm mb-6">
          정말 이 예약을 취소하시겠습니까?<br />
          <span className="text-slate-400 text-xs">취소 후에는 되돌릴 수 없습니다.</span>
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={cancelModal.close}>닫기</Button>
          <Button variant="danger" onClick={handleCancelConfirm}>취소 확정</Button>
        </div>
      </Modal>

      {/* ── 토스트 ──────────────────────────────────────────────────────── */}
      <Toast
        isVisible={toast.isVisible}
        variant={toast.variant}
        position={toast.position}
        onClose={hideToast}
      >
        {toast.message}
      </Toast>
    </div>
  );
};

export default MyPage;