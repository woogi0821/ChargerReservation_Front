import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { useAuthStore } from "../../store/useAuthStore";

interface Station {
  statId: string;
  statNm: string;
  addr: string;
  location: string;
  useTime: string;
  bnm: string;
  parkingFree: string;
  limitYn: string;
}

interface Charger {
  statId: string;
  chargerId: string;
  chargerType: string;
  stat: string;
  output: number;
  method: string;
  statUpdDt: string;
  statLabel: string;
}

const chargerStatStyles: { [key: string]: { dot: string; badge: string } } = {
  "1": { dot: "bg-gray-500",   badge: "bg-gray-100 text-gray-500"   },
  "2": { dot: "bg-green-500",  badge: "bg-green-50 text-green-600"  },
  "3": { dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-600"    },
  "4": { dot: "bg-red-500",    badge: "bg-red-50 text-red-600"      },
  "5": { dot: "bg-amber-500",  badge: "bg-amber-50 text-amber-600"  },
};

const canEditCharger = (): boolean => {
  const adminRole = localStorage.getItem("adminRole");
  const adminPart = localStorage.getItem("adminPart");
  return adminRole === "SUPER" || adminPart === "CHARGER" || adminPart === "ALL";
};

const statLabels: { [key: string]: string } = {
  "1": "통신이상",
  "2": "충전가능",
  "3": "충전중",
  "4": "운영중지",
  "5": "점검중",
};

const AdminChargerPage = () => {
  const { setToastMessage } = useAuthStore(); // ✅ 추가

  const [stations, setStations] = useState<Station[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [selectedStatId, setSelectedStatId] = useState<string | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [isLoadingChargers, setIsLoadingChargers] = useState(true);
  const [editCharger, setEditCharger] = useState<Charger | null>(null);
  const [newStat, setNewStat] = useState<string>("4");
  const [keyword, setKeyword] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  const hasEditPermission = canEditCharger();

  const fetchStations = async (searchKeyword?: string) => {
    try {
      setIsLoadingStations(true);
      const token = localStorage.getItem("accessToken");
      const url = searchKeyword
        ? `http://localhost:8080/api/admin/stations?keyword=${encodeURIComponent(searchKeyword)}`
        : `http://localhost:8080/api/admin/stations`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setStations(data);
      setSelectedStatId(null);
      setChargers([]);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoadingStations(false);
    }
  };

  const fetchChargers = async (statId?: string) => {
    try {
      setIsLoadingChargers(true);
      const token = localStorage.getItem("accessToken");
      const url = statId
        ? `http://localhost:8080/api/admin/chargers?statId=${statId}`
        : `http://localhost:8080/api/admin/chargers`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setChargers(data);
    } catch (error) {
      console.error("서버 연결 실패", error);
    } finally {
      setIsLoadingChargers(false);
    }
  };

  useEffect(() => {
    fetchStations();
    fetchChargers();
  }, []);

  const onSearch = () => {
    setKeyword(searchInput);
    fetchStations(searchInput);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  const onResetSearch = () => {
    setSearchInput("");
    setKeyword("");
    fetchStations();
    fetchChargers();
  };

  const onFilterStation = (statId: string) => {
    if (selectedStatId === statId) {
      setSelectedStatId(null);
      setChargers([]);
    } else {
      setSelectedStatId(statId);
      fetchChargers(statId);
    }
  };

  const onUpdateStat = async () => {
    if (!editCharger) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/admin/chargers/${editCharger.statId}/${editCharger.chargerId}?newStat=${newStat}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      setEditCharger(null);
      fetchChargers(selectedStatId ?? undefined);
      // ✅ 추가
      setToastMessage(`충전기 상태가 "${statLabels[newStat]}" 으로 변경되었습니다`);
    } catch (error) {
      console.error("서버 연결 실패", error);
    }
  };

  const stat2Count = chargers.filter((c) => c.stat?.trim() === "2").length;
  const stat3Count = chargers.filter((c) => c.stat?.trim() === "3").length;
  const stat4Count = chargers.filter((c) => c.stat?.trim() === "4").length;

  return (
    <AdminLayout>

      <AdminPageHeader title="충전소 / 충전기 관리" />

      <div className="bg-white border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">충전소 목록</h2>
            <span className="text-xs text-gray-400">총 {stations.length}개소</span>
            {keyword && (
              <span className="text-xs text-blue-600">"{keyword}" 검색 결과</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="충전소명 / 주소 / 운영기관"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={onSearchKeyDown}
              className="w-56 px-3 py-2 text-sm border-b border-gray-300 focus:border-blue-700 outline-none transition-colors placeholder:text-gray-300"
            />
            <button
              onClick={onSearch}
              className="px-3 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 transition-colors"
            >
              검색
            </button>
            {keyword && (
              <button
                onClick={onResetSearch}
                className="px-3 py-2 text-xs text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소명</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">주소</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">운영기관</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이용시간</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">필터</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingStations ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">불러오는 중...</td>
                  </tr>
                ) : stations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">검색 결과가 없습니다</td>
                  </tr>
                ) : (
                  stations.map((station) => (
                    <tr key={station.statId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-700 font-medium">{station.statNm}</td>
                      <td className="px-5 py-3 text-gray-500">{station.addr}</td>
                      <td className="px-5 py-3 text-gray-500">{station.bnm}</td>
                      <td className="px-5 py-3 text-gray-500">{station.useTime}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => onFilterStation(station.statId)}
                          className={`text-xs px-3 py-1 border transition-colors
                            ${selectedStatId === station.statId
                              ? "border-blue-700 text-blue-700 bg-blue-50"
                              : "border-gray-200 text-gray-400 hover:border-blue-700 hover:text-blue-700"
                            }`}
                        >
                          {selectedStatId === station.statId ? "필터 해제" : "필터"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-blue-700" />
              <h2 className="text-sm font-semibold text-gray-700 tracking-wide">충전기 현황</h2>
              {selectedStatId && (
                <span className="text-xs text-blue-600">{selectedStatId}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />충전가능 {stat2Count}대
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />충전중 {stat3Count}대
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />운영중지 {stat4Count}대
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전기 ID</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소 ID</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">타입</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">출력</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingChargers ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-300">불러오는 중...</td>
                  </tr>
                ) : chargers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-300">
                      {selectedStatId ? "해당 충전소의 충전기가 없습니다" : "충전소를 선택하면 충전기가 표시됩니다"}
                    </td>
                  </tr>
                ) : (
                  chargers.map((charger) => {
                    const statKey = charger.stat?.trim() ?? "";
                    const style = chargerStatStyles[statKey] ?? { dot: "bg-gray-300", badge: "bg-gray-50 text-gray-400" };
                    return (
                      <tr key={`${charger.statId}-${charger.chargerId}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-400">{charger.chargerId}</td>
                        <td className="px-5 py-3 text-gray-600">{charger.statId}</td>
                        <td className="px-5 py-3 text-gray-600">{charger.chargerType}</td>
                        <td className="px-5 py-3 text-gray-600">{charger.output}kW</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-sm ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {charger.statLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => { setEditCharger(charger); setNewStat(charger.stat?.trim() ?? "2"); }}
                            disabled={!hasEditPermission}
                            className={`text-xs transition-colors
                              ${hasEditPermission
                                ? "text-blue-500 hover:text-blue-700"
                                : "text-gray-300 cursor-not-allowed"
                              }`}
                          >
                            상태변경
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editCharger && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setEditCharger(null)}>
          <div className="bg-white w-full max-w-sm mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-blue-700" />
                <h3 className="text-sm font-semibold text-gray-700">충전기 상태 변경</h3>
              </div>
              <button onClick={() => setEditCharger(null)} className="text-gray-300 hover:text-gray-500 transition-colors">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-24 text-xs text-gray-400">충전소 ID</span>
                <span className="text-sm text-gray-700">{editCharger.statId}</span>
              </div>
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-24 text-xs text-gray-400">충전기 ID</span>
                <span className="text-sm text-gray-700">{editCharger.chargerId}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">변경할 상태</label>
                <select
                  value={newStat}
                  onChange={(e) => setNewStat(e.target.value)}
                  className="w-full border-b border-gray-300 focus:border-blue-700 outline-none py-2 text-sm text-gray-700"
                >
                  <option value="1">통신이상</option>
                  <option value="2">충전가능</option>
                  <option value="3">충전중</option>
                  <option value="4">운영중지</option>
                  <option value="5">점검중</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onUpdateStat}
                className="flex-1 py-2 text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                변경 완료
              </button>
              <button
                onClick={() => setEditCharger(null)}
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