import React, { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

interface StationSidebarProps {
  stations: any[];
  isLoading: boolean;
  speedFilter: string;
  setSpeedFilter: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  onSearch: (keyword: string) => void; 
  onLoadMore: () => void; 
  onHoverStation: (id: string | null) => void; 
  onSelectStation: (id: string) => void; 
}

const StationSidebar = ({
  stations,
  isLoading,
  speedFilter,
  setSpeedFilter,
  statusFilter,
  setStatusFilter,
  onLoadMore,
  onHoverStation,
  onSelectStation
}: StationSidebarProps) => {
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && stations.length > 0) {
          onLoadMore();
        }
      },
      {
        root: scrollRef.current, 
        threshold: 0,
        rootMargin: '150px' 
      }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [onLoadMore, isLoading, stations.length]);

  // 💡 수정된 요금 표시 로직: StationDetail의 hasFast/hasSlow 방식을 적용
  const renderPrices = (s: any) => {
    // 상세조회처럼 해당 타입의 충전기가 실제로 존재할 때만 true (0/0 제외)
    const hasFast = s.fastChargerStatus && !s.fastChargerStatus.includes('0/0');
    const hasSlow = s.slowChargerStatus && !s.slowChargerStatus.includes('0/0');
    
    const priceElements = [];

    // 1. 급속 요금 (hasFast가 true일 때만)
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

    // 2. 완속 요금 (hasSlow가 true일 때만)
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

    if (priceElements.length === 0) {
      return <span className="text-gray-400 text-[11px]">요금 정보 없음</span>;
    }

    return <div className="flex flex-col gap-1.5">{priceElements}</div>;
  };

  return (
    <div className="w-full min-w-[380px] h-full bg-white flex flex-col overflow-hidden border-r border-gray-100 shadow-[20px_0_30px_rgba(0,0,0,0.03)] z-20">
      <div className="p-5 border-b space-y-5 shrink-0">
        <div className="relative">
          <input type="text" placeholder="충전소, 지역, 주소 검색..." className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 pl-12 pr-4 text-sm" />
          <button className="absolute left-4 top-3 text-gray-400">🔍</button>
        </div>
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
              {['전체', '이용 가능', '혼잡', '만석'].map((t) => (
                <button key={t} onClick={() => setStatusFilter(t)} className={`px-5 py-2 rounded-full text-xs font-semibold border transition-all ${statusFilter === t ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-3.5 bg-blue-50/50 border-b flex items-center justify-between shrink-0">
        <p className="text-blue-700 text-[13px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>반경 1.5km 내 충전소 {stations.length}개</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
        {stations.map((s, i) => (
          <div key={`${s.statId}-${i}`} className="p-6 hover:bg-gray-50 cursor-pointer transition-all active:bg-blue-50/30" onMouseEnter={() => onHoverStation(s.statId)} onMouseLeave={() => onHoverStation(null)} onClick={() => onSelectStation(s.statId)}>
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="font-bold text-gray-800 text-[16px] leading-tight pr-4">{s.statNm}</h3>
              <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap">{s.distance}km</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 line-clamp-1">{s.addr || '주소 정보가 없습니다.'}</p>
            
            {/* 충전기 대수 정보 - "급속 ", "완속 " 중복 텍스트 제거 */}
            <div className="flex flex-col gap-1.5 mb-4 text-[11px] text-gray-600 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600 w-8">급속</span>
                <span className="font-medium">{s.fastChargerStatus ? s.fastChargerStatus.replace('급속 ', '') : '0/0'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600 w-8">완속</span>
                <span className="font-medium">{s.slowChargerStatus ? s.slowChargerStatus.replace('완속 ', '') : '0/0'}</span>
              </div>
            </div>

            <div className="flex items-end justify-between mt-1 text-[11px] text-gray-400">
              <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
                <span>🅿️ 주차 {s.limitYn === 'Y' ? '가능' : '불가'}</span>
                <span className="truncate">🔓 {s.useTime || '24시간'}</span>
              </div>
              
              <div className="text-right whitespace-nowrap">
                {renderPrices(s)}
              </div>
            </div>
          </div>
        ))}
        <div ref={observerTarget} className="h-24 flex items-center justify-center">
          {isLoading && (
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