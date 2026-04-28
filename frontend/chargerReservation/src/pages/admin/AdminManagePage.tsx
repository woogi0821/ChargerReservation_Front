import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { setToastMessage } = useAuthStore();
  const navigate = useNavigate();

  const [admins, setAdmins] = useState<AdminDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<MemberDto[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [form, setForm] = useState({ adminRole: "MANAGER", adminPart: "MEMBER" });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDto | null>(null);
  const [newRole, setNewRole] = useState("MANAGER");
  const [newPart, setNewPart] = useState("MEMBER"); // ✅ 추가 — 파트 변경 상태

  const currentAdminId = Number(localStorage.getItem("adminId"));
  const token = localStorage.getItem("accessToken");

  const sortedAdmins = [
    ...admins.filter(a => a.adminRole === "SUPER"),
    ...[...admins.filter(a => a.adminRole !== "SUPER")].sort((a, b) =>
      sortOrder === "desc" ? b.adminId - a.adminId : a.adminId - b.adminId
    ),
  ];

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

      if (adminId === currentAdminId) {
        localStorage.clear();
        setToastMessage(`${name}님의 관리자 권한이 해제되었습니다`);
        navigate("/");
        return;
      }

      fetchAdmins();
      setToastMessage(`${name}님의 관리자 권한이 해제되었습니다`);
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  const onOpenRoleModal = (admin: AdminDto) => {
    setSelectedAdmin(admin);
    setNewRole(admin.adminRole);
    setNewPart(admin.adminPart); // ✅ 현재 파트로 초기화
    setIsRoleModalOpen(true);
  };

  const onUpdateRole = async () => {
    if (!selectedAdmin) return;
    // ✅ 역할이랑 파트 둘 다 변경 없으면 닫기
    if (selectedAdmin.adminRole === newRole && selectedAdmin.adminPart === newPart) {
      setIsRoleModalOpen(false);
      return;
    }
    try {
      // ✅ 역할 변경
      if (selectedAdmin.adminRole !== newRole) {
        const roleRes = await fetch(
          `http://localhost:8080/api/admin/${selectedAdmin.adminId}/role?newRole=${newRole}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        if (!roleRes.ok) return;
      }

      // ✅ 파트 변경
      if (selectedAdmin.adminPart !== newPart) {
        const partRes = await fetch(
          `http://localhost:8080/api/admin/${selectedAdmin.adminId}/part?newPart=${newPart}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        if (!partRes.ok) return;
      }

      setIsRoleModalOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
      setToastMessage(`${selectedAdmin.name}님의 정보가 변경되었습니다 ✅`);
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader title="관리자 관리" />

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">관리자 목록</h2>
            <span className="text-xs text-gray-400">총 {admins.length}명</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-blue-400"
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              + 관리자 등록
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-16">번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이름</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">역할</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">담당 파트</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-36">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    불러오는 중...
                  </td>
                </tr>
              ) : sortedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    등록된 관리자가 없습니다
                  </td>
                </tr>
              ) : (
                sortedAdmins.map((admin) => {
                  const isMe = admin.adminId === currentAdminId;
                  const part = partConfig[admin.adminPart] ?? { label: admin.adminPart, color: "bg-gray-50 text-gray-500" };
                  return (
                    <tr
                      key={admin.adminId}
                      className={`border-b border-gray-50 transition-colors ${isMe ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-5 py-3 text-gray-400">{admin.adminId}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">{admin.name}</span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                              나
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${admin.adminRole === "SUPER" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                          {admin.adminRole}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${part.color}`}>
                          {part.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {!isMe && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onOpenRoleModal(admin)}
                              className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              역할변경
                            </button>
                            <button
                              onClick={() => onDeleteAdmin(admin.adminId, admin.name)}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                              해제
                            </button>
                          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={onCloseModal} />
          <div className="relative bg-white w-full max-w-sm mx-4 shadow-lg rounded-xl overflow-hidden">
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
                    className="px-3 py-1 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                  >
                    검색
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && !selectedMember && (
                <div className="border border-gray-100 rounded-lg max-h-36 overflow-y-auto">
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
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2.5 rounded-lg">
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
                className={`flex-1 py-2 text-sm rounded-lg transition-colors
                  ${selectedMember
                    ? "text-white bg-blue-700 hover:bg-blue-800"
                    : "text-gray-300 bg-gray-100 cursor-not-allowed"
                  }`}
              >
                등록 완료
              </button>
              <button
                onClick={onCloseModal}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 역할 + 파트 변경 모달 */}
      {isRoleModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsRoleModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm mx-4 shadow-lg rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">역할 / 파트 변경</h3>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-20 text-xs text-gray-400">대상 관리자</span>
                <span className="text-sm text-gray-700 font-medium">{selectedAdmin.name}</span>
              </div>
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-20 text-xs text-gray-400">현재 역할</span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium
                  ${selectedAdmin.adminRole === "SUPER"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                  {selectedAdmin.adminRole}
                </span>
              </div>
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-20 text-xs text-gray-400">현재 파트</span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${(partConfig[selectedAdmin.adminPart] ?? { color: "bg-gray-50 text-gray-500" }).color}`}>
                  {(partConfig[selectedAdmin.adminPart] ?? { label: selectedAdmin.adminPart }).label}
                </span>
              </div>

              {/* ✅ 역할 변경 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-2">변경할 역할</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewRole("MANAGER")}
                    className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors font-medium
                      ${newRole === "MANAGER"
                        ? "bg-gray-700 text-white border-gray-700"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    MANAGER
                  </button>
                  <button
                    onClick={() => setNewRole("SUPER")}
                    className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors font-medium
                      ${newRole === "SUPER"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-purple-400"
                      }`}
                  >
                    SUPER
                  </button>
                </div>
              </div>

              {/* ✅ 파트 변경 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-2">변경할 파트</label>
                <select
                  value={newPart}
                  onChange={(e) => setNewPart(e.target.value)}
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
                onClick={onUpdateRole}
                disabled={selectedAdmin.adminRole === newRole && selectedAdmin.adminPart === newPart}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors
                  ${(selectedAdmin.adminRole !== newRole || selectedAdmin.adminPart !== newPart)
                    ? "text-white bg-blue-700 hover:bg-blue-800"
                    : "text-gray-300 bg-gray-100 cursor-not-allowed"
                  }`}
              >
                변경 완료
              </button>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
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