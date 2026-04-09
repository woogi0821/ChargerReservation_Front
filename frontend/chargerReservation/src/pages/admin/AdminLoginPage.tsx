import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!id || !password) {
      setErrorMsg("아이디와 비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:8080/api/admins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: id, loginPw: password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMsg(data?.message || "아이디 또는 비밀번호가 올바르지 않습니다");
        return;
      }

      const data = await response.json();

      localStorage.setItem("adminToken", data.accessToken);
      localStorage.setItem("adminRole", data.adminRole);
      localStorage.setItem("adminId", String(data.adminId));
      localStorage.setItem("adminPart", data.adminPart);

      navigate("/admin");

    } catch (e) {
      setErrorMsg("서버 연결에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm mx-4 shadow-sm border border-gray-100">

        {/* 헤더 */}
        <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-100">
          <div className="w-1 h-5 bg-blue-700" />
          <span className="text-sm font-semibold tracking-widest text-gray-800 uppercase">
            Admin
          </span>
        </div>

        {/* 로그인 폼 */}
        <div className="px-8 py-6 space-y-4">

          {/* 아이디 입력 */}
          <div>
            <label className="block text-xs text-gray-400 tracking-wide mb-1">
              아이디
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="아이디를 입력하세요"
              className="
                w-full border-b border-gray-300 focus:border-blue-700
                outline-none py-2 text-sm text-gray-700
                placeholder:text-gray-300 tracking-wide
              "
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-xs text-gray-400 tracking-wide mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="비밀번호를 입력하세요"
              className="
                w-full border-b border-gray-300 focus:border-blue-700
                outline-none py-2 text-sm text-gray-700
                placeholder:text-gray-300 tracking-wide
              "
            />
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="text-xs text-red-500 tracking-wide">
              {errorMsg}
            </p>
          )}
        </div>

        {/* 로그인 버튼 */}
        <div className="px-8 pb-6">
          <button
            onClick={onLogin}
            disabled={loading}
            className="w-full py-2.5 text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLoginPage;