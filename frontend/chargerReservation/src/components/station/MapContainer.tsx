import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapContainerProps {
  rawStations: any[];
  // 부모로부터 지도 객체를 설정받기 위한 함수 (Stations.tsx에서 사용)
  onCreateMap: (map: any) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ rawStations, onCreateMap }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5cc1f47f2bb48afc9e7ef7f4c698644b&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5
        });
        mapInstance.current = map;
        onCreateMap(map); // 부모(Stations)에게 map 객체 전달
      });
    };
  }, []);

  // 마커 렌더링 로직 (기존과 동일)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach(m => m.setMap(null));
    const newOverlays = rawStations.map((item: any) => {
      const colorMap: any = { green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8" };
      const bgColor = item.warningLevel === 'TOTAL' ? colorMap.black : (colorMap[item.markerColor] || colorMap.gray);
      const hasWarning = item.warningLevel === 'PARTIAL' || item.warningLevel === 'TOTAL';

      const content = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="position:relative; width:30px; height:36px;">
             <svg viewBox="0 0 24 24" fill="${bgColor}" xmlns="http://www.w3.org/2000/svg" style="width:30px; height:36px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">
               <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
               <circle cx="12" cy="9" r="3" fill="white"/>
             </svg>
             ${hasWarning ? `<div style="position:absolute; top:-2px; right:-5px; background:#FF3B30; color:white; width:15px; height:15px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; border:1px solid white;">!</div>` : ''}
          </div>
          <div style="margin-top:4px; background:rgba(255,255,255,0.9); border:1px solid ${bgColor}; color:#333; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,0.15);">
            ${item.occupancy || '0%'}
          </div>
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(item.lat, item.lng),
        content,
        yAnchor: 0.9
      });
      overlay.setMap(map);
      return overlay;
    });
    markersRef.current = newOverlays;
  }, [rawStations]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapContainer;