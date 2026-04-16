import { useState } from "react";
// import { Button } from "../common" // Button 컴포넌트 완성 시 주석 해제

interface KioskPinPadProps {
    maxLength?: number;
    onComplete: (pin: string) => void;
}

export const KioskPinPad = ({ maxLength = 4, onComplete }: KioskPinPadProps) => {
    const [pin, setPin] = useState<string>("");

    const handleNumberClick = (numberStr: string) => {
        if (pin.length < maxLength) {
            const newPin = pin + numberStr;
            setPin(newPin);
            if (newPin.length === maxLength) {
                onComplete(newPin);
            }
        }
    };

    const handleDelete = () => setPin(pin.slice(0, -1));
    const handleClear = () => setPin("");

    // Button 컴포넌트 완성 전 임시 스타일 맵
    // Button 완성 시 아래 tempButtonClass 제거하고 Button 컴포넌트로 교체
    const tempButtonClass = {
        secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
        danger:    "bg-red-500 text-white hover:bg-red-600",
        outline:   "border-2 border-zinc-500 text-white hover:bg-zinc-700",
    };

    return (
        <div className="w-full max-w-sm bg-zinc-900 p-6 rounded-2xl shadow-lg">

            {/* PIN 입력 표시 점 */}
            <div className="flex justify-center gap-4 mb-8">
                {Array.from({ length: maxLength }).map((_, index) => (
                    <div
                        key={index}
                        className={`w-4 h-4 rounded-full transition-colors ${
                            index < pin.length ? "bg-white" : "bg-zinc-700"
                        }`}
                    />
                ))}
            </div>

            {/* 숫자 패드 */}
            <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6,7,8,9].map((num) => (
                    // TODO: Button 완성 시 → <Button variant="secondary" size="lg">
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className={`py-4 rounded-xl font-bold text-lg transition-all ${tempButtonClass.secondary}`}
                    >
                        {num}
                    </button>
                ))}

                {/* TODO: Button 완성 시 → <Button variant="danger" size="lg"> */}
                <button
                    onClick={handleClear}
                    className={`py-4 rounded-xl font-bold text-sm transition-all ${tempButtonClass.danger}`}
                >
                    전체삭제
                </button>

                {/* TODO: Button 완성 시 → <Button variant="secondary" size="lg"> */}
                <button
                    onClick={() => handleNumberClick("0")}
                    className={`py-4 rounded-xl font-bold text-lg transition-all ${tempButtonClass.secondary}`}
                >
                    0
                </button>

                {/* TODO: Button 완성 시 → <Button variant="outline" size="lg"> */}
                <button
                    onClick={handleDelete}
                    className={`py-4 rounded-xl font-bold text-sm transition-all ${tempButtonClass.outline}`}
                >
                    ← 지우기
                </button>
            </div>
        </div>
    );
};