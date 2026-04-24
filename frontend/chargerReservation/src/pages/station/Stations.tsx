import { useState, useCallback, useMemo } from "react";
import { stationService } from "../../services/stationService";
import StationSidebar from "../../components/station/StationSidebar";
import StationDetail from "../../components/station/StationDetail";
import GNB from "../../components/station/GNB";
import MapContainer from "../../components/station/MapContainer";

const Stations = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(true);
  const [circleCenter, setCircleCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.978 });
  const [kakaoMap, setKakaoMap] = useState<any>(null);
  const [stationList, setStationList] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speedFilter, setSpeedFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [isParkingAvailable, setIsParkingAvailable] = useState(false);
  const [isParkingFree, setIsParkingFree] = useState(false);
  const [isNoRestriction, setIsNoRestriction] = useState(false);

  const baseStations = isSearchMode ? searchResults : stationList;
  const filteredIds = useMemo(() => {
    return new Set(
      baseStations
        .filter((s) => {
          if (statusFilter === "여유" && s.markerColor !== "green") return false;
          if (statusFilter === "보통" && s.markerColor !== "amber") return false;
          if (speedFilter === "급속" && (!s.fastChargerStatus || s.fastChargerStatus.includes("0/0"))) return false;
          if (speedFilter === "완속" && (!s.slowChargerStatus || s.slowChargerStatus.includes("0/0"))) return false;
          if (isParkingAvailable && s.limitYn === "Y") return false;
          if (isParkingFree && s.parkingFree !== "Y") return false;
          if (isNoRestriction) {
            const ltd = (s.limitDetail ?? "").trim();
            if (!["없음", "-", "해당없음", "null", ""].includes(ltd)) return false;
          }
          return true;
        })
        .map((s) => s.statId),
    );
  }, [baseStations, statusFilter, speedFilter, isParkingAvailable, isParkingFree, isNoRestriction]);

  const displayStations = useMemo(
    () => baseStations.filter((s) => filteredIds.has(s.statId)),
    [baseStations, filteredIds],
  );

  const selectedStationData = useMemo(
    () => baseStations.find((s) => s.statId === selectedStationId),
    [baseStations, selectedStationId],
  );

  const handleSearch = useCallback(async (map: any) => {
    if (!map) return;
    setKeyword("");
    setSearchResults([]);
    setIsSearchMode(false);
    setSelectedStationId(null);
    setIsLoading(true);
    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    setCircleCenter({ lat, lng });
    try {
      const markerData = await stationService.getMarkersOnly(lat, lng);
      setStationList(markerData);
      stationService.getStationsAround(lat, lng).then((listData) => {
        setStationList((prev) => {
          return prev.map((marker) => {
            const detail = listData.find((l: any) => l.statId === marker.statId);
            return detail ? { ...marker, ...detail } : marker;
          });
        });
      });
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectStation = useCallback(
    async (id: string, map: any) => {
      setSelectedStationId(id);
      setIsMobileSheetOpen(true);
      if (!map) return;
      const center = map.getCenter();
      try {
        const detailData = await stationService.getStationDetail(id, speedFilter, center.getLat(), center.getLng());
        if (detailData) {
          setStationList((prev) => prev.map((item) => item.statId === id ? { ...item, ...detailData } : item));
          setSearchResults((prev) => prev.map((item) => item.statId === id ? { ...item, ...detailData } : item));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [speedFilter],
  );

  const handleMobileDetailClose = () => {
    setSelectedStationId(null);
    setIsMobileSheetOpen(true);
  };

  const sidebarProps = {
    stations: displayStations,
    keyword,
    setKeyword,
    isSearchMode,
    setIsSearchMode,
    isLoading,
    setSearchResults,
    speedFilter,
    setSpeedFilter,
    statusFilter,
    setStatusFilter,
    isParkingAvailable,
    setIsParkingAvailable,
    isParkingFree,
    setIsParkingFree,
    isNoRestriction,
    setIsNoRestriction,
    onHoverStation: setHoveredStationId,
    onSelectStation: (id: string) => handleSelectStation(id, kakaoMap),
    onLoadMore: () => {},
    selectedStationId,
    mapCenter: circleCenter,
  };

  return (
    <div className="flex w-full h-screen overflow-hidden relative">
      <GNB />

      <aside
        className="hidden md:block z-30 h-full transition-all duration-300 ease-in-out bg-white shrink-0 overflow-hidden border-r shadow-lg relative"
        style={{ width: isSidebarOpen ? "380px" : "0px" }}
      >
        <div className="w-[380px] h-full">
          <StationSidebar {...sidebarProps} />
        </div>
      </aside>

      <div
        className="hidden md:block absolute top-1/2 -translate-y-1/2 z-[110] transition-all duration-300"
        style={{ left: 80 + (isSidebarOpen ? 380 : 0) + (selectedStationId ? 400 : 0) }}
      >
        <button
          onClick={() => selectedStationId ? setSelectedStationId(null) : setIsSidebarOpen((p) => !p)}
          className="bg-white border border-zinc-200 w-6 h-14 flex items-center justify-center rounded-r-lg shadow-md hover:bg-zinc-50"
        >
          <span className="text-zinc-400 text-[10px] font-bold">
            {selectedStationId || isSidebarOpen ? "◀" : "▶"}
          </span>
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
          isMobileSheetOpen={isMobileSheetOpen}
        />

        {/* 범례 — 모바일 상세 열리면 숨김 */}
        <div className={`absolute top-4 right-4 z-20 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-gray-200 flex items-center gap-2 flex-wrap max-w-[calc(100%-32px)] md:max-w-none
          ${selectedStationId ? "hidden md:flex" : "flex"}`}
        >
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">여유70</span>
          </div>
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">보통70~30</span>
          </div>
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">혼잡30</span>
          </div>
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
            <div className="w-3 h-3 rounded-full bg-black"></div>
            <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">전체고장</span>
          </div>
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
            <div className="w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-black leading-none shrink-0">!</div>
            <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">고장</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-400 shrink-0"></div>
            <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">확인불가</span>
          </div>
        </div>

        {/* 데스크탑 전용 상세 패널 */}
        <div
          className={`
            hidden md:block
            absolute top-0 left-0 h-full w-[400px] z-[120] border-r
            transition-all duration-300 ease-in-out
            ${selectedStationId ? "translate-x-0 opacity-100 visible" : "-translate-x-full opacity-0 invisible w-0"}
          `}
        >
          <div className="w-full h-full relative flex flex-col">
            {selectedStationData && (
              <StationDetail
                station={selectedStationData}
                onClose={() => setSelectedStationId(null)}
              />
            )}
          </div>
        </div>

        {/* ✅ 모바일 하단 시트 — bottom-[65px], 상세 모드 h-[58vh] 로 축소 */}
        <div
          className={`
            md:hidden fixed left-0 w-full z-[110]
            bg-white rounded-t-[2.5rem]
            shadow-[0_-10px_30px_rgba(0,0,0,0.1)]
            border-t border-gray-100
            flex flex-col
            transition-all duration-500 ease-in-out
            bottom-[65px]
            ${selectedStationId
              ? "h-[58vh]"    // ✅ 72vh → 58vh 로 축소 (공백 제거)
              : isMobileSheetOpen
                ? "h-[50vh]"
                : "h-[60px]"
            }
          `}
        >
          {/* 핸들바 */}
          <div
            className="w-full h-[52px] flex items-center justify-center shrink-0 cursor-pointer"
            onClick={() => {
              if (selectedStationId) {
                handleMobileDetailClose();
              } else {
                setIsMobileSheetOpen(!isMobileSheetOpen);
              }
            }}
          >
            {selectedStationId ? (
              <span className="text-blue-600 text-sm font-bold">← 목록으로</span>
            ) : (
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            )}
          </div>

          {/* 시트 내용 */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {selectedStationId && selectedStationData ? (
              <StationDetail
                station={selectedStationData}
                onClose={handleMobileDetailClose}
                isMobileSheet={true}
              />
            ) : (
              <div className="flex-1 overflow-y-auto pb-4">
                <StationSidebar {...sidebarProps} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stations;