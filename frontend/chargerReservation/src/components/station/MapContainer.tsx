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
  const clustererRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  
  // ✅ 원의 중심을 고정하기 위한 Ref
  const circleCenterRef = useRef<any>(null);
  
  const markersMap = useRef<Map<string, { overlay: any; element: HTMLElement }>>(new Map());
  const kakaoMarkersMap = useRef<Map<string, any>>(new Map());

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [deferredStations, setDeferredStations] = useState<any[]>([]);
  const [mapLevel, setMapLevel] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredStations(rawStations);
    }, 100);
    return () => clearTimeout(timer);
  }, [rawStations]);

  // 내 위치 이동 함수
  const handleMoveToCurrentLocation = () => {
    if (!mapInstance.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const moveLatLon = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        mapInstance.current.panTo(moveLatLon);
        
        // 내 위치로 이동 후 검색할 때도 원의 중심 업데이트
        circleCenterRef.current = moveLatLon;
        onSearch(mapInstance.current);
      },
      () => alert("위치 정보를 가져올 수 없습니다.")
    );
  };

  // 지도 초기화
  useEffect(() => {
    window.selectStationFromMap = (id: string) => onSelectStation(id);

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5cc1f47f2bb48afc9e7ef7f4c698644b&libraries=services,clusterer&autoload=false`;
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

        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          setMapLevel(map.getLevel());
        });

        clustererRef.current = new window.kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 6,
          minClusterSize: 2,
        });

        onMapInit(map);
        setIsMapLoaded(true);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const moveLatLon = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            map.setCenter(moveLatLon);
            // 초기 로딩 시 원 중심 설정
            circleCenterRef.current = moveLatLon;
            onSearch(map);
          },
          () => {
            circleCenterRef.current = map.getCenter();
            onSearch(map);
          }
        );
      });
    };
  }, []);

  // 마커 및 클러스터 업데이트 로직
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapLoaded || !clustererRef.current) return;

    // 1. 반경 원 업데이트 (고정된 좌표 사용)
    if (circleRef.current) circleRef.current.setMap(null);
    
    // circleCenterRef에 값이 있으면 사용하고, 없으면 현재 맵 중심 사용
    const center = circleCenterRef.current || map.getCenter();

    circleRef.current = new window.kakao.maps.Circle({
      center: center,
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

    const transparentImage = new window.kakao.maps.MarkerImage(
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      new window.kakao.maps.Size(1, 1)
    );

    const markersToCluster: any[] = [];
    const positionMap = new Map<string, any[]>();

    deferredStations.forEach((item) => {
      const key = `${item.lat}_${item.lng}`;
      if (!positionMap.has(key)) {
        positionMap.set(key, []);
      }
      positionMap.get(key)!.push(item);
    });

    positionMap.forEach((group) => {
      group.forEach((item, index) => {
        const offset = index * 0.0001;
        const lat = item.lat + offset;
        const lng = item.lng + offset;

        let markerObj = markersMap.current.get(item.statId);

        if (!markerObj) {
          const container = document.createElement('div');
          container.style.cursor = 'pointer';
          container.onclick = () => window.selectStationFromMap(item.statId);

          container.innerHTML = `
            <div class="marker-wrapper" style="display:flex; flex-direction:column; align-items:center; transition: transform 0.2s;">
              <div style="width:30px; height:36px; position:relative;">
                <svg class="marker-svg" viewBox="0 0 24 24" style="width:30px; height:36px;">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="3" fill="white"/>
                </svg>
                <div class="broken-badge" style="display:none; position:absolute; top:-2px; right:-4px; background:#EF4444; color:white; width:14px; height:14px; border-radius:50%; border:1.5px solid white; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900;">!</div>
              </div>
              <div class="occupancy-label" style="margin-top:4px; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; border:1px solid transparent;"></div>
            </div>`;

          const overlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(lat, lng),
            content: container,
            yAnchor: 0.9,
          });

          markerObj = { overlay, element: container };
          markersMap.current.set(item.statId, markerObj);
        }

        markerObj.overlay.setPosition(new window.kakao.maps.LatLng(lat, lng));

        const isVisible = filteredIds.has(item.statId);
        markerObj.element.style.display = isVisible ? 'block' : 'none';

        if (isVisible) {
          const isSelected = selectedStationId === item.statId;
          const isHovered = hoveredStationId === item.statId;

          const colorMap: any = {
            green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8"
          };

          const bgColor = item.warningLevel === 'TOTAL'
            ? colorMap.black
            : (colorMap[item.markerColor] || colorMap.gray);

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

          if (mapLevel >= 6) {
            markerObj.overlay.setMap(null);
          } else {
            markerObj.overlay.setMap(map);
          }

          markerObj.overlay.setZIndex(isSelected ? 100 : (isHovered ? 50 : 1));

          let kakaoMarker = kakaoMarkersMap.current.get(item.statId);
          if (!kakaoMarker) {
            kakaoMarker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(lat, lng),
              image: transparentImage,
            });
            window.kakao.maps.event.addListener(kakaoMarker, 'click', () => {
              window.selectStationFromMap(item.statId);
            });
            kakaoMarkersMap.current.set(item.statId, kakaoMarker);
          } else {
            kakaoMarker.setPosition(new window.kakao.maps.LatLng(lat, lng));
          }
          markersToCluster.push(kakaoMarker);
        } else {
          markerObj.overlay.setMap(null);
        }
      });
    });

    clustererRef.current.clear();
    if (markersToCluster.length > 0) {
      clustererRef.current.addMarkers(markersToCluster);
    }

  }, [deferredStations, filteredIds, selectedStationId, hoveredStationId, isMapLoaded, mapLevel]);


  
  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* ✅ 이 지역 재검색 버튼: 클릭 시 원의 중심 좌표 업데이트 */}
      {!selectedStationId && isMapLoaded && (
        <button
          onClick={() => {
            circleCenterRef.current = mapInstance.current.getCenter();
            onSearch(mapInstance.current);
          }}
          className={`absolute left-1/2 -translate-x-1/2 z-[150]
          px-6 py-2.5 rounded-full font-bold shadow-xl transition-all duration-200
          active:scale-90 active:shadow-md active:bg-blue-50
          hover:bg-blue-50 hover:shadow-2xl
          bg-white text-blue-600 border-2 border-blue-500
          ${isMobileSheetOpen ? 'bottom-[52%]' : 'bottom-[80px]'} md:bottom-10`}
        >
          🔄 이 지역 재검색
        </button>
      )}

      {/* ✅ 내 위치 버튼: 클릭 시 애니메이션 추가 */}
      {!selectedStationId && (
        <button
          onClick={handleMoveToCurrentLocation}
          className={`absolute right-6 z-[150] p-3 rounded-xl shadow-lg border bg-white
          transition-all duration-200 active:scale-90 active:bg-gray-100 hover:shadow-xl
          ${isMobileSheetOpen ? 'bottom-[calc(50vh+20px)]' : 'bottom-[80px]'} md:bottom-10`}
        >
          <span className="text-xl inline-block active:rotate-12 transition-transform">🎯</span>
        </button>
      )}
    </div>
  );
};

export default MapContainer;