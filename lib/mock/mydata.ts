// 마이데이터 시뮬레이션

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MyDataResponse {
  personalInfo: {
    name: string;
    age: number;
    gender: string;
    address: string;
  };
  income: {
    monthlyIncome: number;
    annualIncome: number;
    incomeType: string;
    taxPaid: number;
  };
  family: Array<{
    name: string;
    relation: string;
    age: number;
    healthInsurance: boolean;
  }>;
  property: {
    realEstate: Array<{ type: string; address: string; value: number }>;
    vehicles: Array<{ type: string; model: string; year: number }>;
  };
  insurance: {
    healthInsurance: { type: string; monthlyPremium: number };
    nationalPension: { type: string; monthlyPayment: number };
    employmentInsurance: { status: string; startDate: string; endDate?: string };
  };
  welfare: {
    currentBenefits: string[];
    pastApplications: string[];
  };
}

const MYDATA_DB: Record<string, MyDataResponse> = {
  restaurant: {
    personalInfo: {
      name: '김도전',
      age: 34,
      gender: '남',
      address: '서울특별시 마포구 성산동 123-45',
    },
    income: {
      monthlyIncome: 3500000,
      annualIncome: 42000000,
      incomeType: '근로소득 (퇴직 후 사업전환)',
      taxPaid: 4200000,
    },
    family: [
      { name: '김도전', relation: '본인', age: 34, healthInsurance: true },
    ],
    property: {
      realEstate: [],
      vehicles: [{ type: '승용차', model: '현대 아반떼', year: 2022 }],
    },
    insurance: {
      healthInsurance: { type: '직장가입자→지역가입자 전환 예정', monthlyPremium: 120000 },
      nationalPension: { type: '사업장가입자', monthlyPayment: 180000 },
      employmentInsurance: { status: '가입', startDate: '2020-03-01' },
    },
    welfare: {
      currentBenefits: [],
      pastApplications: [],
    },
  },
  relocation: {
    personalInfo: {
      name: '박이사',
      age: 35,
      gender: '남',
      address: '서울특별시 강남구 역삼동 456-78',
    },
    income: {
      monthlyIncome: 5000000,
      annualIncome: 60000000,
      incomeType: '근로소득',
      taxPaid: 7200000,
    },
    family: [
      { name: '박이사', relation: '본인', age: 35, healthInsurance: true },
      { name: '김배우', relation: '배우자', age: 33, healthInsurance: true },
      { name: '박아이', relation: '자녀', age: 3, healthInsurance: true },
    ],
    property: {
      realEstate: [],
      vehicles: [{ type: '승용차', model: '기아 쏘렌토', year: 2024 }],
    },
    insurance: {
      healthInsurance: { type: '직장가입자', monthlyPremium: 150000 },
      nationalPension: { type: '사업장가입자', monthlyPayment: 225000 },
      employmentInsurance: { status: '가입', startDate: '2018-06-01' },
    },
    welfare: {
      currentBenefits: ['영유아 보육료 지원'],
      pastApplications: ['출산축하금'],
    },
  },
  welfare: {
    personalInfo: {
      name: '이위기',
      age: 42,
      gender: '남',
      address: '서울특별시 관악구 봉천동 789-12',
    },
    income: {
      monthlyIncome: 0,
      annualIncome: 48000000,
      incomeType: '근로소득 (실직)',
      taxPaid: 5400000,
    },
    family: [
      { name: '이위기', relation: '본인', age: 42, healthInsurance: true },
    ],
    property: {
      realEstate: [],
      vehicles: [],
    },
    insurance: {
      healthInsurance: { type: '직장가입자→임의계속가입 가능', monthlyPremium: 130000 },
      nationalPension: { type: '사업장가입자→납부예외 신청 가능', monthlyPayment: 200000 },
      employmentInsurance: {
        status: '상실',
        startDate: '2019-01-15',
        endDate: new Date().toISOString().split('T')[0],
      },
    },
    welfare: {
      currentBenefits: [],
      pastApplications: [],
    },
  },
};

export async function getMyData(personaId: string): Promise<MyDataResponse> {
  await delay(300 + Math.random() * 500);
  return MYDATA_DB[personaId] || MYDATA_DB.restaurant;
}
