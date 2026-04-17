import { useState } from "react";
import Button from "../../../components/common/Button";

interface TermsFormProps {
  onNext: () => void;
  onLoginClick: () => void;
}

const TermsAgreement = ({ onNext, onLoginClick }: TermsFormProps) => {
  // 약관 상태 관리
  const [terms, setTerms] = useState({
    all: false,
    service: false,
    privacy: false,
    location: false,
    marketing: false,
  });

  // 전체 동의 핸들러
  const handleAllClick = () => {
    const newState = !terms.all;
    setTerms({
      all: newState,
      service: newState,
      privacy: newState,
      location: newState,
      marketing: newState,
    });
  };

  // 개별 동의 핸들러
  const handleSingleClick = (key: keyof typeof terms) => {
    setTerms((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // 필수/선택 항목들이 모두 true인지 확인하여 'all' 상태 동기화
      const isAllChecked = updated.service && updated.privacy && updated.location && updated.marketing;
      return { ...updated, all: isAllChecked };
    });
  };

  // 필수 항목(service, privacy) 동의 여부에 따른 버튼 활성화
  const isRequiredChecked = terms.service && terms.privacy;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-[#0F172A]">약관 동의</h2>
        <p className="text-sm text-[#64748B]">서비스 이용을 위해 약관에 동의해주세요</p>
      </div>

      <div 
        className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl cursor-pointer"
        onClick={handleAllClick}
      >
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${terms.all ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-[#CBD5E1] bg-white'}`}>
          {terms.all && <span className="text-white text-xs">✓</span>}
        </div>
        <div>
          <p className="font-bold text-[#0F172A]">전체 동의하기</p>
          <p className="text-xs text-[#64748B]">필수 및 선택 약관에 모두 동의합니다</p>
        </div>
      </div>

      <div className="h-[1px] bg-[#E2E8F0] my-1" />

      <div className="flex flex-col gap-5 px-1">
        {[
          { id: 'service', label: 'ChargeNow 이용약관', required: true },
          { id: 'privacy', label: '개인정보 수집 및 이용 동의', required: true },
          { id: 'location', label: '위치기반 서비스 이용약관', required: false },
          { id: 'marketing', label: '이벤트 · 혜택 정보 수신 동의', required: false },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSingleClick(item.id as any)}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${terms[item.id as keyof typeof terms] ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-[#CBD5E1]'}`}>
                {terms[item.id as keyof typeof terms] && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.required ? 'bg-[#EBF5FF] text-[#3B82F6]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                {item.required ? '필수' : '선택'}
              </span>
              <span className="text-sm text-[#334155]">{item.label}</span>
            </div>
            <button className="text-xs text-[#3B82F6] hover:underline">보기</button>
          </div>
        ))}
      </div>

      <Button 
        variant="primary" 
        className="w-full py-4 mt-2" 
        disabled={!isRequiredChecked}
        onClick={onNext}
      >
        다음
      </Button>

      <p className="text-center text-sm text-zinc-500 mt-2">
        이미 계정이 있으신가요?{" "}
        <button onClick={onLoginClick} className="text-[#3B82F6] font-bold">로그인</button>
      </p>
    </div>
  );
};

export default TermsAgreement;