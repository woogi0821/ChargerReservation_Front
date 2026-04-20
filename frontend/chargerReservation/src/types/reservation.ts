// ─────────────────────────────────────────
// ERD 기반 타입 정의 (v0.3 기준)
// ─────────────────────────────────────────

/** 충전기 상태 */
export type ChargerStatus = 'AVAILABLE' | 'CHARGING' | 'RESERVED' | 'BROKEN';

/** 충전기 타입 */
export type ChargerType = 'RAPID' | 'SLOW';

/** 예약 상태 */
export type ReservationStatus = 'RESERVED' | 'CHARGING' | 'DONE' | 'CANCELLED' | 'NO_SHOW';

// ─────────────────────────────────────────
// 충전소 (STATION)
// ─────────────────────────────────────────
export interface Station {
    stationId  : string;
    name       : string;
    address    : string;
    latitude   : number;
    longitude  : number;
    operatorName : string;
    /** 충전소에 속한 충전기 목록 (선택적 — 상세 조회 시 포함) */
    chargers?  : Charger[];
}

// ─────────────────────────────────────────
// 충전기 (CHARGER)
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// 예약 요청/응답 DTO
// ─────────────────────────────────────────

/** 예약 생성 요청 */
export interface ReservationRequest {
    statId      : string;
    chargerId   : string;
    carNumber   : string;
    startTime   : string;   // ISO 8601 형식 (e.g. "2026-04-13T14:00:00")
    chargerType : ChargerType;
}

/** 예약 응답 */
export interface ReservationResponse {
    id              : string;
    chargerId       : string;
    memberId        : number;
    carNumber       : string;
    reservationPin  : string;       // 키오스크 인증용 PIN
    startTime       : string;
    endTime         : string;
    actualEndTime   : string | null;
    status          : ReservationStatus;
    chargerType     : ChargerType;
    version         : number;       // 낙관적 락용 버전
    /** 연관 충전소 정보 (선택적 — 상세 조회 시 포함) */
    station?        : Pick<Station, 'stationId' | 'name' | 'address'>;
}

/** 내 예약 목록 조회 응답 (리스트 아이템) */
export interface MyReservationItem {
    id              : string;
    stationName     : string;
    stationAddress  : string;
    chargerId       : string;
    chargerType     : ChargerType;
    carNumber       : string;
    startTime       : string;
    endTime         : string;
    actualEndTime   : string | null;
    status          : ReservationStatus;
    reservationPin  : string;
}
