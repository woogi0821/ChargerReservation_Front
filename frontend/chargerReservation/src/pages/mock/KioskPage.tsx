// KioskPage — 키오스크 메인 페이지
// URL: /kiosk?chargerId=PW013906_01&type=RAPID
// 톤앤매너: 화이트 배경 + 민트(#00C4A1) 포인트

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useChargerSocket } from "../../hook/useChargerSocket";
import kioskService from "../../services/kioskService";
import KioskStandby from "../../components/reservation/kiosk/KioskStandby";
import KioskPinInput from "../../components/reservation/kiosk/KioskPinInput";
import KioskCharging from "../../components/reservation/kiosk/KioskCharging";

type KioskStep = "STANDBY" | "PIN_INPUT" | "CHARGING" | "DONE";

export const ChargerMain = () => {
  const [searchParams] = useSearchParams();
  const statId      = searchParams.get("statId") ?? "";
  const chargerId   = searchParams.get("chargerId") ?? "";
  const chargerType = searchParams.get("type") ?? "RAPID"; // "RAPID" | "SLOW"

  // ── WebSocket 실시간 상태 ────────────────────────────────────────────────
  // chargerStatus: "AVAILABLE" | "RESERVED" | "CHARGING" | "BROKEN"
  const { chargerStatus, isConnected, broadcastChargerId } = useChargerSocket(statId ,chargerId);
  const effectiveChargerId = chargerId || broadcastChargerId;

  // ── 화면 단계 상태 ───────────────────────────────────────────────────────
  const [step, setStep] = useState<KioskStep>("STANDBY");

  // WebSocket 상태 변화 → 화면 자동 전환
  useEffect(() => {
    if (!chargerStatus) return;
    if (chargerStatus === "CHARGING") {
      setStep("CHARGING");
    } else if (chargerStatus === "AVAILABLE" && step === "CHARGING") {
      setStep("DONE");
    } else if (chargerStatus === "AVAILABLE" && step !== "DONE") {
      setStep("STANDBY");
    }
  }, [chargerStatus]);

  // ── 충전 강제 종료 ───────────────────────────────────────────────────────
  const handleStop = async () => {
    try {
      await kioskService.stop(statId, effectiveChargerId);
    } catch {
      // 서버 오류여도 DONE으로 전환
    } finally {
      setStep("DONE");
    }
  };

  // ── 처음으로 ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep("STANDBY");
  };

  // ── chargerId 없으면 안내 화면 ───────────────────────────────────────────
  if ((statId && !chargerId) || (!statId && chargerId)) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#F8FFFE" }}
      >
        <div className="text-center">
          <p className="text-4xl mb-4">🔌</p>
          <p className="text-gray-500 font-semibold">충전기 ID가 필요합니다.</p>
          <p className="text-gray-300 text-sm mt-2">/kiosk?chargerId=05&type=RAPID</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center font-sans select-none relative"
      style={{ background: "#F0FDF9" }}
    >
      {/* 연결 상태 (우측 상단) */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? "animate-pulse" : ""}`}
          style={{ background: isConnected ? "#00C4A1" : "#EF4444" }}
        />
        <span className="text-xs text-gray-400">
          {isConnected ? `실시간 연결됨 · ${chargerId}` : "연결 끊김"}
        </span>
      </div>

      {/* 키오스크 본체 */}
      <div
        className="w-[420px] h-[780px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative"
        style={{ border: "6px solid #E6FAF6" }}
      >

        {/* ── 상단 헤더 ─────────────────────────────────────────────────────── */}
        <div
          className="px-6 py-5 flex justify-between items-center"
          style={{ borderBottom: "1px solid #E6FAF6" }}
        >
          <div>
            <h1
              className="font-black text-xl tracking-tight"
              style={{ color: "#00C4A1" }}
            >
              CHAEVI 채비
            </h1>
            <p className="text-gray-400 text-xs">{chargerId}</p>
          </div>

          {/* 상태 뱃지 */}
          <div
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={
              chargerStatus === "AVAILABLE"
                ? { background: "rgba(0,196,161,0.1)", color: "#00C4A1" }
                : chargerStatus === "RESERVED"
                ? { background: "rgba(251,191,36,0.15)", color: "#D97706" }
                : chargerStatus === "CHARGING"
                ? { background: "rgba(59,130,246,0.1)", color: "#2563EB" }
                : { background: "rgba(239,68,68,0.1)", color: "#DC2626" }
            }
          >
            {chargerStatus ?? "–"}
          </div>
        </div>

        {/* ── 화면 1: 대기 (STANDBY) ─────────────────────────────────────────── */}
        {step === "STANDBY" && (
          <KioskStandby
            chargerStatus={chargerStatus ?? "AVAILABLE"}
            chargerType={chargerType}
            chargerId={effectiveChargerId}
            onPinInputStart={() => setStep("PIN_INPUT")}
          />
        )}

        {/* ── 화면 2: PIN 입력 ───────────────────────────────────────────────── */}
        {step === "PIN_INPUT" && (
          <KioskPinInput
            statId={statId}
            chargerId={effectiveChargerId}
            chargerType={chargerType}
            onBack={() => setStep("STANDBY")}
          />
        )}

        {/* ── 화면 3: 충전 중 ────────────────────────────────────────────────── */}
        {step === "CHARGING" && (
          <KioskCharging
            chargerId={effectiveChargerId}
            chargerType={chargerType}
            onStop={handleStop}
          />
        )}

        {/* ── 화면 4: 충전 완료 ──────────────────────────────────────────────── */}
        {step === "DONE" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
              style={{
                background: "rgba(0,196,161,0.1)",
                border: "3px solid #00C4A1",
              }}
            >
              ✅
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#00C4A1" }}>
                COMPLETE
              </p>
              <p className="text-3xl font-black text-gray-900 mb-2">충전 완료</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                결제는 등록된 카드로 자동 처리됩니다.<br/>케이블을 안전하게 분리해 주세요.
              </p>
            </div>

            <div className="w-full bg-gray-50 rounded-2xl px-6 py-3 border border-gray-100">
              <p className="text-xs text-gray-400 font-medium">
                {chargerType === "RAPID" ? "⚡ 급속충전" : "🔌 완속충전"} · {chargerId}
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-5 rounded-2xl font-black text-xl text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #00C4A1 0%, #00967C 100%)" }}
            >
              처음으로 돌아가기
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
