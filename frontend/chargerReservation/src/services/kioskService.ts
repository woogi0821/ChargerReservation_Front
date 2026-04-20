import common from "../common/commonservice";

export interface KioskAuthRequest {
    statId    : string;
    chargerId : string;
    pin       : string;
}

const kioskService = {
    // PIN 검증 — POST /api/kiosk/auth
    auth: async (data: KioskAuthRequest): Promise<string> => {
        const response = await common.post<string>("/kiosk/auth", data);
        return response.data;
    },

    // 충전 강제 중지 — POST /api/kiosk/stop
    stop: async (statId: string, chargerId: string): Promise<void> => {
        await common.post("/kiosk/stop", { statId, chargerId });
    },

    // 충전 정상 종료 — POST /api/kiosk/end
    end: async (statId: string, chargerId: string): Promise<void> => {
        await common.post("/kiosk/end", { statId, chargerId });
    },

    // 충전기 현재 상태 조회 — GET /api/kiosk/status/{chargerId}
    getStatus: async (chargerId: string): Promise<string> => {
        const response = await common.get<string>(`/kiosk/status/${chargerId}`);
        return response.data;
    },
};

export default kioskService;
