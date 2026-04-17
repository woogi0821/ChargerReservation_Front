import { useState, useCallback, useMemo } from 'react';
import { stationService } from '../../services/stationService';
import StationSidebar from '../../components/station/StationSidebar';
import StationDetail from '../../components/station/StationDetail';
import GNB from '../../components/station/GNB';
import MapContainer from '../../components/station/MapContainer';


const Stations = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  
  const [kakaoMap, setKakaoMap] = useState<any>(null);
  const [stationList, setStationList] = useState<any[]>([]); 
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 필터 상태
  const [speedFilter, setSpeedFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [isParkingAvailable, setIsParkingAvailable] = useState(false);
  const [isParkingFree, setIsParkingFree] = useState(false);
  const [isNoRestriction, setIsNoRestriction] = useState(false);

  // ✅ 1. 현재 보여줄 데이터 원본 결정
  const baseStations = isSearchMode ? searchResults : stationList;

  // ✅ 2. 필터링 로직 (ID 세트만 추출)
  const filteredIds = useMemo(() => {
    return new Set(
      baseStations
        .filter((s) => {
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
        })
        .map((s) => s.statId)
    );
  }, [baseStations, statusFilter, speedFilter, isParkingAvailable, isParkingFree, isNoRestriction]);

  // ✅ 3. 사이드바용 리스트
  const displayStations = useMemo(() => 
    baseStations.filter(s => filteredIds.has(s.statId)), 
    [baseStations, filteredIds]
  );

  const selectedStationData = useMemo(() => 
    baseStations.find(s => s.statId === selectedStationId), 
    [baseStations, selectedStationId]
  );

  // ✅ 4. 검색 로직 (MapContainer에서 호출 가능하도록 전달)
const handleSearch = useCallback(async (map: any) => {
  if (!map) return;

  // ✅ 1. 버튼 클릭 즉시 UI 상태 초기화
  setKeyword('');             // 검색창 텍스트 초기화
  setSearchResults([]);       // 기존 검색 결과 리스트 초기화
  setIsSearchMode(false);     // 검색 모드 강제 종료 (주변 탐색 모드로 변경)
  setSelectedStationId(null); // (선택 사항) 열려있던 상세 정보창 닫기

  setIsLoading(true);
  const center = map.getCenter();
  const lat = center.getLat();
  const lng = center.getLng();

  try {
    const [markerData, listData] = await Promise.all([
      stationService.getMarkersOnly(lat, lng),
      stationService.getStationsAround(lat, lng)
    ]);

    const combinedData = listData.map((item: any) => ({
      ...markerData.find((m: any) => m.statId === item.statId),
      ...item
    }));

    setStationList(combinedData);
    // ✅ 2. 여기서 setIsSearchMode(false)를 중복으로 해줄 필요는 없지만, 
    // 로직 흐름상 위(1번)에서 미리 해주는 게 UI 반응 속도가 훨씬 빠릅니다.
  } catch (error) {
    console.error("검색 실패:", error);
  } finally {
    setIsLoading(false);
  }
}, []); // 의존성 배열에 setKeyword, setSearchResults 등이 빠져있다면 추가하거나, 
        // 상태 변경 함수는 안정적이므로 이대로 두셔도 작동합니다.

  const handleSelectStation = useCallback(async (id: string, map: any) => {
    setSelectedStationId(id);
    if (!map) return;
    const center = map.getCenter();
    try {
      const detailData = await stationService.getStationDetail(id, speedFilter, center.getLat(), center.getLng());
      if (detailData) {
        setStationList(prev => prev.map(item => item.statId === id ? { ...item, ...detailData } : item));
      }
    } catch (e) { console.error(e); }
  }, [speedFilter]);

  return (
    <div className="flex w-full h-screen overflow-hidden relative">
      <GNB />
      <aside className="z-30 h-full transition-all duration-300 ease-in-out bg-white shrink-0 overflow-hidden border-r shadow-lg relative" style={{ width: isSidebarOpen ? '380px' : '0px' }}>
        <div className="w-[380px] h-full">
          <StationSidebar 
            stations={displayStations} keyword={keyword} setKeyword={setKeyword} isSearchMode={isSearchMode}
            setIsSearchMode={setIsSearchMode} isLoading={isLoading} setSearchResults={setSearchResults}
            speedFilter={speedFilter} setSpeedFilter={setSpeedFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            isParkingAvailable={isParkingAvailable} setIsParkingAvailable={setIsParkingAvailable}
            isParkingFree={isParkingFree} setIsParkingFree={setIsParkingFree}
            isNoRestriction={isNoRestriction} setIsNoRestriction={setIsNoRestriction}
            onHoverStation={setHoveredStationId} 
            onSelectStation={(id) => handleSelectStation(id, kakaoMap)}
            onLoadMore={() => {}}
            mapCenter={kakaoMap ? { lat: kakaoMap.getCenter().getLat(), lng: kakaoMap.getCenter().getLng() } : { lat: 37.5665, lng: 126.9780 }}
          />
        </div>
      </aside>

      {/* 사이드바/상세페이지 조절 버튼 */}
      <div className="absolute top-1/2 -translate-y-1/2 z-[110] transition-all duration-300" style={{ left: 80 + (isSidebarOpen ? 380 : 0) + (selectedStationId ? 400 : 0) }}>
        <button onClick={() => selectedStationId ? setSelectedStationId(null) : setIsSidebarOpen(p => !p)} className="bg-white border border-zinc-200 w-6 h-14 flex items-center justify-center rounded-r-lg shadow-md hover:bg-zinc-50">
          <span className="text-zinc-400 text-[10px] font-bold">{selectedStationId || isSidebarOpen ? "◀" : "▶"}</span>
        </button>
      </div>

      <div className="flex-1 relative z-10 h-full min-w-0">
        <MapContainer 
          rawStations={baseStations}
          filteredIds={filteredIds}
          selectedStationId={selectedStationId}
          hoveredStationId={hoveredStationId}
          onMapInit={(map) => setKakaoMap(map)}
          onSearch={handleSearch}
          onSelectStation={(id) => handleSelectStation(id, kakaoMap)}
        />
        
        {/* 범례 */}
<div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-gray-200 flex items-center gap-2 flex-wrap">
  <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
    <div className="w-3 h-3 rounded-full bg-green-500"></div>
    <span className="text-[11px] font-bold text-gray-600">여유(70%이상)</span>
  </div>
  <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
    <span className="text-[11px] font-bold text-gray-600">보통(70%~30%)</span>
  </div>
  <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
    <div className="w-3 h-3 rounded-full bg-red-500"></div>
    <span className="text-[11px] font-bold text-gray-600">혼잡(30%이하)</span>
  </div>
  <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
    <span className="text-[11px] font-bold text-gray-600">확인불가</span>
  </div>
  <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
    <div className="w-3 h-3 rounded-full bg-black"></div>
    <span className="text-[11px] font-bold text-gray-600">전체고장</span>
  </div>
  {/* ✅ 고장있음 항목 추가 */}
  <div className="flex items-center gap-1.5">
    <div className="relative w-3 h-3">
      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full flex items-center justify-center text-[7px] text-white font-black leading-none">
        !
      </div>
    </div>
    <span className="text-[11px] font-bold text-gray-600">고장있음</span>
  </div>
</div>

        {/* 상세 페이지 레이어 */}
        <div className={`absolute top-0 left-0 h-full bg-white z-[100] transition-all duration-300 ease-in-out shadow-2xl border-r overflow-hidden ${selectedStationId ? 'w-[400px]' : 'w-0'}`}>
          <div className="w-[400px] h-full relative">
            {selectedStationData && <StationDetail station={selectedStationData} onClose={() => setSelectedStationId(null)} />}
          </div>
        </div>

        <button onClick={() => handleSearch(kakaoMap)} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-blue-700 transition-transform active:scale-95">
          이 지역 재검색
        </button>
      </div>
    </div>
  );
};

export default Stations;