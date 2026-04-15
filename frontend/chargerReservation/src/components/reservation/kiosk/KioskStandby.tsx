// KioskStandby — 대기 화면 (AVAILABLE / RESERVED / BROKEN)
// 톤앤매너: 화이트 배경 + 민트(#00C4A1) 포인트

interface KioskStandbyProps {
  chargerStatus: string;   // "AVAILABLE" | "RESERVED" | "BROKEN"
  chargerType: string;     // "RAPID" | "SLOW"
  chargerId: string;
  onPinInputStart: () => void;
}

const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
  RAPID: { label: "급속충전", icon: "⚡" },
  SLOW:  { label: "완속충전", icon: "🔌" },
};

const KioskStandby = ({ chargerStatus, chargerType, chargerId, onPinInputStart }: KioskStandbyProps) => {
  const { label, icon } = TYPE_LABEL[chargerType] ?? { label: "충전기", icon: "⚡" };

  // ── BROKEN ───────────────────────────────────────────────────────────────
  if (chargerStatus === "BROKEN") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
        <div className="w-32 h-32 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center">
          <span className="text-5xl">⚠️</span>
        </div>
        <div>
          <p className="text-2xl font-black text-red-500 mb-1">점검 중</p>
          <p className="text-sm text-gray-400">현재 이용이 불가합니다.<br/>불편을 드려 죄송합니다.</p>
        </div>
        <div className="w-full bg-gray-50 rounded-2xl px-6 py-3 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium">{icon} {label} · {chargerId}</p>
        </div>
      </div>
    );
  }

  // ── RESERVED ─────────────────────────────────────────────────────────────
  if (chargerStatus === "RESERVED") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
        {/* 민트 글로우 아이콘 */}
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center animate-pulse"
          style={{
            background: "rgba(0,196,161,0.08)",
            border: "3px solid #00C4A1",
            boxShadow: "0 0 40px rgba(0,196,161,0.25)",
          }}
        >
          <span className="text-6xl">🔒</span>
        </div>

        <div>
          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#00C4A1" }}>
            RESERVED
          </p>
          <p className="text-3xl font-black text-gray-900 mb-2">예약된 충전기입니다</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            예약 고객님은 아래 버튼을 눌러<br/>
            앱에서 발급받은 <strong>PIN 번호</strong>를 입력해 주세요.
          </p>
        </div>

        <div className="w-full bg-gray-50 rounded-2xl px-6 py-3 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium">{icon} {label} · {chargerId}</p>
        </div>

        <button
          onClick={onPinInputStart}
          className="w-full py-5 rounded-2xl font-black text-xl text-white transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #00C4A1 0%, #00967C 100%)" }}
        >
          PIN 번호 입력하기
        </button>
      </div>
    );
  }

  // ── AVAILABLE (기본) ──────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
      <div
        className="w-36 h-36 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(0,196,161,0.08)",
          border: "3px solid #00C4A1",
          boxShadow: "0 0 40px rgba(0,196,161,0.15)",
        }}
      >
        <span className="text-6xl">{icon}</span>
      </div>

      <div>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#00C4A1" }}>
          AVAILABLE
        </p>
        <p className="text-3xl font-black text-gray-900 mb-2">사용 가능</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          앱에서 미리 예약하시거나<br/>현장에서 바로 충전하세요.
        </p>
      </div>

      <div className="w-full bg-gray-50 rounded-2xl px-6 py-3 border border-gray-100">
        <p className="text-xs text-gray-400 font-medium">{icon} {label} · {chargerId}</p>
      </div>

      <button
        className="w-full py-5 rounded-2xl font-bold text-lg border-2 text-gray-600 bg-white hover:bg-gray-50 transition-all active:scale-95"
        style={{ borderColor: "#E5E7EB" }}
      >
        현장 결제로 시작하기
      </button>
    </div>
  );
};

export default KioskStandby;
