import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CustomSelect, type SelectOption } from "../../components/reservation/CustomSelect";
import type { ReservationRequest, Charger } from "../../types/reservation";

// 🚧 [더미 부품] 아직 김민수, 박은비 팀원의 Input이 도착하지 않았으므로 임시 유지
const DummyInput = ({ placeholder, value, onChange }: any) => (
    <input 
        className="w-full bg-zinc-800 text-white border border-zinc-700 p-3 rounded-lg focus:border-green-500 outline-none" 
        placeholder={placeholder} 
        value={value}
        onChange={onChange} 
    />
);

export const ReservationPage = () => {
    const location = useLocation();
    // 검색 페이지에서 navigate로 넘겨준 selectedCharger 정보를 받습니다.
    const selectedFromSearch = location.state?.selectedCharger as Charger;

    // 1. 예약 요청 데이터 상태 관리
    const [requestData, setRequestData] = useState<ReservationRequest>({
        chargerId: selectedFromSearch?.chargerId || "",
        chargerType: selectedFromSearch?.chargerType || "",
        carNumber: "",
        startTime: "",
    });

    // 2. [충전기 타입 옵션] - 고정값 (급속/완속)
    const chargerTypeOptions: SelectOption[] = [
        { label: "급속 (RAPID)", value: "RAPID" },
        { label: "완속 (SLOW)", value: "SLOW" },
    ];

    // 3. [예약 시간 옵션] - (실무에선 벡엔드에서 예약가능 시간을 받아오지만, 일단 예시 데이터)
    const timeOptions: SelectOption[] = [
        { label: "14:00 (현재 가능)", value: "2026-03-31T14:00:00" },
        { label: "15:00 (현재 가능)", value: "2026-03-31T15:00:00" },
        { label: "16:00 (현재 가능)", value: "2026-03-31T16:00:00" },
    ];

    const handleReservationSubmit = () => {
        if (!requestData.carNumber || !requestData.startTime) {
            alert("모든 정보를 입력해주세요!");
            return;
        }
        console.log("최종 예약 데이터:", requestData);
        // TODO: reservationService.createReservation(requestData) 호출
    };

    return (
        <div className="max-w-xl mx-auto p-8 bg-zinc-900 rounded-2xl my-10 shadow-2xl border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-2">⚡ 충전 예약하기</h2>
            <p className="text-zinc-400 mb-8">{selectedFromSearch?.chargerName || "충전소"} 예약을 진행합니다.</p>

            <div className="flex flex-col gap-6">
                {/* 섹션 1: 충전기 타입 선택 */}
                <div className="flex flex-col gap-2">
                    <label className="text-zinc-300 text-sm font-semibold">충전 방식</label>
                    <CustomSelect 
                        options={chargerTypeOptions}
                        value={requestData.chargerType}
                        placeholder="충전 방식을 골라주세요"
                        onChange={(val) => setRequestData({...requestData, chargerType: val})}
                    />
                </div>

                {/* 섹션 2: 예약 시간 선택 */}
                <div className="flex flex-col gap-2">
                    <label className="text-zinc-300 text-sm font-semibold">시작 시간</label>
                    <CustomSelect 
                        options={timeOptions}
                        value={requestData.startTime}
                        placeholder="시작 시간을 선택하세요"
                        onChange={(val) => setRequestData({...requestData, startTime: val})}
                    />
                </div>

                {/* 섹션 3: 차량 번호 (Dummy Input) */}
                <div className="flex flex-col gap-2">
                    <label className="text-zinc-300 text-sm font-semibold">차량 번호</label>
                    <DummyInput 
                        placeholder="예: 123가4567" 
                        value={requestData.carNumber}
                        onChange={(e: any) => setRequestData({...requestData, carNumber: e.target.value})}
                    />
                </div>

                {/* 하단 버튼 구역 */}
                <button 
                    onClick={handleReservationSubmit}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-xl transition-all mt-4"
                >
                    예약 확정 및 PIN 번호 받기
                </button>
            </div>
        </div>
    );
};