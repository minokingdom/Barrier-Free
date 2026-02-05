
import { ChecklistItem } from './types';

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: '1',
    task: '소상공인확인서 발급',
    description: '중소기업현황정보시스템(sminfo.mss.go.kr)에서 발급',
    completed: false,
  },
  {
    id: '2',
    task: '납세증명서류 준비',
    description: '국세 및 지방세 완납증명서(정부24, 방문, 민원우편, 모바일, 무인발급기)',
    completed: false,
  },
  {
    id: '3',
    task: '취약계층 증빙서류',
    description: '사업자등록증명(간이), 건강보험자격득실확인서, 장애인기업확인서',
    completed: false,
  },
  {
    id: '4',
    task: '매장 사진 촬영',
    description: '매장전면(간판포함) 2장, 내부사진 3~4장 준비',
    completed: false,
  },
  {
    id: '5',
    task: '업체소개동기 및 활용계획',
    description: '참고자료를 활용하여 미리 작성 및 준비',
    completed: false,
  },
];

export const EXCLUSION_CRITERIA = [
  { title: '지원제외 업종', detail: '소상공인 정책자금 지원제외 업종 해당 시' },
  { title: '비영리 영위', detail: '비영리사업자, 비영리법인, 단체 및 조합 등' },
  { title: '세금 체납', detail: '국세 또는 지방세 체납 중인 경우 (대표자 포함)' },
  { title: '대리신청', detail: '대표자 본인이 아닌 대행업체 등을 통해 신청할 경우' },
  { title: '기한 내 완료불가', detail: '정해진 기한 이내 기술설치를 완료할 수 없는 경우' },
  { title: '중복지원', detail: '과거 스마트상점 기술보급사업 지원 이력이 있는 상점' },
  { title: '지급보증보험', detail: '소상공인의 지급보증보험 발급이 불가능한 경우' },
  { title: '기타', detail: '이외 공단에서 지원제외로 판단한 경우' },
];

export const POST_SELECTION_GUIDE = {
  mainWarning: "자부담, 페이백에 대한 내용은 전혀 모르는 내용으로 답변 부탁드립니다.",
  auditTips: [
    { q: "사업에 대해서 어떻게 알게 됐나?", a: "유튜브 또는 인터넷 광고로 알게되었다" },
    { q: "사업 진행 도와 주는 사람 있나?", a: "없다" },
    { q: "자부담금 환급 받거나 대신 내준다고 한 사람 있나?", a: "그런거 없고 제 돈으로 냈습니다 (유도 심문에 주의)" },
    { q: "계약은 어떻게 했나?", a: "공급업체에서 방문해서 계약 했다. (우편으로 진행했다고 언급 금지)" },
    { q: "설치하고 안내 잘 받으셨나?", a: "잘 받았다. 이런 링크도 받았다" }
  ]
};

export const TECH_FIELDS = ['키오스크', '테이블오더', 'AI 서빙로봇', '스마트미러', '3D 스캐너', '기타'];

export const OFFICIAL_SITE_URL = 'https://www.sbiz.or.kr/smst/index.do';
