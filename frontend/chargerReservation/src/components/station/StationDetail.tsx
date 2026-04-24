import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';
import type { Charger } from '../../types/reservation';

interface StationDetailProps {
  station: any;
  onClose: () => void;
  isMobileSheet?: boolean;
}

const StationDetail = ({ station, onClose, isMobileSheet = false }: StationDetailProps) => {
  const navigate = useNavigate();
  const [reserveStep, setReserveStep] = useState<'idle' | 'loading' | 'selecting'>('idle');
  const [availableChargers, setAvailableChargers] = useState<Charger[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (station) {
      setVisible(false);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
    }
  }, [station]);

  if (!station) return null;

  const handleRouteClick = () => {
    const { statNm, lat, lng } = station;
    if (!lat || !lng) {
      alert("위치 정보(좌표)가 없어 길찾기를 실행할 수 없습니다.");
      return;
    }
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(statNm)},${lat},${lng}`;
    window.open(url, '_blank');
  };

  const formatStatusWithIcon = (status: string, type: '급속' | '완속') => {
    if (!status) return null;
    const displayStatus = status.replace('급속 ', '').replace('완속 ', '');
    const icon = type === '급속' ? '⚡' : '🔌';
    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-black text-inherit">{type}: {displayStatus}</span>
      </div>
    );
  };

  const renderPriceDiff = (current: number, last: number) => {
    if (!current || !last) return null;
    const diff = Math.floor(current - last);
    if (diff === 0) return null;
    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${diff > 0 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
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
      const slowList = available.filter(c => c.chargerTypeNm === '완속');
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
    const btnWrapClass = isMobileSheet
      ? "w-full bg-white border-t border-gray-100 p-3 grid grid-cols-2 gap-3 shrink-0"
      : "fixed bottom-[60px] left-0 w-full z-[105] bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-4 grid grid-cols-2 gap-3 md:static md:shadow-none md:border-t md:p-4";

    if (reserveStep === 'selecting') {
      const rapidChargers = availableChargers.filter(c => c.chargerTypeNm === '급속');
      const slowChargers = availableChargers.filter(c => c.chargerTypeNm === '완속');
      return (
        <div className={isMobileSheet
          ? "w-full bg-white border-t border-gray-100 p-3 space-y-2 shrink-0"
          : "fixed bottom-[60px] left-0 w-full z-[105] bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-4 space-y-2 md:static md:shadow-none md:border-t md:p-4"
        }>
          <p className="text-xs text-gray-500 text-center font-medium mb-1">충전 방식을 선택해주세요</p>
          <div className="grid grid-cols-2 gap-3">
            {rapidChargers.length > 0 && (
              <button onClick={() => handleChargerTypeSelect('RAPID')} className="bg-blue-600 text-white py-4 rounded-xl font-black text-base shadow-lg shadow-blue-200 active:scale-95 transition-all">
                ⚡ 급속 예약<br /><span className="text-xs font-normal opacity-80">({rapidChargers.length}대 가능)</span>
              </button>
            )}
            {slowChargers.length > 0 && (
              <button onClick={() => handleChargerTypeSelect('SLOW')} className="bg-green-600 text-white py-4 rounded-xl font-black text-base shadow-lg shadow-green-200 active:scale-95 transition-all">
                🔌 완속 예약<br /><span className="text-xs font-normal opacity-80">({slowChargers.length}대 가능)</span>
              </button>
            )}
          </div>
          <button onClick={() => setReserveStep('idle')} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">취소</button>
        </div>
      );
    }

    return (
      <div className={btnWrapClass}>
        <button
          onClick={handleRouteClick}
          className="bg-gray-100 text-gray-800 py-4 rounded-xl font-bold text-base hover:bg-gray-200 transition-colors"
        >
          길찾기
        </button>
        <button
          onClick={handleReservationClick}
          disabled={reserveStep === 'loading'}
          className="bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {reserveStep === 'loading' ? (
            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>조회 중...</>
          ) : '예약하기'}
        </button>
      </div>
    );
  };

  const MobileSheetDetail = () => (
    <div className="flex flex-col h-full">

      {/* 1. 헤더 */}
      <div className="px-4 pt-3 pb-3 bg-blue-600 text-white shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-0.5 rounded shadow-sm">운영사</span>
          <span className="text-xs font-medium opacity-90">{station.bnm || '정보없음'}</span>
          <span className="ml-auto text-[11px] font-bold bg-blue-700/50 px-2 py-0.5 rounded whitespace-nowrap">{station.distance}km</span>
        </div>
        <h2 className="text-base font-black leading-tight pr-2 mb-0.5">{station.statNm}</h2>
        <p className="text-xs opacity-80 leading-snug">{station.addr}</p>
      </div>

      {/* 2. 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* 현황판 */}
        <div className="px-3 py-3 border-b border-gray-100 bg-gray-50/30">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-blue-100 rounded-xl p-2.5 flex flex-col items-center gap-1 text-blue-700">
              <span className="text-base">⚡</span>
              <span className="text-[10px] font-bold text-blue-500">급속</span>
              <span className="text-xs font-black text-center leading-tight">
                {station.fastChargerStatus ? station.fastChargerStatus.replace('급속 ', '') : '정보없음'}
              </span>
            </div>
            <div className="bg-white border border-green-100 rounded-xl p-2.5 flex flex-col items-center gap-1 text-green-700">
              <span className="text-base">🔌</span>
              <span className="text-[10px] font-bold text-green-500">완속</span>
              <span className="text-xs font-black text-center leading-tight">
                {station.slowChargerStatus ? station.slowChargerStatus.replace('완속 ', '') : '정보없음'}
              </span>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-2.5 flex flex-col items-center gap-1">
              <span className="text-base">💰</span>
              <span className="text-[10px] font-bold text-gray-400">요금</span>
              <div className="text-center">
                {hasFast && station.currentPrice > 0 && <p className="text-xs font-black text-blue-600 leading-tight">{Math.floor(station.currentPrice)}원</p>}
                {hasSlow && station.slowPrice > 0 && <p className="text-xs font-black text-green-600 leading-tight">{Math.floor(station.slowPrice)}원</p>}
              </div>
            </div>
          </div>
        </div>

        {/* 운영시간 / 주차 / 제한 */}
        <div className="px-3 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-2.5 rounded-xl">
              <span className="text-sm">🔓</span>
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Operating</p>
                <p className="text-xs font-bold text-gray-700">{station.useTime || '24시간'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-2.5 rounded-xl">
              <span className="text-sm">🅿️</span>
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Parking</p>
                <p className="text-xs font-bold text-gray-700">{station.limitYn === 'Y' ? '제한' : '가능'} · {station.parkingFree === 'Y' ? '무료' : '유료'}</p>
              </div>
            </div>
          </div>
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border ${hasRestriction ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <span className="text-sm mt-0.5">{hasRestriction ? '⚠️' : '✅'}</span>
            <div>
              <p className={`text-[9px] font-bold uppercase ${hasRestriction ? 'text-red-400' : 'text-green-400'}`}>이용제한</p>
              <p className={`text-xs font-bold ${hasRestriction ? 'text-red-700' : 'text-green-700'}`}>
                {hasRestriction ? station.limitDetail : '제한없음'}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ 추가 — 상세 위치 (location 필드 있을 때만 표시) */}
        {station.location && station.location.trim() !== '' && station.location !== 'null' && (
          <div className="px-3 pb-3 border-t border-gray-100">
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50/50 border border-blue-100 mt-3">
              <span className="text-sm mt-0.5">📍</span>
              <div>
                <p className="text-[9px] text-blue-400 font-bold uppercase">상세 위치</p>
                <p className="text-xs font-bold text-blue-700">{station.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ 추가 — 요금 비교 (작년 요금 데이터 있을 때만 표시) */}
        {(station.lastYearPrice > 0 || station.slowLastYearPrice > 0) && (
          <div className="px-3 pb-3 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 font-bold uppercase px-1 pt-3 pb-2">요금 변동</p>
            <div className="grid grid-cols-2 gap-2">
              {hasFast && station.lastYearPrice > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5">
                  <p className="text-[9px] text-blue-500 font-bold mb-1">급속</p>
                  <p className="text-xs font-black text-gray-700">
                    {Math.floor(station.currentPrice || 0)}원
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-[9px] text-gray-400 line-through">
                      작년 {Math.floor(station.lastYearPrice)}원
                    </p>
                    {renderPriceDiff(station.currentPrice, station.lastYearPrice)}
                  </div>
                </div>
              )}
              {hasSlow && station.slowLastYearPrice > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5">
                  <p className="text-[9px] text-green-500 font-bold mb-1">완속</p>
                  <p className="text-xs font-black text-gray-700">
                    {Math.floor(station.slowPrice || 0)}원
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-[9px] text-gray-400 line-through">
                      작년 {Math.floor(station.slowLastYearPrice)}원
                    </p>
                    {renderPriceDiff(station.slowPrice, station.slowLastYearPrice)}
                  </div>
                </div>
              )}
            </div>
            {/* ✅ 시즌 정보 있을 때 */}
            {station.season && (
              <p className="text-[9px] text-gray-400 text-right mt-1.5 pr-1">
                {station.season} 요금 기준
              </p>
            )}
          </div>
        )}

      </div>

      {/* 3. 버튼 */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        {reserveStep === 'selecting' ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center font-medium">충전 방식을 선택해주세요</p>
            <div className="grid grid-cols-2 gap-3">
              {availableChargers.filter(c => c.chargerTypeNm === '급속').length > 0 && (
                <button onClick={() => handleChargerTypeSelect('RAPID')} className="bg-blue-600 text-white py-4 rounded-xl font-black text-base active:scale-95 transition-all">
                  ⚡ 급속 예약<br /><span className="text-xs font-normal opacity-80">({availableChargers.filter(c => c.chargerTypeNm === '급속').length}대 가능)</span>
                </button>
              )}
              {availableChargers.filter(c => c.chargerTypeNm === '완속').length > 0 && (
                <button onClick={() => handleChargerTypeSelect('SLOW')} className="bg-green-600 text-white py-4 rounded-xl font-black text-base active:scale-95 transition-all">
                  🔌 완속 예약<br /><span className="text-xs font-normal opacity-80">({availableChargers.filter(c => c.chargerTypeNm === '완속').length}대 가능)</span>
                </button>
              )}
            </div>
            <button onClick={() => setReserveStep('idle')} className="w-full text-xs text-gray-400 py-1">취소</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleRouteClick}
              className="bg-gray-100 text-gray-800 py-4 rounded-xl font-bold text-base hover:bg-gray-200 transition-colors"
            >
              길찾기
            </button>
            <button
              onClick={handleReservationClick}
              disabled={reserveStep === 'loading'}
              className="bg-blue-600 text-white py-4 rounded-xl font-black text-lg active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {reserveStep === 'loading' ? (
                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>조회 중...</>
              ) : '예약하기'}
            </button>
          </div>
        )}
      </div>

    </div>
  );

  const MobileDetail = () => (
    <div
      className={`fixed left-4 right-4 bg-white font-sans transition-all duration-500 ease-out z-[105] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden
        bottom-[45vh] top-[0%]
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
    >
      <div className="px-5 pt-5 pb-4 bg-blue-600 text-white relative shrink-0">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-blue-700/50 rounded-full z-10 hover:bg-blue-800 transition-colors">
          <span className="text-sm text-white">✕</span>
        </button>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-0.5 rounded shadow-sm">운영사</span>
          <span className="text-xs font-medium opacity-90">{station.bnm || '정보없음'}</span>
          <span className="ml-auto text-[11px] font-bold bg-blue-700/50 px-2 py-0.5 rounded whitespace-nowrap">{station.distance}km</span>
        </div>
        <h2 className="text-xl font-black leading-tight pr-8 mb-1">{station.statNm}</h2>
        <p className="text-xs opacity-80 leading-snug">{station.addr}</p>
        {station.location && <p className="text-[11px] opacity-70 mt-1">📍 {station.location}</p>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/30">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-blue-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-blue-700 shadow-sm">
              <span className="text-lg">⚡</span>
              <span className="text-[10px] font-bold text-blue-500">급속</span>
              <span className="text-xs font-black text-center leading-tight">
                {station.fastChargerStatus ? station.fastChargerStatus.replace('급속 ', '') : '정보없음'}
              </span>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-green-700 shadow-sm">
              <span className="text-lg">🔌</span>
              <span className="text-[10px] font-bold text-green-500">완속</span>
              <span className="text-xs font-black text-center leading-tight">
                {station.slowChargerStatus ? station.slowChargerStatus.replace('완속 ', '') : '정보없음'}
              </span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
              <span className="text-lg">💰</span>
              <span className="text-[10px] font-bold text-gray-400">요금</span>
              <div className="text-center">
                {hasFast && station.currentPrice && station.currentPrice > 0 && <p className="text-xs font-black text-blue-600 leading-tight">{Math.floor(station.currentPrice)}원</p>}
                {hasSlow && station.slowPrice && station.slowPrice > 0 && <p className="text-xs font-black text-green-600 leading-tight">{Math.floor(station.slowPrice)}원</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-3 rounded-2xl shadow-sm">
              <span className="text-base">🔓</span>
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Operating</p>
                <p className="text-xs font-bold text-gray-700">{station.useTime || '24시간'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-3 rounded-2xl shadow-sm">
              <span className="text-base">🅿️</span>
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Parking</p>
                <p className="text-xs font-bold text-gray-700">{station.limitYn === 'Y' ? '제한' : '가능'} · {station.parkingFree === 'Y' ? '무료' : '유료'}</p>
              </div>
            </div>
          </div>
          <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${hasRestriction ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <span className="text-base mt-0.5">{hasRestriction ? '⚠️' : '✅'}</span>
            <div>
              <p className={`text-[9px] font-bold uppercase ${hasRestriction ? 'text-red-400' : 'text-green-400'}`}>이용제한</p>
              <p className={`text-xs font-bold ${hasRestriction ? 'text-red-700' : 'text-green-700'}`}>
                {hasRestriction ? station.limitDetail : '제한없음'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {renderBottomAction()}
      </div>
    </div>
  );

  const DesktopDetail = () => (
    <div className={`flex flex-col h-full bg-white shadow-2xl border-l border-gray-100 font-sans transition-transform duration-500 ease-out ${visible ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 bg-blue-600 text-white relative shrink-0">
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
      <div className="flex-1 overflow-y-auto pb-[150px]" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>실시간 충전 현황
          </h3>
          <div className={`flex ${hasFast && hasSlow ? 'flex-row' : 'flex-col items-center'} gap-2.5`}>
            {hasFast && <div className={`bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-center justify-center ${hasFast && hasSlow ? 'flex-1' : 'w-full max-w-[320px]'} text-blue-700`}>{formatStatusWithIcon(station.fastChargerStatus, '급속')}</div>}
            {hasSlow && <div className={`bg-green-50/50 p-4 rounded-xl border border-green-100/50 flex items-center justify-center ${hasFast && hasSlow ? 'flex-1' : 'w-full max-w-[320px]'} text-green-700`}>{formatStatusWithIcon(station.slowChargerStatus, '완속')}</div>}
          </div>
        </div>
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>요금 정보 {station.season && `(${station.season})`}
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
                  <p className="text-2xl font-black text-blue-600">{station.currentPrice ? `${Math.floor(station.currentPrice)}원` : '현장 확인'}<span className="text-sm font-normal text-gray-400 ml-1">/kWh</span></p>
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
                  <p className="text-2xl font-black text-green-600">{station.slowPrice ? `${Math.floor(station.slowPrice)}원` : '현장 확인'}<span className="text-sm font-normal text-gray-400 ml-1">/kWh</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
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
              <p className="text-sm font-bold text-gray-700">{station.limitYn === 'Y' ? '주차제한' : '주차가능'} | {station.parkingFree === 'Y' ? '무료 주차' : '유료 주차'}</p>
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
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );

  return (
    <>
      {isMobileSheet ? (
        <div className="block md:hidden h-full overflow-hidden">
          <MobileSheetDetail />
        </div>
      ) : (
        <div className="block md:hidden h-full overflow-hidden">
          <MobileDetail />
        </div>
      )}
      <div className="hidden md:block h-full overflow-hidden">
        <DesktopDetail />
      </div>
    </>
  );
};

export default StationDetail;