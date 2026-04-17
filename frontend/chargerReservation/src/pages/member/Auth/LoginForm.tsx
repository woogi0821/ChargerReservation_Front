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
import FindAccountModal from "./FindAccountModal";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { login, closeModal } = useAuthStore();
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);

  const handleLogin = async (data: IMember) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await AuthService.login({
        loginId: data.loginId,
        loginPw: data.loginPw,
      });
      const { accessToken, memberGrade, adminId, adminRole, adminPart, name } =
        response.data as IToken;

      // AT는 메모리(Zustand)에만 저장 — localStorage 금지
      login(memberGrade, accessToken);

      // 어드민 파트 정보는 localStorage 저장 (파트 관리용)
      localStorage.setItem("adminId",      String(adminId ?? ""));
      localStorage.setItem("adminRole",    adminRole ?? "");
      localStorage.setItem("adminPart",    adminPart ?? "");
      localStorage.setItem("accessToken",  accessToken);
      localStorage.setItem("adminName",    name ?? ""); // ✅ 추가

      closeModal();

      if (memberGrade === "Y") {
        nav("/admin");
      } else {
        nav("/");
      }
    } catch (error: any) {
      console.error("로그인 시도 중 오류 발생:", error);

      const serverMessage = error.response?.data;

      if (error.response) {
        if (error.response.status === 401) {
          alert(serverMessage || "아이디 또는 비밀번호가 일치하지 않습니다.");
        } else {
          alert(
            serverMessage ||
              "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
          );
        }
      } else {
        alert("서버와 통신할 수 없습니다. 네트워크 상태를 확인해주세요.");
      }
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
            label="아이디"
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

        <div className="flex justify-center items-center gap-3 mt-1 text-sm text-zinc-500">
          <p className="text-center text-sm text-zinc-500">
            계정을 잊으셨나요?{" "}
            <button
              type="button"
              onClick={() => setIsFindModalOpen(true)}
              className="text-[#3B82F6] font-bold underline underline-offset-4"
            >
              계정 찾기
            </button>
          </p>
        </div>
      </form>

      <FindAccountModal
        isOpen={isFindModalOpen} 
        onClose={() => setIsFindModalOpen(false)} 
      />

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