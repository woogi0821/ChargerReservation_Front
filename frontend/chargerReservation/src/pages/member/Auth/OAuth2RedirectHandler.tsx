import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // accessToken=... 부분을 읽어옴
    const params = new URLSearchParams(location.search);
    const token = params.get("accessToken");

    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/");
    } else {
      alert("로그인에 실패했습니다.");
      navigate("/member/login");
    }
  }, [location, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>로그인 처리 중입니다...</h2>
    </div>
  );
};

export default OAuth2RedirectHandler;