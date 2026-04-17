import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import common from "../../../common/commonservice";
import { Input } from "../../../components/common/Input";
import Button from "../../../components/common/Button";

interface FindAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindAccountModal = ({ isOpen, onClose }: FindAccountModalProps) => {
  const [activeTab, setActiveTab] = useState<"id" | "pw">("id");
  const [isLoading, setIsLoading] = useState(false);

  // 1. 아이디 찾기 폼
  const idFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("올바른 이메일 형식이 아닙니다.").required("이메일을 입력해주세요."),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await common.post("/member/find-id", values);
        alert(`찾으시는 아이디는 [ ${response.data.loginId} ] 입니다.`);
      } catch (error: any) {
        alert(error.response?.data?.message || "일치하는 계정 정보가 없습니다.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // 2. 비밀번호 재설정 폼 (이메일로 임시 비번 발송 등)
  const pwFormik = useFormik({
    initialValues: { loginId: "", email: "" },
    validationSchema: Yup.object({
      loginId: Yup.string().required("아이디를 입력해주세요."),
      email: Yup.string().email("올바른 이메일 형식이 아닙니다.").required("이메일을 입력해주세요."),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await common.post("/member/reset-password", values);
        alert("입력하신 이메일로 임시 비밀번호가 발송되었습니다.");
        onClose();
      } catch (error: any) {
        alert(error.response?.data?.message || "정보가 일치하지 않습니다.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 헤더 */}
        <div className="p-6 text-center border-b border-zinc-100 relative">
          <h3 className="text-xl font-bold text-zinc-800">계정 정보 찾기</h3>
          <button onClick={onClose} className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600">✕</button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-zinc-100">
          <button
            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === "id" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-400"}`}
            onClick={() => setActiveTab("id")}
          >
            아이디 찾기
          </button>
          <button
            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === "pw" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-400"}`}
            onClick={() => setActiveTab("pw")}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 폼 본문 */}
        <div className="p-8">
          {activeTab === "id" ? (
            <form onSubmit={idFormik.handleSubmit} className="space-y-4">
              <p className="text-sm text-zinc-500 mb-4">가입 시 등록한 이메일 주소를 입력해주세요.</p>
              <Input
                label="이메일"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={idFormik.values.email}
                onChange={idFormik.handleChange}
                onBlur={idFormik.handleBlur}
                error={idFormik.touched.email ? idFormik.errors.email : undefined}
              />
              <Button type="submit" className="w-full py-4 mt-4" disabled={isLoading}>
                {isLoading ? "조회 중..." : "아이디 확인"}
              </Button>
            </form>
          ) : (
            <form onSubmit={pwFormik.handleSubmit} className="space-y-4">
              <p className="text-sm text-zinc-500 mb-4">아이디와 이메일을 입력하시면 임시 비밀번호를 보내드립니다.</p>
              <Input
                label="아이디"
                id="loginId"
                name="loginId"
                placeholder="아이디를 입력하세요"
                value={pwFormik.values.loginId}
                onChange={pwFormik.handleChange}
                onBlur={pwFormik.handleBlur}
                error={pwFormik.touched.loginId ? pwFormik.errors.loginId : undefined}
              />
              <Input
                label="이메일"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={pwFormik.values.email}
                onChange={pwFormik.handleChange}
                onBlur={pwFormik.handleBlur}
                error={pwFormik.touched.email ? pwFormik.errors.email : undefined}
              />
              <Button type="submit" className="w-full py-4 mt-4" disabled={isLoading}>
                {isLoading ? "전송 중..." : "임시 비밀번호 발송"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindAccountModal;