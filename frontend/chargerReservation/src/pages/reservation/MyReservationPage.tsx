import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import { Badge } from "../../components/common/badge";
import { useModal } from "../../hook/useModal";
import { useToast } from "../../hook/useToast";
import reservationService from "../../services/reservationService";
import type { MyReservationItem, ReservationStatus } from "../../types/reservation";

// ─────────────────────────────────────────
// 상태별 표시 설정
// ─────────────────────────────────────────
const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; variant: "primary" | "secondary" | "danger" | "outline"; accent: string }
> = {
  RESERVED  : { label: "예약 완료",  variant: "primary",   accent: "#3B82F6" },
  CHARGING  : { label: "⚡ 충전 중", variant: "primary",   accent: "#3B82F6" },
  DONE      : { label: "완료",       variant: "secondary", accent: "#94A3B8" },
  CANCELLED : { label: "취소됨",     variant: "outline",   accent: "#94A3B8" },
  NO_SHOW   : { label: "노쇼",       variant: "danger",    accent: "#EF4444" },
};

// 탭 정의
type TabKey = "upcoming" | "ongoing" | "done";
const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "예정된 예약" },
  { key: "ongoing",  label: "진행 중"    },
  { key: "done",     label: "완료된 예약" },
];

// 탭별 필터 조건
const TAB_FILTER: Record<TabKey, ReservationStatus[]> = {
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

// ─────────────────────────────────────────
// 임시 더미 데이터 (API 연동 전까지)
// TODO: reservationService.getMyReservation(memberId) 로 교체
// ─────────────────────────────────────────
const MOCK_RESERVATIONS: MyReservationItem[] = [
  {
    id: "1", stationName: "강남 테헤란로점", stationAddress: "서울 강남구 테헤란로 52",
    chargerId: "CHG-001", chargerType: "RAPID", carNumber: "123가4567",
    startTime: "2026-04-14T14:00:00", endTime: "2026-04-14T15:00:00",
    actualEndTime: null, status: "RESERVED", reservationPin: "8421",
  },
  {
    id: "2", stationName: "서초 반포점", stationAddress: "서울 서초구 반포대로 58",
    chargerId: "CHG-002", chargerType: "SLOW", carNumber: "456나7890",
    startTime: "2026-04-13T10:00:00", endTime: "2026-04-13T12:00:00",
    actualEndTime: null, status: "CHARGING", reservationPin: "3157",
  },
  {
    id: "3", stationName: "마포 홍대점", stationAddress: "서울 마포구 와우산로 21",
    chargerId: "CHG-003", chargerType: "RAPID", carNumber: "123가4567",
    startTime: "2026-04-10T09:00:00", endTime: "2026-04-10T10:00:00",
    actualEndTime: "2026-04-10T09:54:00", status: "DONE", reservationPin: "7732",
  },
  {
    id: "4", stationName: "송파 잠실점", stationAddress: "서울 송파구 올림픽로 25",
    chargerId: "CHG-004", chargerType: "SLOW", carNumber: "789다1234",
    startTime: "2026-04-08T16:00:00", endTime: "2026-04-08T18:00:00",
    actualEndTime: null, status: "CANCELLED", reservationPin: "2269",
  },
];

// ─────────────────────────────────────────
// 예약 카드 컴포넌트
// ─────────────────────────────────────────
interface ReservationCardProps {
  item: MyReservationItem;
  onCancelClick: (item: MyReservationItem) => void;
}

function ReservationCard({ item, onCancelClick }: ReservationCardProps) {
  const cfg = STATUS_CONFIG[item.status];
  const canCancel = item.status === "RESERVED";

  return (
    <div className="bg-white rounded-2xl border-2 border-[#DBEAFE] shadow-sm overflow-hidden transition-all hover:translate-x-1 hover:border-[#DBEAFE]">
      {/* 좌측 컬러 엑센트 바 */}
      <div className="flex">
        <div
          className="w-1 flex-shrink-0 rounded-l-2xl"
          style={{ background: cfg.accent }}
        />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            {/* 왼쪽: 정보 */}
            <div className="flex-1 min-w-0">
              <Badge variant={cfg.variant} size="sm" className="mb-2">
                {cfg.label}
              </Badge>
              <h3 className="font-black text-[#0F172A] text-base leading-tight mb-0.5 truncate">
                {item.stationName}
              </h3>
              <p className="text-xs text-[#94A3B8] mb-3">📍 {item.stationAddress}</p>
              <div className="flex flex-wrap gap-2 text-xs text-[#64748B]">
                <span>⚡ {item.chargerType === "RAPID" ? "급속" : "완속"}</span>
                <span>🚗 {item.carNumber}</span>
                <span>🕐 {fmtDateTime(item.startTime)}</span>
              </div>
            </div>

            {/* 오른쪽: 충전기 번호 + 취소 버튼 */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="bg-[#F0F7FF] text-[#1D4ED8] text-xs font-bold px-2.5 py-1 rounded-full border border-[#DBEAFE]">
                #{item.chargerId.slice(-4)}
              </span>
              {canCancel && (
                <button
                  onClick={() => onCancelClick(item)}
                  className="text-xs font-bold text-[#EF4444] border border-[#FEE2E2] bg-white px-3 py-1.5 rounded-lg hover:bg-[#EF4444] hover:text-white transition-all"
                >
                  취소
                </button>
              )}
              {item.status === "DONE" && item.actualEndTime && (
                <span className="text-xs text-[#94A3B8]">
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
// 빈 상태 컴포넌트
// ─────────────────────────────────────────
function EmptyState({ tab }: { tab: TabKey }) {
  const navigate = useNavigate();
  const messages: Record<TabKey, { icon: string; text: string }> = {
    upcoming : { icon: "📅", text: "예정된 예약이 없어요.\n충전소를 찾아서 예약해보세요!" },
    ongoing  : { icon: "⚡", text: "현재 진행 중인 충전이 없어요." },
    done     : { icon: "✅", text: "완료된 예약 내역이 없어요." },
  };
  const { icon, text } = messages[tab];
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-5xl">{icon}</div>
      <p className="text-[#64748B] text-sm font-medium text-center whitespace-pre-line">{text}</p>
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
export const MyReservationPage = () => {
  const [activeTab, setActiveTab]           = useState<TabKey>("upcoming");
  const [reservations, setReservations]     = useState<MyReservationItem[]>(MOCK_RESERVATIONS);
  const [cancelTarget, setCancelTarget]     = useState<MyReservationItem | null>(null);

  const cancelModal = useModal();
  const { toast, hideToast, success: toastSuccess, error: toastError } = useToast();

  // TODO: 실제 API 연동 시 아래 주석 해제
  // useEffect(() => {
  //   reservationService.getMyReservation(memberId).then(setReservations);
  // }, []);

  // ── 탭별 필터링 ────────────────────────
  const filtered = reservations.filter((r) =>
    TAB_FILTER[activeTab].includes(r.status)
  );

  const tabCount = (tab: TabKey) =>
    reservations.filter((r) => TAB_FILTER[tab].includes(r.status)).length;

  // ── 취소 클릭 ──────────────────────────
  const handleCancelClick = (item: MyReservationItem) => {
    setCancelTarget(item);
    cancelModal.open();
  };

  // ── 취소 확정 ──────────────────────────
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    cancelModal.close();

    try {
      // TODO: reservationService.cancelReservation(cancelTarget.id) 연동
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

  return (
    <div className="min-h-screen bg-[#F5F8FF] pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── 페이지 헤더 ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F172A] mb-1">📅 내 예약</h1>
          <p className="text-[#64748B] text-sm">현재 예약 내역을 확인하고 관리하세요.</p>
        </div>

        {/* ── 탭 ── */}
        <div className="flex border-b-2 border-[#DBEAFE] mb-5">
          {TABS.map((tab) => {
            const count = tabCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-t-[10px] transition-all border-b-2 -mb-0.5",
                  isActive
                    ? "text-[#1D4ED8] border-[#3B82F6] bg-[#DBEAFE]"
                    : "text-[#64748B] border-transparent hover:text-[#1D4ED8] hover:border-[#DBEAFE]",
                ].join(" ")}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={[
                      "text-[0.68rem] font-black px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-[#3B82F6] text-white"
                        : "bg-[#DBEAFE] text-[#1D4ED8]",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── 예약 목록 ── */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            filtered.map((item) => (
              <ReservationCard
                key={item.id}
                item={item}
                onCancelClick={handleCancelClick}
              />
            ))
          )}
        </div>
      </div>

      {/* ── 취소 확인 모달 ── */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={cancelModal.close}
        title="예약 취소"
        variant="danger"
      >
        {cancelTarget && (
          <div className="flex flex-col gap-5">
            <div className="bg-[#FEF2F2] rounded-xl p-4 text-sm">
              <p className="font-bold text-[#0F172A] mb-1">{cancelTarget.stationName}</p>
              <p className="text-[#64748B]">
                {fmtDateTime(cancelTarget.startTime)} · {cancelTarget.chargerType === "RAPID" ? "급속" : "완속"} · {cancelTarget.carNumber}
              </p>
            </div>
            <p className="text-[#64748B] text-sm text-center">
              위 예약을 취소하시겠습니까?<br />
              <span className="text-[#EF4444] font-semibold">취소 후에는 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={cancelModal.close}>
                돌아가기
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancelConfirm}>
                예약 취소
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 토스트 ── */}
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
