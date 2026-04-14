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
  const markersRef = useRef<any[]>([]);

  const [rawStations, setRawStations] = useState<any[]>([]); 
  const [stationList, setStationList] = useState<any[]>([]); 
  const [displayStations, setDisplayStations] = useState<any[]>([]); 
  
  const [page, setPage] = useState(0);
  const [speedFilter, setSpeedFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
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
    if (!kakaoMap || rawStations.length === 0) return;
    markersRef.current.forEach(m => m.setMap(null));
    
    const newOverlays = rawStations.map((item: any) => {
      const colorMap: any = { 
        green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8" 
      };
      const bgColor = item.warningLevel === 'TOTAL' ? colorMap.black : (colorMap[item.markerColor] || colorMap.gray);
      const isHovered = hoveredStationId === item.statId;
      const isSelected = selectedStationId === item.statId;

      const content = `
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

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(item.lat, item.lng),
        content,
        yAnchor: 0.9
      });

      overlay.setMap(kakaoMap);
      return overlay;
    });
    markersRef.current = newOverlays;
  }, [kakaoMap, rawStations, hoveredStationId, selectedStationId]);

useEffect(() => {
  let filtered = [...stationList]; 
  
  // 상태 필터
  if (statusFilter === '이용 가능') filtered = filtered.filter(s => s.markerColor === 'green');
  else if (statusFilter === '혼잡') filtered = filtered.filter(s => s.markerColor === 'amber');
  else if (statusFilter === '만석') filtered = filtered.filter(s => s.markerColor === 'red');
  
  // 속도 필터 (수정된 부분: 문자열 체크 방식)
  if (speedFilter === '급속') {
    filtered = filtered.filter(s => s.fastChargerStatus && !s.fastChargerStatus.includes('0/0'));
  } else if (speedFilter === '완속') {
    filtered = filtered.filter(s => s.slowChargerStatus && !s.slowChargerStatus.includes('0/0'));
  }
  
  setDisplayStations(filtered);
}, [speedFilter, statusFilter, stationList]);

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

  // 💡 사이드바 변경 시 지도 리레이아웃
  useEffect(() => {
    if (kakaoMap) {
      setTimeout(() => { kakaoMap.relayout(); }, 320);
    }
  }, [isSidebarOpen, selectedStationId, kakaoMap]);

  return (
    <div className="flex w-full h-screen overflow-hidden relative">
      {/* 사이드바/상세 컨테이너 */}
      <div 
        className="z-20 h-full transition-all duration-300 ease-in-out flex shrink-0 overflow-hidden bg-white"
        style={{ width: isSidebarOpen ? (selectedStationId ? '780px' : '380px') : '0px' }}
      >
        <div className="w-[380px] h-full shrink-0 border-r">
          <StationSidebar 
            stations={displayStations} isLoading={isLoading}
            speedFilter={speedFilter} setSpeedFilter={setSpeedFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
            onSearch={() => {}} onLoadMore={loadMore} 
            onHoverStation={setHoveredStationId}
            onSelectStation={handleSelectStation}
          />
        </div>
        <div className={`h-full bg-white shrink-0 transition-all duration-300 overflow-hidden ${selectedStationId ? 'w-[400px] border-r shadow-xl' : 'w-0'}`}>
          <div className="w-[400px] h-full">
            <StationDetail station={selectedStationData} onClose={() => setSelectedStationId(null)} />
          </div>
        </div>
      </div>

      {/* 💡 버튼을 컨테이너 외부 Absolute로 배치하여 항상 보이고 따라다니게 수정 */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 w-6 h-14 flex items-center justify-center rounded-r-lg shadow-md transition-all duration-300"
        style={{ left: isSidebarOpen ? (selectedStationId ? '780px' : '380px') : '0px' }}
      >
        <span className="text-gray-400 text-[10px] font-bold">{isSidebarOpen ? '◀' : '▶'}</span>
      </button>

      <div className="flex-1 relative z-10 h-full min-w-0">
        <div ref={mapContainer} className="w-full h-full" />
        {/* 범례 디자인 */}
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