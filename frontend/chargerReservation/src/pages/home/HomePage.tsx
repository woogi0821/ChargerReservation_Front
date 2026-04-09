import { useState } from "react";

// ✅ 공용 컴포넌트 import
// → 이 파일에서 직접 스타일을 쓰지 않고 컴포넌트를 "조립"만 합니다.
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/badge";
import { Toast } from "../../components/common/Toast";
import Modal from "../../components/common/Modal";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 충전소 카드 한 개의 데이터 구조
interface StationCard {
  id: string;
  name: string;
  address: string;
  distance: string;
  rapidCount: number;
  slowCount: number;
  // "available" | "busy" | "full" 3가지로 제한
  // → 이 값이 Badge의 variant로 바로 연결됩니다
  status: "available" | "busy" | "full";
}

// ─────────────────────────────────────────────
// 임시 데이터 (나중에 API 연결 시 교체)
// ─────────────────────────────────────────────

const NEARBY_STATIONS: StationCard[] = [
  { id: "s1", name: "강남 테헤란로점",   address: "서울 강남구 테헤란로 152",  distance: "0.3km", rapidCount: 4, slowCount: 6, status: "available" },
  { id: "s2", name: "서초 반포점",       address: "서울 서초구 반포대로 58",   distance: "0.8km", rapidCount: 2, slowCount: 4, status: "busy"      },
  { id: "s3", name: "송파 잠실점",       address: "서울 송파구 올림픽로 240",  distance: "1.2km", rapidCount: 6, slowCount: 8, status: "full"      },
  { id: "s4", name: "마포 홍대점",       address: "서울 마포구 양화로 160",    distance: "1.5km", rapidCount: 2, slowCount: 4, status: "available" },
];

// 충전소 상태에 따라 Badge의 variant와 텍스트를 결정하는 딕셔너리
// ─────────────────────────────────────────────
// 💡 [컴포넌트 이점 ①] 딕셔너리 패턴 + Badge 재사용
//    상태가 4가지로 늘어나도, 또는 "혼잡" 글자를 "BUSY"로 바꿔도
//    이 딕셔너리 한 줄만 수정하면 페이지 내 모든 배지가 한번에 바뀝니다.
//    Badge 컴포넌트 자체를 건드릴 필요가 없습니다.
// ─────────────────────────────────────────────
const statusConfig: Record<
  StationCard["status"],
  { label: string; variant: "primary" | "secondary" | "danger" | "outline" }
> = {
  available: { label: "이용 가능", variant: "primary"   },
  busy:      { label: "혼잡",     variant: "outline"    },
  full:      { label: "만석",     variant: "danger"     },
};

// 서비스 특징 카드 데이터
const FEATURES = [
  { icon: "🗺️", title: "실시간 지도",    desc: "주변 충전소의 현재 이용 현황을 지도에서 한눈에 확인하세요" },
  { icon: "⚡", title: "즉시 예약",      desc: "원하는 시간과 충전기를 선택해 빠르게 예약을 완료하세요"   },
  { icon: "🔔", title: "스마트 알림",    desc: "충전 완료, 예약 시간 임박 등 중요한 알림을 실시간으로 받으세요" },
  { icon: "📊", title: "충전 이력 관리", desc: "내 충전 이력과 비용, CO₂ 절감량을 한눈에 확인하고 관리하세요" },
];

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

export const HomePage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    // TODO: useChargerSearch 훅 연결
    console.log("검색:", searchKeyword);
  };

  return (
    // 시안 배경색: #F5F8FF
    <div className="min-h-screen bg-[#F5F8FF] font-['Noto_Sans_KR']">

      {/* =====================================================
          SECTION 1 : 히어로
          ===================================================== */}
      <section className="bg-gradient-to-br from-[#1D4ED8] to-[#3B82F6] text-white px-6 py-20 text-center relative overflow-hidden">

        {/* 배경 블롭 (시안 그대로) */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto flex flex-col items-center gap-6">

          {/* ─────────────────────────────────────────────
              💡 [컴포넌트 이점 ②] Badge — 상태 표시 통일
              히어로 배지와 아래 충전소 카드 배지가 완전히 다른 곳에 있지만
              같은 Badge 컴포넌트를 씁니다.
              나중에 배지 폰트 크기를 바꾸면 두 곳이 동시에 바뀝니다.
          ───────────────────────────────────────────── */}
          <Badge variant="outline" size="md">
            <span className="text-white">⚡ 실시간 · 248개 충전소 운영 중</span>
          </Badge>

          <h1 className="text-4xl font-black leading-tight">
            가까운 충전소를<br />지금 바로 예약하세요
          </h1>
          <p className="text-blue-100 text-base">
            실시간 충전소 현황 확인부터 간편 예약까지,<br />
            ChargeNow 하나로 모든 것을 해결하세요.
          </p>

          {/* 검색창 */}
          <div className="flex w-full max-w-lg gap-2">

            {/* ─────────────────────────────────────────────
                💡 [컴포넌트 이점 ③] Input — 유효성 검사 내장
                error props만 넘기면 빨간 테두리 + 에러 메시지가
                Input 내부에서 자동으로 처리됩니다.
                이 페이지에서 에러 UI를 직접 만들 필요가 없습니다.
            ───────────────────────────────────────────── */}
            <Input
              placeholder="📍 충전소명 또는 지역 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />

            {/* ─────────────────────────────────────────────
                💡 [컴포넌트 이점 ④] Button — disabled 상태 자동 처리
                disabled={!searchKeyword} 한 줄로
                버튼 비활성화 스타일이 Button 내부에서 처리됩니다.
                disabled 스타일을 여기서 직접 짤 필요가 없습니다.
            ───────────────────────────────────────────── */}
            <Button
              variant="primary"
              size="md"
              disabled={!searchKeyword.trim()}
              onClick={handleSearch}
            >
              검색
            </Button>
          </div>

          {/* 빠른 검색 태그 */}
          <div className="flex gap-2 flex-wrap justify-center">
            {/* ─────────────────────────────────────────────
                💡 [컴포넌트 이점 ⑤] Badge — onClick으로 클릭 가능 배지
                Badge는 onClick이 있으면 자동으로 cursor-pointer + active:scale-95 효과가 붙습니다.
                버튼처럼 만들기 위해 별도 스타일 작업이 필요 없습니다.
            ───────────────────────────────────────────── */}
            {["강남", "서초", "급속 충전", "24시간"].map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                size="sm"
                onClick={() => setSearchKeyword(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* 통계 */}
          <div className="flex gap-8 mt-4">
            {[
              { num: "248", label: "충전소" },
              { num: "1,840", label: "충전기" },
              { num: "94%", label: "가동률" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black">{stat.num}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 : 내 주변 충전소 LIVE
          ===================================================== */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A]">내 주변 충전소 LIVE</h2>
            <p className="text-[#64748B] text-sm mt-1">현재 위치 기준 가까운 충전소</p>
          </div>

          {/* ─────────────────────────────────────────────
              💡 [컴포넌트 이점 ④ 반복] Button — variant="outline"
              "전체 보기" 같은 보조 버튼은 variant만 바꿔서 재사용합니다.
              버튼 컴포넌트를 새로 만들 필요 없이 variant="outline" 한 줄로 해결.
          ───────────────────────────────────────────── */}
          <Button variant="outline" size="sm">
            전체 충전소 보기 →
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEARBY_STATIONS.map((station) => {
            const { label, variant } = statusConfig[station.status];
            return (
              <div
                key={station.id}
                className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(59,130,246,0.09)] hover:shadow-[0_6px_32px_rgba(59,130,246,0.16)] transition-all border border-[#DBEAFE] flex flex-col gap-3"
              >
                {/* 충전소명 + 상태 배지 */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#0F172A] text-sm leading-snug">
                    {station.name}
                  </span>

                  {/* ─────────────────────────────────────────────
                      💡 [컴포넌트 이점 ① 실전 적용]
                      statusConfig 딕셔너리로 variant가 자동 결정됩니다.
                      "이용 가능"이면 primary(파란색),
                      "혼잡"이면 outline(회색),
                      "만석"이면 danger(빨간색).
                      → 이 카드가 100개로 늘어나도 코드는 이 한 줄입니다.
                  ───────────────────────────────────────────── */}
                  <Badge variant={variant} size="sm">
                    {label}
                  </Badge>
                </div>

                {/* 주소 + 거리 */}
                <p className="text-[#64748B] text-xs">{station.address}</p>
                <p className="text-[#94A3B8] text-xs">📍 {station.distance}</p>

                {/* 충전기 수 */}
                <div className="flex gap-3 text-xs text-[#64748B]">
                  <span>⚡ 급속 {station.rapidCount}기</span>
                  <span>🔌 완속 {station.slowCount}기</span>
                </div>

                {/* 예약 버튼 */}
                {/* ─────────────────────────────────────────────
                    💡 [컴포넌트 이점 ⑥] Button — disabled 자동 처리
                    만석이면 disabled를 넘기기만 하면 됩니다.
                    회색 처리 + 클릭 막기가 Button 내부에서 처리됩니다.
                ───────────────────────────────────────────── */}
                <Button
                  variant="primary"
                  size="sm"
                  disabled={station.status === "full"}
                  onClick={() => setIsLoginModalOpen(true)}
                  className="mt-auto w-full"
                >
                  {station.status === "full" ? "예약 불가" : "예약하기"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          SECTION 3 : 왜 ChargeNow인가요?
          ===================================================== */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-[#0F172A]">왜 ChargeNow인가요?</h2>
            <p className="text-[#64748B] mt-2">더 스마트한 충전 경험</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-[#DBEAFE] hover:shadow-[0_4px_24px_rgba(59,130,246,0.09)] transition-all"
              >
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="font-black text-[#0F172A]">{feature.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4 : 하단 CTA 배너
          ===================================================== */}
      <section className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-black mb-3">지금 바로 시작하세요</h2>
        <p className="text-blue-100 mb-8">회원가입 후 첫 충전 요금 10% 할인</p>
        <div className="flex gap-3 justify-center">

          {/* ─────────────────────────────────────────────
              💡 [컴포넌트 이점 ⑦] Button + Toast 조합
              "회원가입" 클릭 → 로그인 모달 오픈
              "알림 테스트" 클릭 → Toast 컴포넌트 노출
              두 기능 모두 컴포넌트가 처리하고 이 페이지는 state만 넘깁니다.
          ───────────────────────────────────────────── */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-white text-[#1D4ED8] hover:bg-blue-50"
          >
            무료로 시작하기
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => { setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); }}
            className="border-white text-white hover:bg-white/10"
          >
            충전소 찾기
          </Button>
        </div>
      </section>

      {/* =====================================================
          SECTION 5 : 푸터
          ===================================================== */}
      <footer className="bg-[#0F172A] text-[#64748B] px-6 py-10 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <div className="text-white font-black text-lg mb-2">⚡ ChargeNow</div>
            <p className="text-xs leading-relaxed">
              전기차 충전소 실시간 예약 서비스<br />
              © 2026 ChargeNow Team. All rights reserved.
            </p>
          </div>
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold mb-1">서비스</span>
              <span>충전소 찾기</span>
              <span>예약 관리</span>
              <span>요금 안내</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold mb-1">고객센터</span>
              <span>공지사항</span>
              <span>FAQ</span>
              <span>1:1 문의</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================
          MODAL : 로그인 유도
          ===================================================== */}
      {/* ─────────────────────────────────────────────
          💡 [컴포넌트 이점 ⑧] Modal — 열기/닫기 로직이 내부에 있음
          isOpen, onClose만 넘기면 배경 블러, 애니메이션, 클릭 외부 닫기가
          Modal 컴포넌트 안에서 전부 처리됩니다.
          이 페이지는 true/false 상태만 관리합니다.
      ───────────────────────────────────────────── */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="로그인이 필요합니다"
      >
        <div className="flex flex-col gap-5">
          <p className="text-[#64748B] text-sm">
            예약 기능을 이용하려면 로그인이 필요합니다.<br />
            계정이 없으신가요? 무료로 가입하세요.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="md" className="flex-1" onClick={() => setIsLoginModalOpen(false)}>
              취소
            </Button>
            <Button variant="primary" size="md" className="flex-1">
              로그인 / 회원가입
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          TOAST : 알림 메시지
          ===================================================== */}
      {/* ─────────────────────────────────────────────
          💡 [컴포넌트 이점 ⑨] Toast — 위치, 애니메이션, 닫기가 내장
          isVisible 하나로 나타나고 사라지는 애니메이션이
          Toast 컴포넌트 안에서 처리됩니다.
          이 페이지는 setTimeout으로 state를 false로 바꾸기만 합니다.
      ───────────────────────────────────────────── */}
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
