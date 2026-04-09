import { useState } from "react";
import {Button} from "../../components/common/Button" //Button 컴포넌트가 완성되면 받아올것

interface KioskPinPadProps {
    //Pin번호의 최대 길이
    maxLength? : number;
    //사용자가 Pin번호(4자리)를 다 입력했을때 완성된 번호를 부모페이지로 올려주는 알림용 함수
    onComplete : (pin : string) => void; 
}

export const KioskPinPad = ({maxLength = 4 , onComplete} : KioskPinPadProps) => {
    //Pin번호를 기억하는 공간, 처음엔 빈 문자열로 표기
    const [pin,setPin] = useState<string>("");
    //로직 1 숫자를 눌렀을때 실행되는 함수
    const handleNumberClick = (numberStr : string) => {
        if (pin.length < maxLength) {
            const newPin = pin + numberStr;
            setPin(newPin);
            if(newPin.length === maxLength) {
                onComplete(newPin);
            }
        }
    };
    //지우기 함수
    const handleDelete = () => {
        setPin(pin.slice(0,-1));
    };
    //전체삭제 함수
    const handleClear = () => {
        setPin("");
    };

    return(
        <div className="w-full max-w-sm bg-zinc-900 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-center gap-4 mb-8">
                {Array.from({length : maxLength}).map((_,index)=>(
                    <div key={index} className={`w-4 h-4 rounded-full transition-colors ${index < pin.length ? "bg-white" : "bg-zinc-700"}`}></div>
                ))}
            </div>        
            <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6,7,8,9].map((num)=>
                (<Button                    
                    key={num}
                    variant = "primary"
                    size="lg"
                    onClick={()=> handleNumberClick(num.toString())}>
                        {num}
                </Button>
            ))}
            <Button variant="danger" size="lg" onClick={handleClear}>
            전체삭제
            </Button>
            <Button variant="primary" size="lg" onClick={()=>handleNumberClick("0")}>
                0
            </Button>
            <Button variant="outline" size="lg" onClick={handleDelete}>
            ← 지우기
            </Button>
            </div>
        </div>
    );
};