//해당 파일은 철저하게 검색이라는 행위와 결과 데이터만 책임지는 파일입니다.
//화면에 어떤식으로 보일지는 전혀 신경쓰지않습니다.
import { useState } from "react";
import common from "../common/commonservice";

//types 폴더에 정의해둘 충전소 데이터 타입
//(뼈대만 잡아둔것이고 api데이터가 전부 들어오면 수정)
interface Charger {
    chargerId: string;
    chargerName:string;
    address:string;
    status:string;
}

export const useChargerSearch = () => {
    const [keyword, setKeyword] = useState<string>('');
    const [results, setResults] = useState<Charger[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const executeSearch = async (searchKeyword : string) =>{
        if(!searchKeyword.trim()){
            setResults([]);
            return;
        }
        setIsLoading(true);
        
        try{
            const response = await common.get(`/chargers/search?keyword=${searchKeyword}`);
            setResults(response.data);
        } catch(err) {
            console.error('검색 실패, UI초기화 진행');
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