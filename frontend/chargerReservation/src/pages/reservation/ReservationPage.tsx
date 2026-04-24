import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import { useModal } from "../../hook/useModal";
import { useToast } from "../../hook/useToast";
import reservationService from "../../services/reservationService";
import type {
  ReservationRequest,
  ReservationResponse,
  Charger,
} from "../../types/reservation";

// ── 유틸 ─────────────────────────────────────────────────────────────────────
/** 현재 시각 + offsetMinutes 분 후를 로컬 시간 기준 ISO 문자열로 반환
 *  ⚠️ toISOString()은 UTC를 반환하므로 사용 금지
 *  백엔드 @Future 어노테이션은 서버 로컬(KST) 기준으로 검증함 */
const getFutureTime = (offsetMinutes: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offsetMinutes);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
};

const CHARGER_TYPE_LABEL: Record<string, string> = {
  RAPID: "⚡ 급속 충전",
  SLOW: "🔌 완속 충전",
};

// stat 코드(공공API) → 표시 정보 매핑
const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  "2": { text: "예약 가능", color: "text-green-600 bg-green-50" },
  "3": { text: "충전 중", color: "text-blue-600 bg-blue-50" },
  "9": { text: "점검 중", color: "text-red-600 bg-red-50" },
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
export const ReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // StationDetail → navigate('/reservation', { state: { selectedCharger } }) 로 전달받음
  const selectedCharger = location.state?.selectedCharger as
    | Charger
    | undefined;

  // ── 폼 상태 ──────────────────────────────────────────────────────────────
  const [carNumber, setCarNumber] = useState("");
  const [carNumberError, setCarNumberError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── 성공 모달 ─────────────────────────────────────────────────────────────
  const pinModal = useModal();
  const [reservationResult, setReservationResult] =
    useState<ReservationResponse | null>(null);

  // ── 토스트 ────────────────────────────────────────────────────────────────
  const { toast, hideToast, error: toastError } = useToast();

  // ── 유효성 검사 ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!carNumber.trim()) {
      setCarNumberError("차량 번호를 입력해주세요.");
      return false;
    }
    // 간단한 한국 차량번호 패턴: 숫자2~3자리+한글+숫자4자리 또는 다양한 형태
    const platePattern =
      /^[가-힣\d]{2,3}\s*[가-힣]\s*\d{4}$|^\d{2,3}[가-힣]\d{4}$/;
    if (!platePattern.test(carNumber.replace(/\s/g, ""))) {
      setCarNumberError("올바른 차량 번호 형식이 아닙니다. (예: 12가3456)");
      return false;
    }
    setCarNumberError("");
    return true;
  };

  // ── 예약 제출 ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedCharger) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 버튼 클릭 순간부터 15분 후를 startTime으로 설정
      const startTime = getFutureTime(15);

      const requestData: ReservationRequest = {
        statId: selectedCharger.statId,
        chargerId: selectedCharger.chgerId,
        carNumber: carNumber.replace(/\s/g, ""),
        startTime,
        chargerType: selectedCharger.chgerType,
      };

      const result = await reservationService.createReservation(requestData);
      setReservationResult(result);
      pinModal.open();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "예약에 실패했습니다. 다시 시도해주세요.";
      toastError(errorMessage, { position: "bottom-center" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 충전기 없이 접근한 경우 (직접 URL 입력 등) ──────────────────────────
  if (!selectedCharger) {
    return (
      <div className="max-w-xl mx-auto p-8 my-10 text-center">
        <p className="text-2xl mb-2">🔌</p>
        <p className="text-zinc-600 font-semibold mb-4">
          충전기 정보가 없습니다.
        </p>
        <Button variant="outline" onClick={() => navigate("/stations")}>
          충전소 찾기로 이동
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_LABEL[selectedCharger.stat] ?? {
    text: selectedCharger.stat,
    color: "text-zinc-600 bg-zinc-100",
  };

  return (
    <>
      {/* ── 본문 카드 ──────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl my-10 shadow-xl border border-[#DBEAFE]">
        {/* 헤더 */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-[#0F172A] mb-1">충전 예약</h2>
          <p className="text-sm text-zinc-500">
            아래 정보를 확인하고 예약을 확정해주세요.
          </p>
        </div>

        {/* 충전기 정보 카드 (읽기 전용) */}
        <div className="bg-[#F5F8FF] border border-[#DBEAFE] rounded-xl p-5 mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#3B82F6]">
              {CHARGER_TYPE_LABEL[selectedCharger.chgerType] ??
                selectedCharger.chgerType}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.color}`}
            >
              {statusInfo.text}
            </span>
          </div>
          <p className="text-base font-black text-[#0F172A]">
            {selectedCharger.chargerName}
          </p>
          <p className="text-xs text-zinc-400">{selectedCharger.address}</p>
          <p className="text-[10px] text-zinc-400 pt-1 border-t border-[#DBEAFE]">
            ID: {selectedCharger.chgerId}
          </p>
        </div>

        {/* 예약 시간 안내 */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
          <span className="text-lg mt-0.5">⏱️</span>
          <div>
            <p className="text-sm font-bold text-amber-800">예약 시간 안내</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              예약 확정 버튼을 누르는 순간부터 <strong>15분간</strong> 예약이
              유지됩니다. 15분 내로 충전을 시작하지 않으면 자동 취소됩니다.
            </p>
          </div>
        </div>

        {/* 차량 번호 입력 */}
        <div className="mb-8">
          <Input
            id="car-number"
            label="차량 번호"
            placeholder="예: 12가3456"
            value={carNumber}
            onChange={(e) => {
              setCarNumber(e.target.value);
              if (carNumberError) setCarNumberError("");
            }}
            error={carNumberError}
            required
          />
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            이전으로
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-[2]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                예약 중...
              </span>
            ) : (
              "예약 확정 및 PIN 받기"
            )}
          </Button>
        </div>
      </div>

      {/* ── PIN 번호 성공 모달 ────────────────────────────────────────── */}
      <Modal
        isOpen={pinModal.isOpen}
        onClose={() => {
          pinModal.close();
          navigate("/mypage", { state: { tab: "reservations" } });
        }}
        title="예약 완료 🎉"
        variant="primary"
      >
        {reservationResult && (
          <div className="space-y-6">
            {/* PIN 번호 강조 */}
            <div className="bg-[#F5F8FF] border-2 border-[#3B82F6] rounded-2xl p-6 text-center">
              <p className="text-xs font-bold text-[#3B82F6] uppercase tracking-widest mb-2">
                충전 PIN 번호
              </p>
              <p className="text-5xl font-black text-[#1D4ED8] tracking-[0.3em]">
                {reservationResult.reservationPin}
              </p>
              <p className="text-xs text-zinc-400 mt-3">
                키오스크에서 이 번호를 입력해주세요
              </p>
            </div>

            {/* 예약 요약 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">차량 번호</span>
                <span className="font-bold text-[#0F172A]">
                  {reservationResult.carNumber}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">충전 방식</span>
                <span className="font-bold text-[#0F172A]">
                  {CHARGER_TYPE_LABEL[reservationResult.chargerType] ??
                    reservationResult.chargerType}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">예약 시작</span>
                <span className="font-bold text-[#0F172A]">
                  {reservationResult.startTime?.replace("T", " ").slice(0, 16)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">예약 만료</span>
                <span className="font-bold text-amber-600">
                  {reservationResult.endTime?.replace("T", " ").slice(0, 16)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                pinModal.close();
                navigate("/mypage", { state: { tab: "reservations" } });
              }}
            >
              내 예약 확인하기
            </Button>
          </div>
        )}
      </Modal>

      {/* ── 토스트 ────────────────────────────────────────────────────── */}
      <Toast
        variant={toast.variant}
        position={toast.position}
        isVisible={toast.isVisible}
        onClose={hideToast}
        hasCloseButton
      >
        {toast.message}
      </Toast>
    </>
  );
};
