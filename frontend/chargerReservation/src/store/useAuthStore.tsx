import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IAuthState } from "../types/IAuthState";

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      loggedIn: false,
      memberGrade: null,
      activeModal: "NONE",
      // AT는 메모리에만 — persist에서 제외됨 (partialize 참고)
      accessToken: null,

      // grade + token 함께 저장
      login: (grade: string, token: string) => {
        set({ loggedIn: true, memberGrade: grade, accessToken: token });
      },

      logout: () => {
        set({ loggedIn: false, memberGrade: null, activeModal: "NONE", accessToken: null });
      },

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
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
      // loggedIn, memberGrade만 localStorage에 저장 — accessToken은 절대 저장 안 함
      partialize: (state) => ({
        loggedIn: state.loggedIn,
        memberGrade: state.memberGrade,
      }),
    }
  )
);