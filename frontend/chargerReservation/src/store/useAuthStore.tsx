// 목적: 공유저장소 플로그인 파일

import { create } from "zustand";
import type { IAuthState } from "../types/IAuthState";

export const useAuthStore = create<IAuthState>((set) => ({
   loggedIn: null,
   memberGrade: null,

   login: (grade: string)=>{
    set({loggedIn: true, memberGrade: grade})
   },
   logout: ()=>{
    set({ loggedIn: false, memberGrade: null })
   }
}));