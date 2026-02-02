
import React, { useState } from 'react';
import { OFFICIAL_SITE_URL } from '../constants';
import CustomModal from './CustomModal';
import { playClickSound } from '../utils/sound';


interface ApplicationEntryViewProps {
  isComplete: boolean;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (data: any, isNew?: boolean) => Promise<void>;
  onNextStep: () => void;
  availableBranches: string[];
  salespersons: any[]; // Salesperson data from GAS
}

const ApplicationEntryView: React.FC<ApplicationEntryViewProps> = ({ isComplete, formData, setFormData, onSubmit, onNextStep, availableBranches, salespersons }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Modal (Results)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Verification Status
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'new_confirmed' | null>(null);

  const handleVerify = () => {
    // Basic validation before verification
    if (!formData.branchName || !formData.branchRep || !formData.salesPassword) {
      setStatusMessage('지부명, 성함, 비밀번호를 모두 입력해 주세요.');
      setStatusModalOpen(true);
      setIsSuccess(false);
      return;
    }

    // Verify against Real Data from GAS
    // 1. Check if member exists based on Immutable Identity (Branch, Name, Phone)
    const existingMember = salespersons.find(
      member =>
        member.branchName === formData.branchName &&
        member.name === formData.branchRep &&
        // Normalize phone comparison
        member.phone.toString().replace(/[^0-9]/g, '') === formData.branchPhone.replace(/[^0-9]/g, '')
    );

    if (existingMember) {
      // 2. Member exists, check password
      if (existingMember.password === formData.salesPassword) {
        setVerificationStatus('verified');
        setStatusMessage('기존 영업자 확인이 완료되었습니다.');
        setStatusModalOpen(true);
        setIsSuccess(true);
      } else {
        // Member exists but password is wrong
        setStatusMessage('비밀번호가 일치하지 않습니다.');
        setStatusModalOpen(true);
        setIsSuccess(false);
      }
    } else {
      // 3. Member does not exist -> Propose New Registration
      setConfirmModalOpen(true);
    }
  };

  const processSubmit = async (isNew: boolean = false) => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData, isNew);
      setStatusMessage('정상적으로 기록되었습니다.');
      setStatusModalOpen(true);
      setIsSuccess(true);
    } catch (err) {
      setStatusMessage('저장 중 오류가 발생했습니다.');
      setStatusModalOpen(true);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    if (verificationStatus === 'verified') {
      await processSubmit(false);
    } else if (verificationStatus === 'new_confirmed') {
      await processSubmit(true);
    } else {
      // If not verified yet, try to verify
      handleVerify();
    }
  };

  const handleConfirmNew = async () => {
    setConfirmModalOpen(false);
    // User confirmed they are new
    setVerificationStatus('new_confirmed');
    // Optional: Auto submit if this came from submit button? 
    // For now, just set status. If the user clicked Submit, they might have to click again or we can separate the flows.
    // To keep it simple: If confirmed, we just set status. The user can then click submit aka "저장하기"
    // Actually, the previous flow submitted immediately. The user asked for a button to distinguish.
    // Let's set status and show a success message "New Salesperson Registered (Ready)"?
    // Or just proceed? The request said "To distinguish".
    // I will simply set status to 'new_confirmed' and letting them proceed with the form.
    setStatusMessage(
      <div className="text-center">
        <p>신규 영업자로 확인되었습니다.</p>
        <p className="mt-1">작성을 계속해 주세요.</p>
      </div>
    );
    setStatusModalOpen(true);
    setIsSuccess(true);
  };

  const handleStatusModalClose = () => {
    setStatusModalOpen(false);
    if (isSuccess && (
      statusMessage === '정상적으로 기록되었습니다.' // Check if it was the final submit success
    )) {
      onNextStep();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Auto-format Phone Numbers
    if (name === 'branchPhone' || name === 'phoneNumber') {
      value = value.replace(/[^0-9]/g, '')
        .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
        .replace(/(\-{1,2})$/g, "");
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));

    // Reset verification if critical fields change
    if (['branchName', 'branchRep', 'salesPassword'].includes(name)) {
      setVerificationStatus(null);
    }
  };

  // 모든 카드의 패딩을 p-8로 일치시키고 라운드값을 2xl로 정교하게 조정
  // 모든 카드의 패딩을 p-8로 일치시키고 라운드값을 2xl로 정교하게 조정
  const inputClasses = "w-full bg-[#2a2a2a] text-white border border-slate-600 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500 text-base shadow-inner";
  const labelClasses = "block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest";
  const cardClasses = "bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100";

  // 버튼 클래스: 이미지와 동일하게 rounded-2xl 사용, 높이는 py-6으로 고정
  const buttonBaseClasses = "w-full flex items-center justify-center bg-blue-700 text-white py-6 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-700/20 active:scale-[0.98]";

  if (!isComplete) {
    return (
      <div className="bg-white rounded-3xl p-12 md:p-20 text-center shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="bg-amber-50 text-amber-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <i className="fa-solid fa-lock text-3xl"></i>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">체크리스트 미완료</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-base">준비물 탭에서 모든 항목을 체크해 주세요.</p>
      </div>
    );
  }

  return (
    <>
      {/* Result Status Modal */}
      <CustomModal
        isOpen={statusModalOpen}
        onClose={handleStatusModalClose}
        message={statusMessage}
        title={isSuccess ? '저장 완료' : '오류 발생'}
        buttonText={isSuccess ? '다음 단계로' : '확인'}
      />

      {/* Confirmation Modal */}
      <CustomModal
        isOpen={confirmModalOpen}
        onClose={handleConfirmNew}
        onCancel={() => setConfirmModalOpen(false)}
        title="신규 영업자 확인"
        message={
          <div className="text-left bg-slate-50 p-4 rounded-xl text-sm space-y-2 border border-slate-100 mb-2">
            <p className="font-bold text-slate-800 text-center mb-4">아래 정보로 신규 등록하시겠습니까?</p>
            <p><span className="text-slate-400 font-bold text-xs mr-2 w-16 inline-block">지부명</span> <span className="text-slate-700 font-bold">{formData.branchName}</span></p>
            <p><span className="text-slate-400 font-bold text-xs mr-2 w-16 inline-block">성함</span> <span className="text-slate-700 font-bold">{formData.branchRep}</span></p>
            <p><span className="text-slate-400 font-bold text-xs mr-2 w-16 inline-block">연락처</span> <span className="text-slate-700 font-bold">{formData.branchPhone}</span></p>
            <p><span className="text-slate-400 font-bold text-xs mr-2 w-16 inline-block">비밀번호</span> <span className="text-slate-700 font-bold">{formData.salesPassword}</span></p>
          </div>
        }
        buttonText="네, 등록합니다"
        cancelText="아니오 (수정)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 items-start">
        {/* 왼쪽: 공식 사이트 카드 (sticky 제거) */}
        <div className="lg:col-span-1">
          <div className={cardClasses}>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-4 inline-block uppercase tracking-wider">Official Link</span>
            <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight">스마트상점<br />공식 신청 사이트</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">사이트 신청 완료 후 발급 정보를 입력해 주세요.</p>
            <a
              href={OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonBaseClasses}
              onClick={playClickSound}
            >
              <span>사이트 바로가기</span>
              <i className="fa-solid fa-arrow-up-right-from-square ml-3"></i>
            </a>
          </div>
        </div>

        {/* 오른쪽: 분리된 세션 폼 */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            {/* Hidden inputs to trick browser autofill */}
            <input type="text" readOnly style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }} />
            <input type="password" readOnly style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }} />

            {/* 세션 1: 영업자 정보 (Refactored) */}
            <div className={cardClasses}>
              <div className="space-y-12">
                <section>
                  <h3 className="text-sm font-black text-blue-700 uppercase mb-8 flex items-center gap-3 tracking-widest">
                    영업자 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelClasses}>지부명</label>
                      <div className="relative">
                        <select
                          name="branchName"
                          required
                          value={formData.branchName}
                          onChange={handleInputChange}
                          className={`${inputClasses} appearance-none cursor-pointer ${formData.branchName ? 'text-white' : 'text-slate-500'
                            }`}
                        >
                          <option value="" disabled>지부 선택</option>
                          {availableBranches.map(branch => (
                            <option key={branch} value={branch} className="text-white bg-[#2a2a2a]">{branch}</option>
                          ))}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>영업자 성함</label>
                      <input
                        name="branchRep"
                        type="text"
                        placeholder="성함"
                        required
                        value={formData.branchRep}
                        onChange={handleInputChange}
                        className={inputClasses}
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => e.target.readOnly = false}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Swapped: Contact first, then Password */}
                    <div>
                      <label className={labelClasses}>영업자 연락처</label>
                      <input
                        name="branchPhone"
                        type="tel"
                        placeholder="010-0000-0000"
                        required
                        value={formData.branchPhone}
                        onChange={handleInputChange}
                        className={inputClasses}
                        autoComplete="off"
                        data-lpignore="true"
                        readOnly
                        onFocus={(e) => e.target.readOnly = false}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>비밀번호</label>
                      <input
                        name="salesPassword"
                        type="password"
                        placeholder="비밀번호"
                        required
                        value={formData.salesPassword}
                        onChange={handleInputChange}
                        className={inputClasses}
                        autoComplete="new-password"
                        data-lpignore="true"
                        readOnly
                        onFocus={(e) => e.target.readOnly = false}
                      />

                      {/* Verification Status Indicator */}
                      {verificationStatus === 'verified' && (
                        <p className="text-blue-500 text-[11px] font-bold mt-2 ml-1 animate-in fade-in">
                          <i className="fa-solid fa-check-circle mr-1"></i>기존 영업자 확인됨
                        </p>
                      )}
                      {verificationStatus === 'new_confirmed' && (
                        <p className="text-emerald-500 text-[11px] font-bold mt-2 ml-1 animate-in fade-in">
                          <i className="fa-solid fa-user-plus mr-1"></i>신규 영업자 등록 대기
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Verification Button Row */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleVerify}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-3 transition-all"
                    >
                      <i className="fa-solid fa-check-circle"></i>
                      <span>영업자 확인</span>
                    </button>
                  </div>
                </section>
              </div>
            </div>


            {/* 세션 2: 분리된 신청 상점 정보 카드 */}
            <div className={cardClasses}>
              <div className="space-y-12">
                <section>
                  <h3 className="text-sm font-black text-blue-700 uppercase mb-8 flex items-center gap-3 tracking-widest">
                    신청 상점 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div><label className={labelClasses}>상호명</label><input name="businessName" type="text" placeholder="상호명" required value={formData.businessName} onChange={handleInputChange} className={inputClasses} /></div>
                    <div><label className={labelClasses}>대표자 성함</label><input name="repName" type="text" placeholder="성함" required value={formData.repName} onChange={handleInputChange} className={inputClasses} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={labelClasses}>상점 연락처</label><input name="phoneNumber" type="tel" placeholder="010-0000-0000" required value={formData.phoneNumber} onChange={handleInputChange} className={inputClasses} /></div>
                    <div><label className={labelClasses}>상점 주소</label><input name="address" type="text" placeholder="주소" required value={formData.address} onChange={handleInputChange} className={inputClasses} /></div>
                  </div>
                </section>
              </div>
            </div>

            {/* 세션 2: 분리된 관리자 계정 기록 카드 및 저장 버튼 */}
            <div className={cardClasses}>
              <section className="mb-10">
                <h3 className="text-sm font-black text-slate-700 uppercase mb-8 flex items-center gap-3 tracking-widest">
                  스마트상점 계정 기록
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelClasses}>접속 아이디</label><input name="storeId" type="text" placeholder="ID" value={formData.storeId} onChange={handleInputChange} className={inputClasses} /></div>
                  <div><label className={labelClasses}>비밀번호</label><input name="storePw" type="text" placeholder="PW" value={formData.storePw} onChange={handleInputChange} className={inputClasses} /></div>
                </div>
              </section>

              {/* 저장하기 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${buttonBaseClasses} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up mr-3"></i>
                    <span>저장하기</span>
                  </>
                )}
              </button>
            </div>
          </form >
        </div >
      </div >
    </>
  );
};

export default ApplicationEntryView;
