
import React from 'react';

interface LandingViewProps {
  onStart: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[160px]"></div>

      <div className="max-w-3xl w-full text-center relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] shadow-2xl shadow-blue-500/40 mb-12 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <i className="fa-solid fa-file-invoice text-white text-5xl"></i>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
          스마트상점<br/>
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">신청 지원 시스템</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-2xl mb-14 font-medium leading-relaxed max-w-xl mx-auto">
          소상공인 기술보급사업 신청을 위한<br/>
          체크리스트 관리 및 신청 내역 기록 관리기
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 text-left max-w-2xl mx-auto">
          {[
            { icon: 'fa-check-double', label: '서류 체크리스트', desc: '필수 증빙 서류 누락 방지' },
            { icon: 'fa-paper-plane', label: '신청 정보 기록', desc: '신청 완료 정보 즉시 저장' },
            { icon: 'fa-database', label: '데이터 아카이브', desc: '스프레드시트 연동 관리' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 group hover:bg-white/10 transition-colors">
              <i className={`fa-solid ${item.icon} text-blue-400 text-xl mb-3`}></i>
              <h3 className="text-white font-bold text-sm mb-1">{item.label}</h3>
              <p className="text-slate-500 text-[11px] leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-16 py-7 font-black text-white bg-blue-600 rounded-3xl overflow-hidden transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(37,99,235,0.4)]"
        >
          <span className="relative flex items-center gap-4 text-xl uppercase tracking-[0.1em]">
            업무 시작하기
            <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
          </span>
        </button>

        <p className="mt-20 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          © 2024 Digital Transformation Unit
        </p>
      </div>
    </div>
  );
};

export default LandingView;
