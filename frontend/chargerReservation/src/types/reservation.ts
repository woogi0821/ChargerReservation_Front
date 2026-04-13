export interface Charger {
    chargerId : string;
    chargerName : string;
    address : string;
    chargerType : 'RAPID' | 'SLOW';
    status : 'AVAILABLE' | 'CHARGING' | 'RESERVED' | 'BROKEN' ;
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