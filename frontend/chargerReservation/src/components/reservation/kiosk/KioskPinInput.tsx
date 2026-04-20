// KioskPinInput — PIN 번호 입력 화면
// 톤앤매너: 화이트 배경 + 민트(#00C4A1) 포인트

import { useState } from "react";
import { KioskPinPad } from "../KioskPinPad";
import kioskService from "../../../services/kioskService";

const PIN_LENGTH = 6;

interface KioskPinInputProps {
  statId      : string;
  chargerId   : string;
  chargerType : string;   // "RAPID" | "SLOW"
  onBack      : () => void;
}

const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
  RAPID: { label: "급속충전", icon: "⚡" },
  SLOW:  { label: "완속충전", icon: "🔌" },
};

const KioskPinInput = ({ statId, chargerId, chargerType, onBack }: KioskPinInputProps) => {
  const [pin, setPin]             = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError]   = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { label, icon } = TYPE_LABEL[chargerType] ?? { label: "충전기", icon: "⚡" };

  // 6자리 완성 → 자동 인증
  const submitPin = async (pinValue: string) => {
    setIsLoading(true);
    setHasError(false);
    try {
      await kioskService.auth({ statId, chargerId, pin: pinValue });
      setIsSuccess(true);
      // 성공 후 WebSocket이 CHARGING 상태를 브로드캐스트 → 부모 KioskPage가 화면 전환
    } catch {
      setHasError(true);
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  // ── VERIFYING ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
        <div
          className="w-20 h-20 rounded-full border-4 animate-spin"
          style={{ borderColor: "#00C4A1", borderTopColor: "transparent" }}
        />
        <div>
          <p className="text-xl font-black text-gray-800 mb-1">예약 확인 중</p>
          <p className="text-sm text-gray-400">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  // ── SUCCESS (WebSocket 이벤트 대기 중 잠깐 표시) ────────────────────────────
  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,196,161,0.12)", border: "3px solid #00C4A1" }}
        >
          <span className="text-5xl">✅</span>
        </div>
        <div>
          <p className="text-2xl font-black text-gray-800 mb-1">인증 완료!</p>
          <p className="text-sm text-gray-400">충전이 곧 시작됩니다.</p>
        </div>
      </div>
    );
  }

  // ── PIN 입력 ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center gap-4 px-6 py-6">
      {/* 헤더 */}
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#00C4A1" }}>
          PIN AUTHENTICATION
        </p>
        <p className="text-2xl font-black text-gray-900 mb-1">PIN 번호를 입력하세요</p>
        <p className="text-sm text-gray-500">
          {icon} {label} · {chargerId}
        </p>
      </div>

      {/* PIN 도트 (6자리) */}
      <div className="flex gap-3 items-center my-1">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full transition-all duration-200"
            style={{
              background: i < pin.length ? "#00C4A1" : "rgba(0,196,161,0.15)",
              border: `2px solid ${i < pin.length ? "#00C4A1" : "#D1FAF3"}`,
              transform: i < pin.length ? "scale(1.2)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* 오류 메시지 */}
      {hasError && (
        <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
          <p className="text-red-500 text-sm font-bold">
            ❌ PIN이 일치하지 않습니다. 다시 입력하세요.
          </p>
        </div>
      )}

      {/* PIN 패드 */}
      <div className="w-full flex justify-center">
        <KioskPinPad
          maxLength={PIN_LENGTH}
          onComplete={submitPin}
        />
      </div>

      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="w-full py-4 rounded-2xl text-gray-400 text-sm font-semibold border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
      >
        ← 돌아가기
      </button>
    </div>
  );
};

export default KioskPinInput;
