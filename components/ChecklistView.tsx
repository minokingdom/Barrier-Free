
import React from 'react';
import { ChecklistItem } from '../types';
import { EXCLUSION_CRITERIA } from '../constants';
import { playClickSound } from '../utils/sound';

interface ChecklistViewProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onNext: () => void;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({ items, onToggle, onNext }) => {
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
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">필수 서류 및 신청</h2>
            <p className="text-slate-500 mt-2 font-medium">아래 서류를 확인하고 공식 사이트에서 신청을 진행해 주세요.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-12">
          {items.map((item) => {
            const isLink = !!item.linkUrl;
            const CardTag = isLink ? 'a' : 'div';
            const cardProps = isLink ? {
              href: item.linkUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              onClick: () => playClickSound()
            } : {};

            return (
              <CardTag
                key={item.id}
                {...cardProps}
                className={`group flex items-center p-5 rounded-2xl border-2 transition-all no-underline bg-white border-slate-100 ${isLink ? 'hover:border-blue-200 hover:shadow-lg cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-5 border-2 transition-all shrink-0 bg-slate-50 border-slate-200`}>
                  <span className="text-sm font-black text-slate-400">{item.id}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-base md:text-lg flex items-center gap-2 text-slate-800">
                    {item.task}
                    {isLink && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">Link</span>}
                  </h3>
                  <p className="text-xs md:text-sm font-medium text-slate-500">
                    {item.description}
                  </p>
                </div>
              </CardTag>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {/* Official Site Button */}
          <a
            href="https://www.sbiz.or.kr/smst/index.do"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClickSound}
            className="w-full py-6 rounded-2xl font-black text-xl transition-all bg-blue-700 text-white shadow-2xl shadow-blue-700/30 hover:bg-blue-800 hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <span>스마트상점 공식 신청 사이트 바로가기</span>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>

          {/* Next Step Button */}
          <button
            onClick={() => {
              playClickSound();
              onNext();
            }}
            className="w-full py-4 rounded-xl font-bold text-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            다음 단계 (입력) 로 이동 <i className="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>
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
