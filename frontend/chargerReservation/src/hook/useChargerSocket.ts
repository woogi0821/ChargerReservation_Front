// [ AWS 배포 픽스 목록 ]
// 1. .env.development / .env.production 파일 생성
// 2. commonservice.ts - baseURL 환경변수로 교체
// 3. useChargerSocket.ts - WS_URL 환경변수로 교체
// 4. SecurityConfig.java - CORS 도메인 EC2 주소로 지정
// 5. WebSocketConfig.java - setAllowedOriginPatterns 도메인 지정
//================================================================
// 해당 파일은 철저하게 WebSocket 연결과 충전기 상태 수신만 책임집니다.
// 커스텀 훅이기때문에 화면에 어떻게 보일지는 전혀 신경쓰지 않는 순수 메소드 파일입니다.
import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = "http://localhost:8080/ws-charger";

export const useChargerSocket = (statId: string, chargerId: string) => {
    // 현재 충전기의 상태 (AVAILABLE, RESERVED, CHARGING, BROKEN 등)
    const [chargerStatus, setChargerStatus] = useState<string>("AVAILABLE");
    // WebSocket 연결 상태
    const [isConnected, setIsConnected] = useState<boolean>(false);
    // 브로드캐스트 모드에서 수신된 chargerId
    const [broadcastChargerId, setBroadcastChargerId] = useState<string>("");

    useEffect(() => {
        // statId, chargerId 둘 다 없으면 브로드캐스트 모드
        const isBroadcastMode = !statId && !chargerId;
        // 특정 충전기 모드인데 값이 없으면 연결 안 함
        if (!isBroadcastMode && (!statId || !chargerId)) return;

        // STOMP 클라이언트 생성
        // SockJS를 통해 연결 (WebSocket 미지원 브라우저 폴백 지원)
        const client = new Client({
            // SockJS 팩토리 함수: STOMP가 연결할 때 이 함수를 호출해서 소켓 생성
            webSocketFactory: () => new SockJS(WS_URL),
            // 연결 성공 시 실행되는 콜백
            onConnect: () => {
                setIsConnected(true);

                if (isBroadcastMode) {
                    // 브로드캐스트 모드: 전체 예약 이벤트 구독
                    // 백엔드 발행 payload: {"statId":"XXX","chargerId":"YYY","status":"RESERVED"}
                    client.subscribe(`/topic/reservation/new`, (message) => {
                        try {
                            const data = JSON.parse(message.body);
                            setBroadcastChargerId(data.chargerId ?? "");
                            setChargerStatus(data.status ?? "RESERVED");
                        } catch {
                            setChargerStatus(message.body);
                        }
                    });
                } else {
                    // 특정 충전기 모드: statId_chargerId 채널 구독
                    client.subscribe(`/topic/charger/${statId}_${chargerId}`, (message) => {
                        // message.body = 백엔드에서 보낸 상태값 문자열
                        // 예) "RESERVED", "CHARGING", "AVAILABLE", "BROKEN"
                        setChargerStatus(message.body);
                    });
                }
            },
            // 연결 끊겼을 때 실행되는 콜백
            onDisconnect: () => {
                setIsConnected(false);
            },
            // 에러 발생 시 콘솔 출력
            onStompError: (frame) => {
                console.error("STOMP 에러 발생", frame);
                setIsConnected(false);
            },
        });

        // STOMP 연결 시작
        client.activate();

        // 컴포넌트 언마운트 시 연결 해제 (메모리 누수 방지)
        return () => {
            client.deactivate();
        };
    }, [statId, chargerId]);

    return {
        chargerStatus,
        isConnected,
        broadcastChargerId,
    };
};
