import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';
import type { Charger } from '../../types/reservation';

interface StationDetailProps {
  station: any;
  onClose: () => void;
}

const StationDetail = ({ station, onClose }: StationDetailProps) => {
  const navigate = useNavigate();

  const [reserveStep, setReserveStep] = useState<'idle' | 'loading' | 'selecting'>('idle');
  const [availableChargers, setAvailableChargers] = useState<Charger[]>([]);

  if (!station) return null;

// ✅ DTO의 변수명(brokenCount, totalCount 등)에 맞춰서 수정
  const formatStatusWithIcon = (status: string, type: '급속' | '완속') => {
    if (!status) return null;
    
    // 1. DTO에서 이미 만들어준 status 문자열을 활용하되, 
    // "급속 " 이나 "완속 " 글자는 중복이니 제거하고 숫자 부분만 추출합니다.
    const displayStatus = status.replace('급속 ', '').replace('완속 ', '');
    
    // 2. 만약 개별 고장 대수가 DTO 필드에 따로 없다면 문자열에서 직접 추출 (고장1 또는 고장:1 대응)
    const brokenMatch = status.match(/고장:?(\d+)/);
    const brokenCount = brokenMatch ? brokenMatch[1] : null;
    
    const icon = type === '급속' ? '⚡' : '🔌';
    
    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-black text-inherit">
          {type}: {displayStatus}
        </span>
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

  const hasFast = !!station.fastChargerStatus || station.speedType === '급속';
  const hasSlow = !!station.slowChargerStatus || station.speedType === '완속';

  const checkRestriction = () => {
    const detail = station.limitDetail;
    if (!detail || detail.trim() === "" || detail === "null") return false;
    const ignoreTexts = ["없음", "-", "시설 상황에 따라 이용이 제한될 수 있음", "해당없음"];
    if (ignoreTexts.includes(detail.trim())) return false;
    return true;
  };
  const hasRestriction = checkRestriction();

  const handleReservationClick = async () => {
    setReserveStep('loading');
    try {
      const chargers = await reservationService.getChargersByStation(station.statId);
      const available = chargers.filter(c => c.stat === '2');

      if (available.length === 0) {
        alert('현재 예약 가능한 충전기가 없습니다.');
        setReserveStep('idle');
        return;
      }

      const rapidList = available.filter(c => c.chargerTypeNm === '급속');
      const slowList  = available.filter(c => c.chargerTypeNm === '완속');

      if (rapidList.length > 0 && slowList.length === 0) {
        navigate('/reservation', { state: { selectedCharger: rapidList[0] } });
        return;
      }
      if (slowList.length > 0 && rapidList.length === 0) {
        navigate('/reservation', { state: { selectedCharger: slowList[0] } });
        return;
      }

      setAvailableChargers(available);
      setReserveStep('selecting');
    } catch {
      alert('충전기 정보를 불러오는데 실패했습니다.\n잠시 후 다시 시도해주세요.');
      setReserveStep('idle');
    }
  };

  const handleChargerTypeSelect = (type: 'RAPID' | 'SLOW') => {
    const selected = availableChargers.find(c =>
      type === 'RAPID' ? c.chargerTypeNm === '급속' : c.chargerTypeNm === '완속'
    );
    navigate('/reservation', { state: { selectedCharger: selected } });
  };

  const renderBottomAction = () => {
    if (reserveStep === 'selecting') {
      const rapidChargers = availableChargers.filter(c => c.chargerTypeNm === '급속');
      const slowChargers  = availableChargers.filter(c => c.chargerTypeNm === '완속');
      return (
        <div className="p-4 border-t border-gray-100 bg-white space-y-2">
          <p className="text-xs text-gray-500 text-center font-medium mb-1">충전 방식을 선택해주세요</p>
          <div className="grid grid-cols-2 gap-3">
            {rapidChargers.length > 0 && (
              <button
                onClick={() => handleChargerTypeSelect('RAPID')}
                className="bg-blue-600 text-white py-4 rounded-xl font-black text-base shadow-lg shadow-blue-200 active:scale-95 transition-all"
              >
                ⚡ 급속 예약<br />
                <span className="text-xs font-normal opacity-80">({rapidChargers.length}대 가능)</span>
              </button>
            )}
            {slowChargers.length > 0 && (
              <button
                onClick={() => handleChargerTypeSelect('SLOW')}
                className="bg-green-600 text-white py-4 rounded-xl font-black text-base shadow-lg shadow-green-200 active:scale-95 transition-all"
              >
                🔌 완속 예약<br />
                <span className="text-xs font-normal opacity-80">({slowChargers.length}대 가능)</span>
              </button>
            )}
          </div>
          <button onClick={() => setReserveStep('idle')} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">취소</button>
        </div>
      );
    }

    return (
      <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
        <button className="bg-gray-100 text-gray-800 py-4 rounded-xl font-bold text-base hover:bg-gray-200 transition-colors">길찾기</button>
        <button
          onClick={handleReservationClick}
          disabled={reserveStep === 'loading'}
          className="bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {reserveStep === 'loading' ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              조회 중...
            </>
          ) : '예약하기'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl border-l border-gray-100 font-sans">
      {/* 헤더 */}
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
          <div className="flex flex-wrap items-end justify-between pt-2 border-t border-blue-500/30 mt-2 gap-y-2">
            <div className="flex gap-1 flex-1 min-w-[200px]">
              <span className="text-[12px] opacity-75 font-medium shrink-0">📍 상세:</span>
              <p className="text-[12px] opacity-90 leading-relaxed break-all">{station.location || '정보없음'}</p>
            </div>
            <div className="ml-auto">
              <p className="text-[12px] font-bold bg-blue-700/50 px-2 py-0.5 rounded whitespace-nowrap">{station.distance}km</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* 실시간 현황 - 디자인 변경 없음 */}
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

        {/* 요금 정보 */}
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

        {/* 상세 시설 정보 */}
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
          <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${hasRestriction ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <span className="text-xl">{hasRestriction ? '⚠️' : '✅'}</span>
            <div>
              <p className={`text-[10px] font-bold uppercase ${hasRestriction ? 'text-red-400' : 'text-green-400'}`}>Restriction Detail</p>
              <p className={`text-sm font-bold ${hasRestriction ? 'text-red-700' : 'text-green-700'}`}>{hasRestriction ? station.limitDetail : '제한사항 없음 (이용가능)'}</p>
            </div>
          </div>
        </div>
      </div>

      {renderBottomAction()}
    </div>
  );
};

export default StationDetail;