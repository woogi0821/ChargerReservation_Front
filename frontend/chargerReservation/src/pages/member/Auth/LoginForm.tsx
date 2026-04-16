import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import Button from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { useAuthStore } from "../../../store/useAuthStore";
import type { IMember } from "../../../types/IMember";
import type { IToken } from "../../../services/AuthService"; 
import AuthService from "../../../services/AuthService";
import { loginValidation } from "../../../validation/authValidation";
import { useState } from "react";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { login, closeModal } = useAuthStore();
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: IMember) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await AuthService.login({
        loginId: data.loginId,
        loginPw: data.loginPw,
      });
      const { accessToken, memberGrade, adminId, adminRole, adminPart } = response.data as IToken;

      // AT는 메모리(Zustand)에만 저장 — localStorage 금지
      login(memberGrade, accessToken);

      // 어드민 파트 정보는 localStorage 저장 (파트 관리용)
      localStorage.setItem("adminId",   String(adminId ?? ""));
      localStorage.setItem("adminRole", adminRole ?? "");
      localStorage.setItem("adminPart", adminPart ?? "");

      closeModal();

      if (memberGrade === "Y") {
        nav("/admin");
      } else {
        nav("/");
      }
    } catch (error: any) {
      console.error("로그인 시도 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: { loginId: "", loginPw: "" },
    validationSchema: loginValidation,
    onSubmit: (values: any) => {
      handleLogin(values);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 mt-3">
        <div>
          <Input
            label="아이디 (이메일)"
            id="loginId"
            name="loginId"
            placeholder="example@email.com"
            type="text"
            value={formik.values.loginId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        <div>
          <Input
            label="비밀번호"
            id="loginPw"
            name="loginPw"
            placeholder="비밀번호를 입력하세요"
            type="password"
            value={formik.values.loginPw}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full py-4 mt-2">
          로그인
        </Button>
      </form>

      <div className="relative flex items-center justify-center my-2">
        <div className="w-full border-t border-zinc-100"></div>
        <span className="absolute bg-white px-4 text-xs text-zinc-400">
          또는 간편 로그인
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={() =>
            (window.location.href =
              "http://localhost:8080/oauth2/authorization/kakao")
          }
          className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FADA0A] border-none"
        >
          <span className="mr-2">🟡</span> 카카오로 로그인
        </Button>
        <Button
          type="button"
          onClick={() =>
            (window.location.href =
              "http://localhost:8080/oauth2/authorization/naver")
          }
          className="w-full bg-[#02b351] text-white hover:bg-[#02b351] border-none"
        >
          <span className="mr-2">🟢</span> 네이버로 로그인
        </Button>
      </div>

      <p className="text-center text-sm text-zinc-500">
        계정이 없으신가요?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[#3B82F6] font-bold underline underline-offset-4"
        >
          회원가입
        </button>
      </p>
    </div>
  );
}

export default LoginForm;