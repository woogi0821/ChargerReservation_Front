import { useEffect, useRef, useState, useCallback } from 'react';
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
  const markersRef = useRef<Map<string, { overlay: any; element: HTMLDivElement }>>(new Map());

  const [rawStations, setRawStations] = useState<any[]>([]); 
  const [stationList, setStationList] = useState<any[]>([]); 
  const [displayStations, setDisplayStations] = useState<any[]>([]); 
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [keyword, setKeyword] = useState('');
  
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
        kakaoMap.panTo(new window.kakao.maps.LatLng(detailData.lat || lat, detailData.lng || lng));
      }
    } catch (error) {
      console.error("상세 정보 호출 실패:", error);
    }
  }, [kakaoMap, speedFilter]);

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

  useEffect(() => {
    if (!kakaoMap) return;
    markersRef.current.forEach((marker) => {
      if (marker.overlay) marker.overlay.setMap(null);
    });
    markersRef.current.clear();

    if (!displayStations || displayStations.length === 0) return;

    const colorMap: any = { 
      green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8" 
    };

    displayStations.forEach((item: any) => {
      const isHovered = hoveredStationId === item.statId;
      const isSelected = selectedStationId === item.statId;
      const bgColor = item.warningLevel === 'TOTAL' ? colorMap.black : (colorMap[item.markerColor] || colorMap.gray);

      const innerHtml = `
        <div style="display:flex; flex-direction:column; align-items:center; transition: transform 0.2s; transform: ${isHovered || isSelected ? 'scale(1.3) translateY(-8px)' : 'scale(1)'}; z-index: ${isHovered || isSelected ? '100' : '1'}; cursor: pointer;">
          <div style="position:relative; width:30px; height:36px;">
            <svg viewBox="0 0 24 24" fill="${isSelected ? '#2563EB' : bgColor}" xmlns="http://www.w3.org/2000/svg" style="width:30px; height:36px;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="white"/>
            </svg>
          </div>
          <div style="margin-top:4px; background:${isSelected ? '#2563EB' : (isHovered ? '#3b82f6' : 'rgba(255,255,255,0.9)')}; color:${isHovered || isSelected ? 'white' : '#333'}; border:1px solid ${bgColor}; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${item.occupancy || '0%'}
          </div>
        </div>
      `;

      const container = document.createElement('div');
      container.innerHTML = innerHtml;
      container.onclick = () => { if (window.selectStationFromMap) window.selectStationFromMap(item.statId); };

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(item.lat, item.lng),
        content: container,
        yAnchor: 0.9,
        map: kakaoMap
      });
      markersRef.current.set(item.statId, { overlay, element: container });
    });
  }, [kakaoMap, displayStations, hoveredStationId, selectedStationId]);

  // ✅ [수정] 목록 데이터 우선순위 조정: 요금/상태 정보가 풍부한 stationList를 기반으로 필터링
  useEffect(() => {
    const baseList = isSearchMode ? searchResults : stationList;
    
    const filtered = baseList.filter((s) => {
      if (statusFilter === '여유' && s.markerColor !== 'green') return false;
      if (statusFilter === '혼잡' && s.markerColor !== 'amber') return false;
      
      if (speedFilter === '급속' && (!s.fastChargerStatus || s.fastChargerStatus.includes('0/0'))) return false;
      if (speedFilter === '완속' && (!s.slowChargerStatus || s.slowChargerStatus.includes('0/0'))) return false;
      
      if (isParkingAvailable && s.limitYn === 'Y') return false;
      if (isParkingFree && s.parkingFree !== 'Y') return false;
      if (isNoRestriction) {
        const ltd = (s.limitDetail ?? "").trim();
        if (!["없음", "-", "해당없음", "null", ""].includes(ltd)) return false;
      }
      return true;
    });
    setDisplayStations(filtered);
  }, [speedFilter, statusFilter, isParkingAvailable, isParkingFree, isNoRestriction, stationList, searchResults, isSearchMode]);

  const handleSearch = async (map: any) => {
    if (!map) return;
    
    setKeyword('');
    setSearchResults([]);
    setIsSearchMode(false);
    
    setSelectedStationId(null); 
    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    if (circleRef.current) circleRef.current.setMap(null);
    const circle = new window.kakao.maps.Circle({
      center: center, radius: 1500, strokeWeight: 2, strokeColor: '#4A90E2',
      strokeOpacity: 0.8, strokeStyle: 'dashed', fillColor: '#E1F0FF', fillOpacity: 0.4, zIndex: 1
    });
    circle.setMap(map);
    circleRef.current = circle;

    setStationList([]); 
    setIsLoading(true);

    try {
      const [markerData, listData] = await Promise.all([
        stationService.getMarkersOnly(lat, lng),
        stationService.getStationsAround(lat, lng)
      ]);
      
      // ✅ [중요] 마커 데이터와 리스트 데이터를 합쳐서 모든 필드가 존재하게 함
      const combinedData = listData.map((item: any) => {
        const marker = markerData.find((m: any) => m.statId === item.statId);
        return { ...marker, ...item };
      });

      setRawStations(markerData);
      setStationList(combinedData);
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="flex w-full h-screen overflow-hidden relative">
      <aside 
        className="z-30 h-full transition-all duration-300 ease-in-out bg-white shrink-0 overflow-hidden border-r shadow-lg"
        style={{ width: isSidebarOpen ? '380px' : '0px' }}
      >
        <div className="w-[380px] h-full">
          <StationSidebar 
            stations={displayStations} 
            setSearchResults={setSearchResults}
            keyword={keyword}
            setKeyword={setKeyword}
            isSearchMode={isSearchMode}
            setIsSearchMode={setIsSearchMode}
            isLoading={isLoading}
            speedFilter={speedFilter} setSpeedFilter={setSpeedFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            isParkingAvailable={isParkingAvailable} setIsParkingAvailable={setIsParkingAvailable}
            isParkingFree={isParkingFree} setIsParkingFree={setIsParkingFree}
            isNoRestriction={isNoRestriction} setIsNoRestriction={setIsNoRestriction}
            onLoadMore={() => {}}
            onHoverStation={setHoveredStationId}
            onSelectStation={handleSelectStation} 
            mapCenter={kakaoMap ? { lat: kakaoMap.getCenter().getLat(), lng: kakaoMap.getCenter().getLng() } : { lat: 37.5665, lng: 126.9780 }} 
          />
        </div>
      </aside>

      <button
        onClick={() => { if (selectedStationId) setSelectedStationId(null); else setIsSidebarOpen(!isSidebarOpen); }}
        className="absolute top-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 w-6 h-14 flex items-center justify-center rounded-r-lg shadow-md transition-all duration-300 hover:bg-gray-50"
        style={{ left: `calc(${(isSidebarOpen ? 380 : 0)}px + ${(selectedStationId ? 400 : 0)}px)` }}
      >
        <span className="text-gray-400 text-[10px] font-bold">{selectedStationId || isSidebarOpen ? '◀' : '▶'}</span>
      </button>

<div className="flex-1 relative z-10 h-full min-w-0">

  <div ref={mapContainer} className="w-full h-full" />

  {/* 범례 (지도 위 고정) */}
  <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-gray-200 flex items-center gap-2 flex-wrap">

    <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <span className="text-[11px] font-bold text-gray-600">여유</span>
    </div>

    <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
      <span className="text-[11px] font-bold text-gray-600">혼잡</span>
    </div>

    <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <span className="text-[11px] font-bold text-gray-600">만차</span>
    </div>

    <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
      <span className="text-[11px] font-bold text-gray-600">확인불가</span>
    </div>

    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-black"></div>
      <span className="text-[11px] font-bold text-gray-600">점검중</span>
    </div>

  </div>

  <div className={`absolute top-0 left-0 h-full bg-white z-[100] transition-all duration-300 ease-in-out shadow-2xl border-r overflow-hidden ${selectedStationId ? 'w-[400px]' : 'w-0'}`}>
    <div className="w-[400px] h-full">
      {selectedStationData && <StationDetail station={selectedStationData} onClose={() => setSelectedStationId(null)} />}
    </div>
  </div>

  <button
    onClick={() => handleSearch(kakaoMap)}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-blue-700 transition-colors"
  >
    이 지역 재검색
  </button>

</div>
    </div>
  );
};

export default Stations;