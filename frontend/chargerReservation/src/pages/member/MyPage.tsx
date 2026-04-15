import React, { useState } from "react";
import Button from "../../components/common/Button";

// 1. 필요한 아이콘 SVG (Heroicons 스타일)
const Icons = {
  User: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  ),
  Mail: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  ),
  Lock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  ),
  Phone: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  ),
};

const MyPage = () => {
  const [isEditing, setIsEditing] = useState(false);

  // 회원가입 폼 기준 초기 데이터
  const [userInfo, setUserInfo] = useState({
    userId: "charge_now_user", // 아이디
    email: "hong@kakao.com", // 이메일
    name: "홍길동", // 이름
    phone: "010-1234-5678", // 전화번호
    password: "", // 비밀번호 변경용
    confirmPassword: "",
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 1. 상단 프로필 요약 카드 */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white">
              👦
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-extrabold text-slate-800">
                  {userInfo.name}
                </h2>
                <span className="px-2 py-1 bg-blue-50 text-blue-500 text-[10px] rounded font-bold uppercase tracking-tighter">
                  Verified
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {userInfo.userId} · {userInfo.email}
              </p>
              <p className="text-slate-400 text-sm">{userInfo.phone}</p>
            </div>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "수정 취소" : "프로필 수정"}
          </Button>
        </div>

        {/* 2. 계정 정보 설정 창 (회원가입 항목 기반) */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isEditing ? "max-h-[1000px] opacity-100 mb-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-50">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              계정 정보 설정
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  아이디
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icons.User />
                  </span>
                  <input
                    type="text"
                    value={userInfo.userId}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  이메일
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icons.Mail />
                  </span>
                  <input
                    type="text"
                    value={userInfo.email}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  이름
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                    <Icons.User />
                  </span>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  전화번호
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                    <Icons.Phone />
                  </span>
                  <input
                    type="text"
                    value={userInfo.phone}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, phone: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="md:col-span-2 border-t border-slate-50 my-2"></div>

              {/* 비밀번호 변경 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  새 비밀번호
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                    <Icons.Lock />
                  </span>
                  <input
                    type="password"
                    placeholder="8~15자 (영문, 숫자, 특수문자)"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  새 비밀번호 확인
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                    <Icons.Lock />
                  </span>
                  <input
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end mt-10 gap-4">
              <Button
                variant="danger"
                className="px-8 py-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all"
              >
                회원 탈퇴
              </Button>
              <Button className="px-12 py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all">
                저장
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "충전 횟수",
              value: "12회",
              bg: "bg-orange-50",
              text: "text-orange-600",
            },
            {
              label: "총 충전량",
              value: "284kWh",
              bg: "bg-green-50",
              text: "text-green-600",
            },
            {
              label: "이번달 요금",
              value: "₩68,400",
              bg: "bg-blue-50",
              text: "text-blue-600",
            },
            {
              label: "CO₂ 절감",
              value: "128kg",
              bg: "bg-teal-50",
              text: "text-teal-600",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                {item.label}
              </span>
              <span className={`text-xl font-black ${item.text}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          {/* 헤더 영역 */}
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              {/* 별 아이콘 직접 삽입 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#fbbf24"
                className="w-5 h-5"
              >
                <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
              </svg>
              즐겨찾기 충전소
            </h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold ring-1 ring-blue-100">
              0개
            </span>
          </div>

          {/* 데이터가 없을 때 표시되는 UI (Empty State) */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4">
              {/* 큰 하트 아이콘 직접 삽입 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#ffb02e"
                className="w-12 h-12"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium text-center leading-relaxed">
              충전소 카드의 ♡ 버튼을 눌러
              <br />
              자주 가는 충전소를 저장해보세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
