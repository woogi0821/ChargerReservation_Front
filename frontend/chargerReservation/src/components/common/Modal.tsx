import React from "react";

export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: "primary" | "danger";
}

function Modal({ isOpen, onClose, title, children, variant: _variant = "primary" }: IModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[rgba(10,20,50,0.5)] backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        // 1. max-w-[560px]로 가로 폭 확장
        // 2. max-h-[85vh]로 높이 제한 및 flex 구조
        className="bg-white rounded-[22px] w-full max-w-[500px] shadow-[0_24px_64px_rgba(0,0,0,0.2)] relative animate-[modalIn_0.28s_cubic-bezier(0.34,1.56,0.64,1)] flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-[32px] h-[32px] rounded-lg bg-[#F5F8FF] text-[#64748B] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-all flex items-center justify-center font-bold"
        >
          &times;
        </button>

        {/* 헤더: 상단 고정 */}
        <div className="p-10 pb-0 mb-4 flex-shrink-0">
          <h2 className="text-[1.75rem] font-[900] text-[#0F172A] font-['Nunito'] mb-1">
            {title}
          </h2>
          {/* {variant === "primary" && (
            <div className="h-1.5 w-12 bg-[#3B82F6] rounded-full"></div>
          )} */}
        </div>

        {/* 바디: 내부 스크롤 적용 및 여백 조정 */}
        <div className="flex-1 overflow-y-auto p-10 pt-0 text-[#64748B] text-[1rem] leading-relaxed scrollbar-thin scrollbar-thumb-zinc-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;