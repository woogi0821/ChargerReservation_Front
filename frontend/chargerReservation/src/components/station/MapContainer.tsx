import React, { useEffect, useRef, useState } from 'react';

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

interface MapContainerProps {
  latitude?: number;
  longitude?: number;
  level?: number;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  latitude = 37.5013, 
  longitude = 127.0397, 
  level = 5 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // 1. 지도 초기화 (app.js의 initKakaoMap)
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(latitude, longitude),
      level: level
    };

    const kakaoMap = new window.kakao.maps.Map(container, options);
    setMap(kakaoMap);

    // 지도 이동이 멈췄을 때 데이터 업데이트 (app.js의 idle 이벤트)
    window.kakao.maps.event.addListener(kakaoMap, 'idle', () => {
      fetchEVStations(kakaoMap);
    });
  }, []);

  // 2. 충전소 데이터 가져오기 (app.js의 fetchEVStations)
  const fetchEVStations = async (targetMap: any) => {
    const EV_KEY = "6ebd5febab70800594860d7682eab328c14df15b1e1dfac30a7a011942ee6c3f";
    // 예시로 서울(zcode=11) 데이터를 가져오는 API 주소
    const url = `https://apis.data.go.kr/B552584/EvCharger/getChargerInfo?serviceKey=${EV_KEY}&numOfRows=30&pageNo=1&zcode=11`;

    try {
      const response = await fetch(url);
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const items = Array.from(xmlDoc.getElementsByTagName("item"));

      displayMarkers(targetMap, items);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  // 3. 마커 표시 (app.js의 displayEVMarkers)
  const displayMarkers = (targetMap: any, items: any[]) => {
    // 기존 마커 제거
    markers.forEach(m => m.setMap(null));
    
    const newMarkers = items.map(item => {
      const lat = parseFloat(item.getElementsByTagName("lat")[0].textContent || "0");
      const lng = parseFloat(item.getElementsByTagName("lng")[0].textContent || "0");
      const statNm = item.getElementsByTagName("statNm")[0].textContent;

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(lat, lng),
        map: targetMap,
        title: statNm
      });

      return marker;
    });

    setMarkers(newMarkers);
  };

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: '100%', minHeight: '500px' }} 
    />
  );
};

export default MapContainer;