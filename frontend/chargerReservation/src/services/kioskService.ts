import common from "../common/commonservice";

export interface KioskAuthRequest {
    chargerId: string;
    pin: string;
}

const kioskService = {
    // PIN 검증 — POST /api/kiosk/auth
    // 응답: string ("SUCCESS" 또는 에러 메시지)
    auth: async (data: KioskAuthRequest): Promise<string> => {
        const response = await common.post<string>("/kiosk/auth", data);
        return response.data;
    },

    // 충전 강제 중지 — POST /api/kiosk/stop
    stop: async (chargerId: string): Promise<void> => {
        await common.post("/kiosk/stop", { chargerId });
    },

    // 충전 정상 종료 — POST /api/kiosk/end
    end: async (chargerId: string): Promise<void> => {
        await common.post("/kiosk/end", { chargerId });
    },

    // 충전기 현재 상태 조회 — GET /api/kiosk/status/{chargerId}
    getStatus: async (chargerId: string): Promise<string> => {
        const response = await common.get<string>(`/kiosk/status/${chargerId}`);
        return response.data;
    },
};

export default kioskService;
