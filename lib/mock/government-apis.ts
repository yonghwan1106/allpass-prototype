// Mock Government API responses simulating real government data portals

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min = 100, max = 400) => delay(Math.floor(Math.random() * (max - min) + min));

// ===== Building Registry API (건축물대장 조회) =====
export async function getBuildingRegistry(address: string): Promise<{
  address: string;
  buildingUse: string;
  floorArea: number;
  floors: number;
  approvalDate: string;
  ownerName: string;
  isEligibleForRestaurant: boolean;
}> {
  await randomDelay(400, 900);
  // Simulate realistic building registry data
  return {
    address,
    buildingUse: '근린생활시설(제1종)',
    floorArea: 85,
    floors: 1,
    approvalDate: '2010-06-15',
    ownerName: '홍***',
    isEligibleForRestaurant: true,
  };
}

// ===== Resident Registration API (전입신고) =====
export async function submitResidentRegistration(params: {
  newAddress: string;
  householdHead: string;
  members: string[];
}): Promise<{
  confirmationNumber: string;
  processedAt: string;
  newAddress: string;
  memberCount: number;
  derivedServices: string[];
}> {
  await randomDelay(600, 1200);
  const members = params.members ?? [];
  return {
    confirmationNumber: `MOI-${Date.now().toString().slice(-8)}`,
    processedAt: new Date().toISOString(),
    newAddress: params.newAddress ?? '주소 미입력',
    memberCount: members.length + 1,
    derivedServices: [
      '건강보험 주소변경',
      '자동차등록증 변경',
      '운전면허 주소변경',
      '국민연금 주소변경',
      '아동수당 주소변경',
      '어린이집 전환 신청',
    ],
  };
}

// ===== Employment Insurance API (고용보험 이력) =====
export async function getEmploymentInsuranceHistory(params: {
  name?: string;
  reason?: string;
}): Promise<{
  insuredDays: number;
  currentEmployer: string;
  employmentStartDate: string;
  separationDate: string;
  separationReason: string;
  isEligible: boolean;
  estimatedDailyBenefit: number;
  estimatedPayDays: number;
}> {
  await randomDelay(500, 1000);
  void params;
  return {
    insuredDays: 683,
    currentEmployer: '(주)***기업',
    employmentStartDate: '2023-11-01',
    separationDate: new Date().toISOString().split('T')[0],
    separationReason: '권고사직',
    isEligible: true,
    estimatedDailyBenefit: 66000,
    estimatedPayDays: 180,
  };
}

// ===== Health Insurance API (건강보험 변경) =====
export async function updateHealthInsuranceAddress(newAddress: string): Promise<{
  success: boolean;
  effectiveDate: string;
  confirmationNumber: string;
}> {
  await randomDelay(300, 700);
  return {
    success: true,
    effectiveDate: new Date().toISOString().split('T')[0],
    confirmationNumber: `NHIS-${Date.now().toString().slice(-8)}`,
  };
}

// ===== Vehicle Registration API (자동차등록 변경) =====
export async function updateVehicleRegistration(newAddress: string): Promise<{
  success: boolean;
  message: string;
  requiresVisit: boolean;
}> {
  await randomDelay(300, 600);
  void newAddress;
  return {
    success: true,
    message: '자동차등록증 주소변경은 가까운 차량등록사업소 방문이 필요합니다.',
    requiresVisit: true,
  };
}

// ===== Food Safety Education API (식품위생교육 일정) =====
export async function getFoodSafetyEducationSchedule(params: {
  region?: string;
}): Promise<{
  schedules: Array<{
    date: string;
    time: string;
    location: string;
    capacity: number;
    remaining: number;
    onlineAvailable: boolean;
  }>;
}> {
  await randomDelay(300, 700);
  void params;
  const base = new Date();
  base.setDate(base.getDate() + 5);
  return {
    schedules: [
      {
        date: base.toISOString().split('T')[0],
        time: '09:00',
        location: '서울시 식품위생교육원 마포센터',
        capacity: 30,
        remaining: 12,
        onlineAvailable: true,
      },
      {
        date: new Date(base.getTime() + 7 * 86400000).toISOString().split('T')[0],
        time: '14:00',
        location: '서울시 식품위생교육원 강남센터',
        capacity: 30,
        remaining: 8,
        onlineAvailable: true,
      },
    ],
  };
}

// ===== Welfare Benefits API (복지혜택 조회) =====
export async function getWelfareBenefits(params: {
  situation?: string;
}): Promise<{
  benefits: Array<{
    name: string;
    description: string;
    amount: string;
    eligibility: string;
    applicationUrl: string;
  }>;
}> {
  await randomDelay(400, 800);
  void params;
  return {
    benefits: [
      {
        name: '국민취업지원제도',
        description: '취업지원 서비스 + 구직촉진수당',
        amount: '월 50만원 × 6개월',
        eligibility: '15-69세, 가구소득 기준 충족',
        applicationUrl: 'https://www.kua.go.kr',
      },
      {
        name: '긴급복지지원',
        description: '갑작스러운 위기 상황 긴급 생계비',
        amount: '최대 월 162만원',
        eligibility: '위기사유 발생 + 소득 기준 충족',
        applicationUrl: 'https://www.129.go.kr',
      },
      {
        name: '건강보험료 납부 유예',
        description: '실직자 건강보험료 6개월 유예',
        amount: '6개월 유예',
        eligibility: '실직 후 6개월 이내 신청',
        applicationUrl: 'https://www.nhis.or.kr',
      },
    ],
  };
}

// ===== Generic dispatcher =====
export async function callGovernmentAPI(
  apiType: string,
  params: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (apiType) {
    case 'building_registry':
      return getBuildingRegistry(params.address as string) as Promise<Record<string, unknown>>;
    case 'resident_registration':
      return submitResidentRegistration(
        params as { newAddress: string; householdHead: string; members: string[] }
      ) as Promise<Record<string, unknown>>;
    case 'employment_insurance':
      return getEmploymentInsuranceHistory(params as { name?: string; reason?: string }) as Promise<
        Record<string, unknown>
      >;
    case 'health_insurance':
      return updateHealthInsuranceAddress(params.newAddress as string) as Promise<
        Record<string, unknown>
      >;
    case 'vehicle_registration':
      return updateVehicleRegistration(params.newAddress as string) as Promise<
        Record<string, unknown>
      >;
    case 'food_education':
      return getFoodSafetyEducationSchedule(params as { region?: string }) as Promise<
        Record<string, unknown>
      >;
    case 'welfare_benefits':
      return getWelfareBenefits(params as { situation?: string }) as Promise<
        Record<string, unknown>
      >;
    default:
      await randomDelay(300, 600);
      return { success: true, message: `${apiType} API 호출 완료`, data: params };
  }
}
