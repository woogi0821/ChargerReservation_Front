import React from "react";

// 팀 가이드에 맞춘 Interface 설계
export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // 원칙 2: children으로 구멍 뚫기
  variant?: "primary" | "danger"; // 5. variant 적용 (나중에 빨간색 모달이 필요하면 danger 추가 가능)
}

function Modal({ isOpen, onClose, title, children, variant = "primary" }: IModalProps) {
  if (!isOpen) return null;

  return (
    // 배경: login-overlay 스타일 (블러 처리)
    <div 
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[rgba(10,20,50,0.5)] backdrop-blur-md"
      onClick={onClose}
    >
      {/* 모달 박스: .login-modal 스타일 (애니메이션과 그림자) */}
      <div 
        className="bg-white rounded-[22px] p-8 w-full max-w-[420px] shadow-[0_24px_64px_rgba(0,0,0,0.2)] relative animate-[modalIn_0.28s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* 닫기 버튼: .login-modal-close 스타일 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-[32px] h-[32px] rounded-lg bg-[#F5F8FF] text-[#64748B] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-all flex items-center justify-center font-bold"
        >
          &times;
        </button>

        {/* 헤더: .login-title 스타일 */}
        <div className="mb-6">
          <h2 className="text-[1.5rem] font-[900] text-[#0F172A] font-['Nunito'] mb-1">
            {title}
          </h2>
          {/* variant가 primary일 때만 파란색 밑줄 */}
          {variant === "primary" && (
            <div className="h-1.5 w-10 bg-[#3B82F6] rounded-full"></div>
          )}
        </div>

        {/* 바디: 무엇이든 들어올 수 있는 children */}
        <div className="text-[#64748B] text-[0.95rem] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;