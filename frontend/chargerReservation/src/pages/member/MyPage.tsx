import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import type { IMember } from "../../types/IMember";
import common from "../../common/commonservice";
import { useFormik } from "formik";
import { updateValidation } from "../../validation/memberValidation";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<IMember | null>(null);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const response = await common.get<IMember>("/member/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchMemberInfo();
  }, []);

  const handleWithdraw = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까? 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.")) {
      return;
    }

    try {
      const response = await common.delete("/member/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.status === 200) {
        alert("회원 탈퇴가 성공적으로 완료되었습니다.");
        
        logout();
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminPart");
        
        navigate("/");
      }
    } catch (error: any) {
      console.error("탈퇴 오류:", error);
      alert(error.response?.data || "회원 탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  const formik = useFormik({
    initialValues: {
      loginId: userInfo?.loginId || "",
      email: userInfo?.email || "",
      name: userInfo?.name || "",
      phone: userInfo?.phone || "",
      loginPw: "",
      confirmPw: "",
    },
    validationSchema: updateValidation,
    validateOnBlur: true,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await common.put("/member/me", values, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.status === 200) {
          alert("회원 정보가 성공적으로 수정되었습니다.");
          setIsEditing(false);
          setUserInfo((prev) => (prev ? { ...prev, ...values } : null));
        }
      } catch (error) {
        alert("수정 실패. 다시 시도 하세요.");
      }
    },
  });

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  const formatPhoneNumber = (phoneNumber: string | undefined) => {
    if (!phoneNumber) return "";
    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : phoneNumber;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 상단 프로필 */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white">
              👦
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-extrabold text-slate-800">
                  {userInfo?.name}
                </h2>
                <span
                  className={`px-2 py-1 text-[10px] rounded font-bold uppercase tracking-tighter ${
                    userInfo?.memberGrade === "Y"
                      ? "bg-rose-50 text-rose-500"
                      : "bg-blue-50 text-blue-500"
                  }`}
                >
                  {userInfo?.memberGrade === "Y" ? "Admin" : "User"}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{userInfo?.email}</p>
              <p className="text-slate-400 text-sm">
                {formatPhoneNumber(userInfo?.phone)}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "수정 취소" : "프로필 수정"}
          </Button>
        </div>

        {/* 계정 정보 설정 폼 */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isEditing ? "opacity-100 mb-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-50">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              계정 정보
            </h3>

            {/* 브라우저 자동완성용 숨김 필드 */}
            <input
              type="text"
              name="username"
              value={formik.values.loginId}
              readOnly
              autoComplete="username"
              style={{ display: "none" }}
            />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              style={{ display: "none" }}
            />

            <form id="profileForm" onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input
                  label="아이디"
                  id="loginId"
                  name="loginId"
                  value={formik.values.loginId}
                  readOnly
                  autoComplete="username"
                />

                <Input
                  label="이메일"
                  id="email"
                  name="email"
                  value={formik.values.email}
                  readOnly
                  autoComplete="email"
                />

                <Input
                  label="이름"
                  type="text"
                  id="name"
                  name="name"
                  placeholder="이름을 입력하세요"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  readOnly={!isEditing}
                  autoComplete="name"
                  error={formik.touched.name ? formik.errors.name : undefined}
                />

                <Input
                  label="전화번호"
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="01000000000 (- 제외)"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  readOnly={!isEditing}
                  autoComplete="tel"
                  error={formik.touched.phone ? formik.errors.phone : undefined}
                />

                <Input
                  label="새 비밀번호"
                  type="password"
                  id="loginPw"
                  name="loginPw"
                  placeholder="8~15자 (영문, 숫자, 특수문자)"
                  value={formik.values.loginPw}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  readOnly={!isEditing}
                  autoComplete="new-password"
                  error={
                    formik.touched.loginPw ? formik.errors.loginPw : undefined
                  }
                />

                <Input
                  label="새 비밀번호 확인"
                  type="password"
                  id="confirmPw"
                  name="confirmPw"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formik.values.confirmPw}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  readOnly={!isEditing}
                  autoComplete="new-password"
                  error={
                    formik.touched.confirmPw
                      ? formik.errors.confirmPw
                      : undefined
                  }
                />
              </div>
            </form>

            <div className="md:col-span-2 border-t border-slate-50 my-2"></div>

            <div className="flex flex-col md:flex-row justify-end mt-10 gap-4">
              <Button
                type="button"
                variant="danger"
                className="px-8 py-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all"
                onClick={handleWithdraw}
              >
                회원 탈퇴
              </Button>

              <Button
                type="submit"
                form="profileForm"
                className="px-12 py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
              >
                저장
              </Button>
            </div>
          </div>
        </div>

        {/* 통계 정보 및 즐겨찾기 */}
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
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
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
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4">
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
