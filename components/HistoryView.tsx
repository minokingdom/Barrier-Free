import React, { useState, useEffect } from 'react';
import { ApplicationRecord } from '../types';
import CustomModal from './CustomModal';

interface HistoryViewProps {
  localRecords: ApplicationRecord[];
  fullHistory: ApplicationRecord[];
  branchAuth: { branchName: string, password: string }[];
  availableBranches: string[];
  currentUser: { branchName: string, name: string, phone: string };
  onRegisterPassword: (branch: string, pw: string) => Promise<void>;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  localRecords,
  fullHistory,
  branchAuth,
  availableBranches,
  currentUser,
  onRegisterPassword
}) => {
  const [viewMode, setViewMode] = useState<'my' | 'admin'>('my');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Admin Search State
  const [selectedBranch, setSelectedBranch] = useState(currentUser.branchName || (availableBranches[0] ?? ''));
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Success Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setIsAdminAuthenticated(false);
    setAdminPassword('');
  }, [viewMode, selectedBranch]);

  // Determine which records to show
  const getFilteredRecords = () => {
    // 1. If in 'My Mode', show records matching currentUser identity
    if (viewMode === 'my') {
      const { branchName, name, phone } = currentUser;
      if (!branchName || !name) return []; // No identity found

      const normalizedUserPhone = phone.replace(/[^0-9]/g, '');

      return fullHistory.filter(record => {
        const recordPhone = String(record.branchPhone).replace(/[^0-9]/g, '');
        return (
          record.branchName === branchName &&
          record.branchRep === name &&
          recordPhone === normalizedUserPhone
        );
      });
    }

    // 2. If in 'Admin Mode', show records for selected branch IF authenticated
    if (viewMode === 'admin' && isAdminAuthenticated) {
      return fullHistory.filter(record => record.branchName === selectedBranch);
    }

    return [];
  };

  const filteredRecords = getFilteredRecords();

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAdminCheck = () => {
    if (!selectedBranch) return alert('지부를 선택해 주세요.');
    if (!adminPassword) return alert('비밀번호를 입력해 주세요.');

    const authInfo = branchAuth.find(b => b.branchName === selectedBranch);

    if (authInfo) {
      // Branch has password
      if (authInfo.password) {
        if (String(authInfo.password) === adminPassword) {
          setIsAdminAuthenticated(true);
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      } else {
        // Branch has NO password -> Propose Registration
        setIsRegModalOpen(true);
      }
    } else {
      // Should not happen if availableBranches is synced, but if so, treat as new?
      // Or maybe restricted. Let's assume registration is needed.
      setIsRegModalOpen(true);
    }
  };

  const [isRegistering, setIsRegistering] = useState(false);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccessModalOpen(true);
  };

  const handleRegister = async () => {
    if (!newPassword || newPassword.length < 4) {
      showSuccess('비밀번호는 4자리 이상 입력해 주세요.');
      return;
    }

    setIsRegistering(true);
    try {
      await onRegisterPassword(selectedBranch, newPassword);
      setIsRegModalOpen(false);
      setAdminPassword(newPassword); // Auto-fill
      setIsAdminAuthenticated(true); // Auto-login (optimistic)
      showSuccess('비밀번호가 등록되었습니다.\n이제 내역을 조회할 수 있습니다.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {/* Header & Filter Controls */}
      <div className="p-6 md:p-8 bg-white border-b border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">신청 현황</h2>
            <p className="text-slate-500 font-medium mt-1">접수된 신청 내역을 조회합니다.</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('my')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'my'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              내 신청 내역 (인증)
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'admin'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              지부별 조회 (관리자)
            </button>
          </div>
        </div>

        {/* Admin Search Bar */}
        {viewMode === 'admin' && (
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col md:flex-row gap-3 items-end md:items-center animate-in slide-in-from-top-2 duration-300">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-amber-800 mb-1 ml-1">지부 선택</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white"
              >
                {availableBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-amber-800 mb-1 ml-1">관리자 비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호 입력"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminCheck()}
                className="w-full h-12 px-4 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handleAdminCheck}
              className="w-full md:w-auto h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95"
            >
              조회
            </button>
          </div>
        )}

        {/* My History Info Message */}
        {viewMode === 'my' && (
          currentUser.branchName ? (
            <div className="bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user-check text-blue-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    {currentUser.branchName} <span className="text-blue-400">|</span> {currentUser.name}
                  </p>
                  <p className="text-xs text-blue-600">님의 신청 내역을 조회합니다.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50/50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-red-600 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-red-900">인증 정보가 없습니다.</p>
                <p className="text-xs text-red-600">신청/입력 탭에서 먼저 영업자 인증을 진행해 주세요.</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto scroller-smooth pb-4 min-h-[400px]">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-black text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">지부 / 담당자</th>
              <th className="px-6 py-4">담당자 연락처</th>
              <th className="px-6 py-4 bg-blue-50/50 text-blue-700">신청 상호 / 대표자</th>
              <th className="px-6 py-4">상점 연락처</th>
              <th className="px-6 py-4">상점 주소</th>
              <th className="px-6 py-4 bg-amber-50/50 text-amber-700">관리자 계정</th>
              <th className="px-6 py-4">등록일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                      <i className="fa-solid fa-folder-open text-2xl"></i>
                    </div>
                    <p className="text-slate-500 font-bold text-lg">
                      {viewMode === 'admin' && !isAdminAuthenticated
                        ? '비밀번호를 입력하여 조회해 주세요.'
                        : '조회된 신청 내역이 없습니다.'}
                    </p>
                    {viewMode === 'my' && !currentUser.branchName && (
                      <p className="text-slate-400 text-sm">신청/입력 탭에서 먼저 본인 확인을 진행해 주세요.</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-6 py-5">
                    <div className="text-base font-bold text-slate-800">{record.branchName}</div>
                    <div className="text-sm text-slate-500 mt-1">{record.branchRep}</div>
                  </td>
                  <td className="px-6 py-5 text-sm font-mono text-slate-600">{record.branchPhone}</td>
                  <td className="px-6 py-5 bg-blue-50/10">
                    <div className="text-base font-black text-blue-900">{record.businessName}</div>
                    <div className="text-sm text-blue-600 font-bold mt-1">{record.repName}</div>
                  </td>
                  <td className="px-6 py-5 text-sm font-mono text-slate-600">{record.phoneNumber}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 max-w-[200px] truncate" title={record.address}>{record.address}</td>
                  <td className="px-6 py-5 bg-amber-50/10 text-sm">
                    <div className="font-bold text-amber-900">ID: {record.storeId}</div>
                    <div className="text-amber-700 font-mono mt-0.5">PW: {record.storePw}</div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-400 font-medium whitespace-nowrap">{record.date ? record.date.substring(0, 16) : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredRecords.length > 0 && (
        <div className="p-6 border-t border-slate-100 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === page
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Password Registration Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsRegModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative z-10 text-center border border-white/20">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 text-2xl shadow-lg shadow-amber-100">
              <i className="fa-solid fa-key"></i>
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-2">비밀번호 등록</h3>
            <div className="text-slate-500 font-medium mb-6 leading-relaxed">
              <span className="font-bold text-blue-600">"{selectedBranch}"</span>의<br />
              관리자 비밀번호가 아직 설정되지 않았습니다.
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <input
                type="password"
                className="w-full text-center text-lg font-bold tracking-widest bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-6 focus:border-amber-400 focus:bg-white outline-none transition-all"
                autoFocus
                placeholder="비밀번호 입력"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
              <p className="text-xs text-slate-400 mt-2">4자리 이상 입력해 주세요</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsRegModalOpen(false)}
                disabled={isRegistering}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    등록 중...
                  </>
                ) : (
                  '등록하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <CustomModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="알림"
        message={successMessage}
        buttonText="확인"
      />
    </div>
  );
};

export default HistoryView;
