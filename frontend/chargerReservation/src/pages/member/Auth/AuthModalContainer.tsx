import Button from "../../../components/common/Button";
import Login from "./LoginForm";
import Register from "./RegisterForm";
import TermsAgreement from "./TermsAgreement";

interface AuthModalContainerProps {
  activeModal: "INFO" | "LOGIN" | "SIGNUP" | "SIGNUP_FORM";
  setActiveModal: (state: any) => void;
  handleCloseModal: () => void;
}

const AuthModalContainer = ({ activeModal, setActiveModal, handleCloseModal }: AuthModalContainerProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. 커스텀 헤더 영역: 모든 단계 공통 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h1 className="text-[#3B82F6] text-xl font-black italic">ChargeNow</h1>
        </div>

        <h2 className="text-[1.75rem] font-[900] text-[#0F172A] font-['Nunito']">
          {activeModal === "INFO" && "로그인이 필요합니다"}
        </h2>

        <div className="h-1.5 w-12 mb-3 bg-[#3B82F6] rounded-full"></div>
      </div>

      {/* 2. 각 상태별 본문 콘텐츠 */}
      {activeModal === "INFO" && (
        <div className="flex flex-col gap-5">
          <p className="text-[#64748B] text-sm leading-relaxed">
            예약 기능을 이용하려면 로그인이 필요합니다.
            <br />
            계정이 없으신가요? 무료로 가입하세요.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
              취소
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => setActiveModal("LOGIN")}>
              로그인 / 회원가입
            </Button>
          </div>
        </div>
      )}

      {activeModal === "LOGIN" && (
        <Login onSwitchToSignup={() => setActiveModal("SIGNUP")} />
      )}

      {activeModal === "SIGNUP" && (
        <TermsAgreement
          onNext={() => setActiveModal("SIGNUP_FORM")}
          onLoginClick={() => setActiveModal("LOGIN")}
        />
      )}

      {activeModal === "SIGNUP_FORM" && (
        <Register
          onSignupSubmit={(data) => {
            console.log("가입 데이터:", data);
            alert("회원가입이 완료되었습니다!");
            setActiveModal("LOGIN");
          }}
          onLoginClick={() => setActiveModal("LOGIN")}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AuthModalContainer;