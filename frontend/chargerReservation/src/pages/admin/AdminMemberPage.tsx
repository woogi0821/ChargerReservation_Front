import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "suspended" | "withdrawn";
}

const MEMBERS: Member[] = [
  { id: "m001", name: "김민준", email: "minjun@example.com",  phone: "010-1234-5678", joinDate: "2025.01.10", status: "active"    },
  { id: "m002", name: "이서연", email: "seoyeon@example.com", phone: "010-2345-6789", joinDate: "2025.02.14", status: "active"    },
  { id: "m003", name: "박지훈", email: "jihun@example.com",   phone: "010-3456-7890", joinDate: "2025.03.01", status: "suspended" },
  { id: "m004", name: "최수아", email: "sua@example.com",     phone: "010-4567-8901", joinDate: "2025.03.15", status: "active"    },
  { id: "m005", name: "정우성", email: "wusung@example.com",  phone: "010-5678-9012", joinDate: "2025.04.02", status: "withdrawn" },
  { id: "m006", name: "한지민", email: "jimin@example.com",   phone: "010-6789-0123", joinDate: "2025.04.20", status: "active"    },
  { id: "m007", name: "오세훈", email: "sehun@example.com",   phone: "010-7890-1234", joinDate: "2025.05.05", status: "suspended" },
  { id: "m008", name: "윤아름", email: "areum@example.com",   phone: "010-8901-2345", joinDate: "2025.05.18", status: "active"    },
];

const memberStatusStyles: {
  [key in "active" | "suspended" | "withdrawn"]: {
    label: string;
    badge: string;
  };
} = {
  active:    { label: "정상", badge: "bg-green-50 text-green-600" },
  suspended: { label: "정지", badge: "bg-amber-50 text-amber-600" },
  withdrawn: { label: "탈퇴", badge: "bg-gray-100 text-gray-400"  },
};

// 회원관리 수정 권한 체크
// SUPER 또는 MEMBER 파트만 수정 가능
const canEditMember = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "MEMBER";
};

const AdminMemberPage = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>(MEMBERS);

  // 수정 권한 여부
  const hasEditPermission = canEditMember();

  const filteredMembers = members.filter((m) =>
    m.name.includes(searchQuery) || m.email.includes(searchQuery)
  );

  const onChangeStatus = (id: string, newStatus: Member["status"]) => {
    if (newStatus === "withdrawn" && !window.confirm("정말 탈퇴 처리하시겠습니까?")) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    setSelectedMember((prev) =>
      prev?.id === id ? { ...prev, status: newStatus } : prev
    );
  };

  return (
    <AdminLayout adminName="홍길동">

      <AdminPageHeader title="회원 관리" />

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">회원 목록</h2>
            <span className="text-xs text-gray-400">총 {filteredMembers.length}명</span>
          </div>
          <input
            type="text"
            placeholder="이름 또는 이메일 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 px-3 py-2 text-sm border-b border-gray-300 focus:border-blue-700 outline-none transition-colors placeholder:text-gray-300 tracking-wide"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이름</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이메일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">가입일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    검색 결과가 없습니다
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const style = memberStatusStyles[member.status];
                  return (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td
                        className="px-5 py-3 text-gray-700 font-medium cursor-pointer hover:text-blue-700 transition-colors"
                        onClick={() => setSelectedMember(member)}
                      >
                        {member.name}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{member.email}</td>
                      <td className="px-5 py-3 text-gray-500">{member.joinDate}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>

                      {/* 관리 버튼 — 권한 없으면 비활성화 */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {member.status === "active" && (
                            <button
                              onClick={() => hasEditPermission && onChangeStatus(member.id, "suspended")}
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
                          {member.status === "suspended" && (
                            <button
                              onClick={() => hasEditPermission && onChangeStatus(member.id, "active")}
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
                          {member.status !== "withdrawn" && (
                            <button
                              onClick={() => hasEditPermission && onChangeStatus(member.id, "withdrawn")}
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

      {/* 회원 상세 모달 */}
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
              <button onClick={() => setSelectedMember(null)} className="text-gray-300 hover:text-gray-500 transition-colors text-lg">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {[
                { label: "이름",   value: selectedMember.name     },
                { label: "이메일", value: selectedMember.email    },
                { label: "연락처", value: selectedMember.phone    },
                { label: "가입일", value: selectedMember.joinDate },
              ].map((row) => (
                <div key={row.label} className="flex items-center border-b border-gray-50 pb-3">
                  <span className="w-20 text-xs text-gray-400 tracking-wide">{row.label}</span>
                  <span className="text-sm text-gray-700">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-20 text-xs text-gray-400 tracking-wide">상태</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-sm ${memberStatusStyles[selectedMember.status].badge}`}>
                  {memberStatusStyles[selectedMember.status].label}
                </span>
              </div>
            </div>

            {/* 모달 하단 버튼 — 권한 없으면 비활성화 */}
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              {selectedMember.status === "active" && (
                <button
                  onClick={() => hasEditPermission && onChangeStatus(selectedMember.id, "suspended")}
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
              {selectedMember.status === "suspended" && (
                <button
                  onClick={() => hasEditPermission && onChangeStatus(selectedMember.id, "active")}
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
              {selectedMember.status !== "withdrawn" && (
                <button
                  onClick={() => hasEditPermission && onChangeStatus(selectedMember.id, "withdrawn")}
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