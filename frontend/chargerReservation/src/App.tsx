import { useEffect, useRef, useState } from "react";
import { AppRouter } from "./routers/AppRouter";
import { useAuthStore } from "./store/useAuthStore";
import common from "./common/commonservice";

function App() {
  const { loggedIn, accessToken, login, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const isChecking = useRef(false);

  useEffect(() => {
    const init = () => {
      if (!(useAuthStore as any).persist?.hasHydrated()) {
        setTimeout(init, 10);
        return;
      }

      const getSessionCookie = () => {
        return document.cookie.split('; ').find(row => row.startsWith('browser_session='));
      };

      if (!getSessionCookie()) {
        logout();
        document.cookie = "browser_session=active; path=/"; 
      }

      setIsHydrated(true);
    };

    init();
  }, [logout]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!accessToken && !loggedIn) return;

    const initializeAuth = async () => {
      if (isChecking.current) return;
      isChecking.current = true;

      try {
        const res = await common.post("/member/refresh");
        if (res.data?.accessToken) {
          login(res.data.memberGrade, res.data.accessToken);
        }
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 500) {
          await new Promise((r) => setTimeout(r, 1000));
          if (useAuthStore.getState().loggedIn) return;
          logout();
        }
      } finally {
        isChecking.current = false;
      }
    };

    initializeAuth();
  }, [isHydrated, accessToken, loggedIn, login, logout]);

  if (!isHydrated) return null;

  return <AppRouter />;
}

export default App;