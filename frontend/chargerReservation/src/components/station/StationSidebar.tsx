import React, { useEffect, useRef, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useChargerSearch } from '../../hook/useChargerSearch';

interface StationSidebarProps {
  stations: any[];
  isLoading: boolean;
  speedFilter: string;
  setSpeedFilter: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  isParkingAvailable: boolean;
  setIsParkingAvailable: Dispatch<SetStateAction<boolean>>;
  isParkingFree: boolean;
  setIsParkingFree: Dispatch<SetStateAction<boolean>>;
  isNoRestriction: boolean;
  setIsNoRestriction: Dispatch<SetStateAction<boolean>>;
  onLoadMore: () => void;
  onHoverStation: (id: string | null) => void;
  mapCenter: { lat: number; lng: number };
  onSelectStation: (id: string) => void;
}

const StationSidebar = ({
  stations,
  isLoading,
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
  onLoadMore,
  onHoverStation,
  onSelectStation,
  mapCenter
}: StationSidebarProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { keyword, setKeyword, results, isLoading: isSearching, executeSearch } = useChargerSearch();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isSearching && stations.length > 0 && results.length === 0) {
          onLoadMore();
        }
      },
      { root: scrollRef.current, threshold: 0, rootMargin: '150px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [onLoadMore, isLoading, isSearching, stations.length, results.length]);

  const displaySource = useMemo(() => {
    return results && results.length > 0 ? results : stations;
  }, [results, stations]);

  const filteredStations = useMemo(() => {
    return (displaySource || []).filter((s: any) => {
      if (statusFilter === '여유' && s.markerColor !== 'green') return false;
      if (statusFilter === '혼잡' && s.markerColor !== 'amber') return false;

      if (speedFilter === '급속') {
        if (!s.fastChargerStatus || s.fastChargerStatus.includes('0/0')) return false;
      } else if (speedFilter === '완속') {
        if (!s.slowChargerStatus || s.slowChargerStatus.includes('0/0')) return false;
      }

      if (isParkingAvailable && s.limitYn === 'Y') return false;
      if (isParkingFree && s.parkingFree !== 'Y') return false;
      if (isNoRestriction) {
        const ignoreTexts = ["없음", "-", "해당없음", "null"];
        const ltd = (s.limitDetail ?? "").trim();
        const isIgnored = !ltd || ignoreTexts.includes(ltd) || ltd.startsWith("시설 상황에 따라");
        if (!isIgnored) return false;
      }
      return true;
    });
  }, [displaySource, statusFilter, speedFilter, isParkingAvailable, isNoRestriction, isParkingFree]);

  const renderPrices = (s: any) => {
    const hasFast = s.fastChargerStatus && !s.fastChargerStatus.includes('0/0');
    const hasSlow = s.slowChargerStatus && !s.slowChargerStatus.includes('0/0');
    const priceElements = [];

    if (hasFast) {
      priceElements.push(
        <div key="fast" className="flex flex-col items-end">
          <span className="text-[9px] text-blue-500 font-bold mb-[-3px]">급속</span>
          <div className="text-blue-600 font-extrabold text-[14px]">
            {s.currentPrice && s.currentPrice > 0 ? Math.floor(s.currentPrice) : '현장확인'}
            <span className="text-[9px] font-normal text-gray-400 ml-0.5">원</span>
          </div>
        </div>
      );
    }

    if (hasSlow) {
      priceElements.push(
        <div key="slow" className="flex flex-col items-end">
          <span className="text-[9px] text-green-500 font-bold mb-[-3px]">완속</span>
          <div className="text-green-600 font-extrabold text-[14px]">
            {s.slowPrice && s.slowPrice > 0 ? Math.floor(s.slowPrice) : '현장확인'}
            <span className="text-[9px] font-normal text-gray-400 ml-0.5">원</span>
          </div>
        </div>
      );
    }

    return priceElements.length === 0 ? (
      <span className="text-gray-400 text-[11px]">요금 정보 없음</span>
    ) : (
      <div className="flex flex-col gap-1.5">{priceElements}</div>
    );
  };

  return (
    <div className="w-full min-w-[380px] h-full bg-white flex flex-col overflow-hidden border-r border-gray-100 shadow-[20px_0_30px_rgba(0,0,0,0.03)] z-20">
      <div className="p-5 border-b space-y-5 shrink-0">
        <div className="relative">
          <input 
            type="text" 
            placeholder="주변 1.5km 충전소 검색..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); 
                executeSearch(keyword, mapCenter.lat, mapCenter.lng);
              }
            }}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 pl-12 pr-4 text-sm" 
          />
          <button 
            type="button"
            className="absolute left-4 top-3 text-gray-400" 
            onClick={(e) => {
              e.preventDefault();
              executeSearch(keyword, mapCenter.lat, mapCenter.lng);
            }}
          >
            🔍
          </button>
          {isSearching && (
            <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        {/* 필터 영역 */}
        <div className="space-y-4">
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wide ml-1">충전 속도</label>
            <div className="flex gap-2">
              {['전체', '급속', '완속'].map((t) => (
                <button key={t} onClick={() => setSpeedFilter(t)} className={`px-5 py-2 rounded-full text-xs font-semibold border transition-all ${speedFilter === t ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                  {t === '급속' ? '⚡ ' : t === '완속' ? '🔌 ' : ''}{t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wide ml-1">이용 상태</label>
            <div className="flex gap-2">
              {['전체', '여유', '혼잡'].map((t) => (
                <button key={t} onClick={() => setStatusFilter(t)} className={`px-5 py-2 rounded-full text-xs font-semibold border transition-all ${statusFilter === t ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wide ml-1">이용 가능</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setIsParkingAvailable(!isParkingAvailable)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isParkingAvailable ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                {isParkingAvailable ? '✓ 주차가능' : '+ 주차가능'}
              </button>
              <button onClick={() => setIsParkingFree(!isParkingFree)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isParkingFree ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                {isParkingFree ? '✓ 주차무료' : '+ 주차무료'}
              </button>
              <button onClick={() => setIsNoRestriction(!isNoRestriction)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isNoRestriction ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                {isNoRestriction ? '✓ 제한없음' : '+ 제한없음'}
              </button>
            </div>
          </div>
        </div>
      </div>

<div className="px-5 py-3.5 bg-blue-50/50 border-b flex items-center justify-between shrink-0">
  <p className="text-blue-700 text-[13px] font-bold flex items-center gap-1.5">
    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
    {results.length > 0 ? (
      // 검색 결과가 있을 때
      `'${keyword}' 검색 결과 ${filteredStations.length}개`
    ) : (
      // 평상시 내 위치 기준 표시
      `내 위치 반경 1.5km 안 충전소 ${filteredStations.length}개`
    )}
  </p>
        {results.length > 0 && (
          <button onClick={() => { setKeyword(''); executeSearch('', mapCenter.lat, mapCenter.lng); }} className="text-[10px] text-gray-400 hover:text-red-500 underline">초기화</button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
        {filteredStations.map((s: any, i: number) => {
          const sid = s.statId || s.chargerId;
          return (
            <div 
              key={`${sid}-${i}`} 
              className="p-6 hover:bg-gray-50 cursor-pointer transition-all active:bg-blue-50/30" 
              onMouseEnter={() => onHoverStation(sid)} 
              onMouseLeave={() => onHoverStation(null)} 
              onClick={() => onSelectStation(sid)}
            >
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-bold text-gray-800 text-[16px] leading-tight pr-4">{s.statNm || s.chargerName || '이름 없음'}</h3>
                {s.distance && <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap">{s.distance}km</span>}
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-1">{s.addr || s.address || '주소 정보가 없습니다.'}</p>
              
              <div className="flex flex-col gap-1.5 mb-4 text-[11px] text-gray-600 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600 w-8">급속</span>
                  <span className="font-medium">
                    {s.fastChargerStatus ? String(s.fastChargerStatus).replace('급속 ', '') : '0/0'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600 w-8">완속</span>
                  <span className="font-medium">
                    {s.slowChargerStatus ? String(s.slowChargerStatus).replace('완속 ', '') : '0/0'}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between mt-1 text-[11px] text-gray-400">
                <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
                  <span>🅿️ 주차 {s.limitYn === 'Y' ? '불가' : '가능'}</span>
                  <span className="truncate">🔓 {s.useTime || '24시간'}</span>
                </div>
                <div className="text-right whitespace-nowrap">
                  {renderPrices(s)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={observerTarget} className="h-24 flex items-center justify-center">
          {(isLoading || isSearching) && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[11px] text-blue-500 font-bold">로딩 중...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationSidebar;