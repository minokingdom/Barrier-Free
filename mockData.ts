export interface Salesperson {
    branchName: string;
    name: string;
    password: string;
}

// Mock data simulating "Salesperson Status" sheet
export const MOCK_SALESPERSONS: Salesperson[] = [
    { branchName: '서울지부', name: '김철수', password: '1234' },
    { branchName: '부산지부', name: '이영희', password: '5678' },
    { branchName: '대구지부', name: '박민수', password: '0000' },
];

export const BRANCH_NAMES = [
    '서울지부', '부산지부', '대구지부', '인천지부', '광주지부', '대전지부', '울산지부', '경기지부', '강원지부', '충북지부', '충남지부', '전북지부', '전남지부', '경북지부', '경남지부', '제주지부'
];
