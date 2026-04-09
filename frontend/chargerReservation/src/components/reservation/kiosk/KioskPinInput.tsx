import { useState } from "react";
import common from "../../../common/commonservice";

interface Uiconfig {
    label : string;
    icon : string;
    color : string;
    badgeClass : string;
    dotClass : string;
}

interface KioskPinPadProps {
    chargerId : string;
    uiConfig : Uiconfig;
}

const KioskPinInput = ({chargerId, uiConfig} : KioksPinInputProps) => {
    const [pin, setPin] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    //PIN 인증 요청 -> 백엔드 /api/kiosk/auth
    //성공 시 WebSocket으로 CHARGING 상태 수신 -> 화면 자동 전환
    const submitPin = async (pinValue : string) => {
        setIsLoading(true);
        try{
            await common.post("/kiosk/auth", {
                chargerId,
                pin : pinValue,
            });
        } catch {
            setHasError(true);
            setPin("");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinInput = (num : string) => {
        if(pin.length >= 4) return;
        const newPin = pin + num;
        setPin(newPin);
        setHasError(false);
        //4자리 완성 시 자동 인증
        if(newPin.length === 4) submitPin(newPin);
    };

    //임시 PIN 패드 버튼 배열 (KioskPinpa 컴포넌트로 교체예정-Button컴포넌트 완료시)
    const padButtons = ["1","2","3","4","5","6","7","8","9","←","0","✓"];
    return (
        <div className="flex flex-col items-center gap-8 px-16 py-10 w-full max-w-sm">
            <p className="text-sm font-black tracking-widest" style={{color : uiConfig.color}}>
                CHAEVI 채비
            </p>
            <div className="text-center">
                <p className="text-2xl font-extrabold text-white mb-2">
                    예약이 확인되었습니다.
                </p>
                <p className="text-sm text-white/55">
                {uiConfig.icon} {uiConfig.label}· 충전기 {chargerId}
                </p>
            </div>
            <div className="flex gap-4 items-center">
                {[0,1,2,3].map((i)=>(
                    <div key={i}
                    className="w-5 h-5 rounded-full transition-all duration-150"
                    style={{background : i < pin.length ? uiConfig.color : "rgba(255,255,255,0.2)",
                        transform : i < pin.length ? "scale(1.2)" : "scale(1)",
                    }}>
                    </div>
                ))}
            </div>
            {hasError && (
                <p className="text-red-400 text-sm font-semibold">
                    PIN이 일치하지 않습니다. 다시 입력하세요.
                </p>
            )}
        </div>
    )
}