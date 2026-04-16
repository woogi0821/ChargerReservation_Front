// src/hook/useModal.ts
import { useState } from "react";

export const useModal = () => {
  // 모달이 떠 있는지 아닌지를 결정하는 스위치
  const [isOpen, setIsOpen] = useState(false);

  // 모달 열기 함수
  const open = () => setIsOpen(true);
  
  // 모달 닫기 함수
  const close = () => setIsOpen(false);

  // 현재 상태와 제어 함수들을 묶어서 내보냅니다.
  return {
    isOpen,
    open,
    close,
  };
};