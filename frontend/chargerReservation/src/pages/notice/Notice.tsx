import React, { useState, useEffect } from 'react';
import { noticeService, type NoticeResponseDto } from '../../services/NoticeService';

const Notice = () => {
  const [notices, setNotices] = useState<NoticeResponseDto[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await noticeService.getCustomerNotices(currentPage);
        
        if (res && res.success && res.result) {
          setNotices(res.result);
          setTotalPages(res.page || 1);
        }
      } catch (error) {
        console.error("화면 로드 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentPage]);

  const handleToggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 px-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">공지사항</h2>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : notices.length > 0 ? (
            <>
              <div className="divide-y divide-slate-100">
                {notices.map((notice) => (
                  <div key={notice.noticeId} className={`group ${notice.fixYn === 'Y' ? 'bg-slate-50/50' : ''}`}>
                    <button
                      onClick={() => handleToggle(notice.noticeId)}
                      className="w-full flex items-center justify-between p-7 text-left hover:bg-slate-100/20 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <span className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                          notice.fixYn === 'Y' ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-500 ring-1 ring-blue-100'
                        }`}>
                          {notice.fixYn === 'Y' ? '중요' : '공지'}
                        </span>
                        <div>
                          <h3 className={`text-[17px] font-bold ${openId === notice.noticeId ? 'text-blue-600' : 'text-slate-800'}`}>
                            {notice.title}
                            {notice.new && <span className="ml-2 text-blue-500 text-xs italic">new</span>}
                          </h3>
                          <time className="text-xs text-slate-400 mt-2 block font-medium">
                            {notice.formattedDate || notice.insertTime?.split('T')[0]}
                          </time>
                        </div>
                      </div>
                      <svg className={`w-5 h-5 transition-transform ${openId === notice.noticeId ? 'rotate-180 text-blue-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openId === notice.noticeId ? 'max-h-[1000px]' : 'max-h-0'}`}>
                      <div className="px-8 py-10 text-[15px] text-slate-600 leading-relaxed border-t border-slate-100/60 whitespace-pre-wrap">
                        {notice.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 버튼 */}
              <div className="flex items-center justify-center py-6 border-t border-slate-100 gap-4 bg-slate-50/30">
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}
                  className="p-2 border rounded-full bg-white shadow-sm disabled:opacity-30 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={2}/></svg>
                </button>
                <span className="text-sm font-bold text-slate-600">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}
                  className="p-2 border rounded-full bg-white shadow-sm disabled:opacity-30 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={2}/></svg>
                </button>
              </div>
            </>
          ) : (
            <div className="p-24 text-center text-slate-400">등록된 공지사항이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notice;