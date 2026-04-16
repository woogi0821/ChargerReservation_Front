import { useState } from "react";
import common from "../common/commonservice";

// 상세 필드까지 포함하도록 인터페이스 확장 (사이드바 에러 방지)
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
    useTime?: string;
    distance?: number;
    [key: string]: any; // 다른 추가 필드 허용
}

export const useChargerSearch = () => {
    const [keyword, setKeyword] = useState<string>('');
    const [results, setResults] = useState<Charger[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const executeSearch = async (searchKeyword: string, lat: number, lng: number) => {
        // 키워드가 없으면 결과 초기화
        if (!searchKeyword.trim()) {
            setResults([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await common.get(
                `/stations/search?keyword=${searchKeyword}&lat=${lat}&lng=${lng}`
            );
            
            // ✅ 데이터가 배열인지 확인 후 저장 (백엔드 구조에 따라 response.data.data 일 수 있음)
            const data = response.data;
            if (Array.isArray(data)) {
                setResults(data);
            } else if (data && Array.isArray(data.data)) {
                setResults(data.data);
            } else {
                setResults([]);
            }
        } catch(err) {
            console.error('검색 실패:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        keyword,
        setKeyword,
        results,
        isLoading,
        executeSearch
    };
};