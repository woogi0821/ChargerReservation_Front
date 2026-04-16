// KioskCharging — 충전 진행 중 화면
// 톤앤매너: 화이트 배경 + 민트(#00C4A1) 포인트

interface KioskChargingProps {
  chargerId: string;
  chargerType: string;   // "RAPID" | "SLOW"
  onStop: () => void;
}

const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
  RAPID: { label: "급속충전", icon: "⚡" },
  SLOW:  { label: "완속충전", icon: "🔌" },
};

const KioskCharging = ({ chargerId, chargerType, onStop }: KioskChargingProps) => {
  const { label, icon } = TYPE_LABEL[chargerType] ?? { label: "충전기", icon: "⚡" };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">

      {/* 민트 원형 애니메이션 */}
      <div className="relative flex items-center justify-center w-44 h-44">
        {/* 바깥 글로우 링 */}
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: "#00C4A1" }}
        />
        {/* 회전 링 */}
        <div
          className="absolute inset-2 rounded-full border-4 animate-spin"
          style={{ borderColor: "#00C4A1", borderTopColor: "transparent" }}
        />
        {/* 내부 아이콘 */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(0,196,161,0.08)",
            border: "3px solid #00C4A1",
          }}
        >
          <span className="text-5xl animate-pulse">{icon}</span>
        </div>
      </div>

      {/* 상태 텍스트 */}
      <div>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#00C4A1" }}>
          CHARGING
        </p>
        <p className="text-3xl font-black text-gray-900 mb-2">충전 중입니다</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          케이블을 분리하지 마세요.<br/>충전이 완료되면 자동으로 알려드립니다.
        </p>
      </div>

      {/* 충전기 정보 */}
      <div className="w-full bg-gray-50 rounded-2xl px-6 py-3 border border-gray-100">
        <p className="text-xs text-gray-400 font-medium">
          {icon} {label} · {chargerId}
        </p>
      </div>

      {/* 강제 종료 버튼 */}
      <button
        onClick={onStop}
        className="w-full py-4 rounded-2xl font-bold text-base border-2 border-red-300 text-red-400 bg-red-50 hover:bg-red-100 transition-all active:scale-95"
      >
        충전 강제 종료
      </button>
    </div>
  );
};

export default KioskCharging;
