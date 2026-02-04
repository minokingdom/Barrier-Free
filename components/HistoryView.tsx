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
  // View & Search State
  const [viewMode, setViewMode] = useState<'my' | 'admin'>('my');

  // Search Configuration
  const [searchType, setSearchType] = useState<'branch' | 'person' | 'all'>('branch');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPassword, setSearchPassword] = useState('');
  const [isSearchAuthenticated, setIsSearchAuthenticated] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Legacy & Modal States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  /* New state for password visibility */
  const [showPassword, setShowPassword] = useState(false);

  // Reset state when view or parameters change
  useEffect(() => {
    setCurrentPage(1);
    setIsSearchAuthenticated(false);
    // Optional: Clear password when switching types for security, but allow keeping branch/phone
    setSearchPassword('');
    setShowPassword(false);
  }, [viewMode, searchType, selectedBranch, searchName]);

  // Determine which records to show
  const getFilteredRecords = () => {
    // 1. My Mode: Authenticated User's Records
    if (viewMode === 'my') {
      const { branchName, name, phone } = currentUser;
      if (!branchName || !name) return [];
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

    // 2. Search Mode (Admin/Branch/Person)
    if (viewMode === 'admin' && isSearchAuthenticated) {
      // Master View
      if (searchType === 'all') {
        return fullHistory.filter(record => record.branchName && record.businessName);
      }

      // Branch Admin View
      if (searchType === 'branch') {
        return fullHistory.filter(record => record.branchName === selectedBranch);
      }

      // Salesperson View
      if (searchType === 'person') {
        return fullHistory.filter(record => {
          return (
            record.branchName === selectedBranch &&
            record.branchRep === searchName &&
            String(record.salesPassword) === searchPassword
          );
        });
      }
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

  const handleSearch = () => {
    // 1. Master Search Validation
    if (searchType === 'all') {
      if (!searchPassword) return showError('전체 관리자 비밀번호를 입력해 주세요.');

      if (searchPassword === 'qwer1234') {
        setIsSearchAuthenticated(true);
      } else {
        showError('관리자 비밀번호가 일치하지 않습니다.');
      }
      return;
    }

    // 2. Basic Validation
    if (!selectedBranch && searchType !== 'all') return showError('지부를 선택해 주세요.');
    if (searchType === 'person' && !searchName) return showError('영업자 이름을 입력해 주세요.');
    if (!searchPassword) return showError('비밀번호를 입력해 주세요.');

    // 3. Branch Admin Validation
    if (searchType === 'branch') {
      const authInfo = branchAuth.find(b => b.branchName === selectedBranch);
      if (authInfo && authInfo.password) {
        if (String(authInfo.password) === searchPassword) {
          setIsSearchAuthenticated(true);
        } else {
          showError('지부 비밀번호가 일치하지 않습니다.');
        }
      } else {
        // Restore: Prompt for registration if password is not set
        setIsRegModalOpen(true);
      }
      return;
    }

    // 4. Person Validation
    if (searchType === 'person') {
      // We set authenticated true, filter logic handles the rest (matching password)
      setIsSearchAuthenticated(true);
      return;
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccessModalOpen(true);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorModalOpen(true);
  };

  /* Registration logic restored */
  const handleRegister = async () => {
    if (!newPassword || newPassword.length < 4) {
      showError('비밀번호를 4자리 이상 입력해 주세요.');
      return;
    }

    setIsRegistering(true);
    try {
      await onRegisterPassword(selectedBranch, newPassword);
      setIsRegModalOpen(false);
      setNewPassword('');
      showSuccess(`[${selectedBranch}] 비밀번호가 등록되었습니다.\n이제 해당 비밀번호로 조회할 수 있습니다.`);
      // Auto-authenticate after registration if desired, or let user type it again.
      // For UX, removing alert and letting user type is fine.
    } catch (error) {
      console.error(error);
      showError('비밀번호 등록 중 오류가 발생했습니다.');
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
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              접수된 신청 내역을 조회합니다.
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
                총 {filteredRecords.length}건
              </span>
            </p>
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
              내역 조회 (검색)
            </button>
          </div>
        </div>

        {/* Salesperson Search Bar */}
        {viewMode === 'admin' && (
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col items-center gap-4 animate-in slide-in-from-top-2 duration-300">

            {/* Search Type Toggles */}
            <div className="flex bg-white p-1 rounded-lg border border-amber-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setSearchType('branch')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${searchType === 'branch' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                지부 조회
              </button>
              <div className="w-px bg-slate-100 my-1"></div>
              <button
                onClick={() => setSearchType('person')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${searchType === 'person' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                영업자 조회
              </button>
              <div className="w-px bg-slate-100 my-1"></div>
              <button
                onClick={() => setSearchType('all')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${searchType === 'all' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                전체 조회
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full">
              {/* Branch Select - Shown for Branch & Person modes */}
              {searchType !== 'all' && (
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-amber-800 mb-1 ml-1">지부 선택</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className={`w-full h-12 px-4 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white ${selectedBranch ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                    <option value="">지부 선택</option>
                    {availableBranches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name Input - Shown only for Person mode */}
              {searchType === 'person' && (
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-amber-800 mb-1 ml-1">영업자 이름</label>
                  <input
                    type="text"
                    placeholder="이름 입력"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete="off"
                    className="w-full h-12 px-4 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Password Input */}
              <div className="flex-1 w-full relative">
                <label className="block text-xs font-bold text-amber-800 mb-1 ml-1">
                  {searchType === 'branch' ? '지부 비밀번호' : searchType === 'person' ? '영업자 비밀번호' : '전체 관리자 비밀번호'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호 입력"
                    value={searchPassword}
                    onChange={(e) => setSearchPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete="new-password"
                    className="w-full h-12 px-4 pr-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-12 px-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full md:w-auto h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 mt-2"
            >
              내역 조회하기
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
                      {viewMode === 'admin' && !isSearchAuthenticated
                        ? (searchType === 'branch' ? '지부와 비밀번호를 입력해 주세요.' :
                          searchType === 'person' ? '정보를 입력해 주세요.' :
                            '관리자 비밀번호를 입력해 주세요.')
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

      {/* Error Modal */}
      <CustomModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="오류"
        message={errorMessage}
        buttonText="확인"
      />
    </div>
  );
};

export default HistoryView;
