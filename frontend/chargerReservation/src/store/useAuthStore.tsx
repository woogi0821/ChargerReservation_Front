import { create } from "zustand";
import { persist } from "zustand/middleware"; // 1. persist 임포트
import type { IAuthState } from "../types/IAuthState";

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      loggedIn: false,
      memberGrade: null,
      activeModal: "NONE",

      login: (grade: string) => {
        set({ loggedIn: true, memberGrade: grade });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        set({ loggedIn: false, memberGrade: null, activeModal: "NONE" });
      },

      setActiveModal: (state: string) => {
        set({ activeModal: state });
      },

      closeModal: () => {
        set({ activeModal: "NONE" });
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        loggedIn: state.loggedIn,
        memberGrade: state.memberGrade,
      }),
    }
  )
);