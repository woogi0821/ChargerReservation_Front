import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

interface Station {
  id: string;
  name: string;
  address: string;
  totalChargers: number;
}

interface Charger {
  id: string;
  stationId: string;
  type: string;
  status: "free" | "busy" | "error";
}

interface ChargerForm {
  stationId: string;
  type: string;
  status: Charger["status"];
}

const STATIONS: Station[] = [
  { id: "s001", name: "강남 테헤란로점",     address: "서울 강남구 테헤란로 152", totalChargers: 3 },
  { id: "s002", name: "송파 잠실점",         address: "서울 송파구 올림픽로 300", totalChargers: 2 },
  { id: "s003", name: "마포 홍대점",         address: "서울 마포구 양화로 188",   totalChargers: 2 },
  { id: "s004", name: "서초 반포점",         address: "서울 서초구 반포대로 58",  totalChargers: 1 },
  { id: "s005", name: "영등포 타임스퀘어점", address: "서울 영등포구 영중로 15",  totalChargers: 2 },
];

const INITIAL_CHARGERS: Charger[] = [
  { id: "c001", stationId: "s001", type: "급속 50kW",  status: "free"  },
  { id: "c002", stationId: "s001", type: "급속 50kW",  status: "busy"  },
  { id: "c003", stationId: "s001", type: "급속 100kW", status: "free"  },
  { id: "c004", stationId: "s002", type: "급속 100kW", status: "busy"  },
  { id: "c005", stationId: "s002", type: "완속 7kW",   status: "free"  },
  { id: "c006", stationId: "s003", type: "급속 50kW",  status: "error" },
  { id: "c007", stationId: "s003", type: "완속 7kW",   status: "busy"  },
  { id: "c008", stationId: "s004", type: "급속 50kW",  status: "free"  },
  { id: "c009", stationId: "s005", type: "급속 100kW", status: "free"  },
  { id: "c010", stationId: "s005", type: "완속 7kW",   status: "error" },
];

const chargerStatusStyles: {
  [key in "free" | "busy" | "error"]: {
    label: string;
    dot: string;
    badge: string;
  };
} = {
  free:  { label: "가용",   dot: "bg-green-500", badge: "bg-green-50 text-green-600" },
  busy:  { label: "사용중", dot: "bg-blue-500",  badge: "bg-blue-50 text-blue-600"  },
  error: { label: "고장",   dot: "bg-red-500",   badge: "bg-red-50 text-red-600"    },
};

const EMPTY_FORM: ChargerForm = {
  stationId: "",
  type: "급속 50kW",
  status: "free",
};

// 충전기 관리 수정 권한 체크
// SUPER 또는 CHARGER 파트만 수정 가능
const canEditCharger = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "CHARGER";
};

const AdminChargerPage = () => {

  const [chargers, setChargers] = useState<Charger[]>(INITIAL_CHARGERS);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editCharger, setEditCharger] = useState<Charger | null>(null);
  const [form, setForm] = useState<ChargerForm>(EMPTY_FORM);

  // 수정 권한 여부
  const hasEditPermission = canEditCharger();

  const filteredChargers = selectedStationId
    ? chargers.filter((c) => c.stationId === selectedStationId)
    : chargers;

  const freeCount  = filteredChargers.filter((c) => c.status === "free").length;
  const busyCount  = filteredChargers.filter((c) => c.status === "busy").length;
  const errorCount = filteredChargers.filter((c) => c.status === "error").length;

  const onCloseModal = () => {
    setModalMode(null);
    setEditCharger(null);
    setForm(EMPTY_FORM);
  };

  const onOpenAddModal = () => {
    if (!hasEditPermission) return;
    setForm(EMPTY_FORM);
    setEditCharger(null);
    setModalMode("add");
  };

  const onOpenEditModal = (charger: Charger) => {
    if (!hasEditPermission) return;
    setForm({
      stationId: charger.stationId,
      type: charger.type,
      status: charger.status,
    });
    setEditCharger(charger);
    setModalMode("edit");
  };

  const onAddCharger = () => {
    const newId = "c" + String(chargers.length + 1).padStart(3, "0");
    const newCharger: Charger = { id: newId, ...form };
    setChargers((prev) => [...prev, newCharger]);
    onCloseModal();
  };

  const onEditCharger = () => {
    if (!editCharger) return;
    setChargers((prev) =>
      prev.map((c) => (c.id === editCharger.id ? { ...c, ...form } : c))
    );
    onCloseModal();
  };

  const onDeleteCharger = (id: string) => {
    if (!hasEditPermission) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setChargers((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AdminLayout adminName="홍길동">

      <AdminPageHeader title="충전소 / 충전기 관리" />

      {/* 충전소 목록 */}
      <div className="bg-white border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">충전소 목록</h2>
            <span className="text-xs text-gray-400">총 {STATIONS.length}개소</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소명</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">주소</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전기 수</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">필터</th>
              </tr>
            </thead>
            <tbody>
              {STATIONS.map((station) => (
                <tr key={station.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-700 font-medium">{station.name}</td>
                  <td className="px-5 py-3 text-gray-500">{station.address}</td>
                  <td className="px-5 py-3 text-gray-500">{station.totalChargers}대</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setSelectedStationId(selectedStationId === station.id ? null : station.id)}
                      className={`text-xs px-3 py-1 border transition-colors
                        ${selectedStationId === station.id
                          ? "border-blue-700 text-blue-700 bg-blue-50"
                          : "border-gray-200 text-gray-400 hover:border-blue-700 hover:text-blue-700"
                        }`}
                    >
                      {selectedStationId === station.id ? "필터 해제" : "필터"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 충전기 현황 */}
      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-blue-700" />
              <h2 className="text-sm font-semibold text-gray-700 tracking-wide">충전기 현황</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />가용 {freeCount}대
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />사용중 {busyCount}대
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />고장 {errorCount}대
              </span>
            </div>
          </div>

          {/* 충전기 추가 버튼 — 권한 없으면 비활성화 */}
          <button
            onClick={onOpenAddModal}
            disabled={!hasEditPermission}
            className={`px-4 py-2 text-xs transition-colors
              ${hasEditPermission
                ? "text-white bg-blue-700 hover:bg-blue-800"
                : "text-gray-300 bg-gray-100 cursor-not-allowed"
              }`}
          >
            + 충전기 추가
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전기 번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">타입</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredChargers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    등록된 충전기가 없습니다
                  </td>
                </tr>
              ) : (
                filteredChargers.map((charger) => {
                  const style = chargerStatusStyles[charger.status];
                  const stationName = STATIONS.find((s) => s.id === charger.stationId)?.name ?? "-";
                  return (
                    <tr key={charger.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{charger.id}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{stationName}</td>
                      <td className="px-5 py-3 text-gray-600">{charger.type}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </td>

                      {/* 수정 / 삭제 버튼 — 권한 없으면 비활성화 */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onOpenEditModal(charger)}
                            disabled={!hasEditPermission}
                            className={`text-xs transition-colors
                              ${hasEditPermission
                                ? "text-blue-500 hover:text-blue-700"
                                : "text-gray-300 cursor-not-allowed"
                              }`}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => onDeleteCharger(charger.id)}
                            disabled={!hasEditPermission}
                            className={`text-xs transition-colors
                              ${hasEditPermission
                                ? "text-red-500 hover:text-red-700"
                                : "text-gray-300 cursor-not-allowed"
                              }`}
                          >
                            삭제
                          </button>
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

      {/* 충전기 추가 / 수정 모달 */}
      {modalMode !== null && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onCloseModal}>
          <div className="bg-white w-full max-w-sm mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">
                  {modalMode === "add" ? "충전기 추가" : "충전기 수정"}
                </h3>
              </div>
              <button onClick={onCloseModal} className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">충전소</label>
                <select
                  value={form.stationId}
                  onChange={(e) => setForm((prev) => ({ ...prev, stationId: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700"
                >
                  {modalMode === "add" && <option value="">충전소 선택</option>}
                  {STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">타입</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700"
                >
                  <option value="급속 50kW">급속 50kW</option>
                  <option value="급속 100kW">급속 100kW</option>
                  <option value="완속 7kW">완속 7kW</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">상태</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Charger["status"] }))}
                  className="w-full border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700"
                >
                  <option value="free">가용</option>
                  <option value="busy">사용중</option>
                  <option value="error">고장</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={modalMode === "add" ? onAddCharger : onEditCharger}
                className="flex-1 py-2 text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                {modalMode === "add" ? "추가" : "수정 완료"}
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

export default AdminChargerPage;