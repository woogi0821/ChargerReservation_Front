import Button from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";

interface SignupFormProps {
  onLoginClick: () => void;
  onSignupSubmit: (data: any) => void;
}

function Register({ onLoginClick, onSignupSubmit }: SignupFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-[#0F172A]">회원가입</h2>
        <p className="text-sm text-[#64748B]">
          ChargeNow와 함께 스마트한 충전을 시작하세요
        </p>
      </div>

      {/* 입력 폼 영역 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input label="아이디" placeholder="아이디를 입력하세요" required />
          </div>
          <Button
            variant="outline"
            className="h-[52px] w-24 shrink-0" // Input 높이(md 기준 약 52px)에 맞춤
            onClick={() => console.log("아이디 중복 확인")}
          >
            중복확인
          </Button>
        </div>
        <Input
          label="비밀번호"
          type="password"
          placeholder="8자 이상 입력하세요"
          required
        />
        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          required
        />
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              required
            />
          </div>
          <Button
            variant="outline"
            className="h-[52px] w-24 shrink-0 bg-[#E2E8F0] text-[#0F172A]" // 이미지와 유사한 회색 스타일
            onClick={() => console.log("인증 메일 발송")}
          >
            전송
          </Button>
        </div>
        <Input
          label="이름"
          type="email"
          placeholder="example@email.com"
          required
        />
        <Input
          label="전화번호"
          type="email"
          placeholder="(-) 제외 01000000000"
          required
        />
      </div>

      <Button
        variant="primary"
        className="w-full py-4 mt-2"
        onClick={() => onSignupSubmit({})}
      >
        가입하기
      </Button>

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
