
import React, { useState } from 'react';
import { OFFICIAL_SITE_URL } from '../constants';
import CustomModal from './CustomModal';
import { playClickSound } from '../utils/sound';

interface ApplicationEntryViewProps {
  isComplete: boolean;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (data: any) => Promise<void>;
  onNextStep: () => void;
}

const ApplicationEntryView: React.FC<ApplicationEntryViewProps> = ({ isComplete, formData, setFormData, onSubmit, onNextStep }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setModalMessage('정상적으로 기록되었습니다.');
      setIsSuccess(true);
      setModalOpen(true);
    } catch (err) {
      setModalMessage('저장 중 오류가 발생했습니다.');
      setIsSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (isSuccess) {
      onNextStep();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

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
      <CustomModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        message={modalMessage}
        title={isSuccess ? '저장 완료' : '오류 발생'}
        buttonText={isSuccess ? '다음 단계로' : '확인'}
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 세션 1: 지부 및 상점 기본 정보 */}
            <div className={cardClasses}>
              <div className="space-y-12">
                <section>
                  <h3 className="text-sm font-black text-blue-700 uppercase mb-8 flex items-center gap-3 tracking-widest">
                    지부 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className={labelClasses}>지부명</label><input name="branchName" type="text" placeholder="예: 서울지부" required value={formData.branchName} onChange={handleInputChange} className={inputClasses} /></div>
                    <div><label className={labelClasses}>지부 담당자</label><input name="branchRep" type="text" placeholder="성함" required value={formData.branchRep} onChange={handleInputChange} className={inputClasses} /></div>
                    <div><label className={labelClasses}>지부 연락처</label><input name="branchPhone" type="tel" placeholder="010-0000-0000" required value={formData.branchPhone} onChange={handleInputChange} className={inputClasses} /></div>
                  </div>
                </section>

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
                  관리자 계정 기록
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelClasses}>접속 아이디</label><input name="storeId" type="text" placeholder="ID" value={formData.storeId} onChange={handleInputChange} className={inputClasses} /></div>
                  <div><label className={labelClasses}>비밀번호</label><input name="storePw" type="text" placeholder="PW" value={formData.storePw} onChange={handleInputChange} className={inputClasses} /></div>
                </div>
              </section>

              {/* 저장하기 버튼: 카드 내부 패딩 p-8 내부에 위치하여 상단 입력창들과 가로 너비가 완벽히 일치 */}
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
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplicationEntryView;
