import common from "../common/commonservice";
import type { ReservationRequest, ReservationResponse, Charger } from "../types/reservation";

const reservationService = {
    // 예약 생성
    createReservation : async (data: ReservationRequest) : Promise<ReservationResponse> => {
        const response = await common.post<ReservationResponse>("/reservation", data, {
            headers : {
                "X-Member-Id" : 1
            }
        });
        return response.data;
    },

    // 내 예약 목록 조회
    getMyReservation : async (memberId : number) => {
        const response = await common.get(`/reservations/member/${memberId}`);
        return response.data;
    },

    // 특정 충전소의 충전기 목록 조회 (statId 기준)
    // → StationDetail 예약하기 버튼에서 호출 (외부 statId → 내부 Charger 목록)
    getChargersByStation : async (statId: string) : Promise<Charger[]> => {
        const response = await common.get<Charger[]>(`/chargers/station/${statId}`);
        return response.data;
    },

    // 예약 취소
    cancelReservation : async (reservationId: string) : Promise<void> => {
        await common.patch(`/reservation/${reservationId}/cancel`, {}, {
            headers : {
                "X-Member-Id" : 1
            }
        });
    }
};
export default reservationService;