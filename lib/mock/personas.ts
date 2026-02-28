// 데모 페르소나 데이터

export interface FamilyMember {
  name: string;
  relation: string;
  age: number;
  ssn?: string;
  healthInsurance?: boolean;
}

export interface EmploymentRecord {
  employer: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  insuredDays?: number;
  monthlyWage?: number;
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  gender: string;
  ssn: string;
  phone: string;
  email: string;
  address: string;
  situation: string;
  family?: FamilyMember[];
  employmentHistory?: EmploymentRecord[];
  income?: {
    monthlyIncome: number;
    annualIncome: number;
    incomeType: string;
  };
  property?: {
    realEstate: Array<{ type: string; address: string; value: number }>;
    vehicles: Array<{ type: string; model: string; year: number }>;
  };
}

export const PERSONAS: Record<string, Persona> = {
  restaurant: {
    id: 'restaurant',
    name: '김도전',
    age: 34,
    gender: '남',
    ssn: '860115-1XXXXXX',
    phone: '010-1234-5678',
    email: 'kim.dojeon@email.com',
    address: '서울특별시 마포구 성산동 123-45',
    situation: '연남동에서 파스타 전문점 창업 준비 중. 임대차 계약 완료.',
    family: [
      { name: '김도전', relation: '본인', age: 34, healthInsurance: true },
    ],
    employmentHistory: [
      {
        employer: '(주)서울외식산업',
        startDate: '2018-03-01',
        endDate: '2025-12-31',
        reason: '자발적퇴직(창업)',
        monthlyWage: 3500000,
      },
    ],
    income: {
      monthlyIncome: 0,
      annualIncome: 0,
      incomeType: '사업소득(예정)',
    },
    property: {
      realEstate: [],
      vehicles: [{ type: '승용차', model: '현대 아반떼', year: 2022 }],
    },
  },
  relocation: {
    id: 'relocation',
    name: '박이사',
    age: 35,
    gender: '남',
    ssn: '910520-1XXXXXX',
    phone: '010-2345-6789',
    email: 'park.isa@email.com',
    address: '서울특별시 강남구 역삼동 456-78',
    situation: '수원시 영통구로 가족(배우자, 3살 자녀) 이사 예정.',
    family: [
      { name: '박이사', relation: '본인(세대주)', age: 35, ssn: '910520-1XXXXXX', healthInsurance: true },
      { name: '김배우', relation: '배우자', age: 33, ssn: '930815-2XXXXXX', healthInsurance: true },
      { name: '박아이', relation: '자녀', age: 3, ssn: '230101-3XXXXXX', healthInsurance: true },
    ],
    employmentHistory: [
      {
        employer: '(주)IT솔루션',
        startDate: '2018-06-01',
        monthlyWage: 5000000,
      },
    ],
    income: {
      monthlyIncome: 5000000,
      annualIncome: 60000000,
      incomeType: '근로소득',
    },
    property: {
      realEstate: [],
      vehicles: [{ type: '승용차', model: '기아 쏘렌토', year: 2024 }],
    },
  },
  welfare: {
    id: 'welfare',
    name: '이위기',
    age: 42,
    gender: '남',
    ssn: '840303-1XXXXXX',
    phone: '010-3456-7890',
    email: 'lee.wigi@email.com',
    address: '서울특별시 관악구 봉천동 789-12',
    situation: '갑작스러운 실직(권고사직). 실업급여 및 긴급복지 지원 필요.',
    family: [
      { name: '이위기', relation: '본인', age: 42, healthInsurance: true },
    ],
    employmentHistory: [
      {
        employer: '(주)한국제조',
        startDate: '2019-01-15',
        endDate: '2026-02-28',
        reason: '권고사직',
        insuredDays: 683,
        monthlyWage: 4000000,
      },
      {
        employer: '(주)구로산업',
        startDate: '2014-03-01',
        endDate: '2018-12-31',
        reason: '자발적퇴직',
        insuredDays: 1765,
        monthlyWage: 3200000,
      },
    ],
    income: {
      monthlyIncome: 0,
      annualIncome: 48000000,
      incomeType: '근로소득(실직)',
    },
    property: {
      realEstate: [],
      vehicles: [],
    },
  },
};
