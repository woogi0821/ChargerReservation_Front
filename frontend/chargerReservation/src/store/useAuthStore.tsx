import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IAuthState } from "../types/IAuthState";

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      loggedIn: false,
      memberGrade: null,
      activeModal: "NONE",
      accessToken: localStorage.getItem("accessToken") || null,
      // ✅ 추가
      toastMessage: null,

      login: (grade: string, token: string) => {
        // localStorage.setItem("accessToken", token);
        set({ loggedIn: true, memberGrade: grade, accessToken: token });
      },

      logout: () => {
        // localStorage.removeItem("accessToken");
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
      },

      // ✅ 추가
      setToastMessage: (msg: string | null) => {
        set({ toastMessage: msg });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken:state.accessToken,
        loggedIn: state.loggedIn,
        memberGrade: state.memberGrade,
      }),
    }
  )
);