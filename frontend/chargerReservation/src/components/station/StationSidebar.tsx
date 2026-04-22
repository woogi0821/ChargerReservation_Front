import { useState, useRef, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useChargerSearch } from '../../hook/useChargerSearch';

interface StationSidebarProps {
  stations: any[];
  setSearchResults: Dispatch<SetStateAction<any[]>>;
  keyword: string;
  setKeyword: (v: string) => void;
  isSearchMode: boolean;
  setIsSearchMode: (v: boolean) => void;
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
  selectedStationId: string | null;
}

const StationSidebar = ({
  stations, setSearchResults, keyword, setKeyword, isSearchMode, setIsSearchMode,
  isLoading, speedFilter, setSpeedFilter, statusFilter, setStatusFilter,
  isParkingAvailable, setIsParkingAvailable, isParkingFree, setIsParkingFree,
  isNoRestriction, setIsNoRestriction, onHoverStation, onSelectStation, mapCenter,
  selectedStationId
}: StationSidebarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { isLoading: isSearching, executeSearch } = useChargerSearch();
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // ✅ 마커 클릭 시 해당 아이템으로 자동 스크롤
  useEffect(() => {
    if (!selectedStationId) return;
    const el = itemRefs.current.get(selectedStationId);
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedStationId]);

  // ✅ 새 검색(selectedStationId 없을 때)에만 맨 위로 스크롤
  // selectedStationId 있을 때는 절대 스크롤 건드리지 않음
  const prevStationsLengthRef = useRef<number>(0);
  useEffect(() => {
    const newLength = stations.length;
    const prevLength = prevStationsLengthRef.current;
    prevStationsLengthRef.current = newLength;

    // 완전히 새로운 검색 결과로 교체됐을 때만(길이가 크게 달라질 때) 맨 위로
    if (!selectedStationId && newLength !== prevLength && prevLength > 0 && newLength > 10) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [stations]);

  const handleExecuteSearch = async () => {
    setIsSearchMode(true);
    const res = await executeSearch(keyword, mapCenter.lat, mapCenter.lng);
    setSearchResults(res || []);
  };

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
    <div className="w-full md:min-w-[380px] h-full bg-white flex flex-col overflow-hidden border-r border-gray-100 shadow-[20px_0_30px_rgba(0,0,0,0.03)] z-20">
      
      {/* 1. 검색창 (고정 영역) */}
      <div className="p-5 border-b shrink-0">
        <div className="relative">
          <input 
            type="text" 
            placeholder="주변 1.5km 충전소 검색..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteSearch(); }}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 pl-12 pr-4 text-sm" 
          />
          <button type="button" className="absolute left-4 top-3 text-gray-400" onClick={handleExecuteSearch}> 🔍 </button>
          {isSearching && <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
        </div>
      </div>

      {/* 2. 필터 토글 헤더 (접었을 때 높이를 줄여주는 트리거) */}
      <div className="px-5 py-2.5 border-b flex items-center justify-between bg-white shrink-0">
        <div className="flex gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${speedFilter !== '전체' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {speedFilter}
          </span>
          <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${statusFilter !== '전체' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {statusFilter}
          </span>
        </div>
        <button 
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
        >
          {isFilterExpanded ? '필터 접기 ▲' : '필터 상세 ▼'}
        </button>
      </div>
      
      {/* 3. 상세 필터 영역 (조건부 렌더링 -> 모바일 h-fit 부모의 높이를 변화시킴) */}
      {isFilterExpanded && (
        <div className="p-5 border-b space-y-5 shrink-0 bg-gray-50/30">
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 tracking-wide ml-1">충전 속도</label>
              <div className="flex gap-2">
                {['전체', '급속', '완속'].map((t) => (
                  <button key={t} onClick={() => setSpeedFilter(t)} className={`px-5 py-2 rounded-full text-xs font-semibold border transition-all ${speedFilter === t ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-500 border-gray-200'}`}>
                    {t === '급속' ? '⚡ ' : t === '완속' ? '🔌 ' : ''}{t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 tracking-wide ml-1">이용 상태</label>
              <div className="flex gap-2">
                {['전체', '여유', '보통'].map((t) => (
                  <button key={t} onClick={() => setStatusFilter(t)} className={`px-5 py-2 rounded-full text-xs font-semibold border transition-all ${statusFilter === t ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-500 border-gray-200'}`}> {t} </button>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 tracking-wide ml-1">이용 가능</label>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setIsParkingAvailable(!isParkingAvailable)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isParkingAvailable ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}> {isParkingAvailable ? '✓ 주차가능' : '+ 주차가능'} </button>
                <button onClick={() => setIsParkingFree(!isParkingFree)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isParkingFree ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}> {isParkingFree ? '✓ 주차무료' : '+ 주차무료'} </button>
                <button onClick={() => setIsNoRestriction(!isNoRestriction)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isNoRestriction ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}> {isNoRestriction ? '✓ 제한없음' : '+ 제한없음'} </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 결과 요약 (고정 영역) */}
      <div className="px-5 py-3.5 bg-blue-50/50 border-b flex items-center justify-between shrink-0">
        <p className="text-blue-700 text-[13px] font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          {isSearchMode ? `'${keyword}' 결과 ${stations.length}개` : `내 주변 충전소 ${stations.length}개`}
        </p>
        {isSearchMode && (
          <button onClick={() => { setKeyword(''); setSearchResults([]); setIsSearchMode(false); }} className="text-[10px] text-gray-400 hover:text-red-500 underline font-bold">초기화</button>
        )}
      </div>

      {/* 5. 리스트 영역 (남은 공간을 채우며, 부모의 max-h에 걸리면 스크롤 발생) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
        {stations.length === 0 && !isLoading && !isSearching ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400 text-sm py-10">
            <div className="mb-2 text-2xl">🔍</div>
            <div className="font-semibold">검색 결과가 없습니다</div>
          </div>
        ) : (
          stations.map((s: any, i: number) => {
            const sid = s.statId || s.chargerId;
            const isSelected = selectedStationId === sid;
            return (
              <div
                key={`${sid}-${i}`}
                ref={(el) => { if (el) itemRefs.current.set(sid, el); }}
                className={`p-6 cursor-pointer transition-all active:bg-blue-50/30
                  ${isSelected
                    ? 'bg-blue-50 border-l-4 border-blue-400'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                onMouseEnter={() => onHoverStation(sid)}
                onMouseLeave={() => onHoverStation(null)}
                onClick={() => onSelectStation(sid)}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-bold text-gray-800 text-[16px] leading-tight pr-4">{s.statNm || '이름 없음'}</h3>
                  {s.distance && <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap">{s.distance}km</span>}
                </div>
                <p className="text-xs text-gray-500 mb-4 line-clamp-1">{s.addr || '주소 정보가 없습니다.'}</p>
                <div className="flex flex-col gap-1.5 mb-4 text-[11px] text-gray-600 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2"><span className="font-bold text-blue-600 w-8">급속</span><span className="font-medium">{s.fastChargerStatus ? String(s.fastChargerStatus).replace('급속 ', '') : '0/0'}</span></div>
                  <div className="flex items-center gap-2"><span className="font-bold text-green-600 w-8">완속</span><span className="font-medium">{s.slowChargerStatus ? String(s.slowChargerStatus).replace('완속 ', '') : '0/0'}</span></div>
                </div>
                <div className="flex items-end justify-between mt-1 text-[11px] text-gray-400">
                  <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2"><span>🅿️ 주차 {s.limitYn === 'Y' ? '불가' : '가능'}</span><span className="truncate">🔓 {s.useTime || '24시간'}</span></div>
                  <div className="text-right whitespace-nowrap">{renderPrices(s)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default StationSidebar;