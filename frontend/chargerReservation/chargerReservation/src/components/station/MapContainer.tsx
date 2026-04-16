import React, { useEffect, useRef, useState } from 'react';

interface MapContainerProps {
  rawStations: any[];
  filteredIds: Set<string>;
  selectedStationId: string | null;
  hoveredStationId: string | null;
  onMapInit: (map: any) => void;
  onSearch: (map: any) => void;
  onSelectStation: (id: string) => void;
}

declare global { interface Window { kakao: any; selectStationFromMap: (id: string) => void; } }

const MapContainer: React.FC<MapContainerProps> = ({ 
  rawStations, filteredIds, selectedStationId, hoveredStationId, onMapInit, onSearch, onSelectStation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markersMap = useRef<Map<string, { overlay: any; element: HTMLElement }>>(new Map());
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // ✅ 내 위치로 이동 기능 추가
  const handleMoveToCurrentLocation = () => {
    if (!mapInstance.current) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const moveLatLon = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          mapInstance.current.panTo(moveLatLon);
          onSearch(mapInstance.current); // 이동 후 해당 위치 기준 재검색
        },
        () => alert("위치 정보를 가져올 수 없습니다.")
      );
    }
  };

  // 1. 지도 초기화
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
        onMapInit(map);
        setIsMapLoaded(true);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const moveLatLon = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
              map.setCenter(moveLatLon);
              onSearch(map);
            },
            () => onSearch(map)
          );
        } else onSearch(map);
      });
    };
  }, []);

  // 2. 선택된 스테이션으로 지도 중심 이동 (PanTo)
  useEffect(() => {
    if (!mapInstance.current || !selectedStationId) return;
    const selected = rawStations.find(s => s.statId === selectedStationId);
    if (selected?.lat && selected?.lng) {
      mapInstance.current.panTo(new window.kakao.maps.LatLng(selected.lat, selected.lng));
    }
  }, [selectedStationId, rawStations]);

  // 3. 마커 렌더링 및 필터링 제어
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapLoaded) return;

    if (circleRef.current) circleRef.current.setMap(null);
    const center = map.getCenter();
    circleRef.current = new window.kakao.maps.Circle({
      center: center, radius: 1500, strokeWeight: 2, strokeColor: '#4A90E2',
      strokeOpacity: 0.8, strokeStyle: 'dashed', fillColor: '#E1F0FF', fillOpacity: 0.4, zIndex: 1
    });
    circleRef.current.setMap(map);

    rawStations.forEach((item) => {
      let markerObj = markersMap.current.get(item.statId);
      if (!markerObj) {
        const container = document.createElement('div');
        container.style.cursor = 'pointer';
        container.onclick = () => window.selectStationFromMap(item.statId);
        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(item.lat, item.lng),
          content: container, yAnchor: 0.9, map: map
        });
        markerObj = { overlay, element: container };
        markersMap.current.set(item.statId, markerObj);
      }

      const isVisible = filteredIds.has(item.statId);
      markerObj.element.style.display = isVisible ? 'block' : 'none';

      if (isVisible) {
        const isSelected = selectedStationId === item.statId;
        const isHovered = hoveredStationId === item.statId;
        const hasBroken = item.brokenCount > 0; 
        
        const colorMap: any = { green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8" };
        const bgColor = item.warningLevel === 'TOTAL' ? colorMap.black : (colorMap[item.markerColor] || colorMap.gray);

        markerObj.element.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; transition: transform 0.2s; transform: ${isSelected || isHovered ? 'scale(1.3) translateY(-7px)' : 'scale(1)'}">
            <div style="width:30px; height:36px; position:relative;">
              <svg viewBox="0 0 24 24" fill="${isSelected ? '#2563EB' : bgColor}" xmlns="http://www.w3.org/2000/svg" style="width:30px; height:36px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
              ${hasBroken ? `
                <div style="position: absolute; top: -2px; right: -4px; background: #EF4444; color: white; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">!</div>
              ` : ''}
            </div>
            <div style="margin-top:4px; background:${isSelected || isHovered ? '#2563EB' : 'rgba(255,255,255,0.9)'}; color:${isSelected || isHovered ? 'white' : '#333'}; border:1px solid ${bgColor}; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space:nowrap;">
              ${item.occupancy || '0%'}
            </div>
          </div>`;
        markerObj.overlay.setZIndex(isSelected ? 100 : (isHovered ? 50 : 1));
      }
    });

    const rawIds = new Set(rawStations.map(s => s.statId));
    markersMap.current.forEach((obj, id) => {
      if (!rawIds.has(id)) {
        obj.overlay.setMap(null);
        markersMap.current.delete(id);
      }
    });
  }, [rawStations, filteredIds, selectedStationId, hoveredStationId, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* ✅ 내 위치로 가기 버튼 추가 */}
      <button 
        onClick={handleMoveToCurrentLocation}
        className="absolute bottom-10 right-6 z-50 bg-white p-3 rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
      >
        <span className="text-xl">🎯</span>
      </button>
    </div>
  );
};

export default MapContainer;