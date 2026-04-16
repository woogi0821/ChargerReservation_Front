import { useFormik } from "formik";
import Button from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import authValidation from "../../../validation/authValidation";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import common from "../../../common/commonservice";
import React from "react";

interface SignupFormProps {
  onLoginClick: () => void;
  onSignupSubmit: (data: any) => void;
  onClose: () => void;
}

function Register({ onLoginClick, onSignupSubmit }: SignupFormProps) {
  const nav = useNavigate();

  // 아이디 중복 확인 관련 상태
  const [isIdChecked, setIsIdChecked] = useState<boolean>(false);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean>(false);

  // 이메일 인증 관련 상태
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Formik 설정
  const formik = useFormik({
    initialValues: {
      loginId: "",
      loginPw: "",
      confirmPw: "",
      name: "",
      phone: "",
      email: "",
      authCode: "",
    },
    validationSchema: authValidation,
    onSubmit: (data) => {
      save(data);
    },
  });

  // 타이머 로직
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setTimeLeft(300);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  // 아이디 중복 확인 로직
  const handleCheckId = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    const loginId = formik.values.loginId;
    if (!loginId || formik.errors.loginId) {
      alert("올바른 아이디 형식을 입력해주세요.");
      return;
    }

    try {
      const response = await common.get(`/member/check-id?loginId=${loginId}`);
      if (response.data === true) {
        setIsIdAvailable(true);
        setIsIdChecked(true);
      } else {
        alert("이미 사용 중인 아이디입니다.");
        setIsIdAvailable(false);
        setIsIdChecked(false);
      }
    } catch (error: any) {
      alert(error.response?.data || "중복 확인 중 오류가 발생했습니다.");
    }
  };

  // 아이디 입력값이 바뀌면 중복확인 상태 초기화
  useEffect(() => {
    setIsIdChecked(false);
    setIsIdAvailable(false);
  }, [formik.values.loginId]);

  // 이메일 인증번호 발송
  const handleSendCode = async () => {
    const email = formik.values.email;
    if (!email || formik.errors.email) {
      alert("유효한 이메일을 입력해주세요.");
      return;
    }
    try {
      const response = await common.post("/email/send", { email });
      alert(response.data);
      setIsSent(true);
      startTimer();
    } catch (error: any) {
      alert(error.response?.data || "발송 실패");
    }
  };

  // 이메일 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      const response = await common.post("/email/verify", {
        email: formik.values.email,
        authCode: formik.values.authCode,
      });
      alert(response.data);
      setIsVerified(true);
      if (timerRef.current) window.clearInterval(timerRef.current);
    } catch (error: any) {
      alert(error.response?.data || "인증 실패");
    }
  };

  // 회원 저장
  const save = async (data: any) => {
    if (!isIdChecked || !isIdAvailable) {
      alert("아이디 중복 확인을 완료해주세요.");
      return;
    }
    if (!isVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }
    try {
      await common.post("/member/join", data);
      alert("회원가입이 완료되었습니다.");
      onSignupSubmit(data);
      nav("/", { replace: true }); // 로그인 페이지로 이동
    } catch (error: any) {
      alert(error.response?.data || "회원가입 실패");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-[#0F172A]">회원가입</h2>
        <p className="text-sm text-[#64748B]">
          ChargeNow와 함께 스마트한 충전을 시작하세요
        </p>
      </div>

      {/* 입력 폼 영역 */}
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <Input
                label="아이디"
                id="loginId"
                name="loginId"
                placeholder="아이디를 입력하세요"
                value={formik.values.loginId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.loginId && formik.errors.loginId
                    ? formik.errors.loginId
                    : ""
                }
              />
              {isIdChecked && isIdAvailable && (
                <p className="text-green-600 text-xs mt-1 ml-1 font-bold">
                  사용 가능한 아이디입니다.
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-[52px] w-24 shrink-0 mt-[28px]"
              onClick={(e) => handleCheckId(e)}
            >
              중복확인
            </Button>
          </div>

          <Input
            label="비밀번호"
            name="loginPw"
            type="password"
            placeholder="8~15자 (영문, 숫자, 특수문자 포함)"
            value={formik.values.loginPw}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.loginPw && formik.errors.loginPw
                ? formik.errors.loginPw
                : ""
            }
          />

          <Input
            label="비밀번호 확인"
            name="confirmPw"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={formik.values.confirmPw}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPw && formik.errors.confirmPw
                ? formik.errors.confirmPw
                : ""
            }
          />

          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <Input
                label="이메일"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : ""
                }
                disabled={isVerified}
              />
            </div>
            {!isVerified && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                className="h-[52px] w-24 shrink-0 mt-[28px]"
              >
                {isSent ? "재발송" : "전송"}
              </Button>
            )}
          </div>

          {isSent && !isVerified && (
            <div className="flex gap-3 items-start mt-2">
              <div className="flex-1 relative">
                <Input
                  label="인증번호"
                  name="authCode"
                  placeholder="6자리 입력"
                  value={formik.values.authCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.authCode && formik.errors.authCode
                      ? formik.errors.authCode
                      : ""
                  }
                />
                <span
                  className={`absolute right-3 top-[43px] text-sm font-bold ${timeLeft < 60 ? "text-red-500" : "text-blue-600"}`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleVerifyCode}
                className="h-[52px] w-24 shrink-0 mt-[28px]"
              >
                확인
              </Button>
            </div>
          )}

          {isVerified && (
            <div className="text-green-600 text-sm font-bold ml-1 flex items-center gap-1">
              <span>✓</span> 이메일 인증이 완료되었습니다.
            </div>
          )}

          {/* 이름 */}
          <Input
            label="이름"
            name="name"
            type="text" // email에서 text로 수정
            placeholder="성함을 입력하세요"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : ""
            }
          />

          {/* 전화번호 */}
          <Input
            label="전화번호"
            name="phone"
            type="text" // email에서 text로 수정
            placeholder="(-) 제외 숫자만 입력"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.phone && formik.errors.phone
                ? formik.errors.phone
                : ""
            }
          />
        </div>

        <Button
          type="submit" // formik.handleSubmit을 실행시킴
          variant="primary"
          className={`w-full py-4 mt-2 ${!isIdChecked || !isVerified ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!isIdChecked || !isIdAvailable || !isVerified}
        >
          가입하기
        </Button>
      </form>

      <p className="text-center text-xs text-[#94A3B8]">
        이미 계정이 있으신가요?{" "}
        <button
          onClick={onLoginClick}
          className="text-[#3B82F6] font-bold hover:underline"
        >
          로그인
        </button>
      </p>
    </div>
  );
}

export default Register;
