import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import { Select } from "../../components/common/Selectbox";
import { useModal } from "../../hook/useModal";
import { useToast } from "../../hook/useToast";
import reservationService from "../../services/reservationService";
import type {
  Charger,
  ChargerType,
  ReservationRequest,
  ReservationResponse,
} from "../../types/reservation";

// ─────────────────────────────────────────
// 상수
// ─────────────────────────────────────────
/** 예약 유효 시간 (분) — 버튼 누른 시각 기준 */
const RESERVATION_HOLD_MINUTES = 15;

const CHARGER_TYPE_LABELS: Record<ChargerType, string> = {
  RAPID: "급속",
  SLOW:  "완속",
};

// ─────────────────────────────────────────
// 🚧 개발용 목 데이터 — 충전소 찾기 페이지 완성 후 삭제
// TODO: 충전소 찾기(/stations) 완성되면 이 블록 + ?? DEV_MOCK_CHARGER 제거
// ─────────────────────────────────────────
const DEV_MOCK_CHARGER: Charger = {
  chargerId : "CHG-DEV-001",
  stationId : "STA-DEV-001",
  type      : "RAPID",
  status    : "AVAILABLE",
  station   : {
    stationId : "STA-DEV-001",
    name      : "강남 테헤란로점 (개발용)",
    address   : "서울 강남구 테헤란로 52",
  },
};

// ─────────────────────────────────────────
// 헬퍼 — 현재 시각 기준 예약 시각 계산
// ─────────────────────────────────────────
const buildReservationTimes = () => {
  const now     = new Date();
  const expiry  = new Date(now.getTime() + RESERVATION_HOLD_MINUTES * 60 * 1000);
  return {
    startTime   : now.toISOString(),
    expiryTime  : expiry,             // 화면 표시용
  };
};

const fmtTime = (date: Date) =>
  date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export const ReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 충전소 찾기 페이지에서 navigate로 넘겨준 충전기 정보
  // 🚧 state가 없으면 개발용 목 데이터 사용 — 충전소 찾기 완성 후 ?? DEV_MOCK_CHARGER 제거
  const selectedCharger =
    (location.state?.selectedCharger as Charger | undefined) ?? DEV_MOCK_CHARGER;

  // ── 폼 상태 ───────────────────────────
  const [carNumber,      setCarNumber]      = useState("");
  const [carNumberError, setCarNumberError] = useState("");

  // ── 확인 모달에서 보여줄 예약 시각 (버튼 클릭 시 계산) ─────
  const [reservationTimes, setReservationTimes] = useState<ReturnType<typeof buildReservationTimes> | null>(null);

  // ── 예약 완료 결과 ─────────────────────
  const [result, setResult] = useState<ReservationResponse | null>(null);

  // ── 모달 ──────────────────────────────
  const confirmModal = useModal();
  const resultModal  = useModal();

  // ── 토스트 ────────────────────────────
  const { toast, hideToast } = useToast();

  // ── 차량번호 유효성 검사 ───────────────
  const validateCarNumber = (value: string): string => {
    if (!value.trim()) return "차량번호를 입력해주세요.";
    const pattern = /^[가-힣0-9]{2,3}[가-힣]{1}[0-9]{4}$/;
    if (!pattern.test(value.replace(/\s/g, "")))
      return "올바른 차량번호 형식이 아닙니다. (예: 123가4567)";
    return "";
  };

  // ── 예약하기 버튼 클릭 → 시각 계산 후 확인 모달 열기 ─────
  const handleConfirmClick = () => {
    const err = validateCarNumber(carNumber);
    if (err) { setCarNumberError(err); return; }

    // 버튼 누른 시각을 기준으로 계산
    setReservationTimes(buildReservationTimes());
    confirmModal.open();
  };

  // ── 예약 최종 제출 ─────────────────────
  const handleSubmit = async () => {
    confirmModal.close();
    if (!selectedCharger || !reservationTimes) return;

    const payload: ReservationRequest = {
      chargerId   : selectedCharger.chargerId,
      carNumber   : carNumber.replace(/\s/g, ""),
      startTime   : reservationTimes.startTime,
      chargerType : selectedCharger.type,
    };

    try {
      const res = await reservationService.createReservation(payload);
      setResult(res);
      resultModal.open();
    } catch {
      // 공통 에러는 commonservice 인터셉터에서 처리됨
    }
  };

  // ── 충전기 미선택 안내 ─────────────────
  if (!selectedCharger) {
    return (
      <div className="min-h-screen bg-[#F5F8FF] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 text-center border-2 border-[#DBEAFE] shadow-md max-w-sm w-full">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-xl font-black text-[#0F172A] mb-2">충전기를 먼저 선택해주세요</h2>
          <p className="text-[#64748B] text-sm mb-6">
            충전소 찾기 페이지에서 충전기를 선택 후 예약을 진행해주세요.
          </p>
          <Button variant="primary" onClick={() => navigate("/stations")}>
            충전소 찾기로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] pt-20 pb-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* ── 헤더 ── */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#64748B] text-sm font-semibold mb-4 hover:text-[#1D4ED8] transition-all"
          >
            ← 뒤로 가기
          </button>
          <h1 className="text-2xl font-black text-[#0F172A] mb-1">⚡ 충전 예약하기</h1>
          <p className="text-[#64748B] text-sm">기본 정보를 입력하고 PIN 번호를 받으세요.</p>
        </div>

        {/* ── 선택된 충전기 정보 카드 ── */}
        <div className="bg-white rounded-2xl border-2 border-[#DBEAFE] p-5 mb-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#64748B] mb-1">선택된 충전기</p>
              <h3 className="text-base font-black text-[#0F172A]">
                {selectedCharger.station?.name ?? "충전소"}
              </h3>
              {selectedCharger.station?.address && (
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  📍 {selectedCharger.station.address}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold px-3 py-1 rounded-full">
                {CHARGER_TYPE_LABELS[selectedCharger.type]}
              </span>
              <span className="bg-[#F5F8FF] text-[#64748B] text-xs font-semibold px-3 py-1 rounded-full border border-[#DBEAFE]">
                충전기 #{selectedCharger.chargerId.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* ── 예약 유효시간 안내 배너 ── */}
        <div className="bg-[#F0F7FF] border border-[#DBEAFE] rounded-xl px-4 py-3 mb-5 flex items-center gap-2.5">
          <span className="text-lg">⏱</span>
          <p className="text-sm text-[#1D4ED8] font-semibold">
            예약 후 <span className="font-black">{RESERVATION_HOLD_MINUTES}분</span> 이내에 키오스크에서 PIN을 입력해주세요.
            시간 초과 시 예약이 자동 취소됩니다.
          </p>
        </div>

        {/* ── 예약 폼 카드 ── */}
        <div className="bg-white rounded-2xl border-2 border-[#DBEAFE] p-6 shadow-sm flex flex-col gap-5">

          {/* 차량번호 */}
          <Input
            label="차량번호"
            placeholder="예: 123가4567"
            required
            value={carNumber}
            error={carNumberError}
            onChange={(e) => {
              setCarNumber(e.target.value);
              if (carNumberError) setCarNumberError("");
            }}
          />

          {/* 충전기 타입 — 선택된 값으로 고정 표시 */}
          <Select label="충전 방식" value={selectedCharger.type} disabled>
            <option value="RAPID">급속 (RAPID)</option>
            <option value="SLOW">완속 (SLOW)</option>
          </Select>

          {/* 예약하기 버튼 */}
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2"
            onClick={handleConfirmClick}
          >
            예약 및 PIN 번호 받기
          </Button>
        </div>
      </div>

      {/* ── 예약 확인 모달 ── */}
      <Modal isOpen={confirmModal.isOpen} onClose={confirmModal.close} title="예약 확인">
        {reservationTimes && (
          <div className="flex flex-col gap-5">
            <div className="bg-[#F5F8FF] rounded-xl p-4 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B] font-semibold">충전소</span>
                <span className="font-bold text-[#0F172A]">
                  {selectedCharger.station?.name ?? "충전소"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-semibold">충전 방식</span>
                <span className="font-bold text-[#0F172A]">
                  {CHARGER_TYPE_LABELS[selectedCharger.type]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-semibold">차량번호</span>
                <span className="font-bold text-[#0F172A]">{carNumber}</span>
              </div>
              {/* 자동 계산된 예약 유지 시간 표시 */}
              <div className="border-t border-[#DBEAFE] pt-2.5 mt-0.5 flex justify-between">
                <span className="text-[#64748B] font-semibold">예약 유효 시간</span>
                <span className="font-black text-[#1D4ED8]">
                  {fmtTime(new Date(reservationTimes.startTime))} ~ {fmtTime(reservationTimes.expiryTime)}
                </span>
              </div>
            </div>

            {/* 경고 문구 */}
            <p className="text-xs text-[#64748B] text-center">
              확인 버튼을 누르면 예약이 즉시 시작되며,<br />
              <span className="text-[#EF4444] font-semibold">
                {fmtTime(reservationTimes.expiryTime)}까지 키오스크에서 PIN을 입력
              </span>
              해야 합니다.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={confirmModal.close}>
                취소
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleSubmit}>
                확인 및 예약
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 예약 완료 모달 (PIN) ── */}
      <Modal
        isOpen={resultModal.isOpen}
        onClose={() => { resultModal.close(); navigate("/reservations"); }}
        title="예약 완료 🎉"
      >
        {result && reservationTimes && (
          <div className="flex flex-col gap-5 text-center">
            <p className="text-[#64748B] text-sm">
              키오스크에서 아래 PIN 번호를 입력하면<br />충전을 시작할 수 있어요.
            </p>

            {/* PIN 번호 */}
            <div className="bg-[#F0F7FF] border-2 border-[#DBEAFE] rounded-2xl p-6">
              <p className="text-xs font-bold text-[#64748B] mb-2">예약 PIN 번호</p>
              <p className="text-4xl font-black text-[#1D4ED8] tracking-[0.25em]">
                {result.reservationPin}
              </p>
            </div>

            {/* 유효 시간 표시 */}
            <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl px-4 py-3 flex items-center gap-2">
              <span>⏱</span>
              <p className="text-sm text-[#92400E] font-semibold text-left">
                <span className="font-black">{fmtTime(reservationTimes.expiryTime)}</span>까지 키오스크에서 PIN을 입력해주세요.
              </p>
            </div>

            <p className="text-xs text-[#94A3B8]">
              ※ PIN 번호는 문자 메시지로도 발송됩니다.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => { resultModal.close(); navigate("/reservations"); }}
            >
              내 예약 확인하기
            </Button>
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
