import { useState } from "react";
import { useFormik } from "formik";
import common from "../../../common/commonservice";
import Button from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import {
  findIdValidation,
  findPwValidation,
} from "../../../validation/memberValidation";

interface FindAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindAccountModal = ({ isOpen, onClose }: FindAccountModalProps) => {
  const [activeTab, setActiveTab] = useState<"id" | "pw">("id");
  const [isIdFound, setIsIdFound] = useState(false); // 아이디 찾기 결과 화면 전환
  const [foundId, setFoundId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 모달 초기화 및 닫기
  const handleClose = () => {
    setIsIdFound(false);
    setFoundId("");
    setActiveTab("id");
    idFormik.resetForm();
    pwFormik.resetForm();
    onClose();
  };

  // 아이디 찾기
  const idFormik = useFormik({
    initialValues: { name: "", email: "" },
    validationSchema: findIdValidation,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await common.post("/member/find-id", values);
        setFoundId(response.data.loginId);
        setIsIdFound(true);
      } catch (error: any) {
        alert(error.response?.data || "일치하는 정보가 없습니다.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // 비밀번호 찾기
  const pwFormik = useFormik({
    initialValues: { loginId: "", phone: "", email: "" },
    validationSchema: findPwValidation,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await common.post("/member/find-pw", values);
        alert(
          "입력하신 이메일로 임시 비밀번호가 발송되었습니다.\n로그인 후 마이페이지에서 비밀번호를 꼭 변경해주세요.",
        );
        handleClose();
      } catch (error: any) {
        alert(error.response?.data || "정보가 일치하지 않습니다.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-6 text-center border-b border-zinc-100 relative">
          <h3 className="text-xl font-bold text-zinc-800">계정 정보 찾기</h3>
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 탭 버튼 - 아이디 결과 화면이 아닐 때만 표시 */}
        {!isIdFound && (
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
        )}

        <div className="p-8">
          {isIdFound ? (
            /* 아이디 찾기 결과 화면 */
            <div className="flex flex-col gap-6 text-center py-4">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <p className="text-zinc-500 text-sm mb-2">
                  가입하신 아이디를 찾았습니다.
                </p>
                <p className="text-3xl font-black text-blue-600 tracking-tight">
                  {foundId}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full py-4 font-bold rounded-2xl"
                onClick={handleClose}
              >
                로그인하러 가기
              </Button>
            </div>
          ) : (
            <>
              {activeTab === "id" ? (
                /* 아이디 찾기 입력 폼 */
                <form
                  onSubmit={idFormik.handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <Input
                    label="이름"
                    name="name"
                    placeholder="성함을 입력하세요"
                    value={idFormik.values.name}
                    onChange={idFormik.handleChange}
                    onBlur={idFormik.handleBlur}
                    error={
                      idFormik.touched.name && idFormik.errors.name
                        ? idFormik.errors.name
                        : ""
                    }
                  />
                  <Input
                    label="이메일"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={idFormik.values.email}
                    onChange={idFormik.handleChange}
                    onBlur={idFormik.handleBlur}
                    error={
                      idFormik.touched.email && idFormik.errors.email
                        ? idFormik.errors.email
                        : ""
                    }
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-4 mt-2 font-bold rounded-2xl shadow-lg shadow-blue-100"
                    disabled={isLoading}
                  >
                    {isLoading ? "조회 중..." : "아이디 확인"}
                  </Button>
                </form>
              ) : (
                /* 비밀번호 찾기 입력 폼 */
                <form
                  onSubmit={pwFormik.handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <Input
                    label="아이디"
                    name="loginId"
                    placeholder="아이디를 입력하세요"
                    value={pwFormik.values.loginId}
                    onChange={pwFormik.handleChange}
                    onBlur={pwFormik.handleBlur}
                    error={
                      pwFormik.touched.loginId && pwFormik.errors.loginId
                        ? pwFormik.errors.loginId
                        : ""
                    }
                  />
                  <Input
                    label="전화번호"
                    name="phone"
                    placeholder="(-) 제외 숫자만 입력"
                    value={pwFormik.values.phone}
                    onChange={pwFormik.handleChange}
                    onBlur={pwFormik.handleBlur}
                    error={
                      pwFormik.touched.phone && pwFormik.errors.phone
                        ? pwFormik.errors.phone
                        : ""
                    }
                  />
                  <Input
                    label="이메일"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={pwFormik.values.email}
                    onChange={pwFormik.handleChange}
                    onBlur={pwFormik.handleBlur}
                    error={
                      pwFormik.touched.email && pwFormik.errors.email
                        ? pwFormik.errors.email
                        : ""
                    }
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-4 mt-2 font-bold rounded-2xl shadow-lg shadow-blue-100"
                    disabled={isLoading}
                  >
                    {isLoading ? "전송 중..." : "임시 비밀번호 발송"}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindAccountModal;
