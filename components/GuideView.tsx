
import React from 'react';
import { POST_SELECTION_GUIDE } from '../constants';

const GuideView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* 핵심 경고 섹션 - 더 깔끔하게 정리 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">
          <i className="fa-solid fa-circle-exclamation"></i>
          Critical Instruction
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
          선정 후 답변 지침 가이드
        </h2>
        <div className="bg-white border-2 border-red-100 rounded-3xl p-8 shadow-sm">
          <p className="text-xl md:text-2xl font-bold text-red-600 leading-tight">
            "{POST_SELECTION_GUIDE.mainWarning}"
          </p>
          <p className="mt-3 text-slate-500 text-sm font-medium">
            (자부담 페이백 또는 대납 유도 질문에 대해 "모른다" 또는 "직접 냈다"고 답변)
          </p>
        </div>
      </div>

      {/* Q&A 섹션 - 스크린샷 스타일 구현 */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fa-solid fa-comments text-white"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">유도 심문별 모범 답안</h3>
        </div>

        <div className="space-y-10">
          {POST_SELECTION_GUIDE.auditTips.map((tip, idx) => (
            <div key={idx} className="space-y-3">
              {/* Question */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-blue-400">Q</span>
                </div>
                <p className="text-base font-bold text-slate-700">{tip.q}</p>
              </div>
              
              {/* Answer Box */}
              <div className="flex gap-4 pl-1">
                <span className="text-red-500 font-black text-sm mt-3 shrink-0">A</span>
                <div className="w-full bg-slate-50/80 border border-slate-100/50 rounded-2xl px-6 py-4 transition-colors hover:bg-slate-50">
                  <p className="text-base font-bold text-red-600 leading-relaxed">
                    {tip.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 추가 유의사항 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 text-white rounded-[2rem] p-8 shadow-xl">
          <h4 className="text-lg font-black mb-6 flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass text-blue-400"></i>
            최종 실사 안내
          </h4>
          <ul className="space-y-4">
            {[
              "운영기관 방문 시 반드시 대표자 직접 응대",
              "실사 거부 시 지원금 환수 조치 가능",
              "계약은 '방문 체결'로 일관되게 답변"
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300 font-medium leading-relaxed">
                <i className="fa-solid fa-check text-blue-400 mt-1"></i>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex flex-col justify-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <i className="fa-solid fa-lightbulb text-xl"></i>
          </div>
          <h4 className="font-black text-amber-900 mb-2">상점주 필수 기억</h4>
          <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
            모든 사업 진행은 "대표자와 공급업체가 직접 소통하여 투명하게 진행했다"는 원칙을 고수해 주세요. 제3자의 개입은 엄격히 금지됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideView;
