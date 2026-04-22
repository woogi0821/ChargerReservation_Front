import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { useAuthStore } from "../../store/useAuthStore";

interface Member {
  memberId: number;
  loginId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  penaltyCount: number;
  insertTime: string;
  memberGrade: string;
}

const memberStatusStyles: { [key: string]: { label: string; badge: string } } = {
  ACTIVE:    { label: "정상", badge: "bg-green-50 text-green-600" },
  SUSPENDED: { label: "정지", badge: "bg-amber-50 text-amber-600" },
  WITHDRAWN: { label: "탈퇴", badge: "bg-gray-100 text-gray-400"  },
};

const statusMessages: { [key: string]: string } = {
  SUSPENDED: "회원이 정지 처리되었습니다",
  ACTIVE:    "회원 정지가 해제되었습니다",
  WITHDRAWN: "회원이 탈퇴 처리되었습니다",
};

const canEditMember = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "MEMBER" || adminPart === "ALL";
};

const AdminMemberPage = () => {
  const { setToastMessage } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<"NORMAL" | "ADMIN">("NORMAL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // ✅ 추가

  const hasEditPermission = canEditMember();

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/api/admin/members", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const onChangeStatus = async (memberId: number, newStatus: string) => {
    if (newStatus === "WITHDRAWN" && !window.confirm("정말 탈퇴 처리하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/members/${memberId}?newStatus=${newStatus}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      fetchMembers();
      setSelectedMember(null);
      setToastMessage(statusMessages[newStatus] ?? "회원 상태가 변경되었습니다");
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  const tabFiltered = members.filter((m) =>
    activeTab === "NORMAL" ? m.memberGrade === "N" : m.memberGrade === "Y"
  );

  // ✅ 검색 + 정렬 적용
  const filteredMembers = tabFiltered
    .filter((m) => m.name?.includes(searchQuery) || m.email?.includes(searchQuery))
    .sort((a, b) => {
      const timeA = new Date(a.insertTime).getTime();
      const timeB = new Date(b.insertTime).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  return (
    <AdminLayout>

      <AdminPageHeader title="회원 관리" />

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">회원 목록</h2>
            <span className="text-xs text-gray-400">총 {filteredMembers.length}명</span>
          </div>
          {/* ✅ 정렬 드롭다운 + 검색창 */}
          <div className="flex items-center gap-3">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="text-xs text-gray-500 border-b border-gray-300 focus:border-blue-700 outline-none bg-transparent py-2 pr-1 cursor-pointer transition-colors"
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </select>
            <input
              type="text"
              placeholder="이름 또는 이메일 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 px-3 py-2 text-sm border-b border-gray-300 focus:border-blue-700 outline-none transition-colors placeholder:text-gray-300 tracking-wide"
            />
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab("NORMAL"); setSearchQuery(""); }}
            className={`px-5 py-3 text-xs tracking-wide transition-colors border-b-2
              ${activeTab === "NORMAL"
                ? "text-blue-700 border-b-blue-700 font-medium"
                : "text-gray-400 border-b-transparent hover:text-gray-600"
              }`}
          >
            일반회원
            <span className="ml-1 text-gray-300">
              {members.filter((m) => m.memberGrade === "N").length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab("ADMIN"); setSearchQuery(""); }}
            className={`px-5 py-3 text-xs tracking-wide transition-colors border-b-2
              ${activeTab === "ADMIN"
                ? "text-blue-700 border-b-blue-700 font-medium"
                : "text-gray-400 border-b-transparent hover:text-gray-600"
              }`}
          >
            관리자
            <span className="ml-1 text-gray-300">
              {members.filter((m) => m.memberGrade === "Y").length}
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이름</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이메일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">연락처</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">패널티</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">가입일</th> {/* ✅ 추가 */}
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-300">
                    불러오는 중...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-300">
                    {searchQuery ? "검색 결과가 없습니다" : "회원이 없습니다"}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const style = memberStatusStyles[member.status]
                    ?? { label: member.status, badge: "bg-gray-100 text-gray-400" };
                  return (
                    <tr key={member.memberId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td
                        className="px-5 py-3 text-gray-700 font-medium cursor-pointer hover:text-blue-700 transition-colors"
                        onClick={() => setSelectedMember(member)}
                      >
                        {member.name}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{member.email}</td>
                      <td className="px-5 py-3 text-gray-500">{member.phone}</td>
                      <td className="px-5 py-3 text-gray-500">{member.penaltyCount}회</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs"> {/* ✅ 추가 */}
                        {member.insertTime?.slice(0, 10)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {member.status === "ACTIVE" && (
                            <button
                              onClick={() => hasEditPermission && onChangeStatus(member.memberId, "SUSPENDED")}
                              disabled={!hasEditPermission}
                              className={`text-xs transition-colors
                                ${hasEditPermission
                                  ? "text-amber-500 hover:text-amber-700"
                                  : "text-gray-300 cursor-not-allowed"
                                }`}
                            >
                              정지
                            </button>
                          )}
                          {member.status === "SUSPENDED" && (
                            <button
                              onClick={() => hasEditPermission && onChangeStatus(member.memberId, "ACTIVE")}
                              disabled={!hasEditPermission}
                              className={`text-xs transition-colors
                                ${hasEditPermission
                                  ? "text-blue-500 hover:text-blue-700"
                                  : "text-gray-300 cursor-not-allowed"
                                }`}
                            >
                              정지해제
                            </button>
                          )}
                          {member.status !== "WITHDRAWN" && (
                            <button
                              onClick={() => hasEditPermission && onChangeStatus(member.memberId, "WITHDRAWN")}
                              disabled={!hasEditPermission}
                              className={`text-xs transition-colors
                                ${hasEditPermission
                                  ? "text-red-500 hover:text-red-700"
                                  : "text-gray-300 cursor-not-allowed"
                                }`}
                            >
                              탈퇴
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white w-full max-w-md mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">회원 상세 정보</h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors text-lg"
              >✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {[
                { label: "이름",   value: selectedMember.name  },
                { label: "이메일", value: selectedMember.email },
                { label: "연락처", value: selectedMember.phone },
                { label: "패널티", value: `${selectedMember.penaltyCount}회` },
                { label: "구분",   value: selectedMember.memberGrade === "Y" ? "관리자" : "일반회원" },
                { label: "가입일", value: selectedMember.insertTime?.slice(0, 10) },
              ].map((row) => (
                <div key={row.label} className="flex items-center border-b border-gray-50 pb-3">
                  <span className="w-20 text-xs text-gray-400 tracking-wide">{row.label}</span>
                  <span className="text-sm text-gray-700">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-20 text-xs text-gray-400 tracking-wide">상태</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-sm
                  ${memberStatusStyles[selectedMember.status]?.badge ?? "bg-gray-100 text-gray-400"}`}>
                  {memberStatusStyles[selectedMember.status]?.label ?? selectedMember.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              {selectedMember.status === "ACTIVE" && (
                <button
                  onClick={() => hasEditPermission && onChangeStatus(selectedMember.memberId, "SUSPENDED")}
                  disabled={!hasEditPermission}
                  className={`flex-1 py-2 text-sm border transition-colors
                    ${hasEditPermission
                      ? "text-amber-600 border-amber-300 hover:bg-amber-50"
                      : "text-gray-300 border-gray-200 cursor-not-allowed"
                    }`}
                >
                  정지 처리
                </button>
              )}
              {selectedMember.status === "SUSPENDED" && (
                <button
                  onClick={() => hasEditPermission && onChangeStatus(selectedMember.memberId, "ACTIVE")}
                  disabled={!hasEditPermission}
                  className={`flex-1 py-2 text-sm border transition-colors
                    ${hasEditPermission
                      ? "text-blue-600 border-blue-300 hover:bg-blue-50"
                      : "text-gray-300 border-gray-200 cursor-not-allowed"
                    }`}
                >
                  정지 해제
                </button>
              )}
              {selectedMember.status !== "WITHDRAWN" && (
                <button
                  onClick={() => hasEditPermission && onChangeStatus(selectedMember.memberId, "WITHDRAWN")}
                  disabled={!hasEditPermission}
                  className={`flex-1 py-2 text-sm transition-colors
                    ${hasEditPermission
                      ? "text-white bg-red-500 hover:bg-red-600"
                      : "text-gray-300 bg-gray-100 cursor-not-allowed"
                    }`}
                >
                  탈퇴 처리
                </button>
              )}
              <button
                onClick={() => setSelectedMember(null)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminMemberPage;