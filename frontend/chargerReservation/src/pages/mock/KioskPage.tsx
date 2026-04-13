import { useState, useEffect } from "react";

type KioskStep = "IDLE" | "PIN_INPUT" | "VERIFYING" | "CHARGING" | "DONE";

export const ChargerMain = () => {
  // 상태 관리
  const [step, setStep] = useState<KioskStep>("IDLE");
  const [isReserved, setIsReserved] = useState(false); // 백엔드 예약 신호 (모킹용)
  const [pin, setPin] = useState("");
  const [chargeProgress, setChargeProgress] = useState(0);

  // ----------------------------------------
  // 1. 키패드 동작 로직 (이전과 동일)
  // ----------------------------------------
  const handleNumberClick = (num: string) => {
    if (pin.length < 4) setPin((prev) => prev + num);
  };

  const handleClear = () => setPin("");

  // ----------------------------------------
  // 2. PIN 번호 자동 검증 로직
  // ----------------------------------------
  useEffect(() => {
    if (pin.length === 4 && step === "PIN_INPUT") {
      setStep("VERIFYING");
      // 1.5초 후 진짜 충전 시작 (나중에 백엔드 API 호출로 대체할 곳)
      setTimeout(() => setStep("CHARGING"), 1500);
    }
  }, [pin, step]);

  // ----------------------------------------
  // 3. 충전 진행 애니메이션 로직
  // ----------------------------------------
  useEffect(() => {
    if (step === "CHARGING") {
      const timer = setInterval(() => {
        setChargeProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setStep("DONE");
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 진행 속도 조절
      return () => clearInterval(timer);
    }
  }, [step]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans text-white select-none relative">
      
      {/* 🛠️ [시연용] 백엔드 예약 신호 시뮬레이터 (우측 상단) */}
      <div className="absolute top-10 right-10 bg-white/10 p-4 rounded-xl border border-white/20">
        <p className="text-xs text-zinc-400 mb-2">백엔드 웹소켓 시뮬레이터</p>
        <button 
          onClick={() => { setIsReserved(!isReserved); setStep("IDLE"); setPin(""); }}
          className={`px-4 py-2 rounded font-bold text-sm w-full ${isReserved ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {isReserved ? "예약 취소 신호 받기" : "앱에서 예약 신호 받기!"}
        </button>
      </div>

      {/* 키오스크 본체 */}
      <div className="w-[480px] h-[800px] bg-black rounded-[40px] shadow-2xl border-8 border-zinc-800 flex flex-col overflow-hidden relative">
        
        {/* 상단 헤더 (예약 상태에 따라 색상 변경) */}
        <div className={`p-6 flex justify-between items-center border-b ${isReserved ? 'bg-amber-900/40 border-amber-900' : 'bg-zinc-900 border-zinc-800'} transition-colors duration-500`}>
          <div>
            <h1 className="text-white font-black text-xl italic tracking-tighter">TeamProject</h1>
            <p className="text-zinc-400 text-xs">Station #01</p>
          </div>
          <div className="text-zinc-400 font-bold">16:00</div>
        </div>

        {/* ======================================== */}
        {/* 화면 1: 대기 화면 (사용가능 / 예약잠금)  */}
        {/* ======================================== */}
        {step === "IDLE" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center transition-all duration-500">
            {isReserved ? (
              <>
                <div className="w-40 h-40 bg-amber-900/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-pulse">
                  <span className="text-6xl">🔒</span>
                </div>
                <h2 className="text-3xl font-black mb-2 text-amber-500">예약된 충전기입니다</h2>
                <p className="text-zinc-400 mb-12">예약 고객님은 화면을 터치하여<br/>발급받은 PIN 번호를 입력해 주세요.</p>
                <button onClick={() => setStep("PIN_INPUT")} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-5 rounded-xl text-xl shadow-lg transition-all active:scale-95">
                  PIN 번호 입력하기
                </button>
              </>
            ) : (
              <>
                <div className="w-40 h-40 bg-green-900/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                  <span className="text-6xl">⚡</span>
                </div>
                <h2 className="text-3xl font-black mb-2 text-green-500">사용 가능</h2>
                <p className="text-zinc-400 mb-12">앱에서 미리 예약하시거나,<br/>화면을 터치하여 바로 충전하세요.</p>
                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-5 rounded-xl text-xl transition-all active:scale-95">
                  현장 결제로 시작하기
                </button>
              </>
            )}
          </div>
        )}

        {/* ======================================== */}
        {/* 화면 2: PIN 번호 입력 및 검증 중         */}
        {/* ======================================== */}
        {(step === "PIN_INPUT" || step === "VERIFYING") && (
          <div className="flex-1 flex flex-col p-8">
            <div className="text-center mt-4 mb-8">
              <h2 className="text-3xl font-bold mb-2 text-amber-500">예약 핀 번호 입력</h2>
              <p className="text-zinc-400">앱에서 발급받은 4자리 PIN 번호를 입력해 주세요.</p>
            </div>

            {/* 입력창 */}
            <div className="flex justify-center gap-4 mb-12">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className={`w-16 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold border-2 transition-all ${
                  step === "VERIFYING" ? "border-amber-500 text-amber-500 bg-amber-900/20" : pin[index] ? "border-white bg-zinc-800" : "border-zinc-700 text-zinc-700"
                }`}>
                  {step === "VERIFYING" ? "✓" : (pin[index] ? "*" : "·")}
                </div>
              ))}
            </div>

            {/* 검증 애니메이션 OR 숫자 키패드 */}
            {step === "VERIFYING" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-amber-500 animate-pulse">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold">예약 정보 확인 중...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button key={num} onClick={() => handleNumberClick(num.toString())} className="bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 text-3xl font-bold py-6 rounded-2xl transition-colors">
                    {num}
                  </button>
                ))}
                <button onClick={handleClear} className="bg-red-900/30 text-red-500 text-xl font-bold py-6 rounded-2xl">지움</button>
                <button onClick={() => handleNumberClick("0")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 text-3xl font-bold py-6 rounded-2xl transition-colors">0</button>
                <button onClick={() => {setStep("IDLE"); setPin("");}} className="bg-zinc-800/50 text-zinc-400 text-xl font-bold py-6 rounded-2xl">뒤로</button>
              </div>
            )}
          </div>
        )}

        {/* ======================================== */}
        {/* 화면 3: 충전 진행 중                     */}
        {/* ======================================== */}
        {step === "CHARGING" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
            <h2 className="text-2xl font-bold text-green-500 mb-2 animate-pulse">⚡ 초급속 충전 중...</h2>
            <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-8 border-zinc-800 mb-12 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
              <div className="flex flex-col items-center">
                <span className="text-7xl font-black text-white">{chargeProgress}</span>
                <span className="text-xl text-green-500 font-bold">%</span>
              </div>
            </div>
            <button onClick={() => setStep("DONE")} className="mt-auto w-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-4 rounded-xl transition-all">
              충전 강제 종료
            </button>
          </div>
        )}

        {/* ======================================== */}
        {/* 화면 4: 충전 완료                        */}
        {/* ======================================== */}
        {step === "DONE" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-5xl mb-8 shadow-[0_0_30px_rgba(34,197,94,0.5)]">✓</div>
            <h2 className="text-4xl font-black text-white mb-4">충전 완료</h2>
            <p className="text-zinc-400 mb-12">결제는 등록된 카드로 자동 진행됩니다.<br/>케이블을 분리해 주세요.</p>
            
            <button 
              onClick={() => {
                setStep("IDLE"); 
                setPin(""); 
                setChargeProgress(0); 
                setIsReserved(false); // ⭐️ 충전이 끝나면 다시 기계를 빈 상태로 풀어줍니다!
              }} 
              className="w-full bg-white text-black hover:bg-green-500 hover:text-white font-bold py-5 rounded-xl transition-all text-lg mt-8 active:scale-95"
            >
              처음으로 돌아가기
            </button>
          </div>
        )}

      </div>
    </div>
  );
};