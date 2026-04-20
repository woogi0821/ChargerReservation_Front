import { useEffect, useRef, useState } from "react";
import "./index.css";
import { AppRouter } from "./routers/AppRouter";
import { useAuthStore } from "./store/useAuthStore";
import common from "./common/commonservice";

function App() {
  const { loggedIn, accessToken, login, logout } = useAuthStore();
  
  const [isHydrated, setIsHydrated] = useState(false);
  const isChecking = useRef(false);

  useEffect(() => {
    const checkHydration = () => {
      const hydrated = (useAuthStore as any).persist?.hasHydrated();
      if (hydrated) {
        setIsHydrated(true);
      } else {
        setTimeout(checkHydration, 10);
      }
    };
    checkHydration();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (accessToken && loggedIn) return;

    const initializeAuth = async () => {

      if (isChecking.current) return;
      isChecking.current = true;

      try {
        const res = await common.post("/member/refresh");
        if (res.data?.accessToken) {
          login(res.data.memberGrade, res.data.accessToken);
        }
      } catch (error: any) {
        // 서버 에러(401, 500) 시 1초 대기 후 다른 요청에 의해 성공했는지 재확인
        if (error.response?.status === 401 || error.response?.status === 500) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (useAuthStore.getState().loggedIn) {
            return;
          }
          logout();
        }
      } finally {
        isChecking.current = false;
      }
    };

    initializeAuth();
  }, [isHydrated, accessToken, loggedIn]);

  if (!isHydrated) {
    return null; 
  }

  return <AppRouter />;
}

export default App;