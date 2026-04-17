import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/badge";
import { Toast } from "../../components/common/Toast";
import { useAuthStore } from "../../store/useAuthStore";
import { stationService } from "../../services/stationService";

interface StationCard {
  statId: string;
  statNm: string;
  addr: string;
  distance: number;
  fastChargerStatus: string;
  slowChargerStatus: string;
  markerColor: string;
}

interface StationStats {
  totalStations: number;
  totalChargers: number;
  availableChargers: number;
}

const getStationStatus = (markerColor: string): "available" | "busy" | "full" => {
  if (markerColor === "green") return "available";
  if (markerColor === "amber") return "busy";
  return "full";
};

const statusConfig = {
  available: { label: "이용 가능", variant: "primary" as const },
  busy:      { label: "혼잡",     variant: "outline" as const },
  full:      { label: "만석",     variant: "danger"  as const },
};

const FEATURES = [
  {
    icon: "🗺️",
    title: "실시간 지도",
    desc: "주변 충전소의 현재 이용 현황을 지도에서 한눈에 확인하세요",
  },
  {
    icon: "⚡",
    title: "즉시 예약",
    desc: "원하는 시간과 충전기를 선택해 빠르게 예약을 완료하세요",
  },
  {
    icon: "🔔",
    title: "스마트 알림",
    desc: "충전 완료, 예약 시간 임박 등 중요한 알림을 실시간으로 받으세요",
  },
  {
    icon: "📊",
    title: "충전 이력 관리",
    desc: "내 충전 이력과 비용, CO₂ 절감량을 한눈에 확인하고 관리하세요",
  },
];

const STEPS = [
  {
    step: "STEP 01",
    title: "충전소 검색",
    desc: "현재 위치 또는 목적지 근처 충전소를 지도에서 실시간으로 확인하세요. 여유 자리와 충전 속도를 한눈에 볼 수 있어요.",
    icon: "🔍",
  },
  {
    step: "STEP 02",
    title: "시간 예약",
    desc: "원하는 날짜와 시간대를 선택해 자리를 미리 확보하세요. 예약 확인은 문자와 앱 알림으로 즉시 받을 수 있어요.",
    icon: "📅",
  },
  {
    step: "STEP 03",
    title: "바로 충전",
    desc: "예약 시간에 도착해 QR코드 또는 앱으로 인증하면 즉시 충전 시작. 대기줄 없이 바로 시작할 수 있어요.",
    icon: "🕐",
  },
];

const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.9780;

export const HomePage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { loggedIn, setActiveModal } = useAuthStore();
  const [toastVisible, setToastVisible] = useState(false);
  const navigate = useNavigate();

  const [stations, setStations] = useState<StationCard[]>([]);
  const [stats, setStats] = useState<StationStats | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await stationService.getStats();
        if (data) setStats(data);
      } catch (error) {
        console.error("통계 로드 실패:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchStations = async (lat: number, lng: number) => {
      try {
        const data = await stationService.getStationsAround(lat, lng);
        setStations(data.slice(0, 4));
      } catch (error) {
        console.error("충전소 로드 실패:", error);
      } finally {
        setIsLoadingStations(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchStations(pos.coords.latitude, pos.coords.longitude),
        () => fetchStations(DEFAULT_LAT, DEFAULT_LNG)
      );
    } else {
      fetchStations(DEFAULT_LAT, DEFAULT_LNG);
    }
  }, []);

  // ✅ 수정 — 검색어를 state 로 넘기며 충전소 찾기 페이지로 이동
  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    navigate("/stations", { state: { keyword: searchKeyword } });
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] font-['Noto_Sans_KR']">

      {/* =====================================================
          SECTION 1 : 히어로
          ===================================================== */}
      <section className="px-6 py-20 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-[#DBEAFE] rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[300px] w-72 h-72 bg-[#FDE68A] rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto flex items-center justify-between gap-12">

          {/* 왼쪽 텍스트 영역 */}
          <div className="flex flex-col gap-6 flex-1">
            <div className="inline-flex items-center gap-2 bg-white border border-[#DBEAFE] rounded-full px-4 py-1.5 w-fit shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-[#1D4ED8] font-medium">
                NOW: {isLoadingStats ? "..." : `${stats?.totalStations?.toLocaleString() ?? "-"}개`} 충전소 운영 중(LIVE)
              </span>
            </div>

            <h1 className="text-5xl font-black text-[#0F172A] leading-tight">
              가까운 충전소를
              <br />
              <span className="text-[#1D4ED8]">지금 바로</span> 예약하세요
            </h1>

            <p className="text-[#64748B] text-base leading-relaxed">
              실시간 충전소 현황 확인부터 간편 예약까지,
              <br />
              ChargeNow 하나로 모든 것을 해결하세요.
            </p>

            <div className="flex w-full max-w-lg gap-2">
              <Input
                placeholder="📍 지역, 충전소명 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-white"
              />
              <Button
                variant="primary"
                size="md"
                disabled={!searchKeyword.trim()}
                onClick={handleSearch}
              >
                검색
              </Button>
            </div>

            {/* ✅ 수정 — 태그 클릭 시 바로 이동 */}
            <div className="flex gap-2 flex-wrap">
              {["강남", "서초", "급속 충전", "24시간"].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/stations", { state: { keyword: tag } })}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-10 mt-2">
              {isLoadingStats ? (
                [0, 1, 2].map((i) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-gray-300 animate-pulse">...</div>
                    <div className="text-[#94A3B8] text-sm">로딩 중</div>
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <div className="text-3xl font-black text-[#1D4ED8]">
                      {stats?.totalStations?.toLocaleString() ?? "-"}
                    </div>
                    <div className="text-[#64748B] text-sm">충전소</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#1D4ED8]">
                      {stats?.totalChargers?.toLocaleString() ?? "-"}
                    </div>
                    <div className="text-[#64748B] text-sm">충전기</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#1D4ED8]">
                      {stats
                        ? `${Math.round((stats.availableChargers / stats.totalChargers) * 100)}%`
                        : "-"}
                    </div>
                    <div className="text-[#64748B] text-sm">가동률 %</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 오른쪽 충전소 카드 */}
          <div className="w-[420px] shrink-0 bg-white rounded-2xl shadow-[0_4px_32px_rgba(59,130,246,0.12)] border border-[#DBEAFE] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DBEAFE]">
              <span className="font-bold text-[#0F172A] text-sm">내 주변 충전소</span>
              <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {isLoadingStations ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[#94A3B8]">불러오는 중...</span>
                </div>
              ) : (
                stations.map((station) => {
                  const status = getStationStatus(station.markerColor);
                  const { label, variant } = statusConfig[status];
                  return (
                    <div
                      key={station.statId}
                      className="flex items-center justify-between px-5 py-3 hover:bg-[#F8FAFF] transition-colors cursor-pointer"
                      onClick={() => navigate("/stations")}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-[#0F172A]">{station.statNm}</span>
                        <span className="text-xs text-[#94A3B8]">📍 {station.distance?.toFixed(1)}km</span>
                      </div>
                      <Badge variant={variant} size="sm">{label}</Badge>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#DBEAFE]">
              <button
                onClick={() => navigate("/stations")}
                className="w-full py-2.5 text-sm text-[#1D4ED8] bg-[#EFF6FF] rounded-xl hover:bg-[#DBEAFE] transition-colors font-medium"
              >
                전체 충전소 보기 →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          SECTION 2 : 왜 ChargeNow인가요?
          ===================================================== */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#EFF6FF] rounded-full px-4 py-1.5 mb-4">
              <span className="text-sm text-[#1D4ED8] font-medium">왜 ChargeNow인가요?</span>
            </div>
            <h2 className="text-3xl font-black text-[#0F172A]">더 스마트한 충전 경험</h2>
            <p className="text-[#64748B] mt-2">번거로운 충전을 간편하게, ChargeNow가 함께합니다</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group flex flex-col gap-4 p-6 rounded-2xl border border-[#DBEAFE] bg-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] group-hover:bg-white/20 flex items-center justify-center text-2xl transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-black text-[#0F172A] group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed group-hover:text-blue-100 transition-colors">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3 : 3단계 예약
          ===================================================== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-[#0F172A] mb-2">
            3단계로 끝나는
            <br />
            간단한 예약
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[#DBEAFE] flex flex-col gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] font-medium tracking-widest mb-1">
                    {step.step}
                  </p>
                  <h3 className="font-black text-[#0F172A] text-lg">{step.title}</h3>
                </div>
                <p className="text-[#64748B] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4 : 현재 충전소 현황
          ===================================================== */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A]">현재 충전소 현황</h2>
              <p className="text-[#94A3B8] text-sm mt-1">방금 전 업데이트됨</p>
            </div>
            <button
              onClick={() => navigate("/stations")}
              className="px-4 py-2 text-sm text-[#1D4ED8] bg-[#EFF6FF] rounded-xl hover:bg-[#DBEAFE] transition-colors font-medium"
            >
              전체 보기 →
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingStats ? (
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-[#F8FAFF] rounded-2xl p-5 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-2xl p-5 border border-[#DBEAFE] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-lg">✅</div>
                    <span className="text-xs text-green-500 font-medium">+3%</span>
                  </div>
                  <div className="text-3xl font-black text-[#1D4ED8] mb-1">
                    {stats?.availableChargers?.toLocaleString() ?? "-"}
                  </div>
                  <div className="text-sm text-[#64748B]">이용 가능</div>
                  <div className="mt-3 h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1D4ED8] rounded-full"
                      style={{
                        width: stats
                          ? `${Math.round((stats.availableChargers / stats.totalChargers) * 100)}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#DBEAFE] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-lg">⚡</div>
                    <span className="text-xs text-gray-400 font-medium">±0</span>
                  </div>
                  <div className="text-3xl font-black text-[#F97316] mb-1">
                    {stats
                      ? Math.round(stats.totalChargers * 0.08).toLocaleString()
                      : "-"}
                  </div>
                  <div className="text-sm text-[#64748B]">충전 중</div>
                  <div className="mt-3 h-1.5 bg-[#FFF7ED] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F97316] rounded-full" style={{ width: "8%" }} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#DBEAFE] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-lg">🚫</div>
                    <span className="text-xs text-red-400 font-medium">-1%</span>
                  </div>
                  <div className="text-3xl font-black text-[#EF4444] mb-1">
                    {stats
                      ? (stats.totalChargers - stats.availableChargers).toLocaleString()
                      : "-"}
                  </div>
                  <div className="text-sm text-[#64748B]">이용 불가</div>
                  <div className="mt-3 h-1.5 bg-[#FEF2F2] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#EF4444] rounded-full"
                      style={{
                        width: stats
                          ? `${Math.round(((stats.totalChargers - stats.availableChargers) / stats.totalChargers) * 100)}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#DBEAFE] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-lg">📋</div>
                    <span className="text-xs text-blue-400 font-medium">+2</span>
                  </div>
                  <div className="text-3xl font-black text-[#6366F1] mb-1">
                    {stats
                      ? Math.round(stats.totalChargers * 0.03).toLocaleString()
                      : "-"}
                  </div>
                  <div className="text-sm text-[#64748B]">예약 중</div>
                  <div className="mt-3 h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#6366F1] rounded-full" style={{ width: "3%" }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 5 : 하단 CTA 배너
          ===================================================== */}
      {!loggedIn && (
        <section className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] py-16 px-6 text-center text-white">
          <h2 className="text-3xl font-black mb-3">지금 바로 시작하세요</h2>
          <p className="text-blue-100 mb-8">회원가입 후 첫 충전 요금 10% 할인</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setActiveModal("INFO")}
              className="bg-white text-[#1D4ED8] hover:bg-blue-50"
            >
              무료로 시작하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/stations")}
              className="border-white text-white hover:bg-white/10"
            >
              충전소 찾기
            </Button>
          </div>
        </section>
      )}

      {/* =====================================================
          SECTION 6 : 푸터
          ===================================================== */}
      <footer className="bg-[#0F172A] text-[#64748B] px-6 py-12 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl">⚡</span>
              <span className="text-white font-black text-lg">ChargeNow</span>
            </div>
            <p className="text-xs leading-relaxed text-[#475569]">
              친환경 모빌리티를 위한
              <br />
              스마트 충전소 예약 플랫폼
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold mb-2">서비스</span>
              <span className="hover:text-white cursor-pointer transition-colors">충전소 찾기</span>
              <span className="hover:text-white cursor-pointer transition-colors">예약 관리</span>
              <span className="hover:text-white cursor-pointer transition-colors">요금 안내</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold mb-2">고객지원</span>
              <span className="hover:text-white cursor-pointer transition-colors">공지사항</span>
              <span className="hover:text-white cursor-pointer transition-colors">자주 묻는 질문</span>
              <span className="hover:text-white cursor-pointer transition-colors">고객센터 1588-0000</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold mb-2">회사</span>
              <span className="hover:text-white cursor-pointer transition-colors">회사 소개</span>
              <span className="hover:text-white cursor-pointer transition-colors">개인정보처리방침</span>
              <span className="hover:text-white cursor-pointer transition-colors">이용약관</span>
            </div>
          </div>
        </div>
      </footer>

      <Toast
        variant="success"
        position="top-right"
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      >
        📍 현재 위치에서 가장 가까운 충전소를 찾는 중입니다...
      </Toast>
    </div>
  );
};