import common from "../common/commonservice";
import type { ReservationRequest, ReservationResponse } from "../types/reservation";

const reservationService = {
    createReservation : async (data: ReservationRequest) : Promise<ReservationResponse> => {
        const response = await common.post<ReservationResponse>("/reservation",data,{
            headers : {
                "X-Member-Id" : 1
            }
        });
        return response.data;
    },
    getMyReservation : async (memberId : number) => {
        const response = await common.get(`/reservations/member/${memberId}`);
        return response.data;
    }
};
export default reservationService;