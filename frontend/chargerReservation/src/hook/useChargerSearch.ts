import { useState } from "react";
import common from "../common/commonservice";

interface Charger {
    statId: string;
    statNm: string;
    addr: string;
    lat: number;
    lng: number;
    fastChargerStatus?: string;
    slowChargerStatus?: string;
    currentPrice?: number;
    slowPrice?: number;
    limitYn?: string;
    limitDetail?: string;
    parkingFree?: string;
    markerColor?: string;
    occupancy?: string;
    [key: string]: any;
}

export const useChargerSearch = () => {
    const [keyword, setKeyword] = useState<string>('');
    const [results, setResults] = useState<Charger[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    

    const executeSearch = async (searchKeyword: string, lat: number, lng: number) => {
        if (!searchKeyword.trim()) {
            setResults([]);
            return []; // 빈 배열 반환
        }
        
        setIsLoading(true);
        try {
            const response = await common.get(
                `/stations/search?keyword=${encodeURIComponent(searchKeyword)}&lat=${lat}&lng=${lng}`
            );
            
            const data = response.data;
            let finalData: Charger[] = [];

            if (Array.isArray(data)) finalData = data;
            else if (data && Array.isArray(data.data)) finalData = data.data;

            // 5번 해결: 목록 정보가 누락되지 않도록 기본값 매핑
            const sanitizedData = finalData.map(item => ({
                ...item,
                markerColor: item.markerColor || 'gray',
                occupancy: item.occupancy || '0%',
                limitYn: item.limitYn || 'N',
                parkingFree: item.parkingFree || 'N'
            }));

            setResults(sanitizedData);
            return sanitizedData; // ✅ Stations.tsx에서 쓰기 위해 반환 필수
        } catch(err) {
            console.error('검색 실패:', err);
            setResults([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return { keyword, setKeyword, results, setResults, isLoading, executeSearch };
};