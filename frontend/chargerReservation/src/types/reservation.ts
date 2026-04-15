export interface Charger {
    chgerId : string;       // 충전기 ID (API: chgerId)
    statId : string;        // 충전소 ID (API: statId)
    chargerName : string;
    address : string;
    fast : boolean;         // 급속 여부 (API: fast)
    chargerTypeNm : string; // 충전 방식 한글 (API: chargerTypeNm) — "급속" | "완속"
    chgerType : string;     // 충전 타입 코드 (API: chgerType) — "RAPID" | "SLOW"
    stat : string;          // 상태 코드 (API: stat) — "2":예약가능 "3":충전중 "9":점검중
    status : string;        // 상태 영문 (API: status) — "AVAILABLE" | "CHARGING"
}

export interface ReservationRequest {
    chargerId : string;
    carNumber : string;
    startTime : string;
    chargerType : string;
}

export interface ReservationResponse {
    id : string;
    chargerId : string;
    carNumber : string;
    reservationPin : string;
    startTime : string;
    endTime : string;
    status : string;
    actualEndTime : string;
    chargerType : string;
}