
export interface ChecklistItem {
  id: string;
  task: string;
  description: string;
  completed: boolean;
  linkUrl?: string; // Optional link URL for navigation
}

export interface ApplicationRecord {
  id: string;
  // index 삭제 (사용자가 시트 수식으로 관리)
  branchName: string;   // 지부 (영업자 정보)
  branchRep: string;    // 영업자 성함 (formerly branchRep)
  salesPassword: string; // 영업자 비밀번호 (NEW)
  branchPhone: string;  // 연락처 (Keep for now as per sheet cols?)

  businessName: string; // 상호
  repName: string;      // 대표이름
  phoneNumber: string;  // 전화번호
  address: string;      // 주소
  storeId: string;      // 상점아이디
  storePw: string;      // 상점비밀번호
  date: string;         // 기록일 (관리용)
}

export enum AppTab {
  CHECKLIST = 'checklist',
  APPLY = 'apply',
  HISTORY = 'history',
  GUIDE = 'guide'
}
