import React, { useEffect, useRef, useState } from 'react';
import { stationService } from '../../services/stationService';
import StationSidebar from '../../components/station/StationSidebar';

declare global {
  interface Window {
    kakao: any;
  }
}

const Stations = () => {
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
  const [isLoading, setIsLoading] = useState(false); // 💥 로딩 상태 추가

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
    let filtered = [...stationList]; 
    
    if (statusFilter === '이용 가능') {
      filtered = filtered.filter(s => s.markerColor === 'green');
    } else if (statusFilter === '혼잡') {
      filtered = filtered.filter(s => s.markerColor === 'amber');
    } else if (statusFilter === '만석') {
      filtered = filtered.filter(s => s.markerColor === 'red');
    }

    if (speedFilter === '급속') {
      filtered = filtered.filter(s => (s.fastTotal || 0) > 0);
    } else if (speedFilter === '완속') {
      filtered = filtered.filter(s => (s.slowTotal || 0) > 0);
    }

    setDisplayStations(filtered);
  }, [speedFilter, statusFilter, stationList]);

  useEffect(() => {
    if (kakaoMap && rawStations.length > 0) {
      renderMarkers(kakaoMap, rawStations);
    }
  }, [rawStations, kakaoMap]);

  const renderMarkers = (map: any, data: any[]) => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const newOverlays = data.map((item: any) => {
      const colorMap: any = { 
        green: "#22C55E", amber: "#F59E0B", red: "#EF4444", black: "#1F2937", gray: "#94A3B8" 
      };
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
        content: content,
        yAnchor: 0.9
      });
      overlay.setMap(map);
      return overlay;
    });
    markersRef.current = newOverlays;
  };

  const drawStyleCircle = (map: any, position: any) => {
    if (circleRef.current) circleRef.current.setMap(null);
    const circle = new window.kakao.maps.Circle({
      center: position,
      radius: 1500,
      strokeWeight: 2,
      strokeColor: '#4A90E2',
      strokeOpacity: 0.8,
      strokeStyle: 'dashed',
      fillColor: '#E1F0FF',
      fillOpacity: 0.4,
      zIndex: 1
    });
    circle.setMap(map);
    circleRef.current = circle;
  };

  const fetchMarkersForMap = async (lat: number, lng: number) => {
    try {
      const markerData = await stationService.getMarkersOnly(lat, lng);
      setRawStations(markerData);
    } catch (error) {
      console.error("지도 마커 로드 실패:", error);
    }
  };

  const fetchStationList = async (lat: number, lng: number, pageNum: number) => {
    setIsLoading(true); // 💥 데이터 요청 시작
    try {
      const listData = await stationService.getStationsAround(lat, lng, pageNum);
      if (pageNum === 0) {
        setStationList(listData);
      } else {
        setStationList(prev => [...prev, ...listData]);
      }
    } catch (error) {
      console.error("목록 로드 실패:", error);
    } finally {
      setIsLoading(false); // 💥 요청 완료 후 로딩 해제
    }
  };

  const handleSearch = (map: any) => {
    if (!map) return;
    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();

    drawStyleCircle(map, center);
    setPage(0);

    fetchMarkersForMap(lat, lng);
    fetchStationList(lat, lng, 0);
  };

  const loadMore = () => {
    // 💥 중요: 이미 로딩 중이면 중복 요청 차단
    if (isLoading || !kakaoMap) return; 
    
    const center = kakaoMap.getCenter();
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStationList(center.getLat(), center.getLng(), nextPage);
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
    } else {
      handleSearch(map);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <StationSidebar 
        stations={displayStations}
        isLoading={isLoading} // 💥 로딩 상태 전달
        speedFilter={speedFilter}
        setSpeedFilter={setSpeedFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter} 
        onSearch={(keyword) => console.log(keyword)} 
        onLoadMore={loadMore} 
      />

      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        <button 
          onClick={() => handleSearch(kakaoMap)}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
        >
          이 지역 재검색
        </button>
      </div>
    </div>
  );
};

export default Stations;