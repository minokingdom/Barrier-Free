
import React from 'react';
import { ApplicationRecord } from '../types';

interface HistoryViewProps {
  records: ApplicationRecord[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ records }) => {
  const exportToCSV = () => {
    const headers = ['지부', '대표', '연락처', '상호', '대표이름', '전화번호', '주소', '상점아이디', '상점비밀번호', '등록일'];
    const rows = records.map(r => [
      r.branchName, 
      r.branchRep, 
      `="${r.branchPhone}"`, 
      r.businessName, 
      r.repName, 
      `="${r.phoneNumber}"`, 
      r.address, 
      r.storeId, 
      r.storePw,
      r.date
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `신청현황_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-white to-slate-50">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">신청 현황</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">신청이 완료되었습니다.</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={records.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-40"
        >
          <i className="fa-solid fa-file-excel"></i>
          <span>엑셀 다운로드</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">지부 / 담당자</th>
              <th className="px-6 py-4">지부 연락처</th>
              <th className="px-6 py-4 bg-blue-50/50 text-blue-700">신청 상호 / 대표자</th>
              <th className="px-6 py-4">상점 연락처</th>
              <th className="px-6 py-4">상점 주소</th>
              <th className="px-6 py-4 bg-amber-50/50 text-amber-700">관리자 계정</th>
              <th className="px-6 py-4">등록일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr><td colSpan={7} className="py-24 text-center text-slate-400 font-medium">신청 내역이 없습니다.</td></tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-800">{record.branchName}</div>
                    <div className="text-[11px] text-slate-500">{record.branchRep}</div>
                  </td>
                  <td className="px-6 py-5 text-[11px] font-mono text-slate-600">{record.branchPhone}</td>
                  <td className="px-6 py-5 bg-blue-50/10">
                    <div className="text-sm font-black text-blue-900">{record.businessName}</div>
                    <div className="text-[11px] text-blue-600 font-bold">{record.repName}</div>
                  </td>
                  <td className="px-6 py-5 text-[11px] font-mono text-slate-600">{record.phoneNumber}</td>
                  <td className="px-6 py-5 text-[11px] text-slate-500 max-w-[180px] truncate">{record.address}</td>
                  <td className="px-6 py-5 bg-amber-50/10 text-[11px]">
                    <div className="font-bold text-amber-900">ID: {record.storeId}</div>
                    <div className="text-amber-700 font-mono">PW: {record.storePw}</div>
                  </td>
                  <td className="px-6 py-5 text-[11px] text-slate-400 font-medium">{record.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {records.length > 0 && (
        <div className="p-4 bg-slate-50 text-right border-t border-slate-100">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">총 {records.length}건 신청중</span>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
