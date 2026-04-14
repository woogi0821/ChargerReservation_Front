import React, { useEffect, useRef, useState, useCallback } from 'react';
import { stationService } from '../../services/stationService';
import StationSidebar from '../../components/station/StationSidebar';
import StationDetail from '../../components/station/StationDetail';

declare global {
  interface Window {
    kakao: any;
    selectStationFromMap: (id: string) => void;
  }
}

const Stations = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const [kakaoMap, setKakaoMap] = useState<any>(null);
  const circleRef = useRef<any>(null);
  // ✅ 마커를 Map으로 관리: statId → { overlay, element }
  const markersRef = useRef<Map<string, { overlay: any; element: HTMLDivElement }>>(new Map());

  const [rawStations, setRawStations] = useState<any[]>([]); 
  const [stationList, setStationList] = useState<any[]>([]); 
  const [displayStations, setDisplayStations] = useState<any[]>([]); 
  
  const [page, setPage] = useState(0);
  const [speedFilter, setSpeedFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [isParkingAvailable, setIsParkingAvailable] = useState(false);
  const [isParkingFree, setIsParkingFree] = useState(false);
  const [isNoRestriction, setIsNoRestriction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedStationData = stationList.find(s => s.statId === selectedStationId) || 
                               rawStations.find(s => s.statId === selectedStationId);

  const handleSelectStation = useCallback(async (id: string) => {
    setSelectedStationId(id);
    if (!kakaoMap) return;
    const center = kakaoMap.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    const currentType = speedFilter === '완속' ? '완속' : '급속';
    
    try {
      const detailData = await stationService.getStationDetail(id, currentType, lat, lng);
      if (detailData) {
        setStationList(prevList => 
          prevList.map(item => item.statId === id ? { ...item, ...detailData } : item)
        );
        setRawStations(prevMarkers => 
          prevMarkers.map(item => item.statId === id ? { ...item, ...detailData } : item)
        );
        kakaoMap.panTo(new window.kakao.maps.LatLng(detailData.lat || lat, detailData.lng || lng));
      }
    } catch (error) {
      console.error("상세 정보 호출 실패:", error);
    }
  }, [kakaoMap, speedFilter]);

  // ✅ window.selectStationFromMap을 항상 최신 handleSelectStation으로 동기화
  useEffect(() => {
    window.selectStationFromMap = (id: string) => handleSelectStation(id);
  }, [handleSelectStation]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5cc1f47f2bb48afc9e7ef7f4c698644b&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapContainer.current) {
          const map = new window.kakao.maps.Map(mapContainer.current, {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 5
          });
          setKakaoMap(map);
          moveToInitialLocation(map);
        }
      });
    };
  }, []);

  // ✅ 마커 생성 및 관리 로직 (기존 유지)
  useEffect(() => {
    if (!kakaoMap || rawStations.length === 0) return;

    const colorMap: any = { 
      green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8" 
    };

    rawStations.forEach((item: any) => {
      const isHovered = hoveredStationId === item.statId;
      const isSelected = selectedStationId === item.statId;
      const bgColor = item.warningLevel === 'TOTAL' ? colorMap.black : (colorMap[item.markerColor] || colorMap.gray);

      const innerHtml = `
        <div onclick="selectStationFromMap('${item.statId}')" style="
          display:flex; flex-direction:column; align-items:center;
          transition: transform 0.2s;
          transform: ${isHovered || isSelected ? 'scale(1.3) translateY(-8px)' : 'scale(1)'};
          z-index: ${isHovered || isSelected ? '100' : '1'};
          cursor: pointer;
        ">
          <div style="position:relative; width:30px; height:36px;">
            <svg viewBox="0 0 24 24" fill="${isSelected ? '#2563EB' : bgColor}" xmlns="http://www.w3.org/2000/svg" style="width:30px; height:36px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="white"/>
            </svg>
          </div>
          <div style="
            margin-top:4px; 
            background:${isSelected ? '#2563EB' : (isHovered ? '#3b82f6' : 'rgba(255,255,255,0.9)')}; 
            color:${isHovered || isSelected ? 'white' : '#333'}; 
            border:1px solid ${bgColor}; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold;
          ">
            ${item.occupancy || '0%'}
          </div>
        </div>
      `;

      const existing = markersRef.current.get(item.statId);
      if (existing) {
        existing.element.innerHTML = innerHtml;
      } else {
        const container = document.createElement('div');
        container.innerHTML = innerHtml;
        container.style.display = 'block';

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(item.lat, item.lng),
          content: container,
          yAnchor: 0.9
        });
        overlay.setMap(kakaoMap);
        markersRef.current.set(item.statId, { overlay, element: container });
      }
    });
  }, [kakaoMap, rawStations, hoveredStationId, selectedStationId]);

  // ✅ 필터 가시성 로직 (기존 유지)
  useEffect(() => {
    if (markersRef.current.size === 0) return;
    const visibleIds = new Set(displayStations.map(s => s.statId));
    markersRef.current.forEach((markerObj, statId) => {
      markerObj.element.style.display = visibleIds.has(statId) ? 'block' : 'none';
    });
  }, [displayStations]);

  // ✅ 필터링 로직
useEffect(() => {
  const stationListMap = new Map(stationList.map(s => [s.statId, s]));

  const filtered = rawStations.filter((s) => {
    // 1. 상태 필터 (markerColor는 rawStations에 있음)
    if (statusFilter === '여유' && s.markerColor !== 'green') return false;
    if (statusFilter === '혼잡' && s.markerColor !== 'amber') return false;

    // 2. stationList에 있는 항목만 상세 필터 적용
    //    없는 항목은 급속/완속/주차 필터 건너뜀 (MarkerDto에 해당 필드 없음)
    const detail = stationListMap.get(s.statId);
    if (detail) {
      // 속도 필터
      if (speedFilter === '급속') {
        if (!detail.fastChargerStatus || detail.fastChargerStatus.includes('0/0')) return false;
      } else if (speedFilter === '완속') {
        if (!detail.slowChargerStatus || detail.slowChargerStatus.includes('0/0')) return false;
      }
      // 주차 및 기타 필터
      if (isParkingAvailable && detail.limitYn === 'Y') return false;
      if (isParkingFree && detail.parkingFree !== 'Y') return false;
      if (isNoRestriction) {
        const ltd = (detail.limitDetail ?? "").trim();
        const ignoreTexts = ["없음", "-", "해당없음", "null"];
        const isIgnored = !ltd || ignoreTexts.includes(ltd) || ltd.startsWith("시설 상황에 따라");
        if (!isIgnored) return false;
      }
    }

    return true;
  });

  setDisplayStations(filtered);
}, [speedFilter, statusFilter, isParkingAvailable, isParkingFree, isNoRestriction, rawStations, stationList]);

  const drawStyleCircle = (map: any, position: any) => {
    if (circleRef.current) circleRef.current.setMap(null);
    const circle = new window.kakao.maps.Circle({
      center: position, radius: 1500, strokeWeight: 2, strokeColor: '#4A90E2',
      strokeOpacity: 0.8, strokeStyle: 'dashed', fillColor: '#E1F0FF', fillOpacity: 0.4, zIndex: 1
    });
    circle.setMap(map);
    circleRef.current = circle;
  };

  const handleSearch = async (map: any) => {
    if (!map) return;
    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    drawStyleCircle(map, center);
    setPage(0);
    markersRef.current.forEach(({ overlay }) => overlay.setMap(null));
    markersRef.current.clear();
    try {
      const [markerData, listData] = await Promise.all([
        stationService.getMarkersOnly(lat, lng),
        stationService.getStationsAround(lat, lng, 0)
      ]);
      setRawStations(markerData);
      setStationList(listData);
    } catch (error) { console.error(error); }
  };

  const loadMore = useCallback(() => {
    if (isLoading || !kakaoMap || stationList.length >= 100) return; 
    const center = kakaoMap.getCenter();
    const nextPage = page + 1;
    setIsLoading(true);
    stationService.getStationsAround(center.getLat(), center.getLng(), nextPage)
      .then(listData => {
        setStationList(prev => [...prev, ...listData].slice(0, 100));
        setPage(nextPage);
      })
      .finally(() => setIsLoading(false));
  }, [isLoading, kakaoMap, page, stationList.length]);

  const moveToInitialLocation = (map: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const myPos = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          map.setCenter(myPos);
          handleSearch(map);
        },
        () => handleSearch(map)
      );
    } else { handleSearch(map); }
  };

  useEffect(() => {
    if (kakaoMap) {
      setTimeout(() => { kakaoMap.relayout(); }, 320);
    }
  }, [isSidebarOpen, selectedStationId, kakaoMap]);

  return (
    <div className="flex w-full h-screen overflow-hidden relative">
      <div 
        className="z-20 h-full transition-all duration-300 ease-in-out flex shrink-0 overflow-hidden bg-white"
        style={{ width: isSidebarOpen ? (selectedStationId ? '780px' : '380px') : '0px' }}
      >
        <div className="w-[380px] h-full shrink-0 border-r">
          <StationSidebar 
            stations={stationList} 
            isLoading={isLoading}
            speedFilter={speedFilter} 
            setSpeedFilter={setSpeedFilter}
            statusFilter={statusFilter} 
            setStatusFilter={setStatusFilter}
            isParkingAvailable={isParkingAvailable} 
            setIsParkingAvailable={setIsParkingAvailable}
            isParkingFree={isParkingFree} 
            setIsParkingFree={setIsParkingFree}
            isNoRestriction={isNoRestriction} 
            setIsNoRestriction={setIsNoRestriction}
            onLoadMore={loadMore}
            onHoverStation={setHoveredStationId}
            onSelectStation={handleSelectStation} 
            mapCenter={kakaoMap ? {
              lat: kakaoMap.getCenter().getLat(),
              lng: kakaoMap.getCenter().getLng()
            } : { lat: 37.5665, lng: 126.9780 }} 
          />
        </div>
        <div className={`h-full bg-white shrink-0 transition-all duration-300 overflow-hidden ${selectedStationId ? 'w-[400px] border-r shadow-xl' : 'w-0'}`}>
          <div className="w-[400px] h-full">
            <StationDetail station={selectedStationData} onClose={() => setSelectedStationId(null)} />
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 w-6 h-14 flex items-center justify-center rounded-r-lg shadow-md transition-all duration-300"
        style={{ left: isSidebarOpen ? (selectedStationId ? '780px' : '380px') : '0px' }}
      >
        <span className="text-gray-400 text-[10px] font-bold">{isSidebarOpen ? '◀' : '▶'}</span>
      </button>

      <div className="flex-1 relative z-10 h-full min-w-0">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute top-4 right-4 z-[1000] flex flex-row items-center gap-2 bg-white/90 backdrop-blur-sm p-2 px-3 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[11px] font-bold text-gray-600">여유</span></div>
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[11px] font-bold text-gray-600">혼잡</span></div>
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[11px] font-bold text-gray-600">만차</span></div>
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div><span className="text-[11px] font-bold text-gray-600">확인불가</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-black"></div><span className="text-[11px] font-bold text-gray-600">점검중</span></div>
        </div>
        <button onClick={() => handleSearch(kakaoMap)} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl">이 지역 재검색</button>
      </div>
    </div>
  );
};

export default Stations;