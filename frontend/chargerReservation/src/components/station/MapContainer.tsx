import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
    selectStationFromMap: (id: string) => void;
  }
}

interface MapContainerProps {
  rawStations: any[];
  filteredIds: Set<string>;
  selectedStationId: string | null;
  hoveredStationId: string | null;
  onCreateMap: (map: any) => void;
  onSelectStation: (id: string) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  rawStations, 
  filteredIds, 
  selectedStationId, 
  hoveredStationId, 
  onCreateMap,
  onSelectStation 
}) => {

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersMap = useRef<Map<string, { overlay: any; element: HTMLElement }>>(new Map());

  // ✅ 지도 생성
  useEffect(() => {
    window.selectStationFromMap = (id: string) => onSelectStation(id);

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
        onCreateMap(map);
      });
    };
  }, [onCreateMap, onSelectStation]);

  // ✅ 마커 생성 + 필터 적용
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || rawStations.length === 0) return;

    rawStations.forEach((item: any) => {
      let markerObj = markersMap.current.get(item.statId);

      // 👉 최초 생성
      if (!markerObj) {
        const container = document.createElement('div');
        container.style.cursor = 'pointer';
        container.onclick = () => window.selectStationFromMap(item.statId);

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(item.lat, item.lng),
          content: container,
          yAnchor: 0.9
        });

        overlay.setMap(map);
        markersMap.current.set(item.statId, { overlay, element: container });
        markerObj = markersMap.current.get(item.statId);
      }

      // 👉 필터 적용 (핵심)
      const isVisible = filteredIds.has(item.statId);
      markerObj!.element.style.display = isVisible ? 'block' : 'none';

      // 👉 보이는 마커만 렌더링
      if (isVisible) {
        const isSelected = selectedStationId === item.statId;
        const isHovered = hoveredStationId === item.statId;

        const colorMap: any = {
          green: "#22C55E",
          amber: "#F59E0B",
          red: "#EF4444",
          black: "#1F2937",
          gray: "#94A3B8"
        };

        const bgColor =
          item.warningLevel === 'TOTAL'
            ? colorMap.black
            : colorMap[item.markerColor] || colorMap.gray;

        markerObj!.element.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; transition: transform 0.2s; transform: ${
            isSelected || isHovered ? 'scale(1.3) translateY(-7px)' : 'scale(1)'
          }">
            <div style="width:30px; height:36px;">
              <svg viewBox="0 0 24 24" fill="${isSelected ? '#2563EB' : bgColor}" xmlns="http://www.w3.org/2000/svg" style="width:30px; height:36px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
            </div>
            <div style="margin-top:4px; background:${isSelected || isHovered ? '#2563EB' : 'rgba(255,255,255,0.9)'}; color:${isSelected || isHovered ? 'white' : '#333'}; border:1px solid ${bgColor}; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold;">
              ${item.occupancy || '0%'}
            </div>
          </div>
        `;

        markerObj!.overlay.setZIndex(isSelected ? 100 : (isHovered ? 50 : 1));
      }
    });
  }, [rawStations, filteredIds, selectedStationId, hoveredStationId]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapContainer;