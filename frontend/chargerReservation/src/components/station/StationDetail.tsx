import React from 'react';

interface StationDetailProps {
  station: any;
  onClose: () => void;
}

const StationDetail = ({ station, onClose }: StationDetailProps) => {
  if (!station) return null;

  const formatStatusWithIcon = (status: string, type: '급속' | '완속') => {
    if (!status) return null;
    const counts = status.match(/\d+\/\d+/);
    const icon = type === '급속' ? '⚡' : '🔌';
    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-black">{type}: {counts ? counts[0] : status}</span>
      </div>
    );
  };

  const renderPriceDiff = (current: number, last: number) => {
    if (!current || !last) return null;
    const diff = Math.floor(current - last);
    if (diff === 0) return null;
    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
        diff > 0 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
      }`}>
        {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}원
      </span>
    );
  };

  const hasFast = !!station.fastChargerStatus;
  const hasSlow = !!station.slowChargerStatus;

  const checkRestriction = () => {
    const detail = station.limitDetail;
    if (!detail || detail.trim() === "" || detail === "null") return false;
    const ignoreTexts = ["없음", "-", "시설 상황에 따라 이용이 제한될 수 있음", "해당없음"];
    if (ignoreTexts.includes(detail.trim())) return false;
    return true;
  };
  const hasRestriction = checkRestriction();

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl border-l border-gray-100 font-sans">
      {/* [헤더] */}
      <div className="p-6 bg-blue-600 text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-blue-700 rounded-full transition-colors z-10">
          <span className="text-xl text-white">✕</span>
        </button>
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block text-[10px] font-bold bg-white text-blue-600 px-2 py-0.5 rounded shadow-sm">운영사</span>
            <span className="text-xs font-medium opacity-90">{station.bnm || '정보없음'}</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight pr-8">{station.statNm}</h2>
          <p className="text-sm opacity-90">{station.addr}</p>
          
          {/* ✨ 상세 주소 길이에 따라 거리가 우측 또는 우측 하단으로 이동 */}
          <div className="flex flex-wrap items-end justify-between pt-2 border-t border-blue-500/30 mt-2 gap-y-2">
            <div className="flex gap-1 flex-1 min-w-[200px]">
              <span className="text-[12px] opacity-75 font-medium shrink-0">📍 상세:</span>
              <p className="text-[12px] opacity-90 leading-relaxed break-all">
                {station.location || '정보없음'}
              </p>
            </div>
            <div className="ml-auto">
              <p className="text-[12px] font-bold bg-blue-700/50 px-2 py-0.5 rounded whitespace-nowrap">
                {station.distance}km
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* [1. 실시간 현황] */}
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            실시간 충전 현황
          </h3>
          <div className={`flex ${hasFast && hasSlow ? 'flex-row' : 'flex-col items-center'} gap-2.5`}>
            {hasFast && (
              <div className={`bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-center justify-center ${hasFast && hasSlow ? 'flex-1' : 'w-full max-w-[320px]'} text-blue-700`}>
                {formatStatusWithIcon(station.fastChargerStatus, '급속')}
              </div>
            )}
            {hasSlow && (
              <div className={`bg-green-50/50 p-4 rounded-xl border border-green-100/50 flex items-center justify-center ${hasFast && hasSlow ? 'flex-1' : 'w-full max-w-[320px]'} text-green-700`}>
                {formatStatusWithIcon(station.slowChargerStatus, '완속')}
              </div>
            )}
          </div>
        </div>

        {/* [2. 요금 정보] */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            요금 정보 {station.season && `(${station.season})`}
          </h3>
          <div className="space-y-3">
            {hasFast && (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">급속</span>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <p className="text-xs text-gray-400 line-through">작년: {station.lastYearPrice ? `${Math.floor(station.lastYearPrice)}원` : '-'}</p>
                    {renderPriceDiff(station.currentPrice, station.lastYearPrice)}
                  </div>
                  <p className="text-2xl font-black text-blue-600">
                    {station.currentPrice ? `${Math.floor(station.currentPrice)}원` : '현장 확인'}
                    <span className="text-sm font-normal text-gray-400 ml-1">/kWh</span>
                  </p>
                </div>
              </div>
            )}
            {hasSlow && (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded">완속</span>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <p className="text-xs text-gray-400 line-through">작년: {station.slowLastYearPrice ? `${Math.floor(station.slowLastYearPrice)}원` : '-'}</p>
                    {renderPriceDiff(station.slowPrice, station.slowLastYearPrice)}
                  </div>
                  <p className="text-2xl font-black text-green-600">
                    {station.slowPrice ? `${Math.floor(station.slowPrice)}원` : '현장 확인'}
                    <span className="text-sm font-normal text-gray-400 ml-1">/kWh</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* [3. 상세 시설 정보] */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <span className="text-xl">🔓</span>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Operating Hours</p>
              <p className="text-sm font-bold text-gray-700">{station.useTime || '24시간'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <span className="text-xl">🅿️</span>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Parking</p>
              <p className="text-sm font-bold text-gray-700">
                {station.limitYn === 'Y' ? '주차제한' : '주차가능'} | {station.parkingFree === 'Y' ? '무료 주차' : '유료 주차'}
              </p>
            </div>
          </div>

          <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
            hasRestriction ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
          }`}>
            <span className="text-xl">{hasRestriction ? '⚠️' : '✅'}</span>
            <div>
              <p className={`text-[10px] font-bold uppercase ${hasRestriction ? 'text-red-400' : 'text-green-400'}`}>Restriction Detail</p>
              <p className={`text-sm font-bold ${hasRestriction ? 'text-red-700' : 'text-green-700'}`}>
                {hasRestriction ? station.limitDetail : '제한사항 없음 (이용가능)'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
        <button className="bg-gray-100 text-gray-800 py-4 rounded-xl font-bold text-base hover:bg-gray-200 transition-colors">길찾기</button>
        <button onClick={() => alert('준비 중인 서비스입니다.')} className="bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all">예약하기</button>
      </div>
    </div>
  );
};

export default StationDetail;