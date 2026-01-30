
import React from 'react';
import { ChecklistItem } from '../types';
import { EXCLUSION_CRITERIA } from '../constants';

interface ChecklistViewProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onNext: () => void;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({ items, onToggle, onNext }) => {
  const completedCount = items.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="bg-amber-100 p-2 rounded-full">
            <i className="fa-solid fa-circle-info text-amber-600"></i>
        </div>
        <p className="text-amber-800 text-sm font-bold">증빙서류는 제출일 기준 1개월 이내 발급분만 유효합니다.</p>
      </div>

      <div className="bg-white rounded-[2rem] p-6 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">필수 서류 체크리스트</h2>
            <p className="text-slate-500 mt-2 font-medium">신청 전 아래 서류들이 모두 준비되었는지 확인하세요.</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[180px]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Progress</span>
              <span className="text-xl font-black text-slate-800">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-12">
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`group flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                item.completed 
                ? 'bg-blue-50/30 border-blue-100' 
                : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center mr-5 border-2 transition-all ${
                item.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 group-hover:border-blue-400'
              }`}>
                {item.completed && <i className="fa-solid fa-check text-sm"></i>}
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-base md:text-lg ${item.completed ? 'text-blue-900/40 line-through' : 'text-slate-800'}`}>
                  {item.task}
                </h3>
                <p className={`text-xs md:text-sm font-medium ${item.completed ? 'text-blue-700/30' : 'text-slate-500'}`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={completedCount < items.length}
          className={`w-full py-6 rounded-2xl font-black text-xl transition-all ${
            completedCount === items.length
            ? 'bg-blue-700 text-white shadow-2xl shadow-blue-700/30 hover:bg-blue-800 hover:-translate-y-1'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          {completedCount === items.length ? '서류 준비 완료 (다음 단계)' : '모든 서류를 체크해 주세요'}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xl"></i>
          지원제외 대상 (필독)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXCLUSION_CRITERIA.slice(0, 8).map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-red-200 transition-colors">
              <h4 className="font-black text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors">{item.title}</h4>
              <p className="text-slate-500 text-[11px] leading-snug">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChecklistView;
