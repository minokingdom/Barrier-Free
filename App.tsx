
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChecklistItem, ApplicationRecord, AppTab } from './types';
import { INITIAL_CHECKLIST } from './constants';
import ChecklistView from './components/ChecklistView';
import ApplicationEntryView from './components/ApplicationEntryView';
import HistoryView from './components/HistoryView';
import GuideView from './components/GuideView';
import LandingView from './components/LandingView';

const FIXED_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzQjGaHGCfFx445WtlSSn3DGB-zErQFr85ZkrnKF4XY6rxARWuhCMO5M9cGG4D05Zo/exec';

const INITIAL_FORM_DATA = {
  branchName: '',
  branchRep: '',
  salesPassword: '',
  branchPhone: '',
  businessName: '',
  repName: '',
  phoneNumber: '',
  address: '',
  storeId: '',
  storePw: '',
};

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GUIDE);
  const isSubmittingRef = useRef(false);
  const navRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('smst_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST.map(item => ({ ...item }));
  });

  const [records, setRecords] = useState<ApplicationRecord[]>(() => {
    const saved = localStorage.getItem('smst_records');
    return saved ? JSON.parse(saved) : [];
  });

  // 앱 전체의 자동 스크롤 복원 기능을 수동으로 고정
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 탭 변경 시 즉시 상단 고정 (0,0)
  useLayoutEffect(() => {
    if (!isStarted) return;

    const forceScrollTop = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    forceScrollTop();

    const rafId1 = requestAnimationFrame(() => {
      forceScrollTop();
      const rafId2 = requestAnimationFrame(forceScrollTop);
      return () => cancelAnimationFrame(rafId2);
    });

    if (navRef.current) {
      const activeBtn = navRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
      if (activeBtn) {
        const containerWidth = navRef.current.offsetWidth;
        const btnOffset = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        navRef.current.scrollLeft = btnOffset - (containerWidth / 2) + (btnWidth / 2);
      }
    }

    return () => cancelAnimationFrame(rafId1);
  }, [activeTab, isStarted]);

  useEffect(() => {
    if (isStarted) {
      localStorage.setItem('smst_checklist', JSON.stringify(checklist));
    }
  }, [checklist, isStarted]);

  useEffect(() => {
    if (isStarted) {
      localStorage.setItem('smst_records', JSON.stringify(records));
    }
  }, [records, isStarted]);

  const handleStartApp = () => {
    // 1. 모든 상태 초기화
    setChecklist(INITIAL_CHECKLIST.map(item => ({ ...item, completed: false })));
    setRecords([]);
    setFormData(INITIAL_FORM_DATA);

    // 2. 로컬 스토리지 데이터 삭제 (인증 정보 포함)
    localStorage.removeItem('smst_checklist');
    localStorage.removeItem('smst_records');
    localStorage.removeItem('last_branch');
    localStorage.removeItem('last_name');
    localStorage.removeItem('last_phone');

    // 3. 앱 시작 및 첫 탭으로 이동
    setActiveTab(AppTab.GUIDE);
    setIsStarted(true);
  };

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addRecord = async (recordData: typeof INITIAL_FORM_DATA, isNew: boolean = false): Promise<void> => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const timestamp = new Date().toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });

    const newRecord: ApplicationRecord = {
      ...recordData,
      id: Date.now().toString(),
      date: timestamp,
    };

    try {
      await fetch(FIXED_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain', // GAS와의 호환성을 위해 text/plain 사용
        },
        body: JSON.stringify({ ...recordData, date: timestamp, isNewSalesperson: isNew })
      });
      console.log('Sheet upload request sent');

      // Refresh server data after a short delay to allow GAS to process
      setTimeout(() => {
        fetchGASData();
      }, 2000);

    } catch (err) {
      console.error("Sheet Sync Error:", err);
    } finally {
      setTimeout(() => { isSubmittingRef.current = false; }, 1500);
    }

    // 로컬 저장은 항상 수행 (서버 실패시에도 로컬엔 남김)
    setRecords(prev => [...prev, newRecord]);

    // Save Identity for History View
    localStorage.setItem('last_branch', recordData.branchName);
    localStorage.setItem('last_name', recordData.branchRep);
    localStorage.setItem('last_phone', recordData.branchPhone);
  };

  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [salespersons, setSalespersons] = useState<any[]>([]); // Store full salesperson data
  const [history, setHistory] = useState<ApplicationRecord[]>([]); // Full history from GAS
  const [branchAuth, setBranchAuth] = useState<{ branchName: string, password: string }[]>([]); // Branch Access Info

  const fetchGASData = async () => {
    try {
      const response = await fetch(FIXED_SHEET_URL);
      const data = await response.json();
      if (data) {
        if (data.branches) setAvailableBranches(data.branches);
        if (data.salespersons) setSalespersons(data.salespersons);
        if (data.history) setHistory(data.history);
        if (data.branchAuth) setBranchAuth(data.branchAuth);
      }
    } catch (error) {
      console.error("Failed to fetch GAS data:", error);
    }
  };

  // Fetch data on initial load AND when switching to History tab
  useEffect(() => {
    fetchGASData();
  }, []);

  // Refetch when user navigates to History tab
  useEffect(() => {
    if (activeTab === AppTab.HISTORY) {
      fetchGASData();
    }
  }, [activeTab]);

  const handleRegisterBranchPassword = async (branchName: string, password: string) => {
    try {
      await fetch(FIXED_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          type: 'registerBranchPassword',
          branchName,
          password
        })
      });
      console.log('Branch password registration request sent');
      // Refresh data after registration (with delay for propagation)
      setTimeout(fetchGASData, 2000);
    } catch (err) {
      console.error("Branch PW Reg Error:", err);
    }
  };

  const isChecklistComplete = true; // Checklist is now informational only

  if (!isStarted) {
    return <LandingView onStart={handleStartApp} />;
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900 bg-slate-50 overflow-x-hidden">
      <header className="bg-blue-700 text-white px-4 py-5 md:px-8 shadow-xl sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsStarted(false)}>
            <div className="bg-white p-2.5 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-file-invoice text-blue-700 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">스마트상점 신청 도우미(영업자용)</h1>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest opacity-70">Application Assistant</p>
            </div>
          </div>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur-md">
            <span className="text-xs font-black uppercase tracking-wider">신청 완료: {records.length}건</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 lg:p-12">
        <nav
          ref={navRef}
          className="flex bg-white rounded-2xl shadow-sm mb-8 md:mb-12 overflow-x-auto border border-slate-200 p-1.5 no-scrollbar scroll-smooth"
        >
          {[
            { id: AppTab.GUIDE, step: 'Step 1', label: '유의사항', icon: 'fa-circle-exclamation', color: 'red' },
            { id: AppTab.CHECKLIST, step: 'Step 2', label: '준비물 및 신청', icon: 'fa-list-check' },
            { id: AppTab.APPLY, step: 'Step 3', label: '신청/입력', icon: 'fa-paper-plane' },
            { id: AppTab.HISTORY, step: 'Final', label: '신청현황', icon: 'fa-table' }
          ].map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => {
                if (tab.id === AppTab.GUIDE) {
                  handleStartApp();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex-1 min-w-[120px] py-4 md:py-5 px-4 text-center rounded-xl transition-all duration-300 ${activeTab === tab.id
                ? `${tab.color === 'red' ? 'bg-red-600' : 'bg-blue-700'} text-white shadow-2xl font-black scale-[1.02]`
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-bold'
                }`}
            >
              <div className="text-[10px] mb-1 opacity-60 font-black uppercase tracking-widest">{tab.step}</div>
              <div className="text-sm md:text-lg flex items-center justify-center gap-2 whitespace-nowrap">
                <i className={`fa-solid ${tab.icon} text-sm`}></i>
                {tab.label}
              </div>
            </button>
          ))}
        </nav>

        <div className="min-h-[600px] animate-in fade-in duration-300">
          {activeTab === AppTab.GUIDE && (
            <GuideView key="guide-view" onNext={() => setActiveTab(AppTab.CHECKLIST)} />
          )}
          {activeTab === AppTab.CHECKLIST && (
            <ChecklistView key="checklist-view" items={checklist} onToggle={toggleCheck} onNext={() => setActiveTab(AppTab.APPLY)} />
          )}
          {activeTab === AppTab.APPLY && (
            <ApplicationEntryView
              key="apply-view"
              isComplete={isChecklistComplete}
              formData={formData}
              setFormData={setFormData}
              availableBranches={availableBranches}
              salespersons={salespersons}
              onSubmit={async (data, isNew) => {
                await addRecord(data, isNew);
                setFormData({ ...INITIAL_FORM_DATA });
              }}
              onNextStep={() => setActiveTab(AppTab.HISTORY)}
            />
          )}
          {activeTab === AppTab.HISTORY && (
            <HistoryView
              key="history-view"
              localRecords={records}
              fullHistory={history}
              branchAuth={branchAuth}
              availableBranches={availableBranches}
              currentUser={{
                branchName: formData.branchName || localStorage.getItem('last_branch') || '',
                name: formData.branchRep || localStorage.getItem('last_name') || '',
                phone: formData.branchPhone || localStorage.getItem('last_phone') || ''
              }}
              onRegisterPassword={handleRegisterBranchPassword}
            />
          )}
        </div>
      </main>

      <footer className="p-10 text-center border-t border-slate-200 bg-white mt-20">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">Digital Support System v2.1</p>
      </footer>
    </div>
  );
};

export default App;
