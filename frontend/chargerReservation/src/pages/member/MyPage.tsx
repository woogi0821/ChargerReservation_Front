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
// 페이지 탭
// ─────────────────────────────────────────
type PageTab = "profile" | "reservations";

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
// 날짜 포맷 헬퍼
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
        <div
          className="w-1 flex-shrink-0"
          style={{ background: cfg.accent }}
        />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Badge variant={cfg.variant} size="sm" className="mb-2">
                {cfg.label}
              </Badge>
              <h3 className="font-black text-slate-800 text-base leading-tight mb-0.5 truncate">
                {item.stationName}
              </h3>
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
                <span className="text-xs text-slate-400">
                  완료 {fmtDateTime(item.actualEndTime)}
                </span>
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
        <Button variant="primary" size="sm" onClick={() => navigate("/stations")}>
          충전소 찾기
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
const MyPage = () => {
  const location = useLocation();
  const initialTab = (location.state as { tab?: PageTab } | null)?.tab ?? "profile";
  const [pageTab, setPageTab]           = useState<PageTab>(initialTab);
  const [isEditing, setIsEditing]       = useState(false);
  const [userInfo, setUserInfo]         = useState<IMember | null>(null);

  // 예약 관련 상태
  const [reservations, setReservations] = useState<MyReservationItem[]>([]);
  const [reservTab, setReservTab]       = useState<ReservTab>("upcoming");
  const [reservLoaded, setReservLoaded] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<MyReservationItem | null>(null);

  const cancelModal = useModal();
  const { toast, hideToast, success: toastSuccess, error: toastError } = useToast();

  // ── 회원 정보 조회 ───────────────────────
  useEffect(() => {
    common.get<IMember>("/member/me").then((res) => {
      setUserInfo(res.data);
    }).catch((err) => console.error("회원 정보 로딩 실패:", err));
  }, []);

  // ── 예약 목록 조회 (탭 첫 진입 시 1회) ──
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

  // ── 프로필 수정 폼 ───────────────────────
  const formik = useFormik({
    initialValues: {
      loginId : userInfo?.loginId || "",
      email   : userInfo?.email   || "",
      name    : userInfo?.name    || "",
      phone   : userInfo?.phone   || "",
      loginPw : "",
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

  // ── 탭별 필터 ────────────────────────────
  const filtered   = reservations.filter((r) => TAB_FILTER[reservTab].includes(r.status));
  const tabCount   = (key: ReservTab) => reservations.filter((r) => TAB_FILTER[key].includes(r.status)).length;

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
                  userInfo.memberGrade === "Y"
                    ? "bg-rose-50 text-rose-500"
                    : "bg-blue-50 text-blue-500"
                }`}>
                  {userInfo.memberGrade === "Y" ? "Admin" : "User"}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{userInfo.email}</p>
              <p className="text-slate-400 text-sm">{formatPhone(userInfo.phone)}</p>
            </div>
          </div>
          {pageTab === "profile" && (
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "수정 취소" : "프로필 수정"}
            </Button>
          )}
        </div>

        {/* ── 페이지 탭 ───────────────────────────────────────────────────── */}
        <div className="flex border-b-2 border-slate-100">
          {(["profile", "reservations"] as PageTab[]).map((key) => {
            const label = key === "profile" ? "프로필" : "내 예약";
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

        {/* ── 탭 1: 프로필 수정 ─────────────────────────────────────────── */}
        {pageTab === "profile" && (
          <div >
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                계정 정보
              </h3>

              {/* 브라우저 자동완성 방지용 숨김 필드 */}
              <input type="text"     name="username" value={formik.values.loginId} readOnly autoComplete="username"         style={{ display: "none" }} />
              <input type="password" name="password"                               readOnly autoComplete="current-password" style={{ display: "none" }} />

              <form id="profileForm" onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <Input label="아이디"    id="loginId"   name="loginId"   value={formik.values.loginId}   readOnly autoComplete="username" />
                  <Input label="이메일"    id="email"     name="email"     value={formik.values.email}     readOnly autoComplete="email" />
                  <Input label="이름"      id="name"      name="name"      value={formik.values.name}      onChange={formik.handleChange} onBlur={formik.handleBlur} readOnly={!isEditing} autoComplete="name"         error={formik.touched.name    ? formik.errors.name    : undefined} />
                  <Input label="전화번호"  id="phone"     name="phone"     value={formik.values.phone}     onChange={formik.handleChange} onBlur={formik.handleBlur} readOnly={!isEditing} autoComplete="tel"          error={formik.touched.phone   ? formik.errors.phone   : undefined} placeholder="01000000000 (- 제외)" />
                  <Input label="새 비밀번호"      type="password" id="loginPw"   name="loginPw"   value={formik.values.loginPw}   onChange={formik.handleChange} onBlur={formik.handleBlur} readOnly={!isEditing} autoComplete="new-password" error={formik.touched.loginPw   ? formik.errors.loginPw   : undefined} placeholder="8~15자 (영문, 숫자, 특수문자)" />
                  <Input label="새 비밀번호 확인" type="password" id="confirmPw" name="confirmPw" value={formik.values.confirmPw} onChange={formik.handleChange} onBlur={formik.handleBlur} readOnly={!isEditing} autoComplete="new-password" error={formik.touched.confirmPw ? formik.errors.confirmPw : undefined} placeholder="비밀번호를 다시 입력하세요" />
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
                <Button
                  type="submit"
                  form="profileForm"
                  className="px-12 py-4 rounded-2xl shadow-lg shadow-blue-100"
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── 탭 2: 내 예약 ──────────────────────────────────────────────── */}
        {pageTab === "reservations" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">

            {/* 내부 탭 */}
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

            {/* 예약 목록 */}
            {!reservLoaded ? (
              <div className="flex justify-center items-center py-14">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.length === 0
                  ? <ReservEmpty tab={reservTab} />
                  : filtered.map((item) => (
                      <ReservationCard
                        key={item.id}
                        item={item}
                        onCancelClick={handleCancelClick}
                      />
                    ))
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 취소 확인 모달 ─────────────────────────────────────────────────── */}
      <Modal isOpen={cancelModal.isOpen} onClose={cancelModal.close} title="예약 취소" variant="danger">
        {cancelTarget && (
          <div className="flex flex-col gap-5">
            <div className="bg-red-50 rounded-xl p-4 text-sm">
              <p className="font-bold text-slate-800 mb-1">{cancelTarget.stationName}</p>
              <p className="text-slate-500">
                {fmtDateTime(cancelTarget.startTime)} · {cancelTarget.chargerType === "RAPID" ? "급속" : "완속"} · {cancelTarget.carNumber}
              </p>
            </div>
            <p className="text-slate-500 text-sm text-center">
              위 예약을 취소하시겠습니까?<br />
              <span className="text-red-500 font-semibold">취소 후에는 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={cancelModal.close}>돌아가기</Button>
              <Button variant="danger"  className="flex-1" onClick={handleCancelConfirm}>예약 취소</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 토스트 ──────────────────────────────────────────────────────────── */}
      <Toast
        variant={toast.variant}
        position={toast.position}
        isVisible={toast.isVisible}
        onClose={hideToast}
        hasCloseButton
      >
        {toast.message}
      </Toast>
    </div>
  );
};

export default MyPage;
