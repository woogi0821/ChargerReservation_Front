import React, { useEffect, useRef, useState } from 'react';

interface MapContainerProps {
  rawStations: any[];
  filteredIds: Set<string>;
  selectedStationId: string | null;
  hoveredStationId: string | null;
  onMapInit: (map: any) => void;
  onSearch: (map: any) => void;
  onSelectStation: (id: string) => void;
  isMobileSheetOpen: boolean;
}

declare global {
  interface Window {
    kakao: any;
    selectStationFromMap: (id: string) => void;
  }
}

const MapContainer: React.FC<MapContainerProps> = ({
  rawStations,
  filteredIds,
  selectedStationId,
  hoveredStationId,
  onMapInit,
  onSearch,
  onSelectStation,
  isMobileSheetOpen
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markersMap = useRef<Map<string, { overlay: any; element: HTMLElement }>>(new Map());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // ✅ 최적화 핵심: 마커용 데이터를 별도 관리하여 렌더링 시점을 쪼갭니다.
  const [deferredStations, setDeferredStations] = useState<any[]>([]);

  // 데이터가 들어오면 마커 렌더링을 아주 살짝 지연시켜 목록과 충돌을 피함
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredStations(rawStations);
    }, 100); // 0.1초 지연 (목록이 먼저 그려질 시간을 줌)
    return () => clearTimeout(timer);
  }, [rawStations]);

  // ✅ 내 위치 이동
  const handleMoveToCurrentLocation = () => {
    if (!mapInstance.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const moveLatLon = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        mapInstance.current.panTo(moveLatLon);
        onSearch(mapInstance.current);
      },
      () => alert("위치 정보를 가져올 수 없습니다.")
    );
  };

  // ✅ 지도 초기화 (최초 1회)
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
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        });
        mapInstance.current = map;
        onMapInit(map);
        setIsMapLoaded(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const moveLatLon = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            map.setCenter(moveLatLon);
            onSearch(map);
          },
          () => onSearch(map)
        );
      });
    };
  }, []);

  // ✅ 마커 업데이트 로직 (성능 최적화 버전)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapLoaded) return;

    // 1. 반경 원 업데이트
    if (circleRef.current) circleRef.current.setMap(null);
    circleRef.current = new window.kakao.maps.Circle({
      center: map.getCenter(),
      radius: 1500,
      strokeWeight: 2,
      strokeColor: '#4A90E2',
      strokeOpacity: 0.8,
      strokeStyle: 'dashed',
      fillColor: '#E1F0FF',
      fillOpacity: 0.4,
      zIndex: 1
    });
    circleRef.current.setMap(map);

    // 2. 지연된 데이터를 바탕으로 마커 업데이트
    deferredStations.forEach((item) => {
      let markerObj = markersMap.current.get(item.statId);

      // 마커가 없으면 뼈대 생성
      if (!markerObj) {
        const container = document.createElement('div');
        container.style.cursor = 'pointer';
        container.onclick = () => window.selectStationFromMap(item.statId);
        container.innerHTML = `
          <div class="marker-wrapper" style="display:flex; flex-direction:column; align-items:center; transition: transform 0.2s;">
            <div style="width:30px; height:36px; position:relative;">
              <svg class="marker-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:30px; height:36px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
              <div class="broken-badge" style="display:none; position: absolute; top: -2px; right: -4px; background: #EF4444; color: white; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900;">!</div>
            </div>
            <div class="occupancy-label" style="margin-top:4px; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; transition: all 0.2s; border: 1px solid transparent;"></div>
          </div>`;

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(item.lat, item.lng),
          content: container, yAnchor: 0.9, map: map
        });
        markerObj = { overlay, element: container };
        markersMap.current.set(item.statId, markerObj);
      }

      // 상태 업데이트 (필요한 속성만 직접 조작)
      const isVisible = filteredIds.has(item.statId);
      markerObj.element.style.display = isVisible ? 'block' : 'none';

      if (isVisible) {
        const isSelected = selectedStationId === item.statId;
        const isHovered = hoveredStationId === item.statId;
        const colorMap: any = { green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8" };
        const bgColor = item.warningLevel === 'TOTAL' ? colorMap.black : (colorMap[item.markerColor] || colorMap.gray);

        const wrapper = markerObj.element.querySelector('.marker-wrapper') as HTMLElement;
        const svg = markerObj.element.querySelector('.marker-svg') as HTMLElement;
        const badge = markerObj.element.querySelector('.broken-badge') as HTMLElement;
        const label = markerObj.element.querySelector('.occupancy-label') as HTMLElement;

        wrapper.style.transform = (isSelected || isHovered) ? 'scale(1.3) translateY(-7px)' : 'scale(1)';
        svg.setAttribute('fill', isSelected ? '#2563EB' : bgColor);
        badge.style.display = (item.brokenCount > 0) ? 'flex' : 'none';
        label.textContent = item.occupancy || '0%';
        label.style.background = (isSelected || isHovered) ? '#2563EB' : 'rgba(255,255,255,0.9)';
        label.style.color = (isSelected || isHovered) ? 'white' : '#333';
        label.style.borderColor = bgColor;
        markerObj.overlay.setZIndex(isSelected ? 100 : (isHovered ? 50 : 1));
      }
    });

    // 제거된 마커 정리
    const rawIds = new Set(deferredStations.map(s => s.statId));
    markersMap.current.forEach((obj, id) => {
      if (!rawIds.has(id)) {
        obj.overlay.setMap(null);
        markersMap.current.delete(id);
      }
    });
  }, [deferredStations, filteredIds, selectedStationId, hoveredStationId, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <button
        onClick={handleMoveToCurrentLocation}
        className={`absolute right-6 z-[150] p-3 rounded-xl shadow-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all ${isMobileSheetOpen ? "bottom-[calc(50vh+20px)]" : "bottom-[80px]"} md:bottom-10`}
      >
        <span className="text-xl">🎯</span>
      </button>
    </div>
  );
};

export default MapContainer;