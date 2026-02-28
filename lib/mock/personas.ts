// 데모 페르소나 데이터

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
    situation: '갑작스러운 실직. 실업급여 및 긴급복지 지원 필요.',
  },
};
