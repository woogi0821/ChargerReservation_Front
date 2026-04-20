import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { useAuthStore } from "../../store/useAuthStore";

interface AdminDto {
  adminId: number;
  memberId: number;
  name: string;
  adminRole: string;
  adminPart: string;
}

interface MemberDto {
  memberId: number;
  name: string;
  email: string;
  loginId: string;
}

const partConfig: Record<string, { label: string; color: string }> = {
  ALL:         { label: "전체",   color: "bg-purple-50 text-purple-700" },
  MEMBER:      { label: "회원",   color: "bg-teal-50 text-teal-700"     },
  RESERVATION: { label: "예약",   color: "bg-blue-50 text-blue-700"     },
  CHARGER:     { label: "충전기", color: "bg-amber-50 text-amber-700"   },
  PENALTY:     { label: "패널티", color: "bg-red-50 text-red-700"       },
  INQUIRY:     { label: "문의",   color: "bg-green-50 text-green-700"   },
};

const AdminManagePage = () => {
  const { setToastMessage } = useAuthStore(); // ✅ 추가

  const [admins, setAdmins] = useState<AdminDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<MemberDto[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [form, setForm] = useState({
    adminRole: "MANAGER",
    adminPart: "MEMBER",
  });

  const currentAdminId = Number(localStorage.getItem("adminId"));
  const token = localStorage.getItem("accessToken");

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/api/admin/list", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const onSearchMember = async () => {
    if (!searchInput.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8080/api/admin/members`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data: MemberDto[] = await response.json();
      const filtered = data.filter(
        (m) =>
          m.name?.includes(searchInput.trim()) ||
          m.email?.includes(searchInput.trim())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("회원 검색 실패", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onCreateAdmin = async () => {
    if (!selectedMember) {
      alert("등록할 회원을 선택해주세요!");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: selectedMember.memberId,
          adminRole: form.adminRole,
          adminPart: form.adminPart,
        }),
      });
      if (!response.ok) return;
      setIsModalOpen(false);
      setSearchInput("");
      setSearchResults([]);
      setSelectedMember(null);
      setForm({ adminRole: "MANAGER", adminPart: "MEMBER" });
      fetchAdmins();
      // ✅ 추가
      setToastMessage(`${selectedMember.name}님이 관리자로 등록되었습니다 ✅`);
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    setSearchInput("");
    setSearchResults([]);
    setSelectedMember(null);
    setForm({ adminRole: "MANAGER", adminPart: "MEMBER" });
  };

  const onDeleteAdmin = async (adminId: number, name: string) => {
    if (!window.confirm("정말 해제하시겠습니까?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/admin/${adminId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      fetchAdmins();
      // ✅ 추가
      setToastMessage(`${name}님의 관리자 권한이 해제되었습니다`);
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader title="관리자 관리" />

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">관리자 목록</h2>
            <span className="text-xs text-gray-400">총 {admins.length}명</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 transition-colors"
          >
            + 관리자 등록
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-16">번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이름</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">역할</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">담당 파트</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    불러오는 중...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    등록된 관리자가 없습니다
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isMe = admin.adminId === currentAdminId;
                  const part = partConfig[admin.adminPart] ?? { label: admin.adminPart, color: "bg-gray-50 text-gray-500" };
                  return (
                    <tr key={admin.adminId} className={`border-b border-gray-50 transition-colors ${isMe ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                      <td className="px-5 py-3 text-gray-400">{admin.adminId}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">{admin.name}</span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">
                              나
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${admin.adminRole === "SUPER" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                          {admin.adminRole}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${part.color}`}>
                          {part.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {!isMe && (
                          <button
                            onClick={() => onDeleteAdmin(admin.adminId, admin.name)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            해제
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 관리자 등록 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onCloseModal}>
          <div className="bg-white w-full max-w-sm mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">관리자 등록</h3>
              </div>
              <button onClick={onCloseModal} className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">회원 검색</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="이름 또는 이메일 입력"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearchMember()}
                    className="flex-1 border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700 placeholder:text-gray-300"
                  />
                  <button
                    onClick={onSearchMember}
                    className="px-3 py-1 text-xs text-white bg-blue-700 hover:bg-blue-800 transition-colors"
                  >
                    검색
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && !selectedMember && (
                <div className="border border-gray-100 rounded max-h-36 overflow-y-auto">
                  {searchResults.map((member) => (
                    <button
                      key={member.memberId}
                      onClick={() => setSelectedMember(member)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-700 font-medium">{member.name}</span>
                      <span className="text-gray-400 text-xs ml-2">{member.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <p className="text-xs text-gray-300 text-center py-2">검색 중...</p>
              )}
              {!isSearching && searchResults.length === 0 && searchInput && !selectedMember && (
                <p className="text-xs text-gray-300 text-center py-2">검색 결과가 없습니다</p>
              )}

              {selectedMember && (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2.5 rounded">
                  <div>
                    <span className="text-sm text-blue-700 font-medium">{selectedMember.name}</span>
                    <span className="text-xs text-blue-400 ml-2">{selectedMember.email}</span>
                  </div>
                  <button
                    onClick={() => { setSelectedMember(null); setSearchResults([]); setSearchInput(""); }}
                    className="text-blue-300 hover:text-blue-500 text-xs"
                  >
                    변경
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">역할</label>
                <select
                  value={form.adminRole}
                  onChange={(e) => setForm(prev => ({ ...prev, adminRole: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700"
                >
                  <option value="MANAGER">MANAGER</option>
                  <option value="SUPER">SUPER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">담당 파트</label>
                <select
                  value={form.adminPart}
                  onChange={(e) => setForm(prev => ({ ...prev, adminPart: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700"
                >
                  <option value="ALL">ALL (전체)</option>
                  <option value="MEMBER">MEMBER (회원)</option>
                  <option value="RESERVATION">RESERVATION (예약)</option>
                  <option value="CHARGER">CHARGER (충전기)</option>
                  <option value="PENALTY">PENALTY (패널티)</option>
                  <option value="INQUIRY">INQUIRY (문의)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onCreateAdmin}
                disabled={!selectedMember}
                className={`flex-1 py-2 text-sm transition-colors
                  ${selectedMember
                    ? "text-white bg-blue-700 hover:bg-blue-800"
                    : "text-gray-300 bg-gray-100 cursor-not-allowed"
                  }`}
              >
                등록 완료
              </button>
              <button
                onClick={onCloseModal}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManagePage;